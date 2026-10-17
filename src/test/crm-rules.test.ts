import { describe, expect, it } from "vitest";
import { createSeed } from "@/lib/crm/seed";
import { computeAlerts, filterLeads, kpis } from "@/lib/crm/metrics";

const NOW = new Date("2026-10-15T12:00:00Z").getTime();
const DAY = 86_400_000;

function stateWithProposal(daysAgo: number) {
  const s = createSeed(NOW);
  const lead = { ...s.leads[0], stage: "proposta_enviada" as const, lastInteraction: new Date(NOW - daysAgo * DAY).toISOString(), nextActivity: undefined };
  return { ...s, leads: [lead], proposals: [{ id: "p1", leadId: lead.id, value: 1000, status: "enviada" as const, sentAt: lead.lastInteraction, notes: "" }] };
}

describe("follow-up alerts", () => {
  it("flags 7 days without reply", () => expect(computeAlerts(stateWithProposal(7), NOW)[0].kind).toBe("d7"));
  it("flags 15 days without reply", () => expect(computeAlerts(stateWithProposal(15), NOW)[0].kind).toBe("d15"));
  it("flags 30 days without reply as critical", () => {
    const a = computeAlerts(stateWithProposal(30), NOW)[0];
    expect(a.kind).toBe("d30");
    expect(a.severity).toBe("critical");
  });
  it("hides a resolved alert", () => {
    const s = stateWithProposal(30);
    const id = computeAlerts(s, NOW)[0].id;
    expect(computeAlerts({ ...s, resolvedAlerts: [id] }, NOW)).toHaveLength(0);
  });
});

describe("demo data", () => {
  it("seeds between 30 and 50 leads", () => {
    const n = createSeed(NOW).leads.length;
    expect(n).toBeGreaterThanOrEqual(30);
    expect(n).toBeLessThanOrEqual(50);
  });
  it("only attributes AI origin with referrer evidence", () => {
    for (const l of createSeed(NOW).leads.filter((x) => x.source === "ai")) expect(l.attribution.referrer).toBeTruthy();
  });
  it("filters by Google Ads origin", () => {
    const s = createSeed(NOW);
    const r = filterLeads(s.leads, { period: "all", source: "google_ads" }, NOW);
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((l) => l.source === "google_ads")).toBe(true);
    expect(kpis(s, r, NOW).total).toBe(r.length);
  });
});
