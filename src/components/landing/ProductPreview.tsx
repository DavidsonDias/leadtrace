import { usePreviewReady } from "./usePreviewReady";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  LayoutDashboard,
  MessagesSquare,
  Radar,
  Columns3,
  CircleCheck,
} from "lucide-react";
import { exampleLead, presentation } from "./presentation";
import { kpis } from "@/lib/crm/metrics";
import { STAGES, stageLabel } from "@/lib/crm/types";
import { Logo } from "@/components/brand/Logo";
import { OriginBadge } from "@/components/crm/OriginBadge";

const totals = kpis(presentation, presentation.leads);
const tabs = ["Visão geral", "Conversas", "Pipeline"] as const;
type View = (typeof tabs)[number];
const money = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export function OriginChart() {
  const sources = ["google_ads", "google_organic", "site", "unknown"] as const;
  return (
    <div className="lp-source-chart">
      {sources.map((source) => {
        const count = presentation.leads.filter((l) => l.source === source).length;
        return (
          <div key={source}>
            <div className="lp-chart-label">
              <OriginBadge source={source} />
              <span>{count} leads</span>
            </div>
            <div className="lp-track">
              <span style={{ width: `${(count / presentation.leads.length) * 100}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
export function PipelinePreview({ compact = false }: { compact?: boolean }) {
  const stages = STAGES.filter((s) => s.key !== "desqualificado");
  return (
    <div className={`lp-kanban ${compact ? "lp-kanban-compact" : ""}`}>
      {stages.map((stage) => {
        const leads = presentation.leads.filter((l) => l.stage === stage.key);
        return (
          <div key={stage.key} className="lp-kanban-column">
            <p className="lp-column-label">
              <span />
              {stage.label}
              <b>{leads.length}</b>
            </p>
            {leads.slice(0, compact ? 1 : 2).map((lead) => (
              <article className="lp-opportunity" key={lead.id}>
                <OriginBadge source={lead.source} />
                <h4>{lead.company}</h4>
                <p>{lead.name}</p>
                <footer>
                  <span>{lead.value === undefined ? "Sem estimativa" : money(lead.value)}</span>
                  <span className="lp-initials" title={lead.owner}>
                    {lead.owner
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </footer>
              </article>
            ))}
          </div>
        );
      })}
    </div>
  );
}
export function InboxPreview() {
  const ready = usePreviewReady();
  const [selected, setSelected] = useState(0);
  const conversations = presentation.conversations.slice(0, 3);
  const conversation = conversations[selected]!;
  const lead = presentation.leads.find((l) => l.id === conversation.leadId)!;
  return (
    <div className="lp-inbox">
      <div className="lp-conversations" aria-label="Conversas da prévia">
        {conversations.map((c, i) => {
          const contact = presentation.leads.find((l) => l.id === c.leadId)!;
          return (
            <button
              key={c.leadId}
              aria-label={`Ver conversa de ${contact.name}`}
              disabled={!ready}
              type="button"
              aria-pressed={selected === i}
              onClick={() => setSelected(i)}
            >
              <span className="lp-initials">
                {contact.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
              <span>
                <strong>{contact.name}</strong>
                <small>{contact.company}</small>
              </span>
              <ChevronRight size={14} />
            </button>
          );
        })}
      </div>
      <div className="lp-thread">
        <div className="lp-thread-heading">
          <strong>{lead.name}</strong>
          <OriginBadge source={lead.source} />
        </div>
        <div className="lp-messages">
          {conversation.messages.slice(0, 3).map((m) => (
            <div key={m.id} className={`lp-message ${m.dir === "out" ? "lp-message-out" : ""}`}>
              <p>{m.text}</p>
              <time dateTime={m.at}>
                {new Date(m.at).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "UTC",
                })}
              </time>
            </div>
          ))}
        </div>
        <p className="lp-preview-note">Conversa fictícia · envio disponível na demonstração</p>
      </div>
      <aside className="lp-contact">
        <span className="lp-initials">
          {lead.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </span>
        <strong>{lead.name}</strong>
        <p>{lead.company}</p>
        <dl>
          <dt>Etapa</dt>
          <dd>{stageLabel(lead.stage)}</dd>
          <dt>Responsável</dt>
          <dd>{lead.owner}</dd>
          <dt>Origem</dt>
          <dd>
            <OriginBadge source={lead.source} />
          </dd>
        </dl>
      </aside>
    </div>
  );
}
export function ProductPreview() {
  const ready = usePreviewReady();
  const [view, setView] = useState<View>("Visão geral");
  return (
    <div className="lp-product reveal-in">
      <div className="lp-product-top">
        <Logo sub={false} />
        <span className="lp-demo-label">
          <span />
          Dados fictícios · prévia interativa
        </span>
        <span className="lp-product-org">Resende Torres Engenharia</span>
      </div>
      <div className="lp-product-body">
        <aside className="lp-product-sidebar">
          <span className="lp-workspace-label">WORKSPACE</span>
          {[
            [LayoutDashboard, "Dashboard"],
            [MessagesSquare, "Inbox"],
            [Radar, "Origem"],
            [Columns3, "Pipeline"],
          ].map(([I, name], i) => {
            const Icon = I as typeof Radar;
            return (
              <span key={String(name)} className={i === 0 ? "is-current" : ""}>
                <Icon size={15} />
                {String(name)}
              </span>
            );
          })}
          <div className="lp-sidebar-signature">
            LeadTrace CRM
            <br />
            <small>by SevenDevX</small>
          </div>
        </aside>
        <div className="lp-product-main">
          <div className="lp-dashboard-heading">
            <div>
              <p>SEU COMERCIAL, EM PERSPECTIVA</p>
              <h3>Cada oportunidade conta.</h3>
            </div>
            <Link to="/app" aria-label="Abrir dashboard na demonstração">
              <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="lp-preview-tabs" role="group" aria-label="Visualização da prévia">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                disabled={!ready}
                aria-pressed={view === tab}
                onClick={() => setView(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="lp-preview-content" key={view}>
            {view === "Visão geral" ? (
              <>
                <div className="lp-metrics">
                  {[
                    ["Total de leads", totals.total],
                    ["Qualificados", totals.qualificados],
                    ["Propostas", presentation.proposals.length],
                    ["Negócios fechados", totals.fechados],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <span>{label}</span>
                      <strong>{value}</strong>
                      <small>
                        <Check size={11} />
                        Base demonstrativa
                      </small>
                    </div>
                  ))}
                </div>
                <div className="lp-dashboard-bottom">
                  <section className="lp-panel">
                    <div className="lp-panel-title">
                      <h4>De onde vêm as oportunidades</h4>
                      <Radar size={16} />
                    </div>
                    <OriginChart />
                  </section>
                  <section className="lp-panel">
                    <div className="lp-panel-title">
                      <h4>Uma origem. Todo o contexto.</h4>
                      <CircleCheck size={16} />
                    </div>
                    <div className="lp-featured-lead">
                      <OriginBadge source={exampleLead.source} />
                      <h4>{exampleLead.company}</h4>
                      <p>
                        {exampleLead.name} · {exampleLead.service}
                      </p>
                      <div className="lp-proof">
                        <Check size={14} />
                        {exampleLead.attribution.method}
                        <span>Confiança alta</span>
                      </div>
                      <div className="lp-mini-path">
                        <span>Campanha</span>
                        <ChevronRight size={12} />
                        <span>Contato</span>
                        <ChevronRight size={12} />
                        <span>Pipeline</span>
                      </div>
                    </div>
                  </section>
                </div>
              </>
            ) : view === "Conversas" ? (
              <InboxPreview />
            ) : (
              <PipelinePreview />
            )}
          </div>
        </div>
      </div>
      <div className="lp-product-bottom">
        <span>Prévia de apresentação · sem alterações nos seus dados</span>
        <Link to="/app">
          Explorar o CRM <ArrowUpRight size={13} />
        </Link>
      </div>
    </div>
  );
}
