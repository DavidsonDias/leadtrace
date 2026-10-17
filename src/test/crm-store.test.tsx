import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CrmProvider, useCrm } from "@/lib/crm/store";
let crm: ReturnType<typeof useCrm>;
function Probe() {
  crm = useCrm();
  return null;
}
function mount() {
  return render(
    <CrmProvider>
      <Probe />
    </CrmProvider>,
  );
}
beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-17T12:00:00Z"));
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("integrated demo flows", () => {
  it("persists pipeline and proposal changes across reloads", () => {
    const view = mount();
    const lead = crm.state.leads.find((l) => l.stage === "novo")!;
    act(() => crm.moveStage(lead.id, "proposta_enviada"));
    expect(crm.state.proposals.find((p) => p.leadId === lead.id)?.status).toBe("enviada");
    view.unmount();
    mount();
    expect(crm.state.leads.find((l) => l.id === lead.id)?.stage).toBe("proposta_enviada");
  });
  it("keeps internal comments separate from contact dates", () => {
    mount();
    const lead = crm.state.leads[0]!;
    act(() => crm.addComment(lead.id, "Validar escopo internamente"));
    expect(crm.state.comments.at(-1)?.text).toBe("Validar escopo internamente");
    expect(crm.state.leads[0]?.lastInteraction).toBe(lead.lastInteraction);
  });
  it("synchronizes scheduling edits from lead details to proposals", () => {
    mount();
    const p = crm.state.proposals[0]!;
    act(() => crm.updateLead(p.leadId, { nextActivity: "2026-10-20T12:00:00.000Z" }));
    expect(crm.state.proposals.find((x) => x.id === p.id)?.nextFollowUp).toBe(
      "2026-10-20T12:00:00.000Z",
    );
    act(() => crm.updateLead(p.leadId, { nextActivity: undefined }));
    expect(crm.state.proposals.find((x) => x.id === p.id)?.nextFollowUp).toBeUndefined();
  });
  it("requires a disqualification reason and records it", () => {
    mount();
    const id = crm.state.leads.find((l) => l.stage === "novo")!.id;
    act(() => crm.moveStage(id, "desqualificado"));
    expect(crm.state.leads.find((l) => l.id === id)?.stage).toBe("novo");
    act(() => crm.moveStage(id, "desqualificado", "Sem orçamento", "Retomar no próximo ano"));
    expect(crm.state.leads.find((l) => l.id === id)).toMatchObject({
      stage: "desqualificado",
      disqualifyReason: "Sem orçamento",
    });
  });
  it("simulates messages and cancels pending replies when restoring the demo", () => {
    mount();
    const id = crm.state.leads[0]!.id;
    act(() => crm.sendMessage(id, "Olá, podemos agendar uma visita?"));
    expect(crm.state.conversations.find((c) => c.leadId === id)?.messages.at(-1)?.text).toBe(
      "Olá, podemos agendar uma visita?",
    );
    act(() => vi.advanceTimersByTime(3300));
    expect(crm.state.conversations.find((c) => c.leadId === id)?.messages.at(-1)?.dir).toBe("in");
    act(() => {
      crm.sendMessage(id, "Outra mensagem");
      crm.openLead(id);
    });
    act(() => crm.reset());
    const count = crm.state.conversations.find((c) => c.leadId === id)?.messages.length;
    act(() => vi.advanceTimersByTime(4000));
    expect(crm.state.conversations.find((c) => c.leadId === id)?.messages).toHaveLength(count!);
    expect(crm.openLeadId).toBeNull();
  });
});
