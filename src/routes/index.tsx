import { useEffect, useState } from "react";
import { SITE_URL } from "@/lib/site";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  Check,
  ChevronRight,
  FileText,
  Menu,
  X,
  ShieldCheck,
  Smartphone,
  Radar,
  Columns3,
  MessagesSquare,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import {
  ProductPreview,
  PipelinePreview,
  InboxPreview,
  OriginChart,
} from "@/components/landing/ProductPreview";
import { presentation } from "@/components/landing/presentation";
import { OriginJourney } from "@/components/landing/OriginJourney";
import { PROPOSAL_STATUS } from "@/lib/crm/types";
import { computeAlerts } from "@/lib/crm/metrics";
import "@/components/landing/landing.css";

export const Route = createFileRoute("/")({
  head: () => ({
    links: [{ rel: "canonical", href: SITE_URL + "/" }],
    meta: [
      { title: "LeadTrace CRM — Rastreie cada lead. Desenvolva cada oportunidade." },
      {
        name: "description",
        content:
          "CRM inteligente que centraliza conversas, identifica a origem dos leads e organiza propostas e follow-ups. Desenvolvido pela SevenDevX.",
      },
      {
        property: "og:title",
        content: "LeadTrace CRM — Track every lead. Grow every opportunity.",
      },
      {
        property: "og:description",
        content:
          "Centralize conversas, descubra de onde vêm seus leads e gerencie cada oportunidade em um CRM inteligente.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL + "/" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "LeadTrace CRM",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          description: "CRM & Lead Intelligence Platform",
          creator: { "@type": "Organization", name: "SevenDevX", url: "https://sevendevx.com/" },
        }),
      },
    ],
  }),
  component: Landing,
});

const sections = [
  ["funcionalidades", "Funcionalidades"],
  ["como-funciona", "Como funciona"],
  ["beneficios", "Benefícios"],
] as const;
function Landing() {
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 20);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  useEffect(() => {
    if (!menu) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenu(false);
        document.getElementById("landing-menu-toggle")?.focus();
      }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [menu]);
  const demoAlerts = computeAlerts(presentation, Date.UTC(2026, 0, 1)).slice(0, 2);
  return (
    <div className="lp-root">
      <a className="lp-skip" href="#conteudo">
        Ir para o conteúdo
      </a>
      <header className={`lp-header ${scrolled ? "lp-header-scrolled" : ""}`}>
        <div className="lp-container lp-nav">
          <Link to="/" aria-label="LeadTrace início">
            <Logo />
          </Link>
          <nav className="lp-desktop-nav" aria-label="Seções">
            {sections.map(([id, label]) => (
              <a key={id} href={`#${id}`}>
                {label}
              </a>
            ))}
          </nav>
          <div className="lp-nav-actions">
            <Link to="/login" className="lp-signin">
              Acessar plataforma <ArrowUpRight size={14} />
            </Link>
            <Button variant="hero" size="sm" asChild className="lp-desktop-cta">
              <Link to="/app">
                Explorar demonstração <ArrowRight />
              </Link>
            </Button>
            <button
              id="landing-menu-toggle"
              className="lp-menu-toggle"
              type="button"
              aria-label={menu ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menu}
              aria-controls="landing-mobile-menu"
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {menu && (
          <nav id="landing-mobile-menu" className="lp-mobile-nav" aria-label="Menu principal">
            {sections.map(([id, label]) => (
              <a key={id} href={`#${id}`} onClick={() => setMenu(false)}>
                {label}
                <ChevronRight size={16} />
              </a>
            ))}
            <Link to="/login" onClick={() => setMenu(false)}>
              Acessar plataforma <ArrowUpRight size={16} />
            </Link>
            <Link to="/app">
              Explorar demonstração <ArrowRight size={16} />
            </Link>
          </nav>
        )}
      </header>
      <main id="conteudo">
        <section className="lp-hero lp-container">
          <div className="lp-hero-copy reveal-in">
            <div>
              <p className="lp-eyebrow">
                <span className="lp-status-dot" />
                LEAD INTELLIGENCE & RELATIONSHIP MANAGEMENT
              </p>
              <h1>
                Cada lead tem
                <br />
                uma <em>origem.</em>
                <br />
                <span>
                  Cada oportunidade,
                  <br />
                  um próximo passo.
                </span>
              </h1>
            </div>
            <div className="lp-hero-support">
              <p>
                Descubra de onde vêm seus contatos, centralize conversas e acompanhe cada
                oportunidade em um CRM feito para transformar dados em decisões.
              </p>
              <div className="lp-hero-actions">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/app">
                    Explorar demonstração <ArrowUpRight />
                  </Link>
                </Button>
                <a href="#origem" className="lp-text-link">
                  Conhecer o LeadTrace <ArrowRight size={16} />
                </a>
              </div>
              <p className="lp-tagline">Track every lead. Grow every opportunity.</p>
              <div className="lp-hero-footnote">
                <span>01 /</span> Da primeira interação à próxima decisão.
              </div>
            </div>
          </div>
          <ProductPreview />
          <div className="lp-product-caption">
            <p>
              O seu comercial inteiro.
              <br />
              <strong>Uma visão conectada.</strong>
            </p>
            <span>Origem → Conversa → Oportunidade → Acompanhamento</span>
            <a href="#origem" aria-label="Conhecer a inteligência de origem">
              <ArrowRight size={22} />
            </a>
          </div>
        </section>
        <section id="origem" className="lp-section lp-container">
          <div className="lp-section-heading">
            <div>
              <p className="lp-eyebrow">01 — LEADTRACE ORIGIN</p>
              <h2>
                Saiba de onde vem
                <br />
                cada <em>oportunidade.</em>
              </h2>
            </div>
            <p>
              Não basta receber contatos. Entenda o caminho até a conversa, confira a evidência e
              decida o próximo passo com contexto.
            </p>
          </div>
          <OriginJourney />
        </section>
        <section id="funcionalidades" className="lp-section lp-container">
          <div className="lp-section-heading">
            <div>
              <p className="lp-eyebrow">02 — UM COMERCIAL CONECTADO</p>
              <h2>
                Do primeiro “olá”
                <br />à decisão final.
              </h2>
            </div>
            <p>
              Uma operação simples de acompanhar. Com as informações que importam, onde você precisa
              delas.
            </p>
          </div>
          <div className="lp-bento">
            <article className="lp-feature lp-feature-origin">
              <div className="lp-feature-heading">
                <Radar size={22} />
                <span>INTELIGÊNCIA DE ORIGEM</span>
              </div>
              <h3>
                Mais clareza sobre
                <br />a origem dos contatos.
              </h3>
              <p>
                Compare os canais da sua base. Sem evidência técnica, a origem permanece
                desconhecida.
              </p>
              <OriginChart />
              <Link to="/app/origin" className="lp-text-link">
                Explorar origens <ArrowUpRight size={16} />
              </Link>
            </article>
            <article className="lp-feature lp-feature-inbox">
              <div className="lp-feature-heading">
                <MessagesSquare size={22} />
                <span>LEADTRACE INBOX</span>
              </div>
              <h3>
                Todas as conversas.
                <br />
                Todo o contexto.
              </h3>
              <p>
                Histórico, origem e responsável juntos. Prévia fictícia; WhatsApp oficial ainda
                depende de configuração.
              </p>
              <InboxPreview />
              <Link to="/app/inbox" className="lp-text-link">
                Abrir inbox demonstrativa <ArrowUpRight size={16} />
              </Link>
            </article>
            <article className="lp-feature lp-feature-pipeline">
              <div className="lp-feature-copy">
                <div className="lp-feature-heading">
                  <Columns3 size={22} />
                  <span>PIPELINE COMERCIAL</span>
                </div>
                <h3>
                  Transforme conversas
                  <br />
                  em oportunidades.
                </h3>
                <p>
                  Qualifique, mova etapas e registre o próximo passo. Experimente o Kanban funcional
                  na demonstração.
                </p>
                <Link to="/app/pipeline" className="lp-text-link">
                  Explorar o pipeline <ArrowUpRight size={16} />
                </Link>
              </div>
              <PipelinePreview compact />
            </article>
            <article className="lp-feature lp-small-feature">
              <div className="lp-feature-heading">
                <Bell size={21} />
                <span>FOLLOW-UP</span>
              </div>
              <h3>Menos oportunidades esquecidas.</h3>
              <div className="lp-alert-list">
                {demoAlerts.map((a) => (
                  <div key={a.id}>
                    <span className="lp-status-dot" />
                    <span>{a.detail}</span>
                  </div>
                ))}
              </div>
              <Link to="/app/followup" className="lp-text-link">
                Ver acompanhamentos <ArrowUpRight size={16} />
              </Link>
            </article>
            <article className="lp-feature lp-small-feature">
              <div className="lp-feature-heading">
                <FileText size={21} />
                <span>PROPOSTAS</span>
              </div>
              <h3>Acompanhe até a decisão.</h3>
              <div className="lp-proposal-list">
                {presentation.proposals.slice(0, 2).map((p) => (
                  <div key={p.id}>
                    <span>
                      {presentation.leads.find((l) => l.id === p.leadId)?.company}
                      <small>{PROPOSAL_STATUS[p.status]}</small>
                    </span>
                    <strong>
                      {p.value.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                        maximumFractionDigits: 0,
                      })}
                    </strong>
                  </div>
                ))}
              </div>
              <Link to="/app/deals" className="lp-text-link">
                Explorar propostas <ArrowUpRight size={16} />
              </Link>
            </article>
            <article className="lp-feature lp-small-feature">
              <div className="lp-feature-heading">
                <Radar size={21} />
                <span>VISÃO EXECUTIVA</span>
              </div>
              <h3>Dados que conversam entre si.</h3>
              <div className="lp-analytics">
                <strong>
                  {presentation.leads.length}
                  <small>leads fictícios</small>
                </strong>
                <span>
                  <Check size={15} />
                  Uma base para todos os módulos
                </span>
              </div>
              <Link to="/app" className="lp-text-link">
                Abrir dashboard <ArrowUpRight size={16} />
              </Link>
            </article>
          </div>
          <p className="lp-preview-note lp-bento-note">
            Todas as prévias desta página usam dados fictícios do ambiente demonstrativo.
          </p>
        </section>
        <section id="como-funciona" className="lp-process-section">
          <div className="lp-container">
            <div className="lp-section-heading">
              <div>
                <p className="lp-eyebrow">03 — UM FLUXO, DO INÍCIO AO FIM</p>
                <h2>
                  Seu próximo passo,
                  <br />
                  sempre à vista.
                </h2>
              </div>
              <p>
                Da captura ao acompanhamento, cada etapa acrescenta contexto à mesma oportunidade.
              </p>
            </div>
            <ol className="lp-process">
              {[
                [
                  "Capture",
                  "Um novo contato",
                  "Cadastre manualmente ou prepare a captura por formulários e canais oficiais.",
                ],
                [
                  "Identifique",
                  "Uma origem verificável",
                  "Registre UTMs, referrer ou informação declarada. Sem evidência, sem suposições.",
                ],
                [
                  "Avance",
                  "Uma oportunidade em movimento",
                  "Qualifique o lead, organize a proposta e atualize a etapa no Kanban.",
                ],
                [
                  "Acompanhe",
                  "Uma próxima ação",
                  "Defina datas e consulte os alertas calculados a partir do histórico.",
                ],
              ].map(([name, detail, copy], i) => (
                <li key={name}>
                  <span className="lp-step-number">0{i + 1}</span>
                  <h3>{name}</h3>
                  <strong>{detail}</strong>
                  <p>{copy}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <section id="beneficios" className="lp-section lp-container lp-benefits">
          <div>
            <p className="lp-eyebrow">04 — CLAREZA PARA O DIA A DIA</p>
            <h2>
              Seu comercial
              <br />
              organizado.
              <br />
              <em>Sem complicação.</em>
            </h2>
            <p>
              Mais contexto para atender.
              <br />
              Mais clareza para acompanhar.
            </p>
            <Button variant="outline" asChild>
              <Link to="/app">
                Conheça na prática <ArrowUpRight />
              </Link>
            </Button>
          </div>
          <div className="lp-benefit-list">
            {[
              [
                "01",
                "Menos oportunidades esquecidas.",
                "Próximas atividades e retornos pendentes visíveis, sem depender da memória.",
              ],
              [
                "02",
                "Mais clareza sobre a origem dos contatos.",
                "Fontes, campanhas e evidências reunidas para avaliar seus canais.",
              ],
              [
                "03",
                "Propostas acompanhadas até a decisão.",
                "Valor, status e próxima data de acompanhamento ligados ao mesmo lead.",
              ],
            ].map(([number, title, copy]) => (
              <article key={number}>
                <span>{number}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
                <ArrowUpRight size={18} />
              </article>
            ))}
            <div className="lp-assurances">
              <span>
                <ShieldCheck size={17} />
                Papéis e auditoria preparados
              </span>
              <span>
                <Smartphone size={17} />
                Desktop, tablet e celular
              </span>
            </div>
          </div>
        </section>
        <section className="lp-final lp-container">
          <p className="lp-eyebrow">
            <span className="lp-status-dot" />
            LEADTRACE CRM · BY SEVENDEVX
          </p>
          <div>
            <h2>
              O próximo passo
              <br />
              começa com <em>clareza.</em>
            </h2>
            <div>
              <Button variant="hero" size="lg" asChild>
                <Link to="/app">
                  Explorar demonstração <ArrowUpRight />
                </Link>
              </Button>
              <p>
                Explore com dados fictícios.
                <br />
                Nenhuma mensagem real será enviada.
              </p>
            </div>
          </div>
          <p className="lp-tagline">Track every lead. Grow every opportunity.</p>
        </section>
      </main>
      <footer className="lp-footer">
        <div className="lp-container">
          <Logo />
          <p>
            LeadTrace CRM — by SevenDevX ·{" "}
            <a href="https://sevendevx.com/" target="_blank" rel="noopener noreferrer">
              Desenvolvido por SevenDevX
            </a>
          </p>
          <a href="#conteudo" aria-label="Voltar ao início">
            ↑
          </a>
        </div>
      </footer>
    </div>
  );
}
