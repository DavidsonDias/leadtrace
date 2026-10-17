import { createContext, useContext } from "react";
import type { CrmState, Lead, Proposal, SourceKey, StageKey } from "./types";
export interface Ctx {
  mode: "demo" | "live";
  owners: string[];
  organizationName: string;
  organizationId: string | null;
  state: CrmState;
  openLeadId: string | null;
  openLead: (id: string | null) => void;
  moveStage: (id: string, stage: StageKey, reason?: string, note?: string) => void;
  updateLead: (id: string, patch: Partial<Lead>) => void;
  addLead: (
    l: Omit<Lead, "id" | "createdAt" | "lastInteraction" | "attributionHistory" | "attribution"> & {
      attribution?: Lead["attribution"];
    },
  ) => string;
  addComment: (leadId: string, text: string) => void;
  sendMessage: (leadId: string, text: string) => void;
  markRead: (leadId: string) => void;
  upsertProposal: (p: Partial<Proposal> & { leadId: string }) => void;
  resolveAlert: (id: string) => void;
  logFollowUp: (leadId: string, text: string, next?: string) => void;
  setAttribution: (leadId: string, source: SourceKey, reason: string) => void;
  setAlertRules: (r: CrmState["alertRules"]) => void;
  reset: () => void;
}
export const CrmCtx = createContext<Ctx | null>(null);

export function useCrm() {
  const c = useContext(CrmCtx);
  if (!c) throw new Error("useCrm must be used inside CrmProvider");
  return c;
}
