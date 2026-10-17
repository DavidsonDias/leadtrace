import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Columns3,
  FileText,
  LayoutDashboard,
  MessagesSquare,
  Radar,
  RotateCcw,
  Settings,
  Users,
  LogOut,
  FlaskConical,
} from "lucide-react";
import { CrmProvider, useCrm } from "@/lib/crm/store";
import { computeAlerts } from "@/lib/crm/metrics";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { LeadSheet } from "@/components/crm/LeadSheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/app")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Demonstração — LeadTrace CRM" },
      {
        name: "description",
        content: "Ambiente demonstrativo do LeadTrace CRM com dados fictícios.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AppLayout,
});

const NAV = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/app/inbox", label: "Inbox", icon: MessagesSquare },
  { to: "/app/pipeline", label: "Pipeline", icon: Columns3 },
  { to: "/app/leads", label: "Leads", icon: Users },
  { to: "/app/origin", label: "Origem", icon: Radar },
  { to: "/app/deals", label: "Propostas", icon: FileText },
  { to: "/app/followup", label: "Follow-up", icon: Bell },
  { to: "/app/settings", label: "Configurações", icon: Settings },
] as const;

function AppLayout() {
  return (
    <CrmProvider>
      <Shell />
    </CrmProvider>
  );
}

function Shell() {
  const { state, reset } = useCrm();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const alerts = computeAlerts(state).length;
  const unread = state.conversations.reduce((a, c) => a + c.unread, 0);
  const isActive = (to: string, exact?: boolean) =>
    exact ? path === to || path === to + "/" : path.startsWith(to);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="px-5 py-5">
          <Link to="/" aria-label="LeadTrace — início">
            <Logo />
          </Link>
        </div>
        <div className="mx-3 mb-3 rounded-lg border border-border bg-card p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Organização</p>
          <p className="mt-0.5 text-sm font-semibold">Resende Torres Engenharia</p>
          <p className="text-[11px] text-muted-foreground">Cliente piloto · demo</p>
        </div>
        <nav className="flex-1 space-y-0.5 px-3" aria-label="Principal">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground",
                isActive(n.to, "exact" in n) && "bg-sidebar-accent font-medium text-foreground",
              )}
            >
              <n.icon className={cn("size-4", isActive(n.to, "exact" in n) && "text-primary")} />
              <span className="flex-1">{n.label}</span>
              {n.to === "/app/inbox" && unread > 0 && (
                <span className="rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                  {unread}
                </span>
              )}
              {n.to === "/app/followup" && alerts > 0 && (
                <span className="rounded-full bg-warning px-1.5 text-[10px] font-bold text-primary-foreground">
                  {alerts}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="space-y-2 p-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground"
            onClick={() => {
              reset();
              toast.success("Dados demonstrativos restaurados");
            }}
          >
            <RotateCcw /> Restaurar demo
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground"
            asChild
          >
            <Link to="/login">
              <LogOut /> Sair da demo
            </Link>
          </Button>
          <a
            href="https://sevendevx.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-3 pt-1 text-[10px] text-muted-foreground hover:text-foreground"
          >
            Desenvolvido por SevenDevX
          </a>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pb-16 lg:pb-0">
        <div className="flex items-center gap-2 border-b border-border bg-warning/10 px-4 py-1.5 text-xs text-warning">
          <FlaskConical className="size-3.5 shrink-0" />
          <span>
            Modo demonstração — dados fictícios, salvos apenas neste navegador. Nenhuma mensagem
            será enviada pelo WhatsApp.
          </span>
        </div>
        <header className="flex items-center justify-between border-b border-border px-4 py-3 lg:hidden">
          <Link to="/app">
            <LogoMark />
          </Link>
          <span className="text-sm font-semibold">Resende Torres</span>
          <Button variant="ghost" size="icon" aria-label="Configurações" asChild>
            <Link to="/app/settings">
              <Settings />
            </Link>
          </Button>
        </header>
        <nav
          aria-label="Todos os módulos"
          className="flex gap-2 overflow-x-auto border-b border-border px-4 py-2 lg:hidden"
        >
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "shrink-0 rounded-md px-3 py-2 text-xs",
                isActive(n.to, "exact" in n)
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <main className="min-w-0 flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      <nav
        aria-label="Navegação móvel"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-sidebar/95 backdrop-blur lg:hidden"
      >
        {[NAV[0], NAV[1], NAV[2], NAV[3], NAV[6]].map((n) => (
          <Link
            key={n.to}
            to={n.to}
            className={cn(
              "relative flex flex-col items-center gap-0.5 py-2 text-[10px] text-muted-foreground",
              isActive(n.to, "exact" in n) && "text-primary",
            )}
          >
            <n.icon className="size-5" />
            {n.label}
            {n.to === "/app/followup" && alerts > 0 && (
              <span className="absolute right-4 top-1 size-2 rounded-full bg-warning" />
            )}
            {n.to === "/app/inbox" && unread > 0 && (
              <span className="absolute right-4 top-1 size-2 rounded-full bg-primary" />
            )}
          </Link>
        ))}
      </nav>
      <LeadSheet />
    </div>
  );
}
