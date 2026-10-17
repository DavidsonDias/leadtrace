import { z } from "zod";
import type { CrmState } from "./types";
import { SOURCE_KEYS, STAGES } from "./types";
const date = z.string().datetime({ offset: true });
const source = z.custom<string>(
  (v) => typeof v === "string" && SOURCE_KEYS.includes(v as (typeof SOURCE_KEYS)[number]),
);
const lead = z
  .object({
    id: z.string(),
    name: z.string(),
    company: z.string(),
    role: z.string(),
    phone: z.string(),
    email: z.string(),
    service: z.string(),
    source,
    stage: z.custom<string>((v) => STAGES.some((s) => s.key === v)),
    owner: z.string(),
    createdAt: date,
    lastInteraction: date,
    nextActivity: date.optional(),
    value: z.number().finite().nonnegative().optional(),
    tags: z.array(z.string()),
    notes: z.string(),
    attribution: z
      .object({
        channel: z.string(),
        firstTouch: date,
        lastTouch: date,
        method: z.string(),
        evidence: z.string(),
        confidence: z.enum(["alta", "media", "baixa", "nenhuma"]),
      })
      .passthrough(),
    attributionHistory: z.array(
      z.object({ at: date, by: z.string(), from: source, to: source, reason: z.string() }),
    ),
  })
  .passthrough();
const schema = z.object({
  version: z.literal(1),
  seededAt: date,
  leads: z.array(lead),
  conversations: z.array(
    z.object({
      leadId: z.string(),
      unread: z.number().int().nonnegative(),
      messages: z.array(
        z.object({
          id: z.string(),
          dir: z.enum(["in", "out"]),
          text: z.string(),
          at: date,
          status: z.enum(["sent", "delivered", "read", "received", "failed"]),
        }),
      ),
    }),
  ),
  proposals: z.array(
    z.object({
      id: z.string(),
      leadId: z.string(),
      value: z.number().finite().nonnegative(),
      status: z.enum(["a_preparar", "enviada", "aguardando", "aceita", "recusada", "expirada"]),
      sentAt: date.optional(),
      nextFollowUp: date.optional(),
      notes: z.string(),
    }),
  ),
  comments: z.array(
    z.object({
      id: z.string(),
      leadId: z.string(),
      text: z.string(),
      at: date,
      author: z.string(),
    }),
  ),
  activities: z.array(
    z.object({
      id: z.string(),
      leadId: z.string(),
      type: z.enum(["stage", "message", "comment", "proposal", "followup", "lead", "attribution"]),
      text: z.string(),
      at: date,
    }),
  ),
  resolvedAlerts: z.array(z.string()),
  alertRules: z.object({
    d7: z.boolean(),
    d15: z.boolean(),
    d30: z.boolean(),
    overdue: z.boolean(),
    awaiting: z.boolean(),
  }),
});
export function parseDemoState(raw: string): CrmState | null {
  try {
    const result = schema.safeParse(JSON.parse(raw));
    if (!result.success) return null;
    const state = result.data as CrmState;
    const ids = new Set(state.leads.map((l) => l.id));
    if (
      ids.size !== state.leads.length ||
      [...state.proposals, ...state.conversations, ...state.comments, ...state.activities].some(
        (item) => !ids.has(item.leadId),
      )
    )
      return null;
    return state;
  } catch {
    return null;
  }
}
