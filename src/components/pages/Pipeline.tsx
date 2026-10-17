import { useMemo, useState } from "react";
import { AlertCircle, GripVertical } from "lucide-react";
import { useCrm } from "@/lib/crm/context";
import { brl, daysSince, filterLeads, fmtDate, relDays, type LeadFilter } from "@/lib/crm/metrics";
import { STAGES, type StageKey } from "@/lib/crm/types";
import { OriginBadge } from "@/components/crm/OriginBadge";
import { PageHeader } from "@/components/crm/PageHeader";
import { FilterBar } from "@/components/crm/FilterBar";
import { DisqualifyDialog } from "@/components/crm/DisqualifyDialog";
import { cn } from "@/lib/utils";
import { useCrmFeedback } from "@/lib/crm/feedback";

export function Pipeline() {
  const toast = useCrmFeedback();
  const { state, moveStage, openLead } = useCrm();
  const [f, setF] = useState<LeadFilter>({ period: "all", owner: "all", source: "all" });
  const [over, setOver] = useState<StageKey | null>(null);
  const [pendingDq, setPendingDq] = useState<string | null>(null);
  const leads = useMemo(() => filterLeads(state.leads, f), [state.leads, f]);

  const move = (id: string, to: StageKey) => {
    if (to === "desqualificado") {
      setPendingDq(id);
      return;
    }
    const l = state.leads.find((x) => x.id === id);
    if (l && l.stage !== to) {
      moveStage(id, to);
      toast.success(`${l.company} → ${STAGES.find((s) => s.key === to)!.label}`);
    }
  };
  const dqLead = state.leads.find((l) => l.id === pendingDq);

  return (
    <div>
      <PageHeader
        title="LeadTrace Pipeline"
        subtitle="Arraste os cards entre etapas ou use o seletor no card (teclado/mobile)."
      />
      <FilterBar value={f} onChange={setF} />
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-4 md:-mx-0 md:px-0">
        {STAGES.map((s) => {
          const items = leads.filter((l) => l.stage === s.key);
          const total = items.reduce((a, l) => a + (l.value ?? 0), 0);
          return (
            <section
              key={s.key}
              aria-label={s.label}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(s.key);
              }}
              onDragLeave={() => setOver(null)}
              onDrop={(e) => {
                e.preventDefault();
                setOver(null);
                move(e.dataTransfer.getData("text/plain"), s.key);
              }}
              className={cn(
                "flex w-72 shrink-0 snap-start flex-col rounded-xl border border-border bg-card/50 transition-colors",
                over === s.key && "border-primary bg-primary/5",
              )}
            >
              <header className="flex items-center justify-between border-b border-border p-3">
                <div>
                  <h2 className="text-sm font-semibold">{s.label}</h2>
                  <p className="text-[11px] text-muted-foreground">{brl(total)}</p>
                </div>
                <span className="rounded-full bg-muted px-2 text-xs">{items.length}</span>
              </header>
              <div className="flex min-h-32 flex-1 flex-col gap-2 p-2">
                {items.map((l) => {
                  const stale =
                    !["fechado", "desqualificado"].includes(l.stage) &&
                    daysSince(l.lastInteraction) >= 7;
                  return (
                    <article
                      key={l.id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("text/plain", l.id)}
                      className="group cursor-grab rounded-lg border border-border bg-card p-3 shadow-card transition-transform hover:-translate-y-0.5 active:cursor-grabbing"
                    >
                      <button className="w-full text-left" onClick={() => openLead(l.id)}>
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold leading-tight">{l.company}</p>
                          <GripVertical className="size-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {l.name} · {l.service}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <OriginBadge source={l.source} />
                          {l.value != null && (
                            <span className="text-xs font-medium">{brl(l.value)}</span>
                          )}
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>
                            {l.owner.split(" ")[0]} · entrou {fmtDate(l.createdAt)}
                          </span>
                          <span className={cn("flex items-center gap-1", stale && "text-warning")}>
                            {stale && <AlertCircle className="size-3" />}
                            {relDays(l.lastInteraction)}
                          </span>
                        </div>
                        {l.disqualifyReason && (
                          <p className="mt-1 text-[11px] text-destructive">{l.disqualifyReason}</p>
                        )}
                      </button>
                      <select
                        aria-label={`Mover ${l.company}`}
                        className="mt-2 h-7 w-full rounded border border-input bg-background px-1 text-xs"
                        value={l.stage}
                        onChange={(e) => move(l.id, e.target.value as StageKey)}
                      >
                        {STAGES.map((x) => (
                          <option key={x.key} value={x.key}>
                            Mover: {x.label}
                          </option>
                        ))}
                      </select>
                    </article>
                  );
                })}
                {items.length === 0 && (
                  <p className="p-4 text-center text-xs text-muted-foreground">Solte cards aqui</p>
                )}
              </div>
            </section>
          );
        })}
      </div>
      <DisqualifyDialog
        open={!!pendingDq}
        onOpenChange={(o) => !o && setPendingDq(null)}
        leadName={dqLead?.company ?? ""}
        onConfirm={(r, n) => {
          if (pendingDq) {
            moveStage(pendingDq, "desqualificado", r, n);
            toast("Lead desqualificado", { description: r });
          }
        }}
      />
    </div>
  );
}
