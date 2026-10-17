import type { CrmState, Proposal } from "./types";

/** Single proposal per lead; synchronize commercial state without pretending an internal edit is a contact. */
export function saveProposal(
  state: CrmState,
  patch: Partial<Proposal> & { leadId: string },
  now: string,
  id: string,
): CrmState {
  const lead = state.leads.find((l) => l.id === patch.leadId);
  if (!lead || (patch.value != null && (!Number.isFinite(patch.value) || patch.value < 0)))
    return state;
  const existing = state.proposals.find((p) => p.leadId === patch.leadId);
  const proposal: Proposal = {
    id,
    value: lead.value ?? 0,
    status: "a_preparar",
    notes: "",
    ...existing,
    ...patch,
  };
  if (["enviada", "aguardando", "aceita"].includes(proposal.status) && !proposal.sentAt)
    proposal.sentAt = now;
  const active = !["fechado", "desqualificado"].includes(lead.stage);
  const stage =
    patch.status === "aceita"
      ? "fechado"
      : active && (patch.status === "enviada" || patch.status === "aguardando")
        ? "proposta_enviada"
        : active && patch.status === "a_preparar"
          ? "enviar_proposta"
          : lead.stage;
  // An explicit date clear must propagate as well as a new date.
  const scheduling = Object.prototype.hasOwnProperty.call(patch, "nextFollowUp");
  return {
    ...state,
    proposals: existing
      ? state.proposals.map((p) => (p.id === existing.id ? proposal : p))
      : [...state.proposals, proposal],
    leads: state.leads.map((l) =>
      l.id === lead.id
        ? {
            ...l,
            stage,
            value: proposal.value,
            ...(scheduling ? { nextActivity: patch.nextFollowUp } : {}),
          }
        : l,
    ),
  };
}
