export type SourceKey =
  | "google_ads" | "google_organic" | "gbp" | "instagram" | "facebook"
  | "whatsapp" | "site" | "referral" | "ai" | "other" | "unknown";

export const SOURCES: Record<SourceKey, { label: string; token: string }> = {
  google_ads: { label: "Google Ads", token: "--src-ads" },
  google_organic: { label: "Google Orgânico", token: "--src-organic" },
  gbp: { label: "Google Business Profile", token: "--src-gbp" },
  instagram: { label: "Instagram", token: "--src-insta" },
  facebook: { label: "Facebook", token: "--src-fb" },
  whatsapp: { label: "WhatsApp direto", token: "--src-wa" },
  site: { label: "Site institucional", token: "--src-site" },
  referral: { label: "Indicação", token: "--src-ref" },
  ai: { label: "IA / Assistentes", token: "--src-ai" },
  other: { label: "Outras fontes", token: "--src-other" },
  unknown: { label: "Origem desconhecida", token: "--src-unknown" },
};
export const SOURCE_KEYS = Object.keys(SOURCES) as SourceKey[];

export type StageKey = "novo" | "qualificado" | "enviar_proposta" | "proposta_enviada" | "desqualificado" | "fechado";
export const STAGES: { key: StageKey; label: string }[] = [
  { key: "novo", label: "Novo lead" },
  { key: "qualificado", label: "Lead qualificado" },
  { key: "enviar_proposta", label: "Enviar proposta" },
  { key: "proposta_enviada", label: "Proposta enviada" },
  { key: "desqualificado", label: "Lead desqualificado" },
  { key: "fechado", label: "Negócio fechado" },
];
export const stageLabel = (k: StageKey) => STAGES.find((s) => s.key === k)!.label;

export const DISQUALIFY_REASONS = ["Sem orçamento", "Fora do escopo", "Sem interesse", "Contato inválido", "Concorrência", "Outro"] as const;

export type ProposalStatus = "a_preparar" | "enviada" | "aguardando" | "aceita" | "recusada" | "expirada";
export const PROPOSAL_STATUS: Record<ProposalStatus, string> = {
  a_preparar: "A preparar",
  enviada: "Enviada",
  aguardando: "Aguardando retorno",
  aceita: "Aceita",
  recusada: "Recusada",
  expirada: "Expirada",
};

export type Confidence = "alta" | "media" | "baixa" | "nenhuma";

export interface Attribution {
  channel: string;
  campaign?: string | undefined;
  utm?: Partial<Record<"utm_source" | "utm_medium" | "utm_campaign" | "utm_content" | "utm_term", string | undefined>> | undefined;
  gclid?: string | undefined;
  referrer?: string | undefined;
  landingPage?: string | undefined;
  firstTouch: string;
  lastTouch: string;
  method: string;
  evidence: string;
  confidence: Confidence;
}

export interface AttributionChange { at: string; by: string; from: SourceKey; to: SourceKey; reason: string }

export interface Lead {
  id: string;
  name: string;
  company: string;
  role: string;
  phone: string;
  email: string;
  service: string;
  source: SourceKey;
  attribution: Attribution;
  attributionHistory: AttributionChange[];
  stage: StageKey;
  owner: string;
  value?: number | undefined;
  createdAt: string;
  lastInteraction: string;
  nextActivity?: string | undefined;
  tags: string[];
  notes: string;
  disqualifyReason?: string | undefined;
  disqualifyNote?: string | undefined;
}

export interface Message { id: string; dir: "in" | "out"; text: string; at: string; status: "sent" | "delivered" | "read" | "received" }
export interface Conversation { leadId: string; messages: Message[]; unread: number }

export interface Proposal {
  id: string; leadId: string; value: number; status: ProposalStatus;
  sentAt?: string | undefined; nextFollowUp?: string | undefined; notes: string;
}

export interface Comment { id: string; leadId: string; text: string; at: string; author: string }
export interface Activity { id: string; leadId: string; type: "stage" | "message" | "comment" | "proposal" | "followup" | "lead" | "attribution"; text: string; at: string }

export interface CrmState {
  version: number;
  seededAt: string;
  leads: Lead[];
  conversations: Conversation[];
  proposals: Proposal[];
  comments: Comment[];
  activities: Activity[];
  resolvedAlerts: string[];
  alertRules: { d7: boolean; d15: boolean; d30: boolean; overdue: boolean; awaiting: boolean };
}

export const OWNERS = ["Ana Resende", "Carlos Torres", "Juliana Mota"];
export const SERVICES = ["Reforma de fachada", "Recuperação estrutural", "Pintura predial", "Impermeabilização", "Manutenção predial", "Orçamento de engenharia"];
