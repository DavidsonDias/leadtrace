import { createClient } from "npm:@supabase/supabase-js@2.118.0";
import { identifyOrigin, captureEvidence } from "../_shared/attribution.ts";
// Server-to-server only. Never expose LEADTRACE_CAPTURE_KEY in site JavaScript.
Deno.serve(async (request) => {
  const reply = (status: number, message: string) =>
    Response.json({ message }, { status, headers: { "Cache-Control": "no-store" } });
  const key = Deno.env.get("LEADTRACE_CAPTURE_KEY"),
    org = Deno.env.get("CAPTURE_ORGANIZATION_ID");
  if (!key || !org) return reply(503, "Captura não configurada");
  if (request.method !== "POST") return reply(405, "Método não permitido");
  if (request.headers.get("x-leadtrace-key") !== key) return reply(401, "Acesso negado");
  const raw = await request.text();
  if (raw.length > 20_000) return reply(413, "Payload muito grande");
  try {
    const data = JSON.parse(raw);
    if (
      typeof data.eventId !== "string" ||
      !data.eventId ||
      data.eventId.length > 100 ||
      typeof data.name !== "string" ||
      data.name.trim().length < 2 ||
      typeof data.company !== "string" ||
      typeof data.phone !== "string" ||
      !/^\+?[\d ()-]{8,25}$/.test(data.phone) ||
      typeof data.pageUrl !== "string"
    )
      return reply(400, "Dados inválidos");
    const evidence = captureEvidence(
      data.pageUrl,
      typeof data.referrer === "string" ? data.referrer : undefined,
    );
    const allowed = Deno.env.get("CAPTURE_SITE_ORIGIN");
    if (!allowed || new URL(data.pageUrl).origin !== allowed)
      return reply(400, "Site não permitido");
    const origin = identifyOrigin(evidence);
    const client = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        auth: { persistSession: false, autoRefreshToken: false },
        db: {
          schema: Deno.env.get("LEADTRACE_DB_SCHEMA") === "leadtrace" ? "leadtrace" : "public",
        },
      },
    );
    const { error } = await client.rpc("ingest_site_lead", {
      org,
      event_id: data.eventId,
      payload: {
        name: data.name.trim(),
        company: data.company.trim(),
        phone: data.phone,
        email: typeof data.email === "string" ? data.email : "",
        service: typeof data.service === "string" ? data.service : "",
        source: origin.source,
        attribution: origin.attribution,
      },
    });
    if (error) return reply(503, "Falha temporária na captura");
    return reply(200, "Recebido");
  } catch {
    return reply(400, "Dados inválidos");
  }
});
