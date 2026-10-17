import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const authConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);
export const googleConfigured = import.meta.env.VITE_GOOGLE_OAUTH_ENABLED === "true";
let browserClient: SupabaseClient | undefined;
/** Browser-only singleton. Never create a shared server auth client or accept a service-role key. */
export function getSupabase(): SupabaseClient {
  if (typeof window === "undefined")
    throw new Error("Cliente de autenticação disponível apenas no navegador.");
  if (!authConfigured) throw new Error("Autenticação ainda não configurada neste ambiente.");
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (key.startsWith("sb_secret_")) throw new Error("Use somente uma chave pública do Supabase.");
  if (key.split(".").length === 3) {
    try {
      const payload = JSON.parse(atob(key.split(".")[1]!.replace(/-/g, "+").replace(/_/g, "/")));
      if (payload.role !== "anon") throw new Error("private-key");
    } catch {
      throw new Error("A chave configurada não é uma chave pública válida.");
    }
  }
  return (browserClient ??= createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        flowType: "pkce",
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
        storageKey: "leadtrace.auth",
      },
    },
  ));
}
export const authError = (error: unknown) => {
  const message = error instanceof Error ? error.message : "";
  if (/invalid login credentials/i.test(message)) return "E-mail ou senha incorretos.";
  if (/email not confirmed/i.test(message)) return "Confirme seu e-mail antes de entrar.";
  if (/rate limit|too many/i.test(message)) return "Muitas tentativas. Aguarde alguns minutos.";
  return "Não foi possível concluir a operação. Verifique sua conexão e tente novamente.";
};
