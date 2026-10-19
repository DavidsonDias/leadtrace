import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/backend/auth-context";
import { authConfigured, getSupabase } from "@/lib/backend/client";
import { listOrganizations, type Organization } from "@/lib/backend/repository";
import { LiveCrmProvider } from "@/lib/backend/live-store";
import { LeadSheet } from "@/components/crm/LeadSheet";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { privateRouteMeta } from "@/lib/route-meta";
export const Route = createFileRoute("/workspace")({
  ssr: false,
  head: () => privateRouteMeta("Plataforma", "Ambiente de trabalho da organização no LeadTrace CRM."),
  component: Workspace,
});
const modules = [
  ["dashboard", "Dashboard"],
  ["leads", "Leads"],
  ["pipeline", "Pipeline"],
  ["origin", "Origem"],
  ["deals", "Propostas"],
  ["followup", "Follow-up"],
  ["inbox", "Inbox"],
  ["settings", "Configurações"],
];
function Workspace() {
  const auth = useAuth(),
    nav = useNavigate();
  const userId = auth.user?.id;
  const [organizations, setOrganizations] = useState<Organization[] | null>(null),
    [selected, setSelected] = useState(""),
    [error, setError] = useState(false);
  useEffect(() => {
    if (!auth.loading && !auth.user && authConfigured)
      void nav({ to: "/login", search: { reason: "expired" }, replace: true });
  }, [auth.loading, auth.user, nav]);
  useEffect(() => {
    let active = true;
    if (!userId) {
      setOrganizations(null);
      return;
    }
    void listOrganizations()
      .then((orgs) => {
        if (active) {
          setOrganizations(orgs);
          setSelected(orgs[0]?.id ?? "");
        }
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [userId]);
  if (!authConfigured)
    return (
      <div className="mx-auto max-w-xl space-y-4 p-8">
        <Logo />
        <h1 className="text-xl font-semibold">Plataforma ainda não configurada</h1>
        <p>
          As credenciais públicas do projeto Supabase e as migrations precisam ser configuradas para
          o acesso real.
        </p>
        <Button asChild>
          <Link to="/app">Explorar demonstração isolada</Link>
        </Button>
      </div>
    );
  if (auth.loading || !auth.user)
    return (
      <p role="status" className="p-8">
        Validando acesso…
      </p>
    );
  if (error)
    return (
      <div role="alert" className="p-8">
        <h1 className="text-xl font-semibold">Não foi possível consultar as organizações</h1>
        <p className="my-3">Verifique a conexão e a configuração do banco.</p>
        <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
      </div>
    );
  if (!organizations)
    return (
      <p role="status" className="p-8">
        Carregando organizações…
      </p>
    );
  const organization = organizations.find((o) => o.id === selected);
  return (
    <div className="min-h-screen bg-background">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <Logo />
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="active-org" className="text-xs text-muted-foreground">
            Organização
          </label>
          <select
            id="active-org"
            className="max-w-64 rounded-md border border-input bg-background p-2 text-sm"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            {organizations.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              await getSupabase().auth.signOut();
              window.location.assign("/login");
            }}
          >
            Sair
          </Button>
        </div>
      </header>
      {!organization ? (
        <main className="mx-auto max-w-xl space-y-4 p-8">
          <h1 className="text-xl font-semibold">Conta sem organização</h1>
          <p>
            Seu login foi validado, mas ainda não há vínculo com uma organização. Solicite ao
            administrador o provisionamento do seu acesso.
          </p>
          <Link to="/app" className="text-primary">
            Abrir demonstração isolada
          </Link>
        </main>
      ) : (
        <LiveCrmProvider key={`${auth.user.id}:${organization.id}`} organization={organization}>
          <nav
            aria-label="Módulos da plataforma"
            className="flex gap-2 overflow-x-auto border-b border-border p-3"
          >
            {modules.map(([module, label]) => (
              <Link
                key={module}
                to="/workspace/$module"
                params={{ module: module! }}
                search={{ lead: undefined }}
                className="shrink-0 rounded-md px-3 py-2 text-sm hover:bg-accent"
                activeProps={{ className: "bg-accent text-primary" }}
              >
                {label}
              </Link>
            ))}
          </nav>
          <main className="p-4 md:p-6 lg:p-8">
            <Outlet />
          </main>
          <LeadSheet />
        </LiveCrmProvider>
      )}
      <footer className="border-t border-border px-4 py-4 text-xs text-muted-foreground">
        <a href="https://sevendevx.com/" target="_blank" rel="noopener noreferrer">
          Desenvolvido por SevenDevX
        </a>
      </footer>
    </div>
  );
}
