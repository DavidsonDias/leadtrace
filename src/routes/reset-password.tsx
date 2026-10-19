import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/backend/auth-context";
import { getSupabase, authError } from "@/lib/backend/client";
import { AuthLayout } from "@/components/brand/AuthLayout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { privateRouteMeta } from "@/lib/route-meta";
export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => privateRouteMeta("Redefinir senha", "Redefinição segura da senha de acesso ao LeadTrace CRM."),
  component: Reset,
});
function Reset() {
  const auth = useAuth(),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  return (
    <AuthLayout>
      <h1 className="font-display text-2xl font-bold">Redefinir senha</h1>
      {auth.loading ? (
        <p role="status">Validando sessão…</p>
      ) : !auth.user ? (
        <>
          <p className="mt-4 text-sm">Abra um link válido de recuperação ou entre na sua conta.</p>
          <Link to="/forgot-password" className="mt-4 block text-primary">
            Solicitar novo link
          </Link>
        </>
      ) : (
        <form
          className="mt-6 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget),
              password = String(form.get("password"));
            if (password !== form.get("confirm")) {
              setMessage("As senhas não coincidem.");
              return;
            }
            setBusy(true);
            try {
              const { error } = await getSupabase().auth.updateUser({ password });
              if (error) throw error;
              await getSupabase().auth.signOut();
              window.location.assign("/login");
            } catch (error) {
              setMessage(authError(error));
            } finally {
              setBusy(false);
            }
          }}
        >
          <Label htmlFor="new-password">Nova senha</Label>
          <Input
            id="new-password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={12}
            required
            disabled={busy}
          />
          <p className="text-xs text-muted-foreground">Use pelo menos 12 caracteres.</p>
          <Label htmlFor="confirm-password">Confirmar senha</Label>
          <Input
            id="confirm-password"
            name="confirm"
            type="password"
            autoComplete="new-password"
            minLength={12}
            required
            disabled={busy}
          />
          <Button className="w-full" type="submit" disabled={busy}>
            {busy ? "Salvando…" : "Salvar nova senha"}
          </Button>
        </form>
      )}
      {message && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {message}
        </p>
      )}
    </AuthLayout>
  );
}
