interface Options {
  accessToken: string;
  phoneNumberId: string;
  graphVersion: string;
  fetcher?: typeof fetch;
}
export function createWhatsAppTransport(options: Options) {
  return async (
    message: {
      to: string;
      text: string;
      lastInboundAt?: string;
      template?: { name: string; language: string };
    },
    now = Date.now(),
  ) => {
    if (
      !options.accessToken ||
      !/^\d+$/.test(options.phoneNumberId) ||
      !/^v\d+\.\d+$/.test(options.graphVersion)
    )
      throw new Error("Integração oficial não configurada");
    if (!/^\d{8,15}$/.test(message.to) || !message.text.trim() || message.text.length > 4096)
      throw new Error("Destinatário ou mensagem inválidos");
    const last = message.lastInboundAt ? new Date(message.lastInboundAt).getTime() : NaN;
    if (!message.template && (!Number.isFinite(last) || last > now || now - last >= 86_400_000))
      throw new Error("Fora da janela de 24 horas. Use um template aprovado.");
    const body = {
      messaging_product: "whatsapp",
      to: message.to,
      ...(message.template
        ? {
            type: "template",
            template: {
              name: message.template.name,
              language: { code: message.template.language },
            },
          }
        : { type: "text", text: { body: message.text } }),
    };
    const response = await (options.fetcher ?? fetch)(
      `https://graph.facebook.com/${options.graphVersion}/${options.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${options.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );
    if (!response.ok) throw new Error(`A API oficial recusou o envio (${response.status}).`);
    const result: unknown = await response.json();
    if (
      !result ||
      typeof result !== "object" ||
      !("messages" in result) ||
      !Array.isArray(result.messages) ||
      typeof result.messages[0]?.id !== "string"
    )
      throw new Error("Resposta inválida da API oficial");
    return result.messages[0].id as string;
  };
}
