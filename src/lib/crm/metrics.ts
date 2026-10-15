import type { CrmState, Lead, SourceKey } from "./types";

const DAY = 86_400_000;
export const daysSince = (iso: string, now = Date.now()) => Math.floor((now - new Date(iso).getTime()) / DAY);

export type AlertKind = "d7" | "d15" | "d30" | "overdue" | "awaiting";
export interface CrmAlert { id: string; kind: AlertKind; leadId: string; title: string; detail: string; severity: "info" | "warning" | "critical"; days: number }

/** Alerts are derived from persisted data only. One no-reply tier per proposal (highest reached). */
export function computeAlerts(s: CrmState, now = Date.now()): CrmAlert[] {
  const out: CrmAlert[] = [];
  const lead = (id: string) => s.leads.find((l) => l.id === id);
  for (const p of s.proposals) {
    if (p.status !== "enviada" && p.status !== "aguardando") continue;
    const l = lead(p.leadId);
    if (!l || l.stage !== "proposta_enviada") continue;
    const d = daysSince(l.lastInteraction, now);
    const sent = p.sentAt ? daysSince(p.sentAt, now) : d;
    const tier: AlertKind | null = d >= 30 ? "d30" : d >= 15 ? "d15" : d >= 7 ? "d7" : null;
    if (tier && s.alertRules[tier]) {
      out.push({
        id: `${tier}:${p.id}:${l.lastInteraction}`, kind: tier, leadId: l.id, days: d,
        severity: tier === "d30" ? "critical" : tier === "d15" ? "warning" : "info",
        title: `${d} dias sem retorno`,
        detail: `A proposta do ${l.company} foi enviada há ${sent} dias e ainda não recebeu retorno.`,
      });
    } else if (!tier && s.alertRules.awaiting) {
      out.push({ id: `awaiting:${p.id}:${l.lastInteraction}`, kind: "awaiting", leadId: l.id, days: d, severity: "info", title: "Proposta aguardando resposta", detail: `${l.company} — último contato há ${d} dia(s).` });
    }
  }
  if (s.alertRules.overdue) {
    for (const l of s.leads) {
      if (!l.nextActivity || l.stage === "fechado" || l.stage === "desqualificado") continue;
      const d = daysSince(l.nextActivity, now);
      if (d >= 1) out.push({ id: `overdue:${l.id}:${l.nextActivity}`, kind: "overdue", leadId: l.id, days: d, severity: "warning", title: "Atividade vencida", detail: `Próxima atividade com ${l.company} venceu há ${d} dia(s).` });
    }
  }
  const resolved = new Set(s.resolvedAlerts);
  return out.filter((a) => !resolved.has(a.id)).sort((a, b) => b.days - a.days);
}

export interface LeadFilter { period: "today" | "7" | "30" | "90" | "all" | "custom"; from?: string; to?: string; owner?: string; source?: SourceKey | "all" }

export function filterLeads(leads: Lead[], f: LeadFilter, now = Date.now()): Lead[] {
  return leads.filter((l) => {
    const t = new Date(l.createdAt).getTime();
    if (f.period === "today" && now - t > DAY) return false;
    if (["7", "30", "90"].includes(f.period) && now - t > Number(f.period) * DAY) return false;
    if (f.period === "custom") {
      if (f.from && t < new Date(f.from).getTime()) return false;
      if (f.to && t > new Date(f.to).getTime() + DAY) return false;
    }
    if (f.owner && f.owner !== "all" && l.owner !== f.owner) return false;
    if (f.source && f.source !== "all" && l.source !== f.source) return false;
    return true;
  });
}

export function kpis(s: CrmState, leads: Lead[], now = Date.now()) {
  const ids = new Set(leads.map((l) => l.id));
  const props = s.proposals.filter((p) => ids.has(p.leadId));
  const closed = leads.filter((l) => l.stage === "fechado").length;
  const decided = leads.filter((l) => l.stage === "fechado" || l.stage === "desqualificado").length;
  return {
    total: leads.length,
    novos: leads.filter((l) => l.stage === "novo").length,
    qualificados: leads.filter((l) => l.stage === "qualificado").length,
    pendentes: props.filter((p) => p.status === "a_preparar").length,
    enviadas: props.filter((p) => p.status === "enviada" || p.status === "aguardando").length,
    fechados: closed,
    desqualificados: leads.filter((l) => l.stage === "desqualificado").length,
    aguardandoResposta: s.conversations.filter((c) => ids.has(c.leadId) && c.messages.at(-1)?.dir === "in").length,
    semMovimento: leads.filter((l) => !["fechado", "desqualificado"].includes(l.stage) && daysSince(l.lastInteraction, now) >= 7).length,
    conversao: decided > 0 ? Math.round((closed / leads.length) * 100) : null,
  };
}

export const brl = (v?: number) => (v == null ? "—" : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }));
export const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) : "—");
export const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
export const relDays = (iso: string, now = Date.now()) => { const d = daysSince(iso, now); return d <= 0 ? "hoje" : d === 1 ? "ontem" : `há ${d} dias`; };
