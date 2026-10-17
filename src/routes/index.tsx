import { SITE_URL } from "@/lib/site";
import { createSeed } from "@/lib/crm/seed";
import { kpis } from "@/lib/crm/metrics";
import { SOURCES, type SourceKey } from "@/lib/crm/types";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  Columns3,
  FileText,
  MessagesSquare,
  Radar,
  ShieldCheck,
  Smartphone,
  Workflow,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { OriginBadge } from "@/components/crm/OriginBadge";

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
      { property: "og:image", content: SITE_URL + "/og-leadtrace.png" },
      { name: "twitter:image", content: SITE_URL + "/og-leadtrace.png" },
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

const FEATURES = [
  {
    id: "inbox",
    icon: MessagesSquare,
    t: "Central de atendimento",
    d: "Conversas em um só lugar, ligadas ao lead, com histórico, responsável e status. Preparado para a API oficial do WhatsApp Business.",
  },
  {
    id: "origin",
    icon: Radar,
    t: "Inteligência de origem",
    d: "UTMs, gclid, referrer e formulários viram evidência. Cada lead mostra de onde veio — e com qual grau de confiança.",
  },
  {
    id: "pipeline",
    icon: Columns3,
    t: "Pipeline comercial",
    d: "Kanban com arrastar e soltar, motivo de desqualificação, comentários e timeline completa.",
  },
  {
    id: "deals",
    icon: FileText,
    t: "Gestão de propostas",
    d: "Valor, status, data de envio e próximo acompanhamento de cada proposta, sem planilhas.",
  },
  {
    id: "followup",
    icon: Bell,
    t: "Alertas e follow-up",
    d: "Avisos de 7, 15 e 30 dias sem retorno e atividades vencidas, calculados a partir dos seus dados.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Logo />
          <nav className="hidden gap-6 text-sm text-muted-foreground md:flex" aria-label="Seções">
            <a href="#funcionalidades" className="hover:text-foreground">
              Funcionalidades
            </a>
            <a href="#como-funciona" className="hover:text-foreground">
              Como funciona
            </a>
            <a href="#beneficios" className="hover:text-foreground">
              Benefícios
            </a>
          </nav>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
              <Link to="/login">Acessar plataforma</Link>
            </Button>
            <Button variant="hero" size="sm" asChild>
              <Link to="/app">Explorar demonstração</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]" />
          <div className="pointer-events-none absolute inset-0 bg-glow" />
          <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 text-center md:pt-24">
            <p className="mx-auto mb-5 inline-flex rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
              CRM & Lead Intelligence Platform · by SevenDevX
            </p>
            <h1 className="mx-auto max-w-4xl font-display text-4xl font-extrabold leading-[1.05] md:text-6xl">
              Cada lead tem uma história.{" "}
              <span className="text-brand">Acompanhe cada oportunidade.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Centralize conversas, descubra de onde vêm seus clientes e gerencie tudo em um CRM
              inteligente.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button variant="hero" size="lg" asChild>
                <Link to="/app">
                  Explorar demonstração <ArrowRight />
                </Link>
              </Button>
              <Button variant="glass" size="lg" asChild>
                <Link to="/login">Acessar plataforma</Link>
              </Button>
            </div>
            <Mockup />
          </div>
        </section>

        <section id="funcionalidades" className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-center font-display text-3xl font-bold md:text-4xl">
            Tudo o que o comercial precisa, nada além
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
            Feito para equipes que recebem dezenas de leads por semana e não podem perder nenhum.
          </p>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <article
                key={f.id}
                className="rounded-2xl border border-border bg-card p-6 shadow-card transition-transform hover:-translate-y-1"
              >
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{f.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
              </article>
            ))}
            <article className="rounded-2xl border border-primary/40 bg-primary/5 p-6">
              <h3 className="text-lg font-semibold">Origem sem achismo</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Sem evidência técnica, o LeadTrace marca o lead como origem desconhecida — e
                registra toda atribuição manual.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <OriginBadge source="google_ads" />
                <OriginBadge source="gbp" />
                <OriginBadge source="instagram" />
                <OriginBadge source="referral" />
                <OriginBadge source="unknown" />
              </div>
            </article>
          </div>
        </section>

        <section id="como-funciona" className="border-y border-border bg-card/40 py-20">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-center font-display text-3xl font-bold md:text-4xl">
              Como funciona
            </h2>
            <ol className="mt-12 grid gap-6 md:grid-cols-4">
              {[
                ["Capture", "Links rastreáveis, formulários e conversas chegam ao LeadTrace."],
                ["Identifique", "A origem é atribuída com evidência e nível de confiança."],
                ["Avance", "Qualifique, envie propostas e mova no pipeline."],
                ["Acompanhe", "Alertas lembram cada retorno pendente."],
              ].map(([t, d], i) => (
                <li key={t} className="rounded-xl border border-border bg-background p-5">
                  <span className="font-display text-3xl font-extrabold text-brand">0{i + 1}</span>
                  <h3 className="mt-2 font-semibold">{t}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="beneficios" className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-center font-display text-3xl font-bold md:text-4xl">
            Benefícios comerciais
          </h2>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              [
                Workflow,
                "Saiba onde investir",
                "Compare canais pelos leads e negócios fechados que realmente geram.",
              ],
              [
                Bell,
                "Nenhuma proposta esquecida",
                "Follow-ups automáticos com base em dias sem retorno.",
              ],
              [
                ShieldCheck,
                "Governança e segurança",
                "Arquitetura multiempresa, papéis de acesso e auditoria de alterações.",
              ],
              [
                Smartphone,
                "Em qualquer tela",
                "Desktop, tablet e celular, instalável como aplicativo.",
              ],
            ].map(([I, t, d]) => {
              const Icon = I as typeof Bell;
              return (
                <div key={t as string} className="flex gap-4 rounded-xl border border-border p-5">
                  <Icon className="size-5 shrink-0 text-primary" />
                  <div>
                    <h3 className="font-semibold">{t as string}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{d as string}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="px-4 pb-20">
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-border bg-card p-10 text-center shadow-elegant">
            <div className="pointer-events-none absolute inset-0 bg-glow" />
            <h2 className="relative font-display text-3xl font-bold">
              Track every lead. Grow every opportunity.
            </h2>
            <p className="relative mt-2 text-muted-foreground">
              Explore o ambiente demonstrativo com dados fictícios.
            </p>
            <Button variant="hero" size="lg" className="relative mt-6" asChild>
              <Link to="/app">
                Explorar demonstração <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 text-sm text-muted-foreground">
          <Logo />
          <p>
            LeadTrace CRM — by SevenDevX ·{" "}
            <a
              href="https://sevendevx.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Desenvolvido por SevenDevX
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

function Mockup() {
  const demo = createSeed(Date.UTC(2026, 0, 1));
  const totals = kpis(demo, demo.leads);
  const bars = Object.entries(
    demo.leads.reduce<Record<string, number>>((acc, lead) => {
      acc[lead.source] = (acc[lead.source] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(
      ([key, count]) =>
        [
          SOURCES[key as SourceKey].label,
          Math.round((count / demo.leads.length) * 100),
          SOURCES[key as SourceKey].token,
        ] as const,
    );
  return (
    <div
      className="relative mx-auto mt-14 max-w-5xl animate-float rounded-2xl border border-border bg-card p-3 text-left shadow-elegant"
      aria-label="Prévia do dashboard LeadTrace"
      role="img"
    >
      <p className="mb-3 text-xs text-muted-foreground">
        Prévia com dados fictícios da demonstração
      </p>
      <div className="flex gap-3">
        <div className="hidden w-40 space-y-1.5 rounded-xl bg-sidebar p-3 md:block">
          {["Dashboard", "Inbox", "Pipeline", "Leads", "Origem", "Propostas", "Follow-up"].map(
            (n, i) => (
              <div
                key={n}
                className={`rounded px-2 py-1 text-xs ${i === 0 ? "bg-sidebar-accent text-foreground" : "text-muted-foreground"}`}
              >
                {n}
              </div>
            ),
          )}
        </div>
        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {[
              ["Leads", totals.total],
              ["Qualificados", totals.qualificados],
              ["Propostas", demo.proposals.length],
              ["Fechados", totals.fechados],
            ].map(([l, v]) => (
              <div key={l} className="rounded-lg border border-border bg-background p-3">
                <p className="text-[10px] text-muted-foreground">{l}</p>
                <p className="font-display text-xl font-bold">{v}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="mb-2 text-[11px] font-semibold">Leads por origem</p>
              {bars.map(([l, w, t]) => (
                <div key={l} className="mb-1.5 flex items-center gap-2 text-[10px]">
                  <span className="w-16 text-muted-foreground">{l}</span>
                  <span
                    className="h-2 rounded-full origin-dot"
                    style={{ width: `${w}%`, ["--c" as string]: `var(${t})` }}
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 rounded-lg border border-border bg-background p-3">
              {["Novo", "Qualificado", "Proposta"].map((c, i) => (
                <div key={c}>
                  <p className="mb-1 text-[10px] text-muted-foreground">{c}</p>
                  {Array.from({ length: 3 - i }).map((_, k) => (
                    <div key={k} className="mb-1 h-8 rounded border border-border bg-card" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
