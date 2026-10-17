import { useMemo, useState } from "react";
import { useCrm } from "@/lib/crm/context";
import { filterLeads, fmtDate, type LeadFilter } from "@/lib/crm/metrics";
import { SOURCES, SOURCE_KEYS } from "@/lib/crm/types";
import { ConfidenceMeter, OriginBadge, sourceColor } from "@/components/crm/OriginBadge";
import { PageHeader, Panel } from "@/components/crm/PageHeader";
import { FilterBar } from "@/components/crm/FilterBar";
import type { CSSProperties } from "react";

export function Origin() {
  const { state, openLead } = useCrm();
  const [f, setF] = useState<LeadFilter>({ period: "all", owner: "all", source: "all" });
  const leads = useMemo(() => filterLeads(state.leads, f), [state.leads, f]);
  const max = Math.max(1, ...SOURCE_KEYS.map((k) => leads.filter((l) => l.source === k).length));
  const campaigns = Object.entries(
    leads.reduce<Record<string, { n: number; closed: number }>>((a, l) => {
      const c = l.attribution.campaign;
      if (!c) return a;
      a[c] ??= { n: 0, closed: 0 };
      a[c].n++;
      if (l.stage === "fechado") a[c].closed++;
      return a;
    }, {}),
  );
  const audits = state.leads.flatMap((l) => l.attributionHistory.map((h) => ({ ...h, l })));

  return (
    <div>
      <PageHeader
        title="LeadTrace Origin"
        subtitle="Atribuição somente com evidência técnica. Sem evidência = “Origem desconhecida”."
      />
      <FilterBar value={f} onChange={setF} />
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Leads por canal" className="lg:col-span-2">
          <ul className="space-y-2">
            {SOURCE_KEYS.map((k) => {
              const n = leads.filter((l) => l.source === k).length;
              return (
                <li key={k}>
                  <button
                    className="flex w-full items-center gap-3 text-left text-sm"
                    onClick={() => setF({ ...f, source: f.source === k ? "all" : k })}
                  >
                    <span className="w-44 shrink-0 truncate">{SOURCES[k].label}</span>
                    <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <span
                        className="block h-full rounded-full origin-dot"
                        style={
                          { "--c": sourceColor(k), width: `${(n / max) * 100}%` } as CSSProperties
                        }
                      />
                    </span>
                    <span className="w-6 text-right font-medium">{n}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>
        <Panel title="Campanhas (fictícias)">
          <ul className="space-y-2 text-sm">
            {campaigns.map(([c, v]) => (
              <li key={c} className="flex justify-between gap-2">
                <span className="truncate font-mono text-xs">{c}</span>
                <span className="text-xs text-muted-foreground">
                  {v.n} leads · {v.closed} fechados
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[11px] text-muted-foreground">
            Captura real via UTM/gclid requer o script de rastreamento no site (Fase 2).
          </p>
        </Panel>
      </div>
      <Panel title="Evidências de atribuição" className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr className="border-b border-border">
                {["Lead", "Origem", "Método", "Evidência", "Confiança", "Primeiro toque"].map(
                  (h) => (
                    <th key={h} className="px-2 py-2 font-medium">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr
                  key={l.id}
                  className="cursor-pointer border-b border-border/50 hover:bg-accent"
                  onClick={() => openLead(l.id)}
                >
                  <td className="px-2 py-2">
                    <p className="font-medium">{l.company}</p>
                    <p className="text-xs text-muted-foreground">{l.name}</p>
                  </td>
                  <td className="px-2 py-2">
                    <OriginBadge source={l.source} />
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 text-xs">{l.attribution.method}</td>
                  <td className="min-w-64 px-2 py-2 text-xs text-muted-foreground">
                    {l.attribution.evidence}
                  </td>
                  <td className="px-2 py-2">
                    <ConfidenceMeter value={l.attribution.confidence} />
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 text-xs">
                    {fmtDate(l.attribution.firstTouch)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title="Histórico de atribuições manuais" className="mt-4">
        {audits.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma alteração manual registrada.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {audits.map((a, i) => (
              <li key={i}>
                {fmtDate(a.at)} · {a.by} · <b>{a.l.company}</b>: {SOURCES[a.from].label} →{" "}
                {SOURCES[a.to].label} — “{a.reason}”
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
