import { useEffect, useState } from "react";
import { useAuth } from "@/lib/backend/auth-context";
import { getSupabase } from "@/lib/backend/client";
import {
  listOrganizations,
  type Organization,
  type Member,
  loadWorkspace,
} from "@/lib/backend/repository";
import { useCrm } from "@/lib/crm/context";
import { PageHeader, Panel } from "@/components/crm/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
export function WorkspaceSettings() {
  const { user } = useAuth(),
    { state, organizationName, organizationId, setAlertRules } = useCrm();
  const [org, setOrg] = useState<Organization | null>(null),
    [members, setMembers] = useState<Member[]>([]),
    [error, setError] = useState(false),
    [busy, setBusy] = useState(false);
  const role = members.find((m) => m.userId === user?.id)?.role;
  useEffect(() => {
    let active = true;
    void listOrganizations()
      .then(async (orgs) => {
        const current = orgs.find((o) => o.id === organizationId);
        if (!current) throw new Error();
        const snapshot = await loadWorkspace(current);
        if (active) {
          setOrg(current);
          setMembers(snapshot.members);
        }
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [organizationId]);
  if (error) return <p role="alert">Não foi possível carregar as configurações.</p>;
  return (
    <div>
      <PageHeader title="Configurações" subtitle={organizationName} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Meu perfil">
          <p className="mb-3 text-sm text-muted-foreground">{user?.email}</p>
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              const name = String(new FormData(e.currentTarget).get("name")).trim();
              try {
                const { error } = await getSupabase()
                  .from("profiles")
                  .update({ display_name: name })
                  .eq("id", user!.id);
                if (error) throw error;
                toast.success("Perfil salvo");
                window.location.reload();
              } catch {
                toast.error("Não foi possível salvar o perfil");
              } finally {
                setBusy(false);
              }
            }}
          >
            <Label htmlFor="profile-name">Nome de exibição</Label>
            <Input
              id="profile-name"
              name="name"
              minLength={2}
              maxLength={100}
              required
              defaultValue={members.find((m) => m.userId === user?.id)?.label.split(" · ")[0] ?? ""}
              key={members.length}
            />
            <Button type="submit" disabled={busy || !org}>
              Salvar perfil
            </Button>
          </form>
          <a className="mt-4 block text-sm text-primary" href="/reset-password">
            Alterar senha
          </a>
        </Panel>
        <Panel title="Organização">
          {org && (
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                setBusy(true);
                try {
                  const { data, error } = await getSupabase()
                    .from("organizations")
                    .update({
                      name: String(f.get("name")).trim(),
                      website: String(f.get("website")).trim(),
                    })
                    .eq("id", org.id)
                    .select("id");
                  if (error || !data?.length) throw error;
                  toast.success("Organização atualizada");
                  window.location.reload();
                } catch {
                  toast.error("Não foi possível salvar a organização");
                } finally {
                  setBusy(false);
                }
              }}
            >
              <Label htmlFor="org-name">Nome</Label>
              <Input
                id="org-name"
                name="name"
                required
                minLength={2}
                maxLength={120}
                defaultValue={org.name}
                disabled={role !== "admin"}
              />
              <Label htmlFor="org-site">Site</Label>
              <Input
                id="org-site"
                name="website"
                type="url"
                defaultValue={org.website}
                disabled={role !== "admin"}
              />
              <Button type="submit" disabled={busy || role !== "admin"}>
                Salvar organização
              </Button>
            </form>
          )}
        </Panel>
        <Panel title="Usuários e permissões">
          <ul className="space-y-3">
            {members.map((m) => (
              <li
                className="flex flex-wrap items-center justify-between gap-2 text-sm"
                key={m.userId}
              >
                <span>{m.label}</span>
                <select
                  aria-label={`Permissão de ${m.label}`}
                  className="rounded-md border border-input bg-background p-2"
                  value={m.role}
                  disabled={role !== "admin" || busy}
                  onChange={async (e) => {
                    setBusy(true);
                    const next = e.target.value;
                    try {
                      const { error } = await getSupabase().rpc("set_member_role", {
                        org: org!.id,
                        member: m.userId,
                        new_role: next,
                      });
                      if (error) throw error;
                      setMembers((ms) =>
                        ms.map((x) => (x.userId === m.userId ? { ...x, role: next } : x)),
                      );
                      toast.success("Permissão atualizada");
                    } catch {
                      toast.error(
                        "Não foi possível alterar a permissão. A organização precisa manter ao menos um administrador.",
                      );
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  <option value="admin">Administrador</option>
                  <option value="manager">Gestor</option>
                  <option value="agent">Atendente</option>
                </select>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            Novos usuários precisam ser convidados pelo administrador do projeto Supabase e
            vinculados à organização. Atendentes acessam somente leads atribuídos a eles.
          </p>
        </Panel>
        <Panel title="Alertas">
          {(
            Object.entries({
              d7: "7 dias sem retorno",
              d15: "15 dias sem retorno",
              d30: "30 dias sem retorno",
              overdue: "Atividade vencida",
              awaiting: "Proposta aguardando resposta",
            }) as [keyof typeof state.alertRules, string][]
          ).map(([key, label]) => (
            <div key={key} className="mb-3 flex items-center justify-between gap-3">
              <Label htmlFor={`alert-${key}`}>{label}</Label>
              <Switch
                id={`alert-${key}`}
                checked={state.alertRules[key]}
                disabled={role !== "admin"}
                onCheckedChange={(checked) =>
                  setAlertRules({ ...state.alertRules, [key]: checked })
                }
              />
            </div>
          ))}
        </Panel>
        <Panel title="Integrações" className="lg:col-span-2">
          <p className="mb-3 text-sm">
            Banco e autenticação Supabase configurados neste ambiente. As integrações abaixo exigem
            credenciais e homologação próprias.
          </p>
          <ul className="divide-y divide-border">
            {[
              "WhatsApp Business Cloud API",
              "Google Ads",
              "Captura do site",
              "Webhooks externos",
            ].map((name) => (
              <li key={name} className="flex justify-between gap-4 py-3 text-sm">
                <span>{name}</span>
                <span className="text-muted-foreground">Não configurado</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Tokens e chaves privadas devem permanecer exclusivamente nos secrets do servidor.
          </p>
        </Panel>
      </div>
    </div>
  );
}
