import { createClient } from "npm:@supabase/supabase-js@2.118.0";
import { createWebhookHandler } from "../_shared/webhook.ts";
const handler = createWebhookHandler({
  appSecret: Deno.env.get("META_APP_SECRET") ?? "",
  verifyToken: Deno.env.get("WHATSAPP_VERIFY_TOKEN") ?? "",
  process: async (payload) => {
    const org = Deno.env.get("WHATSAPP_ORGANIZATION_ID"),
      phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
    if (!org || !phoneNumberId) throw new Error("Not configured");
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
    const event = payload as {
      object?: string;
      entry?: {
        changes?: {
          value?: {
            metadata?: { phone_number_id?: string };
            messages?: {
              id: string;
              from: string;
              timestamp: string;
              type: string;
              text?: { body?: string };
            }[];
            statuses?: { id: string; status: string; timestamp: string }[];
          };
        }[];
      }[];
    };
    if (event.object !== "whatsapp_business_account") return;
    for (const entry of event.entry ?? [])
      for (const change of entry.changes ?? []) {
        const value = change.value;
        if (value?.metadata?.phone_number_id !== phoneNumberId) continue;
        for (const message of value.messages ?? []) {
          const { error } = await client.rpc("ingest_whatsapp_message", {
            org,
            provider_message_id: message.id,
            sender: message.from,
            message_body:
              message.type === "text"
                ? (message.text?.body ?? "")
                : "[Mensagem de mídia recebida — visualização ainda indisponível]",
            received_at: new Date(Number(message.timestamp) * 1000).toISOString(),
          });
          if (error) throw error;
        }
        for (const status of value.statuses ?? []) {
          const { error } = await client.rpc("update_whatsapp_status", {
            org,
            provider_message_id: status.id,
            next_status: status.status,
          });
          if (error) throw error;
        }
      }
  },
});
Deno.serve(handler);
