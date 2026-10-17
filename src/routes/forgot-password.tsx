import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/brand/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Recuperar senha — LeadTrace CRM" }, { name: "description", content: "Recupere o acesso à sua conta LeadTrace." }, { property: "og:title", content: "Recuperar senha — LeadTrace CRM" }, { property: "og:description", content: "Recupere o acesso à sua conta LeadTrace." }, { name: "robots", content: "noindex" }] }),
  component: Forgot,
});

function Forgot() {
  const [sent, setSent] = useState(false);
  return (
    <AuthLayout>
      <h1 className="font-display text-2xl font-bold">Recuperar senha</h1>
      <p className="mt-1 text-sm text-muted-foreground">Informe seu e-mail para receber o link de redefinição.</p>
      {sent ? <p role="status" className="mt-6 rounded-md border border-border bg-card p-3 text-sm">O envio de e-mails será ativado com a autenticação real (Fase 2). Nenhum e-mail foi enviado.</p> : (
        <form className="mt-6 space-y-3" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
          <div><Label htmlFor="e">E-mail</Label><Input id="e" type="email" required /></div>
          <Button type="submit" className="w-full">Enviar link</Button>
        </form>)}
      <Link to="/login" className="mt-6 block text-center text-sm text-primary">Voltar ao login</Link>
    </AuthLayout>
  );
}
