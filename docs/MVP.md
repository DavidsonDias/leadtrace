# LeadTrace CRM — MVP

Produto: LeadTrace CRM, by SevenDevX. Piloto: Resende Torres Engenharia. Slogan: “Track every lead. Grow every opportunity.”

## Executar

Node.js 24 e npm. npm/package-lock.json é a referência de dependências para desenvolvimento, CI e Vercel.

```sh
npm ci --ignore-scripts
npm run dev
```

Abra a URL exibida pelo Vite. Nenhuma credencial é necessária para a demonstração.

```sh
npm test
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
```

## Telas e fluxos

| Tela                                                    | Funcionamento                                                                                                                                                             |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                                                     | Landing em português, branding, recursos, como funciona, benefícios, prévia derivada da base fictícia, metadados sociais, canonical, sitemap e assinatura SevenDevX.      |
| `/login`                                                | E-mail/senha e Google OAuth reais quando configurados; acesso separado à demo. Sem configuração, o formulário real permanece indisponível.                                |
| `/forgot-password`, `/auth/callback`, `/reset-password` | Recuperação, callback PKCE e redefinição via Supabase; mensagens honestas quando indisponíveis.                                                                           |
| `/app`                                                  | Demonstração isolada com 36 leads fictícios persistidos neste navegador.                                                                                                  |
| `/workspace`                                            | Plataforma com verificação de usuário, seleção de organização e persistência via banco/RLS quando configurados.                                                           |
| Dashboard                                               | Indicadores, gráficos, atividades, alertas e acompanhamentos derivados da mesma base dos demais módulos.                                                                  |
| Leads                                                   | Cadastro, pesquisa, filtros, ordenação, paginação e CSV. Detalhe com edição, responsável, origem, agenda, comentários e timeline.                                         |
| Inbox                                                   | Três painéis, associação conversa/lead e status. Na demo, envio/resposta simulados; na plataforma, envio bloqueado até a integração oficial ser configurada e homologada. |
| Origem                                                  | Filtros por canal, campanha, evidência, confiança e atribuição manual com justificativa/histórico.                                                                        |
| Pipeline                                                | Drag-and-drop e seletor para teclado/celular. Motivo obrigatório para desqualificar. Avanços comerciais sincronizam propostas.                                            |
| Propostas                                               | Valor, status, envio, observações e acompanhamento; agenda sincronizada nos dois sentidos com o lead.                                                                     |
| Follow-up                                               | Alertas de 7/15/30 dias, atividade vencida, proposta aguardando resposta, registro de acompanhamento e resolução.                                                         |
| Configurações                                           | Demo: regras e restauração. Plataforma: perfil, organização, regras e administração de papéis com proteção do último administrador.                                       |

Todos os módulos são acessíveis no celular. Temas claro/escuro são persistidos; controles do tema aguardam a inicialização do navegador para não perder cliques durante a hidratação. Há estados vazios, erros, confirmações e preferência de movimento reduzido.

## Arquitetura e dados

React 19, TypeScript estrito, TanStack Start/Router, Vite, Tailwind 4, Radix/shadcn, Zod, Recharts e Supabase JS. A arquitetura existente da Lovable foi preservada e o histórico Git não foi reescrito.

As telas compartilhadas estão em `src/components/pages`. `src/lib/crm/context.ts` fornece o contrato; `store.tsx` mantém exclusivamente a demonstração em `leadtrace.demo.v1`; `backend/live-store.tsx` usa o repositório Supabase e nunca escreve no armazenamento demo.

`metrics.ts` concentra filtros/indicadores/alertas. “Hoje” começa à meia-noite local; períodos personalizados incluem a data final; comentários internos não alteram o último contato; alertas de proposta consideram a data de envio. `transitions.ts` valida alterações demonstrativas de propostas; a produção usa a RPC transacional `crm_command`.

A migration em `supabase/migrations` cria 18 tabelas, índices, relações por organização, RLS, histórico, auditoria e ingestão deduplicada. As políticas foram exercitadas em Postgres local via PGlite. O banco remoto ainda precisa ser criado/configurado; não foi aplicado em projetos de outros sistemas. A modelagem e a ativação estão em [PRODUCTION.md](PRODUCTION.md).

## PWA, SEO e governança

Manifest, ícones PNG 192/512 e Apple 180, service worker em produção, aviso de nova versão com ação de atualização, fallback offline e indicação de conectividade. O teste de navegador confirmou cache de arquivos públicos e exclusão de `/workspace` e requisições privadas. HTML operacional, APIs e conversas não entram no Cache Storage. O CRM não promete operação integral offline. Instalação em aparelhos Android/iOS ainda requer homologação.

Landing com HTML semântico, title/description, canonical, Open Graph, Twitter Cards, imagem social e Schema.org. Rotas demo, operacionais e de autenticação usam noindex e são excluídas do robots. A URL pública estável observada é `https://leadtrace-two.vercel.app`; um domínio próprio continua opcional.

Secrets não entram no frontend. Auth utiliza PKCE e `getUser`; permissões ficam nas memberships e no banco, não em metadados editáveis do usuário. A aplicação mantém assinatura e links da SevenDevX. Não há cobrança implementada nem serviços pagos provisionados.

## Validação

Nesta entrega: 47 testes automatizados de regras, persistência, banco/RLS, auth e adaptadores; cinco testes de navegador para edição persistente, pipeline/proposta/desqualificação, navegação móvel/tema, mensagens simuladas e separação do acesso real. TypeScript, build e checagem dos adaptadores Deno também executados. A CI roda a suíte e os testes Playwright.

## Próximas dependências de ativação

- Projeto Supabase dedicado, variáveis públicas, migrations e conta administrativa.
- Provedor Google e e-mails de recuperação configurados/homologados com contas reais.
- Credenciais Meta, número, webhook, templates e fila de envio antes de liberar saída na inbox operacional.
- Backend do site conectado ao endpoint de captura com chave privada, consentimento e proteção contra abuso.
- Homologação com duas organizações reais, celulares e revisão completa de acessibilidade/LGPD/retenção.

Essas dependências são externas. Os adaptadores estão preparados e testados localmente, mas não são apresentados como integrações conectadas.

A cotação de um novo projeto na SevenDevX é US$ 10/mês; não foi criado sob a condição de custo adicional zero. A alternativa de schema isolado no projeto existente está preparada e testada, aguardando escolha explícita. Detalhes em [PRODUCTION.md](PRODUCTION.md).
