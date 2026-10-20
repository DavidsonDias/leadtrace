import { type SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const authConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);
export const authRedirectsConfigured = import.meta.env.VITE_AUTH_REDIRECTS_CONFIGURED === "true";
export const recoveryConfigured = authConfigured && authRedirectsConfigured;
export const googleConfigured =
  authRedirectsConfigured && import.meta.env.VITE_GOOGLE_OAUTH_ENABLED === "true";
/** Browser-only singleton. Never create a shared server auth client or accept a service-role key. */
export function getSupabase(): SupabaseClient {
  if (typeof window === "undefined")
    throw new Error("Cliente de autenticação disponível apenas no navegador.");
  if (!authConfigured) throw new Error("Autenticação ainda não configurada neste ambiente.");
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (key.startsWith("sb_secret_")) throw new Error("Use somente uma chave pública do Supabase.");
  if (key.split(".").length === 3) {
    try {
      const segment = key.split(".")[1];
      if (!segment) throw new Error("private-key");
      const payload = JSON.parse(atob(segment.replace(/-/g, "+").replace(/_/g, "/")));
      if (payload.role !== "anon") throw new Error("private-key");
    } catch {
      throw new Error("A chave configurada não é uma chave pública válida.");
    }
  }
  return supabase as SupabaseClient;
}
export const authError = (error: unknown) => {
  const message = error instanceof Error ? error.message : "";
  if (/invalid login credentials/i.test(message)) return "E-mail ou senha incorretos.";
  if (/email not confirmed/i.test(message)) return "Confirme seu e-mail antes de entrar.";
  if (/rate limit|too many/i.test(message)) return "Muitas tentativas. Aguarde alguns minutos.";
  return "Não foi possível concluir a operação. Verifique sua conexão e tente novamente.";
};

export const databaseSchema =
  import.meta.env.VITE_SUPABASE_DB_SCHEMA === "leadtrace" ? "leadtrace" : "public";
export const getDatabase = () => getSupabase().schema(databaseSchema);
