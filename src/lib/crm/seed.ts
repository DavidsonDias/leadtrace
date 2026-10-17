import type { Attribution, Comment, Conversation, CrmState, Lead, Proposal, SourceKey, StageKey, Activity, Confidence } from "./types";
import { OWNERS, SERVICES } from "./types";

const DAY = 86_400_000;

function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = ["Marcos", "Patrícia", "Roberto", "Fernanda", "Ricardo", "Luciana", "Eduardo", "Camila", "Sérgio", "Helena", "Paulo", "Renata", "André", "Beatriz", "Gustavo", "Marina", "Fábio", "Cláudia", "Rodrigo", "Simone", "Leonardo", "Adriana", "Thiago", "Vanessa", "Márcio", "Daniela", "Alexandre", "Priscila", "Henrique", "Tatiana", "Vinícius", "Larissa", "Otávio", "Elaine", "Bruno", "Silvia"];
const LAST = ["Almeida", "Barros", "Cardoso", "Duarte", "Esteves", "Ferraz", "Gouveia", "Holanda", "Lacerda", "Macedo", "Nogueira", "Pacheco", "Queiroz", "Rezende", "Sampaio", "Teixeira"];
const COMPANIES = [
  ["Condomínio Edifício Jardim Europa", "Síndico"], ["Condomínio Residencial Bela Vista", "Síndica"],
  ["Administradora Prime Gestão", "Gerente predial"], ["Condomínio Torre Azul", "Síndico"],
  ["Edifício Solar das Palmeiras", "Síndica"], ["Construtora Horizonte", "Responsável por obras"],
  ["Condomínio Parque das Águas", "Conselheiro"], ["Administradora Lume Condomínios", "Coordenadora"],
  ["Edifício Monte Carlo", "Síndico profissional"], ["Shopping Vila Nova", "Gerente de manutenção"],
  ["Condomínio Villa Toscana", "Síndica"], ["Edifício Atlântico Sul", "Síndico"],
  ["Hotel Costa Verde", "Gerente de facilities"], ["Condomínio Recanto dos Ipês", "Síndico"],
  ["Indústria Metalfort", "Engenheiro de manutenção"], ["Edifício Comercial Paulista 1200", "Administrador"],
  ["Condomínio Alto da Serra", "Síndica"], ["Colégio Santa Clara", "Diretora administrativa"],
] as const;

const SOURCE_POOL: SourceKey[] = [
  "google_ads", "google_ads", "google_ads", "google_ads", "google_ads", "google_ads", "google_ads",
  "google_organic", "google_organic", "google_organic", "google_organic",
  "gbp", "gbp", "gbp", "instagram", "instagram", "instagram", "facebook", "facebook",
  "whatsapp", "whatsapp", "whatsapp", "site", "site", "site", "site", "referral", "referral", "referral",
  "ai", "other", "unknown", "unknown", "unknown", "unknown", "google_ads",
];
const STAGE_POOL: StageKey[] = [
  "novo", "novo", "novo", "novo", "novo", "novo", "novo",
  "qualificado", "qualificado", "qualificado", "qualificado", "qualificado", "qualificado",
  "enviar_proposta", "enviar_proposta", "enviar_proposta", "enviar_proposta",
  "proposta_enviada", "proposta_enviada", "proposta_enviada", "proposta_enviada", "proposta_enviada", "proposta_enviada", "proposta_enviada",
  "desqualificado", "desqualificado", "desqualificado", "desqualificado",
  "fechado", "fechado", "fechado", "fechado", "fechado", "novo", "qualificado", "proposta_enviada",
];

function attributionFor(source: SourceKey, i: number, first: string, last: string): Attribution {
  const base = { firstTouch: first, lastTouch: last };
  const camp = ["fachadas-condominios-2026", "impermeabilizacao-verao", "recuperacao-estrutural-sp"][i % 3]!;
  const by: Record<SourceKey, Omit<Attribution, "firstTouch" | "lastTouch">> = {
    google_ads: { channel: "Pago (CPC)", campaign: camp, utm: { utm_source: "google", utm_medium: "cpc", utm_campaign: camp, utm_term: "reforma de fachada" }, gclid: `demo-gclid-${1000 + i}`, landingPage: "/servicos/fachadas", method: "GCLID + UTM", evidence: "Clique registrado com gclid e UTM no formulário do site.", confidence: "alta" },
    google_organic: { channel: "Busca orgânica", referrer: "https://www.google.com/", landingPage: "/blog/quando-reformar-fachada", method: "Referrer", evidence: "Referrer google.com sem parâmetros de campanha.", confidence: "media" },
    gbp: { channel: "Perfil da empresa", utm: { utm_source: "gbp", utm_medium: "organic", utm_campaign: "perfil-google" }, landingPage: "/", method: "UTM do perfil", evidence: "Link do Google Business Profile com UTM dedicada.", confidence: "alta" },
    instagram: { channel: "Social", campaign: "bio-link", utm: { utm_source: "instagram", utm_medium: "social", utm_campaign: "bio-link" }, method: "Link rastreável", evidence: "Link da bio com UTM.", confidence: "alta" },
    facebook: { channel: "Social", utm: { utm_source: "facebook", utm_medium: "social" }, referrer: "https://l.facebook.com/", method: "UTM + Referrer", evidence: "UTM parcial e referrer do Facebook.", confidence: "media" },
    whatsapp: { channel: "Mensagem direta", method: "Declarado pelo contato", evidence: "Contato iniciou conversa sem link rastreável; informou que já conhecia a empresa.", confidence: "baixa" },
    site: { channel: "Formulário", landingPage: "/contato", method: "Formulário do site", evidence: "Envio do formulário de contato sem parâmetros de campanha.", confidence: "alta" },
    referral: { channel: "Indicação", method: "Declarado pelo contato", evidence: "Contato informou indicação de outro síndico.", confidence: "media" },
    ai: { channel: "Assistente de IA", referrer: "https://chatgpt.com/", landingPage: "/servicos/impermeabilizacao", method: "Referrer", evidence: "Referrer chatgpt.com registrado no primeiro acesso ao site.", confidence: "media" },
    other: { channel: "Outros", method: "Manual", evidence: "Feira do setor condominial (registro manual).", confidence: "baixa" },
    unknown: { channel: "—", method: "Nenhum", evidence: "Sem evidência técnica disponível.", confidence: "nenhuma" as Confidence },
  };
  return { ...base, ...by[source] };
}

const CONV_SCRIPTS: Record<string, [("in" | "out"), string][]> = {
  default: [
    ["in", "Bom dia! Gostaria de um orçamento para {service} no {company}."],
    ["out", "Bom dia, {first}! Aqui é da Resende Torres Engenharia. Pode nos informar o número de pavimentos e o endereço?"],
    ["in", "São 12 andares, fica na Zona Sul. Conseguem fazer uma visita técnica?"],
    ["out", "Conseguimos sim. Temos disponibilidade na próxima terça às 10h. Fica bom?"],
    ["in", "Perfeito, pode agendar. Obrigado!"],
  ],
};

export function createSeed(now = Date.now()): CrmState {
  const r = rng(20261015);
  const pick = <T,>(a: readonly T[]) => a[Math.floor(r() * a.length)]!;
  const leads: Lead[] = [];
  const conversations: Conversation[] = [];
  const proposals: Proposal[] = [];
  const comments: Comment[] = [];
  const activities: Activity[] = [];
  const iso = (t: number) => new Date(t).toISOString();

  for (let i = 0; i < 36; i++) {
    const first = FIRST[i]!;
    const lastName = LAST[i % LAST.length]!;
    const [company, role] = COMPANIES[i % COMPANIES.length]!;
    const source = SOURCE_POOL[i]!;
    const stage = STAGE_POOL[i]!;
    const ageDays = stage === "novo" ? 1 + Math.floor(r() * 10) : 8 + Math.floor(r() * 70);
    const created = now - ageDays * DAY - Math.floor(r() * 8) * 3_600_000;
    let lastInt = created + Math.floor(r() * (now - created) * 0.6);
    // Ensure some proposals cross the 7/15/30 day follow-up thresholds
    if (stage === "proposta_enviada") lastInt = now - [3, 9, 17, 33, 12, 40, 5][i % 7]! * DAY;
    const value = stage === "novo" ? undefined : Math.round((18 + r() * 460) * 1000);
    const service = SERVICES[i % SERVICES.length]!;
    const id = `lead-${String(i + 1).padStart(2, "0")}`;
    const lead: Lead = {
      id, name: `${first} ${lastName}`, company: `${company}${i >= COMPANIES.length ? " II" : ""}`, role,
      phone: `+55 11 9${String(8000 + i * 37).slice(0, 4)}-${String(1000 + i * 53).slice(0, 4)}`,
      email: `${first.toLowerCase().normalize("NFD").replace(/[^a-z]/g, "")}.demo@exemplo.com`,
      service, source,
      attribution: attributionFor(source, i, iso(created), iso(lastInt)),
      attributionHistory: [],
      stage, owner: OWNERS[i % 3]!, value,
      createdAt: iso(created), lastInteraction: iso(lastInt),
      nextActivity: ["qualificado", "enviar_proposta", "novo"].includes(stage) ? iso(now + (Math.floor(r() * 10) - 4) * DAY) : undefined,
      tags: [service.split(" ")[0]!, ...(r() > 0.6 ? ["Prioridade"] : [])],
      notes: "Dados fictícios para demonstração.",
      ...(stage === "desqualificado" ? { disqualifyReason: pick(["Sem orçamento", "Fora do escopo", "Concorrência", "Sem interesse"]), disqualifyNote: "" } : {}),
    };
    leads.push(lead);
    activities.push({ id: `act-c-${i}`, leadId: id, type: "lead", text: `Lead criado via ${lead.attribution.method}`, at: lead.createdAt });

    if (["enviar_proposta", "proposta_enviada", "fechado"].includes(stage) || (stage === "desqualificado" && i % 2 === 0)) {
      const status = stage === "enviar_proposta" ? "a_preparar" : stage === "fechado" ? "aceita" : stage === "desqualificado" ? "recusada" : i % 2 ? "aguardando" : "enviada";
      proposals.push({
        id: `prop-${i}`, leadId: id, value: value ?? 50000, status,
        sentAt: status === "a_preparar" ? undefined : iso(lastInt),
        nextFollowUp: status === "aguardando" || status === "enviada" ? iso(now + ((i % 5) - 2) * DAY) : undefined,
        notes: "",
      });
    }

    if (i < 22) {
      const script = CONV_SCRIPTS.default!;
      const n = 2 + (i % 4);
      const msgs = script.slice(0, n).map(([dir, t], k) => ({
        id: `m-${i}-${k}`, dir,
        text: t.replace("{service}", service.toLowerCase()).replace("{company}", lead.company).replace("{first}", first),
        at: iso(created + k * 25 * 60_000),
        status: dir === "in" ? ("received" as const) : ("read" as const),
      }));
      conversations.push({ leadId: id, messages: msgs, unread: msgs[msgs.length - 1]!.dir === "in" ? 1 + (i % 2) : 0 });
    }
    if (i % 4 === 0) {
      comments.push({ id: `c-${i}`, leadId: id, author: lead.owner, at: iso(lastInt), text: "Cliente pediu visita técnica antes da assembleia de condomínio." });
    }
  }
  return {
    version: 1, seededAt: iso(now), leads, conversations, proposals, comments, activities,
    resolvedAlerts: [], alertRules: { d7: true, d15: true, d30: true, overdue: true, awaiting: true },
  };
}
