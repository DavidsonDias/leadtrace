import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCrm } from "@/lib/crm/store";
import { OWNERS, SOURCES, SOURCE_KEYS, STAGES, type SourceKey, type StageKey } from "@/lib/crm/types";
import { brl, fmtDate } from "@/lib/crm/metrics";
import { ConfidenceMeter, OriginBadge } from "./OriginBadge";
import { DisqualifyDialog } from "./DisqualifyDialog";
import { MessagesSquare } from "lucide-react";
import { toast } from "sonner";

export const selectCls = "h-9 w-full rounded-md border border-input bg-background px-2 text-sm";

export function LeadSheet() {
  const { state, openLeadId, openLead } = useCrm();
  const lead = state.leads.find((l) => l.id === openLeadId);
  return (
    <Sheet open={!!lead} onOpenChange={(o) => !o && openLead(null)}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        {lead && <LeadDetail key={lead.id} id={lead.id} />}
      </SheetContent>
    </Sheet>
  );
}

function LeadDetail({ id }: { id: string }) {
  const { state, moveStage, updateLead, addComment, setAttribution, openLead } = useCrm();
  const lead = state.leads.find((l) => l.id === id)!;
  const [comment, setComment] = useState("");
  const [dq, setDq] = useState(false);
  const [attr, setAttr] = useState<SourceKey>(lead.source);
  const [attrReason, setAttrReason] = useState("");
  const comments = state.comments.filter((c) => c.leadId === id).sort((a, b) => b.at.localeCompare(a.at));
  const acts = state.activities.filter((a) => a.leadId === id).slice(0, 12);
  const a = lead.attribution;

  return (
    <>
      <SheetHeader>
        <SheetTitle className="font-display text-xl">{lead.name}</SheetTitle>
        <SheetDescription>{lead.role} · {lead.company}</SheetDescription>
      </SheetHeader>
      <div className="space-y-6 px-4 pb-8">
        <div className="flex flex-wrap gap-2"><OriginBadge source={lead.source} />{lead.tags.map((t) => <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-[11px]">{t}</span>)}</div>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div><dt className="text-xs text-muted-foreground">Telefone</dt><dd>{lead.phone}</dd></div>
          <div><dt className="text-xs text-muted-foreground">E-mail</dt><dd className="truncate">{lead.email}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Serviço</dt><dd>{lead.service}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Valor estimado</dt><dd>{brl(lead.value)}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Entrada</dt><dd>{fmtDate(lead.createdAt)}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Último contato</dt><dd>{fmtDate(lead.lastInteraction)}</dd></div>
        </dl>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs">Etapa</Label>
            <select className={selectCls} value={lead.stage} onChange={(e) => { const v = e.target.value as StageKey; if (v === "desqualificado") setDq(true); else moveStage(id, v); }}>
              {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select></div>
          <div><Label className="text-xs">Responsável</Label>
            <select className={selectCls} value={lead.owner} onChange={(e) => updateLead(id, { owner: e.target.value })}>{OWNERS.map((o) => <option key={o}>{o}</option>)}</select></div>
          <div className="col-span-2"><Label className="text-xs">Próxima atividade</Label>
            <Input type="date" value={lead.nextActivity?.slice(0, 10) ?? ""} onChange={(e) => updateLead(id, { nextActivity: e.target.value ? new Date(e.target.value + "T12:00:00").toISOString() : undefined })} /></div>
        </div>
        {lead.disqualifyReason && <p className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-xs">Desqualificado: {lead.disqualifyReason}{lead.disqualifyNote ? ` — ${lead.disqualifyNote}` : ""}</p>}
        <Button variant="outline" size="sm" asChild onClick={() => openLead(null)}><Link to="/app/inbox" search={{ lead: id }}><MessagesSquare /> Abrir conversa</Link></Button>

        <section className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold">Origem do lead</h3>
          <dl className="grid grid-cols-2 gap-2 text-xs">
            <div><dt className="text-muted-foreground">Canal</dt><dd>{a.channel}</dd></div>
            <div><dt className="text-muted-foreground">Confiança</dt><dd><ConfidenceMeter value={a.confidence} /></dd></div>
            <div><dt className="text-muted-foreground">Método</dt><dd>{a.method}</dd></div>
            <div><dt className="text-muted-foreground">Campanha</dt><dd>{a.campaign ?? "—"}</dd></div>
            {a.gclid && <div><dt className="text-muted-foreground">gclid</dt><dd className="font-mono">{a.gclid}</dd></div>}
            {a.referrer && <div><dt className="text-muted-foreground">Referrer</dt><dd className="truncate">{a.referrer}</dd></div>}
            {a.landingPage && <div><dt className="text-muted-foreground">Landing page</dt><dd>{a.landingPage}</dd></div>}
            {a.utm && Object.entries(a.utm).map(([k, v]) => <div key={k}><dt className="font-mono text-muted-foreground">{k}</dt><dd className="font-mono">{v}</dd></div>)}
          </dl>
          <p className="mt-2 text-xs text-muted-foreground">Evidência: {a.evidence}</p>
          <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
            <Label className="text-xs">Atribuição manual (auditada)</Label>
            <select className={selectCls} value={attr} onChange={(e) => setAttr(e.target.value as SourceKey)}>{SOURCE_KEYS.map((k) => <option key={k} value={k}>{SOURCES[k].label}</option>)}</select>
            <Input placeholder="Justificativa (obrigatória)" value={attrReason} onChange={(e) => setAttrReason(e.target.value)} />
            <Button size="sm" variant="secondary" disabled={attr === lead.source || attrReason.trim().length < 3} onClick={() => { setAttribution(id, attr, attrReason.trim()); setAttrReason(""); toast.success("Origem atualizada e registrada na auditoria"); }}>Salvar atribuição</Button>
            {lead.attributionHistory.map((h, i) => <p key={i} className="text-[11px] text-muted-foreground">{fmtDate(h.at)} · {h.by}: {SOURCES[h.from].label} → {SOURCES[h.to].label} — “{h.reason}”</p>)}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold">Comentários</h3>
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!comment.trim()) return; addComment(id, comment.trim()); setComment(""); toast.success("Comentário registrado"); }}>
            <Textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Registrar comentário…" aria-label="Novo comentário" />
            <Button type="submit" size="sm">Salvar</Button>
          </form>
          <ul className="mt-3 space-y-2">{comments.map((c) => <li key={c.id} className="rounded-md bg-muted p-2 text-sm"><p>{c.text}</p><p className="mt-1 text-[11px] text-muted-foreground">{c.author} · {fmtDate(c.at)}</p></li>)}</ul>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold">Timeline</h3>
          <ol className="space-y-2 border-l border-border pl-4">{acts.map((x) => <li key={x.id} className="relative text-xs"><span className="absolute -left-[21px] top-1 size-2 rounded-full bg-primary" />{x.text}<span className="block text-muted-foreground">{new Date(x.at).toLocaleString("pt-BR")}</span></li>)}</ol>
        </section>
      </div>
      <DisqualifyDialog open={dq} onOpenChange={setDq} leadName={lead.company} onConfirm={(r, n) => { moveStage(id, "desqualificado", r, n); toast("Lead desqualificado", { description: r }); }} />
    </>
  );
}
