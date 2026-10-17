import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { CrmCtx, type Ctx } from "@/lib/crm/context";
import { getSupabase } from "./client";
import {
  command,
  listOrganizations,
  loadWorkspace,
  type Member,
  type Organization,
} from "./repository";
import type { CrmState } from "@/lib/crm/types";
import { Button } from "@/components/ui/button";
export function LiveCrmProvider({
  organization,
  children,
}: {
  organization: Organization;
  children: ReactNode;
}) {
  const [state, setState] = useState<CrmState | null>(null),
    [members, setMembers] = useState<Member[]>([]),
    [error, setError] = useState(false),
    [pending, setPending] = useState(0),
    [openLeadId, openLead] = useState<string | null>(null);
  const alive = useRef(true),
    queue = useRef(Promise.resolve()),
    reading = useRef(new Set<string>());
  const organizationId = organization.id;
  const reload = useCallback(async () => {
    const current = (await listOrganizations()).find((o) => o.id === organizationId);
    if (!current) throw new Error("Acesso negado");
    const result = await loadWorkspace(current);
    if (alive.current) {
      setState(result.state);
      setMembers(result.members);
      setError(false);
    }
  }, [organizationId]);
  useEffect(() => {
    alive.current = true;
    void reload().catch(() => {
      if (alive.current) setError(true);
    });
    return () => {
      alive.current = false;
    };
  }, [reload]);
  const run = (operation: () => Promise<unknown>, quiet = false) => {
    setPending((p) => p + 1);
    queue.current = queue.current
      .then(async () => {
        if (!alive.current) return;
        await operation();
        if (alive.current) await reload();
        if (!quiet) toast.success("Alteração salva no banco da organização");
      })
      .catch(() => {
        if (alive.current)
          toast.error(
            "Não foi possível salvar. Nenhuma confirmação de gravação foi recebida. Atualize a página antes de tentar novamente.",
          );
      })
      .finally(() => {
        if (alive.current) setPending((p) => Math.max(0, p - 1));
      });
  };
  const write = (
    op: string,
    lead: string | null,
    payload: Record<string, unknown> = {},
    quiet = false,
  ) => run(() => command(organization.id, op, lead, payload), quiet);
  if (error)
    return (
      <div role="alert" className="p-8">
        <h1 className="text-xl font-semibold">Não foi possível carregar a organização</h1>
        <p className="my-3 text-muted-foreground">
          Verifique a conexão, as permissões e se as migrations foram aplicadas.
        </p>
        <Button
          onClick={() => {
            setError(false);
            void reload().catch(() => setError(true));
          }}
        >
          Tentar novamente
        </Button>
      </div>
    );
  if (!state)
    return (
      <p role="status" className="p-8">
        Carregando dados da organização…
      </p>
    );
  const ownerId = (label: string) => members.find((m) => m.label === label)?.userId;
  const value: Ctx = {
    state,
    mode: "live",
    owners: members.map((m) => m.label),
    organizationName: organization.name,
    organizationId: organization.id,
    openLeadId,
    openLead,
    moveStage: (id, stage, reason, note) => write("stage_move", id, { stage, reason, note }),
    updateLead: (id, patch) => {
      const { owner, ...rest } = patch;
      write("lead_update", id, { ...rest, ...(owner ? { ownerId: ownerId(owner) } : {}) });
    },
    addLead: (lead) => {
      const id = crypto.randomUUID();
      const { owner, attribution, ...rest } = lead;
      write("lead_create", null, { ...rest, id, ownerId: ownerId(owner) });
      return id;
    },
    addComment: (id, text) => write("comment_add", id, { text }),
    sendMessage: () => toast.error("WhatsApp não configurado. Nenhuma mensagem foi enviada."),
    markRead: (id) => {
      if (
        !reading.current.has(id) &&
        state.conversations.some((c) => c.leadId === id && c.unread)
      ) {
        reading.current.add(id);
        run(async () => {
          try {
            await command(organization.id, "mark_read", id);
          } finally {
            reading.current.delete(id);
          }
        }, true);
      }
    },
    upsertProposal: ({ leadId, ...patch }) => write("proposal_save", leadId, patch),
    resolveAlert: (id) =>
      run(async () => {
        const { error } = await getSupabase()
          .from("notifications")
          .upsert(
            { organization_id: organization.id, alert_key: id },
            { onConflict: "organization_id,user_id,alert_key", ignoreDuplicates: true },
          );
        if (error) throw error;
      }),
    logFollowUp: (id, text, next) => write("followup_log", id, { text, next }),
    setAttribution: (id, source, reason) => write("attribution_set", id, { source, reason }),
    setAlertRules: (rules) =>
      run(async () => {
        const { data, error } = await getSupabase()
          .from("organizations")
          .update({ alert_rules: rules })
          .eq("id", organization.id)
          .select("id");
        if (error || !data?.length) throw error ?? new Error("Sem permissão");
      }),
    reset: () => toast.error("A restauração está disponível somente na demonstração."),
  };
  return (
    <CrmCtx.Provider value={value}>
      <div
        role="status"
        aria-live="polite"
        className="border-b border-border px-4 py-2 text-xs text-muted-foreground"
      >
        {pending
          ? `Salvando ${pending} alteração(ões)…`
          : "Dados da organização · persistência no banco"}
      </div>
      {children}
    </CrmCtx.Provider>
  );
}
