import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { FlaskConical, Info } from "lucide-react";
import { AuthLayout } from "@/components/brand/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authConfigured, authError, getSupabase, googleConfigured } from "@/lib/backend/client";
import { privateRouteMeta } from "@/lib/route-meta";
export const Route = createFileRoute("/login")({
  validateSearch: z.object({ reason: z.enum(["expired", "denied"]).optional() }),
  head: () => privateRouteMeta("Entrar", "Acesso à conta e à demonstração isolada do LeadTrace CRM, desenvolvido pela SevenDevX."),
  component: Login,
});
function Login() {
  const { reason } = Route.useSearch();
  const navigate = useNavigate();
  const [message, setMessage] = useState<string | null>(null),
    [busy, setBusy] = useState(false);
  return (
    <AuthLayout>
      <h1 className="font-display text-2xl font-bold">Acessar plataforma</h1>
      <p className="mt-1 text-sm text-muted-foreground">Entre com sua conta LeadTrace.</p>
      {reason && (
        <p role="status" className="mt-4 rounded-md border border-warning p-3 text-sm">
          {reason === "expired"
            ? "Sua sessão expirou. Entre novamente."
            : "Acesso negado. Solicite ao administrador acesso à organização."}
        </p>
      )}
      {!authConfigured && (
        <p className="mt-4 rounded-md border border-border p-3 text-sm text-muted-foreground">
          O acesso real ainda não foi configurado neste ambiente. Explore a demonstração enquanto
          isso.
        </p>
      )}
      <Button
        variant="outline"
        disabled={busy || !authConfigured || !googleConfigured}
        className="mt-6 w-full"
        onClick={async () => {
          setBusy(true);
          try {
            const { error } = await getSupabase().auth.signInWithOAuth({
              provider: "google",
              options: { redirectTo: `${window.location.origin}/auth/callback` },
            });
            if (error) throw error;
          } catch (error) {
            setMessage(authError(error));
            setBusy(false);
          }
        }}
      >
        Continuar com Google
      </Button>
      {!googleConfigured && (
        <p className="mt-1 text-center text-xs text-muted-foreground">
          Google OAuth não configurado.
        </p>
      )}
      <div className="my-5 text-center text-xs text-muted-foreground">ou entre com e-mail</div>
      <form
        className="space-y-3"
        onSubmit={async (event) => {
          event.preventDefault();
          setMessage(null);
          if (!authConfigured) return;
          setBusy(true);
          const form = new FormData(event.currentTarget);
          try {
            const { error } = await getSupabase().auth.signInWithPassword({
              email: String(form.get("email")).trim(),
              password: String(form.get("password")),
            });
            if (error) throw error;
            await navigate({ to: "/workspace" });
          } catch (error) {
            setMessage(authError(error));
          } finally {
            setBusy(false);
          }
        }}
      >
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            disabled={busy || !authConfigured}
          />
        </div>
        <div>
          <div className="flex justify-between">
            <Label htmlFor="pw">Senha</Label>
            <Link to="/forgot-password" className="text-xs text-primary">
              Esqueci a senha
            </Link>
          </div>
          <Input
            id="pw"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            disabled={busy || !authConfigured}
          />
        </div>
        <Button type="submit" disabled={busy || !authConfigured} className="w-full">
          {busy ? "Entrando…" : "Entrar"}
        </Button>
      </form>
      {message && (
        <p
          role="alert"
          className="mt-4 flex gap-2 rounded-md border border-destructive p-3 text-sm"
        >
          <Info className="size-4 shrink-0" />
          {message}
        </p>
      )}
      <Button variant="hero" className="mt-6 w-full" asChild>
        <Link to="/app">
          <FlaskConical />
          Entrar na demonstração
        </Link>
      </Button>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Ambiente isolado com dados fictícios.
      </p>
    </AuthLayout>
  );
}
