import { afterEach, describe, expect, it, vi } from "vitest";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});
describe("production auth configuration", () => {
  it("does not turn demo access into an authenticated production session", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "");
    const { authConfigured, getSupabase } = await import("@/lib/backend/client");
    expect(authConfigured).toBe(false);
    expect(() => getSupabase()).toThrow("não configurada");
  });
  it("blocks recovery and Google until shared Auth redirect URLs are configured", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
    vi.stubEnv("VITE_AUTH_REDIRECTS_CONFIGURED", "false");
    vi.stubEnv("VITE_GOOGLE_OAUTH_ENABLED", "true");
    const { authConfigured, recoveryConfigured, googleConfigured } =
      await import("@/lib/backend/client");
    expect(authConfigured).toBe(true);
    expect(recoveryConfigured).toBe(false);
    expect(googleConfigured).toBe(false);
  });
  it("rejects a private key before constructing a browser client", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "sb_secret_never-use-in-browser");
    const { getSupabase } = await import("@/lib/backend/client");
    expect(() => getSupabase()).toThrow("chave pública");
  });
  it("does not expose backend error details in authentication messages", async () => {
    const { authError } = await import("@/lib/backend/client");
    expect(authError(new Error("secret internal trace"))).not.toContain("secret");
    expect(authError(new Error("Invalid login credentials"))).toBe("E-mail ou senha incorretos.");
  });
});
