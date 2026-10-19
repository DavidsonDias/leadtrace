import { createSeed } from "@/lib/crm/seed";

// Fixed seed for SSR and client hydration; never read or mutate workspace storage.
export const presentation = createSeed(Date.UTC(2026, 0, 1));
export const exampleLead = presentation.leads.find((lead) => lead.source === "google_ads")!;
