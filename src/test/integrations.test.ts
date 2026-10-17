// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { identifyOrigin, captureEvidence } from "../../supabase/functions/_shared/attribution";
import { createWebhookHandler } from "../../supabase/functions/_shared/webhook";
import { createWhatsAppTransport } from "../../supabase/functions/_shared/whatsapp";
const encoder = new TextEncoder();
async function signature(body: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode("secret"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return (
    "sha256=" +
    Array.from(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(body))))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  );
}
describe("evidence-based attribution", () => {
  it("keeps origin unknown without technical evidence", () =>
    expect(identifyOrigin({}).source).toBe("unknown"));
  it("records Ads evidence with medium rather than invented certainty", () => {
    const r = identifyOrigin(
      captureEvidence(
        "https://site.test/orcamento?utm_source=google&utm_medium=cpc&email=private@test.com#gclid",
      ),
    );
    expect(r.source).toBe("google_ads");
    expect(r.attribution.confidence).toBe("media");
    expect(JSON.stringify(r)).not.toContain("private@test.com");
  });
  it("does not infer AI from a misleading host", () =>
    expect(identifyOrigin({ referrer: "https://chatgpt.com.attacker.test" }).source).toBe(
      "unknown",
    ));
  it("attributes AI only with explicit known referrer evidence", () =>
    expect(identifyOrigin({ referrer: "https://chatgpt.com/" }).source).toBe("ai"));
});
describe("official WhatsApp webhook", () => {
  it("rejects unsigned and tampered requests before persistence", async () => {
    const process = vi.fn();
    const handler = createWebhookHandler({ appSecret: "secret", verifyToken: "verify", process });
    const valid = await signature('{"hello":1}');
    expect(
      (
        await handler(
          new Request("https://test/", {
            method: "POST",
            body: '{"hello":2}',
            headers: { "x-hub-signature-256": valid },
          }),
        )
      ).status,
    ).toBe(401);
    expect(process).not.toHaveBeenCalled();
  });
  it("persists a signed event and asks Meta to retry a failed persistence", async () => {
    const process = vi.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error("db"));
    const handler = createWebhookHandler({ appSecret: "secret", verifyToken: "verify", process });
    const body = '{"object":"whatsapp_business_account"}',
      sig = await signature(body);
    const request = () =>
      new Request("https://test/", {
        method: "POST",
        body,
        headers: { "x-hub-signature-256": sig },
      });
    expect((await handler(request())).status).toBe(200);
    expect((await handler(request())).status).toBe(503);
  });
  it("validates the verification challenge", async () => {
    const handler = createWebhookHandler({
      appSecret: "secret",
      verifyToken: "verify",
      process: async () => {},
    });
    const r = await handler(
      new Request("https://test/?hub.mode=subscribe&hub.verify_token=verify&hub.challenge=123"),
    );
    expect(await r.text()).toBe("123");
  });
});
describe("official outbound transport", () => {
  it("blocks free-text outside the 24-hour service window", async () => {
    const fetcher = vi.fn();
    const send = createWhatsAppTransport({
      accessToken: "test-token",
      phoneNumberId: "12345",
      graphVersion: "v24.0",
      fetcher,
    });
    await expect(send({ to: "5521999990000", text: "Olá" })).rejects.toThrow("janela");
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("uses only Meta Cloud API for a valid service window", async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({ messages: [{ id: "wamid.1" }] }));
    const send = createWhatsAppTransport({
      accessToken: "test-token",
      phoneNumberId: "12345",
      graphVersion: "v24.0",
      fetcher,
    });
    expect(
      await send({
        to: "5521999990000",
        text: "Olá",
        lastInboundAt: new Date(Date.now() - 1000).toISOString(),
      }),
    ).toBe("wamid.1");
    expect(fetcher.mock.calls[0]?.[0]).toBe("https://graph.facebook.com/v24.0/12345/messages");
  });
});
