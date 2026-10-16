import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useCrm } from "@/lib/crm/store";
import { brl, fmtDate } from "@/lib/crm/metrics";
import { PROPOSAL_STATUS, type ProposalStatus } from "@/lib/crm/types";
import { PageHeader, EmptyState } from "@/components/crm/PageHeader";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/deals")({ component: Deals });

function Deals() {
  const { state, upsertProposal, openLead } = useCrm();
  const [status, setStatus] = useState<ProposalStatus | "all">("all");
  const rows = state.proposals.filter((p) => status === "all" || p.status === status).map((p) => ({ p, l: state.leads.find((l) => l.id === p.leadId)! })).filter((x) => x.l);
  const totals = (Object.keys(PROPOSAL_STATUS) as ProposalStatus[]).map((s) => ({ s, n: state.proposals.filter((p) => p.status === s).length, v: state.proposals.filter((p) => p.status === s).reduce((a, p) => a + p.value, 0) }));

  return (
    <div>
      <PageHeader title="LeadTrace Deals" subtitle="Acompanhamento de propostas comerciais" />
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setStatus("all")} className={cn("shrink-0 rounded-lg border border-border px-3 py-2 text-left text-sm", status === "all" && "border-primary bg-primary/10")}>Todas<span className="block text-xs text-muted-foreground">{state.proposals.length}</span></button>
        {totals.map((t) => <button key={t.s} onClick={() => setStatus(t.s)} className={cn("shrink-0 rounded-lg border border-border px-3 py-2 text-left text-sm", status === t.s && "border-primary bg-primary/10")}>{PROPOSAL_STATUS[t.s]}<span className="block text-xs text-muted-foreground">{t.n} · {brl(t.v)}</span></button>)}
      </div>
      {rows.length === 0 ? <EmptyState title="Nenhuma proposta neste status" /> : (
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-muted-foreground"><tr className="border-b border-border">{["Lead / Empresa", "Responsável", "Valor", "Envio", "Status", "Último contato", "Próximo acompanhamento", "Observações"].map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}</tr></thead>
          <tbody>{rows.map(({ p, l }) => (
            <tr key={p.id} className="border-b border-border/50">
              <td className="px-3 py-2"><button className="text-left hover:text-primary" onClick={() => openLead(l.id)}><p className="font-medium">{l.company}</p><p className="text-xs text-muted-foreground">{l.name}</p></button></td>
              <td className="whitespace-nowrap px-3 py-2">{l.owner}</td>
              <td className="px-3 py-2"><Input type="number" aria-label="Valor" className="h-8 w-28" defaultValue={p.value} onBlur={(e) => { const v = Number(e.target.value); if (v !== p.value) { upsertProposal({ leadId: l.id, value: v }); toast.success("Valor atualizado"); } }} /></td>
              <td className="whitespace-nowrap px-3 py-2">{fmtDate(p.sentAt)}</td>
              <td className="px-3 py-2"><select aria-label="Status" className="h-8 rounded-md border border-input bg-background px-1 text-xs" value={p.status} onChange={(e) => { const s = e.target.value as ProposalStatus; upsertProposal({ leadId: l.id, status: s, ...(s === "enviada" && !p.sentAt ? { sentAt: new Date().toISOString() } : {}) }); toast.success(`Proposta: ${PROPOSAL_STATUS[s]}`); }}>
                {(Object.keys(PROPOSAL_STATUS) as ProposalStatus[]).map((s) => <option key={s} value={s}>{PROPOSAL_STATUS[s]}</option>)}</select></td>
              <td className="whitespace-nowrap px-3 py-2">{fmtDate(l.lastInteraction)}</td>
              <td className="px-3 py-2"><Input type="date" aria-label="Próximo acompanhamento" className="h-8 w-36" value={p.nextFollowUp?.slice(0, 10) ?? ""} onChange={(e) => upsertProposal({ leadId: l.id, nextFollowUp: e.target.value ? new Date(e.target.value + "T12:00:00").toISOString() : undefined })} /></td>
              <td className="px-3 py-2"><Input aria-label="Observações" className="h-8 min-w-40" defaultValue={p.notes} onBlur={(e) => e.target.value !== p.notes && upsertProposal({ leadId: l.id, notes: e.target.value })} /></td>
            </tr>))}</tbody>
        </table>
      </div>)}
    </div>
  );
}
