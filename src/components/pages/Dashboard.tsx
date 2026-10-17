import { CrmLink } from "@/components/crm/CrmLink";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  MessageCircle,
  Sparkles,
  Target,
  Users,
  XCircle,
  Hourglass,
  TrendingUp,
} from "lucide-react";
import { useCrm } from "@/lib/crm/context";
import { computeAlerts, filterLeads, kpis, relDays, type LeadFilter } from "@/lib/crm/metrics";
import {
  PROPOSAL_STATUS,
  SOURCES,
  STAGES,
  type ProposalStatus,
  type SourceKey,
} from "@/lib/crm/types";
import { FilterBar } from "@/components/crm/FilterBar";
import { PageHeader, Panel, EmptyState } from "@/components/crm/PageHeader";
import { OriginBadge, sourceColor } from "@/components/crm/OriginBadge";

const tip = {
  contentStyle: {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    fontSize: 12,
  },
  labelStyle: { color: "var(--foreground)" },
};

export function Dashboard() {
  const { state, openLead } = useCrm();
  const [f, setF] = useState<LeadFilter>({ period: "90", owner: "all", source: "all" });
  const leads = useMemo(() => filterLeads(state.leads, f), [state.leads, f]);
  const k = kpis(state, leads);
  const alerts = computeAlerts(state).slice(0, 5);

  const bySource = Object.entries(
    leads.reduce<Record<string, number>>((a, l) => ((a[l.source] = (a[l.source] ?? 0) + 1), a), {}),
  )
    .map(([s, v]) => ({ key: s as SourceKey, name: SOURCES[s as SourceKey].label, v }))
    .sort((a, b) => b.v - a.v);
  const byWeek = useMemo(() => {
    const weeks: { name: string; leads: number; fechados: number }[] = [];
    for (let w = 11; w >= 0; w--) {
      const end = Date.now() - w * 7 * 86400000,
        start = end - 7 * 86400000;
      const inW = leads.filter((l) => {
        const t = new Date(l.createdAt).getTime();
        return t > start && t <= end;
      });
      weeks.push({
        name: new Date(end).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        leads: inW.length,
        fechados: inW.filter((l) => l.stage === "fechado").length,
      });
    }
    return weeks;
  }, [leads]);
  const byStage = STAGES.map((s, i) => ({
    name: s.label,
    v: leads.filter((l) => l.stage === s.key).length,
    c: `var(--chart-${(i % 5) + 1})`,
  }));
  const ids = new Set(leads.map((l) => l.id));
  const byProp = (Object.keys(PROPOSAL_STATUS) as ProposalStatus[]).map((s) => ({
    name: PROPOSAL_STATUS[s],
    v: state.proposals.filter((p) => ids.has(p.leadId) && p.status === s).length,
  }));
  const pending = state.conversations
    .filter((c) => ids.has(c.leadId) && c.messages.at(-1)?.dir === "in")
    .slice(0, 5);
  const upcoming = leads
    .filter((l) => l.nextActivity && !["fechado", "desqualificado"].includes(l.stage))
    .sort((a, b) => a.nextActivity!.localeCompare(b.nextActivity!))
    .slice(0, 5);

  const cards = [
    { l: "Total de leads", v: k.total, i: Users },
    { l: "Novos leads", v: k.novos, i: Sparkles },
    { l: "Qualificados", v: k.qualificados, i: Target },
    { l: "Propostas a preparar", v: k.pendentes, i: Hourglass },
    { l: "Propostas enviadas", v: k.enviadas, i: FileText },
    { l: "Negócios fechados", v: k.fechados, i: CheckCircle2 },
    { l: "Desqualificados", v: k.desqualificados, i: XCircle },
    { l: "Aguardando resposta", v: k.aguardandoResposta, i: MessageCircle },
    { l: "Sem movimentação 7d+", v: k.semMovimento, i: Clock },
    { l: "Taxa de conversão", v: k.conversao == null ? "—" : `${k.conversao}%`, i: TrendingUp },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard executivo"
        subtitle="Resende Torres Engenharia · visão comercial"
      />
      <FilterBar value={f} onChange={setF} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {cards.map((c) => (
          <div key={c.l} className="rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              {c.l}
              <c.i className="size-4 text-primary" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold">{c.v}</p>
          </div>
        ))}
      </div>

      {leads.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="Nenhum lead no período" hint="Ajuste os filtros acima." />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Panel title="Leads por período (semanal)" className="lg:col-span-2">
            <div className="h-56">
              <ResponsiveContainer>
                <AreaChart data={byWeek}>
                  <defs>
                    <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="var(--teal)" stopOpacity={0.5} />
                      <stop offset="1" stopColor="var(--teal)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={24}
                  />
                  <Tooltip {...tip} />
                  <Area
                    type="monotone"
                    dataKey="leads"
                    name="Leads"
                    stroke="var(--teal)"
                    fill="url(#ga)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="fechados"
                    name="Fechados"
                    stroke="var(--electric)"
                    fill="transparent"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>
          <Panel title="Distribuição por etapa">
            <div className="h-56">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={byStage}
                    dataKey="v"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {byStage.map((s) => (
                      <Cell key={s.name} fill={s.c} />
                    ))}
                  </Pie>
                  <Tooltip {...tip} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Panel>
          <Panel title="Leads por origem" className="lg:col-span-2">
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={bySource} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" allowDecimals={false} hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={140}
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip {...tip} cursor={{ fill: "var(--accent)" }} />
                  <Bar dataKey="v" name="Leads" radius={[0, 6, 6, 0]}>
                    {bySource.map((s) => (
                      <Cell key={s.key} fill={sourceColor(s.key)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
          <Panel title="Propostas por status">
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={byProp}>
                  <XAxis
                    dataKey="name"
                    stroke="var(--muted-foreground)"
                    fontSize={9}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis
                    allowDecimals={false}
                    width={20}
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip {...tip} cursor={{ fill: "var(--accent)" }} />
                  <Bar dataKey="v" name="Propostas" fill="var(--electric)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel
          title="Alertas comerciais"
          action={
            <CrmLink module="followup" className="text-xs text-primary">
              Ver todos
            </CrmLink>
          }
        >
          <ul className="space-y-2">
            {alerts.length === 0 ? (
              <li className="text-sm text-muted-foreground">Nenhum alerta pendente.</li>
            ) : (
              alerts.map((a) => (
                <li key={a.id}>
                  <button
                    onClick={() => openLead(a.leadId)}
                    className="flex w-full gap-2 rounded-md p-2 text-left text-sm hover:bg-accent"
                  >
                    <AlertTriangle
                      className={
                        a.severity === "critical"
                          ? "size-4 shrink-0 text-destructive"
                          : "size-4 shrink-0 text-warning"
                      }
                    />
                    <span>
                      <span className="font-medium">{a.title}</span>
                      <span className="block text-xs text-muted-foreground">{a.detail}</span>
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </Panel>
        <Panel title="Próximos acompanhamentos">
          <ul className="space-y-1">
            {upcoming.map((l) => (
              <li key={l.id}>
                <button
                  onClick={() => openLead(l.id)}
                  className="flex w-full items-center justify-between gap-2 rounded-md p-2 text-left text-sm hover:bg-accent"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{l.company}</span>
                    <span className="text-xs text-muted-foreground">{l.owner}</span>
                  </span>
                  <span
                    className={
                      new Date(l.nextActivity!) < new Date()
                        ? "text-xs text-destructive"
                        : "text-xs text-muted-foreground"
                    }
                  >
                    {new Date(l.nextActivity!).toLocaleDateString("pt-BR")}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel
          title="Conversas pendentes"
          action={
            <CrmLink module="inbox" className="text-xs text-primary">
              Inbox
            </CrmLink>
          }
        >
          <ul className="space-y-1">
            {pending.map((c) => {
              const l = state.leads.find((x) => x.id === c.leadId)!;
              return (
                <li key={c.leadId}>
                  <CrmLink
                    module="inbox"
                    lead={l.id}
                    className="flex items-center justify-between gap-2 rounded-md p-2 text-sm hover:bg-accent"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{l.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {c.messages.at(-1)!.text}
                      </span>
                    </span>
                    <OriginBadge source={l.source} />
                  </CrmLink>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <Panel title="Atividades recentes" className="mt-4">
        <ul className="divide-y divide-border">
          {state.activities.slice(0, 8).map((a) => {
            const l = state.leads.find((x) => x.id === a.leadId);
            return (
              <li key={a.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="min-w-0 truncate">
                  <span className="font-medium">{l?.company}</span> — {a.text}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">{relDays(a.at)}</span>
              </li>
            );
          })}
        </ul>
      </Panel>
      <p className="mt-8 text-center text-[11px] text-muted-foreground">
        LeadTrace CRM · by SevenDevX
      </p>
    </div>
  );
}
