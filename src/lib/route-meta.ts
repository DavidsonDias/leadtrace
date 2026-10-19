/** Metadata for private CRM surfaces; never expose organization or lead data. */
export function privateRouteMeta(title: string, description: string) {
  const appTitle = `${title} — LeadTrace CRM`;
  return {
    meta: [
      { title: appTitle },
      { name: "description", content: description },
      { property: "og:title", content: appTitle },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  };
}