import { usePreviewReady } from "./usePreviewReady";
import { useState } from "react";
import {
  Check,
  ChevronRight,
  Globe,
  MessagesSquare,
  MousePointer2,
  Radar,
  Columns3,
} from "lucide-react";
import { OriginBadge } from "@/components/crm/OriginBadge";
import { exampleLead, presentation } from "./presentation";

const steps = [
  {
    label: "Campanha",
    name: "Google Ads",
    icon: MousePointer2,
    title: "O primeiro sinal vem da campanha.",
    description: "Um clique com identificador de campanha permite registrar a primeira interação.",
    field: "Campanha",
    value: exampleLead.attribution.campaign!,
    evidence: exampleLead.attribution.gclid!,
  },
  {
    label: "Site",
    name: "Visita identificada",
    icon: Globe,
    title: "A visita carrega a evidência.",
    description: "UTMs e identificadores registrados no site ajudam a ligar o contato à campanha.",
    field: "Landing page",
    value: exampleLead.attribution.landingPage!,
    evidence: "utm_source=google · utm_medium=cpc",
  },
  {
    label: "Conversa",
    name: "WhatsApp",
    icon: MessagesSquare,
    title: "A conversa precisa de contexto.",
    description:
      "Neste exemplo fictício, o contato foi associado à evidência do formulário. O WhatsApp, sozinho, não informa a origem.",
    field: "Contato",
    value: exampleLead.name,
    evidence: exampleLead.attribution.evidence,
  },
  {
    label: "Origem",
    name: "LeadTrace Origin",
    icon: Radar,
    title: "Atribuição que você pode conferir.",
    description:
      "Fonte, método e confiança ficam visíveis no perfil do lead. Atribuições manuais mantêm histórico.",
    field: "Método",
    value: exampleLead.attribution.method,
    evidence: "Confiança alta · evidência técnica demonstrativa",
  },
  {
    label: "Oportunidade",
    name: "Pipeline",
    icon: Columns3,
    title: "Contexto para o próximo passo.",
    description:
      "A origem acompanha a oportunidade durante a qualificação, a proposta e o acompanhamento comercial.",
    field: "Empresa",
    value: exampleLead.company,
    evidence: `Responsável: ${exampleLead.owner}`,
  },
];
export function OriginJourney() {
  const ready = usePreviewReady();
  const [selected, setSelected] = useState(0);
  const [unknown, setUnknown] = useState(false);
  const step = steps[selected]!;
  const lead = unknown ? presentation.leads.find((l) => l.source === "unknown")! : exampleLead;
  return (
    <div className="lp-attribution">
      <div className="lp-attribution-heading">
        <span className="lp-eyebrow">UM CAMINHO, EVIDÊNCIAS VISÍVEIS</span>
        <div className="lp-scenario" role="group" aria-label="Cenário de atribuição">
          <button
            type="button"
            disabled={!ready}
            aria-pressed={!unknown}
            onClick={() => setUnknown(false)}
          >
            Com evidência
          </button>
          <button
            type="button"
            disabled={!ready}
            aria-pressed={unknown}
            onClick={() => setUnknown(true)}
          >
            Sem evidência
          </button>
        </div>
      </div>
      <div className="lp-journey" role="group" aria-label="Etapas da origem">
        {steps.map((s, i) => (
          <button
            key={s.label}
            type="button"
            disabled={!ready || unknown}
            aria-pressed={!unknown && selected === i}
            onClick={() => setSelected(i)}
          >
            <span className="lp-journey-icon">
              <s.icon size={20} />
            </span>
            <small>
              0{i + 1} · {s.label}
            </small>
            <strong>{s.name}</strong>
            <ChevronRight className="lp-path-arrow" size={15} />
          </button>
        ))}
      </div>
      <div className="lp-evidence" aria-live="polite" aria-atomic="true">
        <div>
          <OriginBadge source={lead.source} />
          <h3>{unknown ? "Sem evidência, sem suposições." : step.title}</h3>
          <p>
            {unknown
              ? "Uma mensagem direta sem link rastreável ou informação declarada não permite identificar a campanha. O LeadTrace mantém a origem desconhecida."
              : step.description}
          </p>
        </div>
        <dl>
          <div>
            <dt>{unknown ? "Método" : step.field}</dt>
            <dd>{unknown ? lead.attribution.method : step.value}</dd>
          </div>
          <div>
            <dt>{unknown ? "Evidência" : "Evidência demonstrativa"}</dt>
            <dd>{unknown ? lead.attribution.evidence : step.evidence}</dd>
          </div>
          <div>
            <dt>Primeira interação fictícia</dt>
            <dd>
              <time dateTime={lead.attribution.firstTouch}>
                {new Date(lead.attribution.firstTouch).toLocaleDateString("pt-BR", {
                  timeZone: "UTC",
                })}
              </time>
            </dd>
          </div>
        </dl>
      </div>
      <p className="lp-preview-note">
        <Check size={13} />
        Jornada ilustrativa com dados fictícios. Integrações externas dependem de configuração e
        homologação.
      </p>
    </div>
  );
}
