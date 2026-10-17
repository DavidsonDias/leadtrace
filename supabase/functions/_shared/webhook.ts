export async function verifySignature(raw: Uint8Array, signature: string | null, secret: string) {
  if (!secret || !signature || !/^sha256=[a-f0-9]{64}$/i.test(signature)) return false;
  const bytes = Uint8Array.from(signature.slice(7).match(/../g)!, (pair) => parseInt(pair, 16));
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  return crypto.subtle.verify("HMAC", key, bytes, new Uint8Array(raw).buffer);
}
export function createWebhookHandler(config: {
  appSecret: string;
  verifyToken: string;
  process: (payload: unknown) => Promise<void>;
}) {
  return async (request: Request): Promise<Response> => {
    const json = (status: number, message: string) =>
      Response.json({ message }, { status, headers: { "Cache-Control": "no-store" } });
    if (!config.appSecret || !config.verifyToken) return json(503, "Integração não configurada");
    if (request.method === "GET") {
      const query = new URL(request.url).searchParams;
      if (
        query.get("hub.mode") === "subscribe" &&
        query.get("hub.verify_token") === config.verifyToken &&
        query.has("hub.challenge")
      )
        return new Response(query.get("hub.challenge"), {
          headers: { "Cache-Control": "no-store", "Content-Type": "text/plain" },
        });
      return json(403, "Verificação inválida");
    }
    if (request.method !== "POST") return json(405, "Método não permitido");
    if (Number(request.headers.get("content-length")) > 1_000_000)
      return json(413, "Payload muito grande");
    const reader = request.body?.getReader();
    if (!reader) return json(400, "Payload ausente");
    const chunks: Uint8Array[] = [];
    let size = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 1_000_000) {
        await reader.cancel();
        return json(413, "Payload muito grande");
      }
      chunks.push(value);
    }
    const raw = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      raw.set(chunk, offset);
      offset += chunk.length;
    }
    if (!(await verifySignature(raw, request.headers.get("x-hub-signature-256"), config.appSecret)))
      return json(401, "Assinatura inválida");
    let payload: unknown;
    try {
      payload = JSON.parse(new TextDecoder().decode(raw));
    } catch {
      return json(400, "JSON inválido");
    }
    try {
      await config.process(payload);
      return json(200, "Recebido");
    } catch {
      return json(503, "Falha temporária ao persistir evento");
    }
  };
}
