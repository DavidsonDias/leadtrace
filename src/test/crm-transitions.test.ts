import { describe, expect, it } from "vitest";
import { createSeed } from "@/lib/crm/seed";
import { saveProposal } from "@/lib/crm/transitions";
import { computeAlerts, filterLeads } from "@/lib/crm/metrics";
const now = "2026-10-17T12:00:00.000Z";
const time = new Date(now).getTime();
const seed = () => createSeed(time);

describe("proposal workflow", () => {
  it("records the first send and synchronizes the pipeline", () => {
    const state = seed();
    const lead = state.leads.find((l) => l.stage === "novo")!;
    const next = saveProposal(
      state,
      { leadId: lead.id, status: "aguardando", value: 25000 },
      now,
      "new",
    );
    expect(next.proposals.find((p) => p.leadId === lead.id)?.sentAt).toBe(now);
    expect(next.leads.find((l) => l.id === lead.id)).toMatchObject({
      stage: "proposta_enviada",
      value: 25000,
      lastInteraction: lead.lastInteraction,
    });
    expect(state.leads.find((l) => l.id === lead.id)?.stage).toBe("novo");
  });
  it("synchronizes and clears follow-up dates", () => {
    const state = seed();
    const leadId = state.leads[0]!.id;
    const scheduled = saveProposal(state, { leadId, nextFollowUp: now }, now, "new");
    expect(scheduled.leads[0]?.nextActivity).toBe(now);
    const cleared = saveProposal(scheduled, { leadId, nextFollowUp: undefined }, now, "new");
    expect(cleared.leads[0]?.nextActivity).toBeUndefined();
    expect(cleared.proposals.find((p) => p.leadId === leadId)?.nextFollowUp).toBeUndefined();
  });
  it("accepts proposals without duplicating them", () => {
    const state = seed();
    const p = state.proposals[0]!;
    const next = saveProposal(state, { leadId: p.leadId, status: "aceita" }, now, "new");
    expect(next.leads.find((l) => l.id === p.leadId)?.stage).toBe("fechado");
    expect(next.proposals).toHaveLength(state.proposals.length);
  });
  it("rejects invalid values and missing leads", () => {
    const state = seed();
    for (const value of [-1, NaN, Infinity])
      expect(saveProposal(state, { leadId: state.leads[0]!.id, value }, now, "new")).toBe(state);
    expect(saveProposal(state, { leadId: "missing" }, now, "new")).toBe(state);
  });
  it("does not report a newly sent proposal as 30 days without return", () => {
    const state = seed();
    const leadId = state.leads[0]!.id;
    state.leads[0]!.stage = "novo";
    state.leads[0]!.lastInteraction = "2026-09-01T12:00:00.000Z";
    state.proposals = [];
    const next = saveProposal(state, { leadId, status: "enviada" }, now, "new");
    expect(
      computeAlerts(next, time)
        .filter((a) => a.leadId === leadId)
        .every((a) => a.kind !== "d30"),
    ).toBe(true);
  });
});

describe("calendar filters", () => {
  it("Today starts at local midnight and excludes future captures", () => {
    const template = seed().leads[0]!;
    const midnight = new Date(time);
    midnight.setHours(0, 0, 0, 0);
    const leads = [-1, 0, time - midnight.getTime(), time - midnight.getTime() + 1].map(
      (offset, i) => ({
        ...template,
        id: String(i),
        createdAt: new Date(midnight.getTime() + offset).toISOString(),
      }),
    );
    expect(filterLeads(leads, { period: "today" }, time).map((l) => l.id)).toEqual(["1", "2"]);
  });
  it("includes the final date but excludes midnight of the following day", () => {
    const l = seed().leads[0]!;
    const leads = ["2026-10-16T23:59:59", "2026-10-17T00:00:00"].map((createdAt) => ({
      ...l,
      createdAt,
    }));
    expect(
      filterLeads(leads, { period: "custom", from: "2026-10-16", to: "2026-10-16" }, time),
    ).toHaveLength(1);
  });
  it("flags activities overdue by hours", () => {
    const s = seed();
    s.proposals = [];
    s.leads = [
      { ...s.leads[0]!, stage: "novo", nextActivity: new Date(time - 3600000).toISOString() },
    ];
    expect(computeAlerts(s, time)[0]?.kind).toBe("overdue");
  });
});
