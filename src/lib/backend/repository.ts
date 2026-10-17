import { z } from "zod";
import { getDatabase } from "./client";
import { parseDemoState } from "@/lib/crm/storage";
import { SOURCES, type CrmState, type Lead } from "@/lib/crm/types";
const rowSchema = z.record(z.unknown());
type Row = z.infer<typeof rowSchema>;
const text = (r: Row, k: string, fallback = "") =>
  typeof r[k] === "string" ? (r[k] as string) : fallback;
const optional = (r: Row, k: string) => text(r, k) || undefined;
export interface Member {
  userId: string;
  label: string;
  role: string;
}
export interface Organization {
  id: string;
  name: string;
  website: string;
  alertRules: CrmState["alertRules"];
}
export async function listOrganizations(): Promise<Organization[]> {
  const { data, error } = await getDatabase()
    .from("organizations")
    .select("id,name,website,alert_rules");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    website: r.website,
    alertRules: r.alert_rules,
  }));
}
async function rows(table: string, org: string): Promise<Row[]> {
  const all: Row[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await getDatabase()
      .from(table)
      .select("*")
      .eq("organization_id", org)
      .order(table === "organization_members" ? "user_id" : "id")
      .range(from, from + 999);
    if (error) throw error;
    const batch = z.array(rowSchema).parse(data);
    all.push(...batch);
    if (batch.length < 1000) return all;
  }
}
export async function loadWorkspace(
  org: Organization,
): Promise<{ state: CrmState; members: Member[] }> {
  const [
    leads,
    proposals,
    conversations,
    messages,
    notes,
    activities,
    events,
    notifications,
    members,
  ] = await Promise.all(
    [
      "leads",
      "proposals",
      "conversations",
      "messages",
      "notes",
      "activities",
      "attribution_events",
      "notifications",
      "organization_members",
    ].map((t) => rows(t, org.id)),
  );
  const { data: profiles, error } = await getDatabase().from("profiles").select("id,display_name");
  if (error) throw error;
  const name = (id: string) => profiles?.find((p) => p.id === id)?.display_name ?? "Usuário";
  const roster = members!.map((m) => ({
    userId: text(m, "user_id"),
    label: `${name(text(m, "user_id"))} · ${text(m, "user_id").slice(0, 8)}`,
    role: text(m, "role"),
  }));
  const state: CrmState = {
    version: 1,
    seededAt: new Date().toISOString(),
    alertRules: org.alertRules,
    resolvedAlerts: notifications!.map((n) => text(n, "alert_key")),
    leads: leads!
      .filter((l) => !l["deleted_at"])
      .map((l) => ({
        id: text(l, "id"),
        name: text(l, "name"),
        company: text(l, "company"),
        role: text(l, "role"),
        phone: text(l, "phone"),
        email: text(l, "email"),
        service: text(l, "service"),
        source: text(l, "source") as Lead["source"],
        stage: text(l, "stage") as Lead["stage"],
        owner: roster.find((m) => m.userId === l["owner_id"])?.label ?? "Usuário",
        value: l["value"] == null ? undefined : Number(l["value"]),
        createdAt: text(l, "created_at"),
        lastInteraction: text(l, "last_interaction"),
        nextActivity: optional(l, "next_activity"),
        tags: z.array(z.string()).parse(l["tags"]),
        notes: text(l, "notes"),
        disqualifyReason: optional(l, "disqualify_reason"),
        disqualifyNote: optional(l, "disqualify_note"),
        attribution: l["attribution"] as Lead["attribution"],
        attributionHistory: events!
          .filter((e) => e["lead_id"] === l["id"])
          .sort((a, b) => text(a, "created_at").localeCompare(text(b, "created_at")))
          .map((e) => ({
            at: text(e, "created_at"),
            by: name(text(e, "actor_id")),
            from: text(e, "from_source") as Lead["source"],
            to: text(e, "to_source") as Lead["source"],
            reason: text(e, "reason"),
          })),
      })),
    proposals: proposals!.map((p) => ({
      id: text(p, "id"),
      leadId: text(p, "lead_id"),
      value: Number(p["value"]),
      status: text(p, "status") as CrmState["proposals"][number]["status"],
      sentAt: optional(p, "sent_at"),
      nextFollowUp: optional(p, "next_follow_up"),
      notes: text(p, "notes"),
    })),
    conversations: conversations!.map((c) => ({
      leadId: text(c, "lead_id"),
      unread: Number(c["unread"]),
      messages: messages!
        .filter((m) => m["conversation_id"] === c["id"])
        .sort((a, b) => text(a, "created_at").localeCompare(text(b, "created_at")))
        .map((m) => ({
          id: text(m, "id"),
          dir: text(m, "direction") as "in" | "out",
          text: text(m, "body"),
          at: text(m, "created_at"),
          status: text(m, "status") as "sent" | "delivered" | "read" | "received" | "failed",
        })),
    })),
    comments: notes!.map((n) => ({
      id: text(n, "id"),
      leadId: text(n, "lead_id"),
      text: text(n, "text"),
      at: text(n, "created_at"),
      author: name(text(n, "actor_id")),
    })),
    activities: activities!
      .sort((a, b) => text(b, "created_at").localeCompare(text(a, "created_at")))
      .map((a) => ({
        id: text(a, "id"),
        leadId: text(a, "lead_id"),
        type: text(a, "type") as CrmState["activities"][number]["type"],
        text: text(a, "text"),
        at: text(a, "created_at"),
      })),
  };
  for (const l of state.leads)
    l.attribution.channel = SOURCES[l.source]?.label ?? "Origem desconhecida";
  const checked = parseDemoState(JSON.stringify(state));
  if (!checked)
    throw new Error(
      "Os dados recebidos não correspondem ao formato esperado. Atualize as migrations.",
    );
  return { state: checked, members: roster };
}
export async function command(
  org: string,
  operation: string,
  lead: string | null,
  payload: Record<string, unknown> = {},
) {
  // Undefined means an explicit clear for optional date/value fields.
  const serialized = JSON.parse(
    JSON.stringify(payload, (_, value: unknown) => (value === undefined ? null : value)),
  );
  const { data, error } = await getDatabase().rpc("crm_command", {
    org,
    command: operation,
    lead,
    payload: serialized,
  });
  if (error) throw error;
  return data as string;
}
