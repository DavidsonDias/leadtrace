import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { FlaskConical, Info } from "lucide-react";
import { AuthLayout } from "@/components/brand/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  validateSearch: z.object({ reason: z.enum(["expired", "denied"]).optional() }),
  head: () => ({ meta: [{ title: "Entrar — LeadTrace CRM" }, { name: "description", content: "Acesse a plataforma LeadTrace CRM." }, { property: "og:title", content: "Entrar — LeadTrace CRM" }, { property: "og:description", content: "Acesse a plataforma LeadTrace CRM." }, { name: "robots", content: "noindex" }] }),
  component: Login,
});

function Login() {
  const { reason } = Route.useSearch();
  const [msg, setMsg] = useState<string | null>(null);
  const notReady = "O acesso com conta real será liberado na Fase 2 (autenticação e banco de produção). Use a demonstração por enquanto.";
  return (
    <AuthLayout>
      <h1 className="font-display text-2xl font-bold">Acessar plataforma</h1>
      <p className="mt-1 text-sm text-muted-foreground">Entre com sua conta LeadTrace.</p>
      {reason === "expired" && <p className="mt-4 rounded-md border border-warning/40 bg-warning/10 p-3 text-sm">Sua sessão expirou. Entre novamente.</p>}
      {reason === "denied" && <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">Acesso negado. Você não tem permissão para esta área.</p>}
      <Button variant="outline" className="mt-6 w-full" onClick={() => setMsg(notReady)}>
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden><path fill="currentColor" d="M21.35 11.1H12v2.9h5.35c-.25 1.5-1.7 4.3-5.35 4.3-3.2 0-5.8-2.65-5.8-5.9s2.6-5.9 5.8-5.9c1.8 0 3 .77 3.7 1.43l2.5-2.4C16.6 4 14.5 3 12 3 7 3 3 7 3 12s4 9 9 9c5.2 0 8.65-3.65 8.65-8.8 0-.6-.07-1.05-.15-1.1z" /></svg>
        Continuar com Google
      </Button>
      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />ou<span className="h-px flex-1 bg-border" /></div>
      <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); setMsg(notReady); }}>
        <div><Label htmlFor="email">E-mail</Label><Input id="email" type="email" required autoComplete="email" /></div>
        <div><div className="flex justify-between"><Label htmlFor="pw">Senha</Label><Link to="/forgot-password" className="text-xs text-primary">Esqueci a senha</Link></div><Input id="pw" type="password" required autoComplete="current-password" /></div>
        <Button type="submit" className="w-full">Entrar</Button>
      </form>
      {msg && <p role="status" className="mt-4 flex gap-2 rounded-md border border-border bg-card p-3 text-xs text-muted-foreground"><Info className="size-4 shrink-0 text-primary" />{msg}</p>}
      <Button variant="hero" className="mt-6 w-full" asChild><Link to="/app"><FlaskConical /> Entrar na demonstração</Link></Button>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">Ambiente isolado com dados fictícios.</p>
    </AuthLayout>
  );
}
