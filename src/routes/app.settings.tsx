import { createFileRoute } from "@tanstack/react-router";
import { useCrm } from "@/lib/crm/context";
import { OWNERS, SOURCES, SOURCE_KEYS, STAGES } from "@/lib/crm/types";
import { PageHeader, Panel } from "@/components/crm/PageHeader";
import { OriginBadge } from "@/components/crm/OriginBadge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { privateRouteMeta } from "@/lib/route-meta";

export const Route = createFileRoute("/app/settings")({
  head: () => privateRouteMeta("Configurações demonstrativas", "Preferências, alertas e estado das integrações no ambiente fictício do LeadTrace CRM."),
  component: Settings,
});

const INTEGRATIONS = [
  {
    n: "WhatsApp Business (Cloud API oficial)",
    s: "Demonstração",
    d: "Conversas simuladas. Conexão real via conector oficial da Meta na Fase 3.",
  },
  {
    n: "Google OAuth",
    s: "Não configurado",
    d: "Login com Google será ativado junto com a autenticação real (Fase 2).",
  },
  {
    n: "Google Ads",
    s: "Não configurado",
    d: "Importação de conversões e gclid prevista para a Fase 3.",
  },
  {
    n: "Site institucional",
    s: "Não configurado",
    d: "Script de captura de UTM/referrer e formulário (Fase 2).",
  },
  {
    n: "Webhooks",
    s: "Não configurado",
    d: "Endpoints de entrada para formulários e plataformas externas.",
  },
];
const ROLES = [
  { r: "Administrador", d: "Acesso total, usuários e integrações" },
  { r: "Gestor", d: "Pipeline, propostas, relatórios" },
  { r: "Atendente", d: "Inbox e leads atribuídos" },
];

function Settings() {
  const { state, setAlertRules, reset } = useCrm();
  const r = state.alertRules;
  const rules: [keyof typeof r, string][] = [
    ["d7", "7 dias sem retorno"],
    ["d15", "15 dias sem retorno"],
    ["d30", "30 dias sem retorno"],
    ["overdue", "Atividade vencida"],
    ["awaiting", "Proposta aguardando resposta"],
  ];
  return (
    <div>
      <PageHeader title="Configurações" subtitle="Organização: Resende Torres Engenharia (demo)" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Organização">
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Nome</dt>
              <dd>Resende Torres Engenharia</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Site</dt>
              <dd>
                <a
                  className="text-primary"
                  href="https://www.resendetorres.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  resendetorres.com
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Plano</dt>
              <dd>Piloto</dd>
            </div>
          </dl>
        </Panel>
        <Panel title="Usuários e permissões">
          <ul className="space-y-1 text-sm">
            {OWNERS.map((o, i) => (
              <li key={o} className="flex justify-between">
                <span>{o}</span>
                <span className="text-xs text-muted-foreground">{ROLES[i]?.r}</span>
              </li>
            ))}
          </ul>
          <ul className="mt-3 space-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
            {ROLES.map((x) => (
              <li key={x.r}>
                <b className="text-foreground">{x.r}:</b> {x.d}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Alertas">
          <ul className="space-y-3">
            {rules.map(([k, l]) => (
              <li key={k} className="flex items-center justify-between text-sm">
                <label htmlFor={`r-${k}`}>{l}</label>
                <Switch
                  id={`r-${k}`}
                  checked={r[k]}
                  onCheckedChange={(v) => setAlertRules({ ...r, [k]: v })}
                />
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Pipeline">
          <ol className="list-inside list-decimal space-y-1 text-sm">
            {STAGES.map((s) => (
              <li key={s.key}>{s.label}</li>
            ))}
          </ol>
        </Panel>
        <Panel title="Origens" className="lg:col-span-2">
          <div className="flex flex-wrap gap-2">
            {SOURCE_KEYS.map((k) => (
              <OriginBadge key={k} source={k} />
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {Object.keys(SOURCES).length} origens configuradas.
          </p>
        </Panel>
        <Panel title="Integrações" className="lg:col-span-2">
          <ul className="divide-y divide-border">
            {INTEGRATIONS.map((i) => (
              <li key={i.n} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="text-sm font-medium">{i.n}</p>
                  <p className="text-xs text-muted-foreground">{i.d}</p>
                </div>
                <span
                  className={
                    i.s === "Demonstração"
                      ? "rounded-full bg-warning/15 px-2 py-0.5 text-xs text-warning"
                      : "rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                  }
                >
                  {i.s}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Ambiente demonstrativo" className="lg:col-span-2">
          <p className="mb-3 text-sm text-muted-foreground">
            Dados fictícios guardados apenas neste navegador, isolados de qualquer dado real.
          </p>
          <Button
            variant="destructive"
            onClick={() => {
              reset();
              toast.success("Dados demonstrativos restaurados");
            }}
          >
            Restaurar dados da demo
          </Button>
        </Panel>
      </div>
    </div>
  );
}
