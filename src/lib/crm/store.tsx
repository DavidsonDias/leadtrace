import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { parseDemoState } from "./storage";
import { saveProposal } from "./transitions";
import { toast } from "sonner";
import { createSeed } from "./seed";
import type { CrmState, Lead, Proposal, SourceKey, StageKey, Activity } from "./types";
import { stageLabel, SOURCES, OWNERS } from "./types";

/** Demo workspace is persisted in this browser only — fully isolated from any production data. */
const KEY = "leadtrace.demo.v1";
const ACTOR = "Você (demo)";
const uid = () => Math.random().toString(36).slice(2, 10);
const nowIso = () => new Date().toISOString();

function load(): CrmState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = parseDemoState(raw);
      if (s) return s;
    }
  } catch {
    /* corrupt storage falls back to seed */
  }
  return createSeed();
}

import { CrmCtx, type Ctx } from "./context";

export function CrmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CrmState>(() => load());
  const [openLeadId, openLead] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      toast.error(
        "Não foi possível salvar a demo neste navegador. As alterações desta sessão podem ser perdidas.",
        { id: "demo-storage" },
      );
    }
  }, [state]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const act = (s: CrmState, leadId: string, type: Activity["type"], text: string): CrmState => ({
    ...s,
    activities: [{ id: uid(), leadId, type, text, at: nowIso() }, ...s.activities],
  });
  const touch = (s: CrmState, id: string): CrmState => ({
    ...s,
    leads: s.leads.map((l) => (l.id === id ? { ...l, lastInteraction: nowIso() } : l)),
  });

  const moveStage = useCallback<Ctx["moveStage"]>((id, stage, reason, note) => {
    setState((s) => {
      const lead = s.leads.find((l) => l.id === id);
      if (!lead || lead.stage === stage || (stage === "desqualificado" && !reason?.trim()))
        return s;
      let next: CrmState = {
        ...s,
        leads: s.leads.map((l) =>
          l.id === id
            ? {
                ...l,
                stage,
                ...(stage === "desqualificado"
                  ? { disqualifyReason: reason, disqualifyNote: note }
                  : { disqualifyReason: undefined, disqualifyNote: undefined }),
              }
            : l,
        ),
      };
      // keep proposals coherent with pipeline
      const p = next.proposals.find((x) => x.leadId === id);
      if (stage === "enviar_proposta" && !p)
        next.proposals = [
          ...next.proposals,
          { id: uid(), leadId: id, value: lead.value ?? 0, status: "a_preparar", notes: "" },
        ];
      if (stage === "proposta_enviada")
        next.proposals = p
          ? next.proposals.map((x) =>
              x.leadId === id ? { ...x, status: "enviada", sentAt: x.sentAt ?? nowIso() } : x,
            )
          : [
              ...next.proposals,
              {
                id: uid(),
                leadId: id,
                value: lead.value ?? 0,
                status: "enviada",
                sentAt: nowIso(),
                notes: "",
              },
            ];
      if (stage === "fechado" && p)
        next.proposals = next.proposals.map((x) =>
          x.leadId === id ? { ...x, status: "aceita" } : x,
        );
      if (stage === "desqualificado" && p && p.status !== "aceita")
        next.proposals = next.proposals.map((x) =>
          x.leadId === id ? { ...x, status: "recusada" } : x,
        );
      next = act(
        next,
        id,
        "stage",
        `Movido de “${stageLabel(lead.stage)}” para “${stageLabel(stage)}”${reason ? ` — motivo: ${reason}${note ? ` (${note})` : ""}` : ""}`,
      );
      return next;
    });
  }, []);

  const updateLead = useCallback<Ctx["updateLead"]>((id, patch) => {
    setState((s) =>
      act(
        {
          ...s,
          leads: s.leads.map((l) => (l.id === id ? { ...l, ...patch } : l)),
          proposals: Object.prototype.hasOwnProperty.call(patch, "nextActivity")
            ? s.proposals.map((p) =>
                p.leadId === id ? { ...p, nextFollowUp: patch.nextActivity } : p,
              )
            : s.proposals,
        },
        id,
        "lead",
        "Informações do lead atualizadas",
      ),
    );
  }, []);

  const addLead = useCallback<Ctx["addLead"]>((l) => {
    const id = `lead-${uid()}`;
    const t = nowIso();
    const lead: Lead = {
      ...l,
      id,
      createdAt: t,
      lastInteraction: t,
      attributionHistory: [],
      attribution: l.attribution ?? {
        channel: l.source === "unknown" ? "—" : SOURCES[l.source].label,
        firstTouch: t,
        lastTouch: t,
        method: l.source === "unknown" ? "Nenhum" : "Manual",
        evidence:
          l.source === "unknown"
            ? "Sem evidência técnica disponível."
            : "Cadastro manual pelo usuário.",
        confidence: l.source === "unknown" ? "nenhuma" : "baixa",
      },
    };
    setState((s) =>
      act({ ...s, leads: [lead, ...s.leads] }, id, "lead", "Lead cadastrado manualmente"),
    );
    return id;
  }, []);

  const addComment = useCallback<Ctx["addComment"]>((leadId, text) => {
    setState((s) =>
      act(
        {
          ...s,
          comments: [...s.comments, { id: uid(), leadId, text, at: nowIso(), author: ACTOR }],
        },
        leadId,
        "comment",
        "Comentário registrado",
      ),
    );
  }, []);

  const sendMessage = useCallback<Ctx["sendMessage"]>((leadId, text) => {
    const msg = { id: uid(), dir: "out" as const, text, at: nowIso(), status: "sent" as const };
    setState((s) => {
      const exists = s.conversations.some((c) => c.leadId === leadId);
      const conversations = exists
        ? s.conversations.map((c) =>
            c.leadId === leadId ? { ...c, messages: [...c.messages, msg] } : c,
          )
        : [...s.conversations, { leadId, messages: [msg], unread: 0 }];
      return act(
        touch({ ...s, conversations }, leadId),
        leadId,
        "message",
        "Mensagem enviada (simulada)",
      );
    });
    const setStatus = (status: "delivered" | "read") =>
      setState((s) => ({
        ...s,
        conversations: s.conversations.map((c) =>
          c.leadId === leadId
            ? { ...c, messages: c.messages.map((m) => (m.id === msg.id ? { ...m, status } : m)) }
            : c,
        ),
      }));
    timers.current.push(window.setTimeout(() => setStatus("delivered"), 700));
    timers.current.push(window.setTimeout(() => setStatus("read"), 1600));
    timers.current.push(
      window.setTimeout(() => {
        const replies = [
          "Perfeito, obrigado pelo retorno!",
          "Vou levar para a assembleia e retorno em breve.",
          "Pode me enviar mais detalhes por aqui?",
          "Combinado. Aguardo o contato.",
        ];
        setState((s) => ({
          ...touch(s, leadId),
          conversations: s.conversations.map((c) =>
            c.leadId === leadId
              ? {
                  ...c,
                  unread: c.unread + 1,
                  messages: [
                    ...c.messages,
                    {
                      id: uid(),
                      dir: "in",
                      text: replies[Math.floor(Math.random() * replies.length)]!,
                      at: nowIso(),
                      status: "received",
                    },
                  ],
                }
              : c,
          ),
        }));
      }, 3200),
    );
  }, []);

  const markRead = useCallback<Ctx["markRead"]>((leadId) => {
    setState((s) =>
      s.conversations.some((c) => c.leadId === leadId && c.unread)
        ? {
            ...s,
            conversations: s.conversations.map((c) =>
              c.leadId === leadId ? { ...c, unread: 0 } : c,
            ),
          }
        : s,
    );
  }, []);

  const upsertProposal = useCallback<Ctx["upsertProposal"]>((p) => {
    setState((s) => {
      const next = saveProposal(s, p, nowIso(), uid());
      return next === s ? s : act(next, p.leadId, "proposal", "Proposta atualizada");
    });
  }, []);

  const resolveAlert = useCallback(
    (id: string) => setState((s) => ({ ...s, resolvedAlerts: [...s.resolvedAlerts, id] })),
    [],
  );

  const logFollowUp = useCallback<Ctx["logFollowUp"]>((leadId, text, next) => {
    setState((s) => {
      let n = touch(s, leadId);
      if (next)
        n = {
          ...n,
          leads: n.leads.map((l) => (l.id === leadId ? { ...l, nextActivity: next } : l)),
          proposals: n.proposals.map((p) =>
            p.leadId === leadId ? { ...p, nextFollowUp: next } : p,
          ),
        };
      n = {
        ...n,
        comments: [
          ...n.comments,
          { id: uid(), leadId, text: `Follow-up: ${text}`, at: nowIso(), author: ACTOR },
        ],
      };
      return act(
        n,
        leadId,
        "followup",
        `Acompanhamento registrado${next ? ` — próximo em ${new Date(next).toLocaleDateString("pt-BR")}` : ""}`,
      );
    });
  }, []);

  const setAttribution = useCallback<Ctx["setAttribution"]>((leadId, source, reason) => {
    setState((s) => {
      const l = s.leads.find((x) => x.id === leadId);
      if (!l || l.source === source || reason.trim().length < 3) return s;
      const leads = s.leads.map((x) =>
        x.id === leadId
          ? {
              ...x,
              source,
              attribution: {
                ...x.attribution,
                method: "Atribuição manual",
                evidence: reason,
                confidence: "baixa" as const,
                channel: SOURCES[source].label,
              },
              attributionHistory: [
                ...x.attributionHistory,
                { at: nowIso(), by: ACTOR, from: x.source, to: source, reason },
              ],
            }
          : x,
      );
      return act(
        { ...s, leads },
        leadId,
        "attribution",
        `Origem alterada: ${SOURCES[l.source].label} → ${SOURCES[source].label}`,
      );
    });
  }, []);

  const setAlertRules = useCallback(
    (r: CrmState["alertRules"]) => setState((s) => ({ ...s, alertRules: r })),
    [],
  );
  const reset = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    openLead(null);
    setState(createSeed());
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      state,
      mode: "demo",
      owners: OWNERS,
      organizationName: "Resende Torres Engenharia",
      organizationId: null,
      openLeadId,
      openLead,
      moveStage,
      updateLead,
      addLead,
      addComment,
      sendMessage,
      markRead,
      upsertProposal,
      resolveAlert,
      logFollowUp,
      setAttribution,
      setAlertRules,
      reset,
    }),
    [
      state,
      openLeadId,
      moveStage,
      updateLead,
      addLead,
      addComment,
      sendMessage,
      markRead,
      upsertProposal,
      resolveAlert,
      logFollowUp,
      setAttribution,
      setAlertRules,
      reset,
    ],
  );
  return <CrmCtx.Provider value={value}>{children}</CrmCtx.Provider>;
}
