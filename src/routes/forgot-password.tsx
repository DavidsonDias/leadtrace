import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/brand/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authConfigured, authError, getSupabase } from "@/lib/backend/client";
export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Recuperar senha — LeadTrace CRM" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Forgot,
});
function Forgot() {
  const [sent, setSent] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <AuthLayout>
      <h1 className="font-display text-2xl font-bold">Recuperar senha</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Informe seu e-mail para receber o link de redefinição.
      </p>
      {!authConfigured ? (
        <p role="status" className="mt-6 text-sm">
          Recuperação de senha ainda não configurada neste ambiente. Nenhum e-mail será enviado.
        </p>
      ) : sent ? (
        <p role="status" className="mt-6 text-sm">
          Se houver uma conta elegível para este e-mail, você receberá as instruções de recuperação.
        </p>
      ) : (
        <form
          className="mt-6 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            const email = String(new FormData(e.currentTarget).get("email")).trim();
            try {
              const { error } = await getSupabase().auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=reset-password`,
              });
              if (error) throw error;
              setSent(true);
            } catch (err) {
              setError(authError(err));
            } finally {
              setBusy(false);
            }
          }}
        >
          <Label htmlFor="recovery-email">E-mail</Label>
          <Input
            id="recovery-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            disabled={busy}
          />
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Enviando…" : "Enviar link"}
          </Button>
        </form>
      )}
      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
      <Link to="/login" className="mt-6 block text-center text-sm text-primary">
        Voltar ao login
      </Link>
    </AuthLayout>
  );
}
