/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
  readonly VITE_SUPABASE_DB_SCHEMA?: "public" | "leadtrace";
  readonly VITE_PUBLIC_SITE_URL?: string;
  readonly VITE_GOOGLE_OAUTH_ENABLED?: string;
}
