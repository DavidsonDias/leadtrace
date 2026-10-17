import { useState } from "react";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { useCrm } from "@/lib/crm/context";
import { computeAlerts, type AlertKind, type CrmAlert } from "@/lib/crm/metrics";
import { PageHeader, EmptyState } from "@/components/crm/PageHeader";
import { OriginBadge } from "@/components/crm/OriginBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useCrmFeedback } from "@/lib/crm/feedback";

const KINDS: { k: AlertKind | "all"; l: string }[] = [
  { k: "all", l: "Todos" },
  { k: "d30", l: "30 dias" },
  { k: "d15", l: "15 dias" },
  { k: "d7", l: "7 dias" },
  { k: "overdue", l: "Atividade vencida" },
  { k: "awaiting", l: "Aguardando resposta" },
];

export function FollowUp() {
  const { state } = useCrm();
  const [kind, setKind] = useState<AlertKind | "all">("all");
  const alerts = computeAlerts(state).filter((a) => kind === "all" || a.kind === kind);
  return (
    <div>
      <PageHeader
        title="LeadTrace Follow-up"
        subtitle="Alertas calculados a partir dos dados salvos. Notificações externas ficam para fases futuras."
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {KINDS.map((x) => (
          <Button
            key={x.k}
            size="sm"
            variant={kind === x.k ? "default" : "outline"}
            onClick={() => setKind(x.k)}
          >
            {x.l}
          </Button>
        ))}
      </div>
      {alerts.length === 0 ? (
        <EmptyState title="Nenhuma pendência" hint="Tudo em dia por aqui." />
      ) : (
        <ul className="space-y-3">
          {alerts.map((a) => (
            <AlertCard key={a.id} a={a} />
          ))}
        </ul>
      )}
    </div>
  );
}

function AlertCard({ a }: { a: CrmAlert }) {
  const toast = useCrmFeedback();
  const { state, openLead, logFollowUp, resolveAlert } = useCrm();
  const l = state.leads.find((x) => x.id === a.leadId)!;
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [date, setDate] = useState("");
  return (
    <li
      className={cn(
        "rounded-xl border bg-card p-4",
        a.severity === "critical"
          ? "border-destructive/50"
          : a.severity === "warning"
            ? "border-warning/40"
            : "border-border",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-3">
          {a.severity === "critical" ? (
            <AlertTriangle className="mt-0.5 size-5 text-destructive" />
          ) : (
            <Clock className="mt-0.5 size-5 text-warning" />
          )}
          <div>
            <p className="font-semibold">{a.title}</p>
            <p className="text-sm text-muted-foreground">{a.detail}</p>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <OriginBadge source={l.source} />
              {l.owner}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => openLead(l.id)}>
            Abrir lead
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setOpen(!open)}>
            Registrar acompanhamento
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              resolveAlert(a.id);
              toast.success("Alerta resolvido");
            }}
          >
            <CheckCircle2 /> Resolver
          </Button>
        </div>
      </div>
      {open && (
        <form
          className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;
            logFollowUp(
              l.id,
              text.trim(),
              date ? new Date(date + "T12:00:00").toISOString() : undefined,
            );
            toast.success("Acompanhamento registrado");
            setOpen(false);
          }}
        >
          <Input
            className="min-w-60 flex-1"
            placeholder="O que foi feito? (ex.: liguei para o síndico)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-label="Descrição do acompanhamento"
          />
          <Input
            type="date"
            className="w-auto"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-label="Nova data"
          />
          <Button type="submit">Salvar</Button>
        </form>
      )}
    </li>
  );
}
