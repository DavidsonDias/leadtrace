import type { LeadFilter } from "@/lib/crm/metrics";
import { OWNERS, SOURCES, SOURCE_KEYS, type SourceKey } from "@/lib/crm/types";
import { Input } from "@/components/ui/input";

const sel = "h-9 rounded-md border border-input bg-card px-2 text-sm";

export function FilterBar({ value, onChange }: { value: LeadFilter; onChange: (f: LeadFilter) => void }) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <select aria-label="Período" className={sel} value={value.period} onChange={(e) => onChange({ ...value, period: e.target.value as LeadFilter["period"] })}>
        <option value="today">Hoje</option><option value="7">Últimos 7 dias</option><option value="30">Últimos 30 dias</option><option value="90">Últimos 90 dias</option><option value="all">Todo o período</option><option value="custom">Personalizado</option>
      </select>
      {value.period === "custom" && (<>
        <Input type="date" aria-label="De" className="h-9 w-auto" value={value.from ?? ""} onChange={(e) => onChange({ ...value, from: e.target.value })} />
        <Input type="date" aria-label="Até" className="h-9 w-auto" value={value.to ?? ""} onChange={(e) => onChange({ ...value, to: e.target.value })} />
      </>)}
      <select aria-label="Responsável" className={sel} value={value.owner ?? "all"} onChange={(e) => onChange({ ...value, owner: e.target.value })}>
        <option value="all">Todos os responsáveis</option>{OWNERS.map((o) => <option key={o}>{o}</option>)}
      </select>
      <select aria-label="Origem" className={sel} value={value.source ?? "all"} onChange={(e) => onChange({ ...value, source: e.target.value as SourceKey | "all" })}>
        <option value="all">Todas as origens</option>{SOURCE_KEYS.map((k) => <option key={k} value={k}>{SOURCES[k].label}</option>)}
      </select>
    </div>
  );
}
