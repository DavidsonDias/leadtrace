import type { CSSProperties } from "react";
import { SOURCES, type Confidence, type SourceKey } from "@/lib/crm/types";
import { cn } from "@/lib/utils";

export const sourceColor = (s: SourceKey) => `var(${SOURCES[s].token})`;

export function OriginBadge({ source, className }: { source: SourceKey; className?: string }) {
  return (
    <span style={{ "--c": sourceColor(source) } as CSSProperties} className={cn("origin-badge inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium", className)}>
      <span className="origin-dot size-1.5 rounded-full" />
      {SOURCES[source].label}
    </span>
  );
}

const CONF: Record<Confidence, { label: string; bars: number }> = {
  alta: { label: "Alta", bars: 3 }, media: { label: "Média", bars: 2 }, baixa: { label: "Baixa", bars: 1 }, nenhuma: { label: "Sem evidência", bars: 0 },
};
export function ConfidenceMeter({ value }: { value: Confidence }) {
  const c = CONF[value];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground" title={`Confiança da atribuição: ${c.label}`}>
      <span className="flex items-end gap-0.5" aria-hidden>
        {[1, 2, 3].map((i) => <span key={i} className={cn("w-1 rounded-sm", i <= c.bars ? "bg-primary" : "bg-border")} style={{ height: 4 + i * 3 }} />)}
      </span>
      {c.label}
    </span>
  );
}
