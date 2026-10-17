/** Evidence is explicit. A message or the contact's wording is never treated as technical attribution. */
export function identifyOrigin(
  input: {
    landingPage?: string | undefined;
    referrer?: string | undefined;
    utm?: Record<string, string> | undefined;
    gclid?: string | undefined;
  },
  now = new Date().toISOString(),
) {
  let source = "unknown",
    confidence = "nenhuma",
    method = "Nenhum",
    evidence = "Sem evidência técnica disponível.";
  const utm = input.utm ?? {};
  const declared = (utm["utm_source"] ?? "").toLowerCase();
  const known: Record<string, string> = {
    google: "google_organic",
    google_ads: "google_ads",
    instagram: "instagram",
    facebook: "facebook",
    whatsapp: "whatsapp",
    referral: "referral",
    chatgpt: "ai",
    gemini: "ai",
    perplexity: "ai",
  };
  if (input.gclid) {
    source = "google_ads";
    confidence = "media";
    method = "Identificador de campanha";
    evidence = "gclid capturado no formulário; conversão ainda não validada na plataforma.";
  } else if (known[declared]) {
    source = known[declared]!;
    if (declared === "google" && /^(cpc|ppc|paidsearch)$/i.test(utm["utm_medium"] ?? ""))
      source = "google_ads";
    confidence = "media";
    method = "UTM capturada";
    evidence = "Parâmetros UTM recebidos pelo formulário do site.";
  } else if (input.referrer) {
    try {
      const host = new URL(input.referrer).hostname.toLowerCase().replace(/^www\./, "");
      if (["chatgpt.com", "chat.openai.com", "gemini.google.com", "perplexity.ai"].includes(host)) {
        source = "ai";
        confidence = "media";
        method = "Referrer";
        evidence = `Referrer capturado: ${host}. Não identifica o usuário ou valida recomendação da plataforma.`;
      } else if (["google.com", "google.com.br"].includes(host)) {
        source = "google_organic";
        confidence = "media";
        method = "Referrer";
        evidence = `Referrer capturado: ${host}.`;
      }
    } catch {
      /* Invalid referrer gives no evidence. */
    }
  }
  return {
    source,
    attribution: {
      channel: source,
      campaign: utm["utm_campaign"],
      utm,
      gclid: input.gclid,
      referrer: input.referrer,
      landingPage: input.landingPage,
      firstTouch: now,
      lastTouch: now,
      method,
      evidence,
      confidence,
    },
  };
}
/** Only known tracking parameters are retained; URL fragments and unrelated query values can contain PII. */
export function captureEvidence(url: string, referrer?: string) {
  const parsed = new URL(url);
  const utm: Record<string, string> = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    const value = parsed.searchParams.get(key);
    if (value) utm[key] = value.slice(0, 250);
  }
  let safeReferrer: string | undefined;
  try {
    if (referrer) {
      const r = new URL(referrer);
      if (["http:", "https:"].includes(r.protocol)) safeReferrer = r.origin + r.pathname;
    }
  } catch {
    /* No referrer */
  }
  if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("URL inválida");
  return {
    landingPage: parsed.origin + parsed.pathname,
    referrer: safeReferrer,
    utm,
    gclid: parsed.searchParams.get("gclid")?.slice(0, 250),
  };
}
