# Refinamento visual da landing — v3

A página inicial preserva rotas, logotipo, tokens, assinatura SevenDevX e metadados SEO. Não altera Auth, Supabase, variáveis de ambiente, regras comerciais ou PWA. O ambiente operacional continua desconectado, conforme a reversão anterior.

## Composição e componentes

- `src/routes/index.tsx`: hero editorial, navegação compacta com menu móvel/Escape, bento assimétrico, jornada conectada de quatro etapas, benefícios e CTA.
- `src/components/landing/ProductPreview.tsx`: projeções somente leitura de dashboard, inbox e pipeline. Botões alternam a visualização e a conversa; ações comerciais continuam nas rotas existentes da demonstração.
- `OriginJourney.tsx`: cinco etapas da atribuição e comparação entre cenários com/sem evidência. WhatsApp não é apresentado como fonte automática de atribuição.
- `presentation.ts`: base fictícia determinística, derivada do mesmo gerador/modelo do CRM. Indicadores e detalhes são calculados dessa base. Não lê nem grava o armazenamento do workspace.
- `usePreviewReady.ts`: desabilita controles de apresentação até a hidratação; evita cliques sem efeito durante o carregamento inicial.
- `landing.css`: estilos limitados à landing, usando os tokens existentes e adaptações próprias para celular/tablet. Transições curtas e respeito a `prefers-reduced-motion`; sem nova biblioteca ou imagem pesada.

## Verificação

48 testes Vitest, TypeScript e build de produção aprovados. A suíte Playwright cobre os cinco fluxos existentes do CRM e quatro verificações novas da landing: evidência/teclado/troca de prévias/ausência de chamadas Supabase e de gravação demo; larguras de 390, 768 e 1440 px nos dois temas; menu móvel/Escape; preferência por movimento reduzido. Capturas locais de desktop e celular revisadas visualmente.

Não foi medido um novo score Lighthouse ou Core Web Vitals em tráfego real. As prévias são de apresentação com dados fictícios, não screenshots de uma operação real. WhatsApp, autenticação real e backend dedicado mantêm suas pendências anteriores.
