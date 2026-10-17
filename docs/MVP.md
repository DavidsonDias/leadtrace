# LeadTrace CRM — estado do MVP

Produto desenvolvido por SevenDevX. Organização piloto: Resende Torres Engenharia.

## Executar

Node.js 24 e npm. Na raiz do repositório:

```sh
npm ci --ignore-scripts
npm run dev
```

Abra a URL exibida pelo Vite (normalmente http://localhost:8080). Nenhuma credencial é necessária para a demonstração. Para validar:

```sh
npm test
npx tsc --noEmit
npm run build
npm run preview
```

O repositório já utilizava React 19, TypeScript estrito, TanStack Start/Router, Vite, Tailwind 4, componentes Radix/shadcn, Zod e Recharts. A implementação preserva essa arquitetura e a sincronização com Lovable. O build atual gera um servidor Nitro com preset Cloudflare; publicação em Vercel ainda exige configuração e homologação próprias.

## Telas e fluxos

- `/`: landing pública, identidade LeadTrace, demonstração visual, funcionalidades, benefícios, etapas e assinatura SevenDevX.
- `/login` e `/forgot-password`: apresentação do acesso; contas reais e OAuth ainda não estão habilitados. A interface informa essa limitação.
- `/app`: indicadores e gráficos derivados dos leads e propostas da demo.
- `/app/inbox`: conversas fictícias associadas a leads, envio simulado, status e resposta simulada.
- `/app/origin`: fontes, campanhas, evidências e confiança demonstrativas. Atribuição manual com justificativa no detalhe do lead.
- `/app/pipeline`: arrastar cards ou usar seletor acessível; motivo obrigatório para desqualificar; propostas sincronizadas com avanço do funil.
- `/app/leads`: cadastro, pesquisa, filtros, ordenação, paginação e CSV. Detalhe com edição de contato/empresa/observações, responsável, etapa, agenda, comentários e timeline.
- `/app/deals`: valores, status, observações e próxima data de acompanhamento. A data também atualiza a atividade do lead.
- `/app/followup`: alertas de propostas, atividades vencidas, registro de acompanhamento e resolução.
- `/app/settings`: regras de alertas e restauração da demo. Usuários, papéis e integrações são referências demonstrativas, não administração real.

Todos os módulos estão acessíveis em navegação móvel. Há tema claro/escuro persistido e respeito à preferência de movimento reduzido.

## Persistência e regras

`src/lib/crm/store.tsx` contém exclusivamente o estado demo, salvo sob `leadtrace.demo.v1` no localStorage. Dados fictícios persistem neste navegador, sem compartilhamento com outras pessoas/dispositivos. A demo não acessa dados de produção nem autentica usuários reais. Não use esse armazenamento para dados reais de clientes.

`storage.ts` valida o formato e as referências aos leads antes de restaurar uma sessão; armazenamento inválido volta à base fictícia. Falha ao salvar exibe aviso. Restaurar cancela respostas simuladas pendentes e fecha o detalhe aberto.

`metrics.ts` concentra filtros, indicadores e alertas. “Hoje” começa à meia-noite local, períodos personalizados incluem toda a data final e capturas futuras são excluídas. Alertas consideram o envio da proposta para não anunciar atraso anterior ao envio. Comentários e movimentações internas não alteram a data de último contato. Uma atividade pode estar vencida por horas, sem aguardar um dia inteiro.

`transitions.ts` centraliza a atualização de proposta: não aceita valores negativos/não finitos ou leads inexistentes, cria a data de envio quando necessária e sincroniza valor, etapa e acompanhamento. Recusa/expiração da proposta não desqualifica automaticamente o lead; o motivo de desqualificação é uma decisão explícita no pipeline.

## PWA

Manifest e ícone vetorial, registro de service worker somente no build de produção, fallback offline e indicação de conectividade. O cache aceita apenas arquivos públicos de assets e ícones. HTML da aplicação, APIs, conversas e dados operacionais não entram no Cache Storage. A demo localStorage continua sendo armazenamento explícito separado desse cache.

Atualizações do worker seguem o ciclo do navegador: uma nova versão aguarda o fechamento das abas antigas. Ainda pendem ícones PNG 192/512, validação de instalação em Android/iOS e testes de atualização em uma publicação HTTPS. Não declarar certificação PWA ou funcionamento integral do CRM offline.

## Estrutura atual e banco de produção

Ainda não há conexão Supabase, migrations ou banco de produção neste repositório. As entidades TypeScript existentes são leads, atribuição/histórico, conversas/mensagens, propostas, comentários, atividades, regras e resoluções de alertas.

O modelo relacional previsto para a fase operacional é:

| Área                  | Tabelas previstas                                   |
| --------------------- | --------------------------------------------------- |
| Organizações e acesso | organizations, profiles, organization_members       |
| Comercial             | leads, pipeline_stages, pipeline_history, proposals |
| Origem                | lead_sources, attribution_events                    |
| Atendimento           | conversations, messages                             |
| Operação              | activities, notes, notifications                    |
| Administração         | integration_settings, audit_logs                    |

Antes de receber dados reais: migrations com UUIDs/FKs/índices; `organization_id` nas entidades; relações compostas que impeçam referências entre organizações; RLS em todas as tabelas expostas; papéis em membership controlada no servidor; provisionamento seguro da primeira organização; auditoria sem copiar mensagens sensíveis; testes de isolamento com dois tenants. Tokens Meta devem permanecer em secrets do servidor, nunca no frontend ou em integration_settings legível pelo cliente.

## Integrações pendentes

- Supabase Auth e PostgreSQL: projeto, configurações e persistência real separados da demo; login, logout, recuperação e redefinição reais.
- Google OAuth: provedor configurado e URLs de retorno; nenhuma conexão atual.
- Meta WhatsApp Cloud API: conta/número, templates, secrets, assinatura e idempotência de webhooks, recebimento/envio reais e janela de atendimento.
- Site: formulário e links rastreáveis, captura first/last touch, UTMs/referrer/gclid e consentimento quando aplicável.
- Google Ads: autorização, eventos e conversões; não conectado.
- Domínio e hospedagem finais: canonical/URLs públicas e metadados sociais com domínio aprovado; homologação em HTTPS.

Não há cobrança ou serviços pagos provisionados. Não é necessário crédito Lovable para desenvolver localmente com Git/npm.

## Testes e roteiro de apresentação

A suíte automatizada cobre regras de alertas (7/15/30 dias), filtros de origem/data, consistência de propostas, persistência ao remontar o app, mensagens simuladas, motivo de desqualificação, comentários e restauração. A CI executa testes, TypeScript e build em pull requests e na main.

Roteiro: landing → demonstração → dashboard → abrir conversa simulada → mostrar evidência de origem → mover card → registrar comentário → enviar proposta pela troca de status → agendar acompanhamento → conferir alertas → filtrar Google Ads → abrir os mesmos módulos no celular.

Critérios ainda não homologados: WCAG 2.2 AA completa, instalação PWA em aparelhos reais, integrações externas, RLS/multi-tenancy, banco de produção e deploy Vercel. O escopo entregue é a evolução do MVP demonstrativo; não representa conclusão das fases operacionais e SaaS do prompt mestre.

## Validação desta entrega — 17/10/2026

- Instalação limpa por `npm ci --ignore-scripts`: aprovada.
- Vitest: 22 testes aprovados, em quatro arquivos.
- TypeScript estrito: aprovado, sem erros.
- Build de produção: aprovado.
- ESLint dos arquivos TypeScript alterados: sem erros; um aviso de Fast Refresh no arquivo de provider/hook já compartilhado.
- Chromium desktop e viewport móvel 390 × 844: edição persistida após reload, tema claro e navegação para Origem, Propostas e Configurações; sem erros JavaScript.

Esses resultados não equivalem à homologação das integrações de produção.
