import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";
import { useAuth } from "@/lib/backend/auth-context";
import { AuthLayout } from "@/components/brand/AuthLayout";
import { privateRouteMeta } from "@/lib/route-meta";
export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  validateSearch: z.object({ next: z.enum(["workspace", "reset-password"]).optional() }),
  head: () => privateRouteMeta("Autenticando", "Validação do acesso e retorno seguro à plataforma LeadTrace CRM."),
  component: Callback,
});
function Callback() {
  const auth = useAuth(),
    navigate = useNavigate(),
    { next } = Route.useSearch();
  useEffect(() => {
    if (!auth.loading && auth.user)
      void navigate({
        to: next === "reset-password" ? "/reset-password" : "/workspace",
        replace: true,
      });
  }, [auth.loading, auth.user, next, navigate]);
  return (
    <AuthLayout>
      {auth.loading ? (
        <p role="status">Validando acesso…</p>
      ) : (
        <>
          <h1 className="text-xl font-semibold">
            {auth.user ? "Acesso validado" : "Link inválido ou expirado"}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {auth.user
              ? "Abrindo a plataforma…"
              : "Solicite um novo link e abra-o no mesmo navegador em que iniciou o acesso."}
          </p>
          <Link to="/login" className="mt-4 block text-primary">
            Voltar ao login
          </Link>
        </>
      )}
    </AuthLayout>
  );
}
