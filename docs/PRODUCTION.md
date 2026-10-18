# LeadTrace — ativação operacional

## O que já está implementado

A demonstração (`/app`) e a plataforma (`/workspace`) usam as mesmas telas de CRM, mas providers e persistências separados. O provider demo acessa apenas localStorage. O provider operacional usa Supabase Auth, consultas sob RLS e comandos transacionais PostgreSQL. Dados operacionais não são gravados no armazenamento demo nem no cache offline.

Há código para e-mail/senha, Google OAuth configurável, callback PKCE, recuperação, redefinição, verificação de usuário com `getUser`, logout, conta sem organização, seleção de organização, perfil, dados comerciais, regras de alertas e administração de papéis. Google só fica disponível quando o provedor real é habilitado.

As telas de dashboard, leads, origem, pipeline, propostas, follow-up e inbox são compartilhadas em `src/components/pages`. O contexto vive em `src/lib/crm/context.ts`; providers em `store.tsx` (demo) e `backend/live-store.tsx` (operacional). `backend/repository.ts` pagina consultas, traduz o modelo relacional e valida o snapshot antes de renderizá-lo. Confirmações de gravação operacional só aparecem após a resposta do banco.

## Banco dedicado

O proprietário aprovou a instalação em schemas exclusivos no projeto SevenDevX existente. A alternativa isolada foi aplicada; as tabelas e políticas dos outros sistemas foram preservadas. A migration em `supabase/migrations` permanece como opção para um futuro projeto dedicado. Estado da ativação em [ACTIVATION.md](ACTIVATION.md).

A migration contém 17 tabelas:

- organizations, profiles, organization_members;
- leads, lead_sources, attribution_events;
- conversations, messages;
- pipeline_stages, pipeline_history;
- proposals, activities, notes, notifications;
- integration_settings, audit_logs, webhook_events.

Inclui UUIDs, timestamps, FKs compostas por organização, índices para consultas e atribuição, soft delete de leads, RLS, histórico e auditoria sem copiar mensagens ou valores pessoais para os logs. Os eventos de integração são deduplicados no banco. Nenhum lead fictício é inserido na produção.

Papéis: administrador e gestor trabalham nos leads da organização; atendente acessa apenas os próprios. Somente administrador altera configurações e papéis. A última conta administrativa não pode ser removida por rebaixamento de papel. O provisionamento de novas organizações e vínculos exige administração confiável; não há endpoint público que permita se promover ou entrar em um tenant.

As únicas funções privilegiadas são auxiliares internos no schema `private`, com `search_path` vazio, grants explícitos e validações de identidade quando recebem chamadas de usuário. As RPCs comerciais são `SECURITY INVOKER`, mantendo RLS. Funções de ingestão ficam disponíveis exclusivamente ao papel de servidor `service_role`.

## Ativar sem compartilhar secrets no chat

1. Criar/selecionar o projeto dedicado e verificar seu custo antes de contratar qualquer recurso pago.
2. Aplicar a migration completa em um banco vazio pelo SQL Editor ou pela CLI Supabase vinculada ao projeto correto. Na CLI, conferir a identidade e usar `supabase db push --dry-run` antes de aplicar. A migration já foi executada nos testes locais Postgres/PGlite; a opção isolada já foi aplicada e validada no projeto remoto.
3. Criar ou convidar a conta administrativa no painel de Auth. Para o piloto, manter cadastro público desabilitado. Após existir o usuário em `auth.users`, adaptar e executar `supabase/bootstrap.sql`. O script não cria senhas e não envia e-mails.
4. Configurar as variáveis públicas da `.env.example` no ambiente de destino. Usar uma publishable key; nunca uma chave secret/service_role em `VITE_*`.
5. No Auth, definir a URL pública e permitir `/auth/callback` e `/auth/callback?next=reset-password` nas URLs de retorno. Para desenvolvimento: mesma origem/porta exibida pelo Vite. No Google, cadastrar o callback Supabase indicado no painel e habilitar `VITE_GOOGLE_OAUTH_ENABLED=true` somente após configurar o provedor.
6. Publicar o frontend e validar duas organizações e dois papéis com contas reais antes de importar clientes.

Não colar access tokens, senhas do banco ou chaves privadas em issues, commits ou chat. Secrets de integração são configurados no painel de secrets das Edge Functions.

## WhatsApp oficial

`supabase/functions/whatsapp-webhook` contém o endpoint de verificação e recebimento. Ele exige assinatura HMAC SHA-256 da Meta antes de interpretar o JSON, valida o `phone_number_id`, limita o corpo, persiste mensagens/status e retorna erro temporário quando a gravação falha, permitindo retry da Meta. Identificadores de mensagem são únicos; a retransmissão não duplica conversa nem contador.

Secrets necessários:

- `META_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN`;
- `WHATSAPP_ORGANIZATION_ID`, `WHATSAPP_PHONE_NUMBER_ID`;
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` fornecidos ao runtime Supabase.

O endpoint usa `verify_jwt=false` porque autentica a assinatura Meta. Essa opção não dispensa a assinatura. O mapeamento de número para organização fica no servidor. A configuração atual suporta o número do piloto; um SaaS com vários números precisa de um registro privado de integrações por número.

`_shared/whatsapp.ts` implementa o transporte de envio pela Cloud API: exige token/número/versão da Graph API configurados, valida destinatário, bloqueia texto livre fora de 24 horas e permite template cujo aceite continua sendo validado pela Meta. Não usa WhatsApp Web. Esse transporte ainda não está exposto como ação operacional: o envio na inbox real permanece bloqueado até configurar credenciais, preparar a fila de envio/idempotência de saída e homologar templates. Mensagens com falha têm estado próprio, sem aparecer como enviadas.

Deploy, após configurar o projeto/secrets:

```sh
supabase functions deploy whatsapp-webhook
```

Cadastrar a URL gerada no painel Meta, usar o verify token configurado e testar mensagens/eventos reais. Nenhuma Edge Function foi publicada e nenhuma mensagem real foi enviada nesta entrega.

## Captura de origem do site

`supabase/functions/capture-lead` é servidor a servidor. O backend do formulário envia `x-leadtrace-key`; essa chave nunca deve ir ao JavaScript público. Secrets: `LEADTRACE_CAPTURE_KEY`, `CAPTURE_ORGANIZATION_ID` e `CAPTURE_SITE_ORIGIN` (origem HTTPS exata do site).

Corpo esperado:

```json
{
  "eventId": "identificador-unico-da-submissao",
  "name": "Nome do contato",
  "company": "Empresa ou condomínio",
  "phone": "5521999990000",
  "email": "",
  "service": "Reforma de fachada",
  "pageUrl": "https://seu-site/orcamento?utm_source=google&utm_medium=cpc&utm_campaign=fachadas",
  "referrer": "https://www.google.com/"
}
```

O formulário deve capturar URL/referrer no momento apropriado à política de consentimento do site e enviar somente os campos necessários ao atendimento. O servidor descarta fragmentos e parâmetros alheios à atribuição, evitando guardar e-mail ou outros valores acidentais na URL. UTMs, gclid e referrers conhecidos são evidências registradas com confiança média; não são validação de conversão junto à plataforma. Sem evidência: origem desconhecida. IA exige referrer conhecido ou UTM explícita; o texto da mensagem nunca é usado para inferir origem.

O primeiro contato mantém a origem inicial; capturas posteriores atualizam last touch sem substituir a atribuição original. `eventId` elimina duplicatas. Homologar o formulário real, proteção contra abuso e a política de retenção antes de expor a captura no site do cliente.

## Deploy existente

O repositório está ligado ao projeto Vercel `leadtrace`, equipe `davidson-dias-projects`, Node 24. A URL estável observada é `https://leadtrace-two.vercel.app`. O Git integra preview por branch e produção na `main`. O preset é escolhido pelo ambiente da plataforma; o build local padrão do plugin Lovable produz saída Nitro/Cloudflare.

A produção recebe a configuração pública do projeto selecionado pelo proprietário, usando schema `leadtrace`. Preview e CI permanecem isolados da produção. A demo continua acessível separadamente; não usar seu armazenamento para dados reais.

## Testar

```sh
npm ci --ignore-scripts
npm test
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
```

No ambiente de desenvolvimento desta entrega, os testes Playwright usaram Chromium instalado no sistema via `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium`. A CI instala o navegador e executa os mesmos fluxos sem credenciais reais.

Os testes Postgres executam a migration de verdade via PGlite, com papéis `anon`, `authenticated` e `service_role`. Cobrem isolamento entre organizações, restrição de atendentes, escalada de privilégios, motivo de desqualificação, FKs, transações comerciais, autoria de auditoria, preservação do último administrador, deduplicação de WhatsApp/site e origem desconhecida sem evidência. As funções Deno também passaram em `deno check`.

Limites de homologação: login e recuperação com contas reais, Google, Meta, formulário real, concorrência em Postgres remoto, aparelhos Android/iOS, auditoria WCAG completa e política LGPD/retenção do cliente. Os testes locais não substituem essas validações externas.

## Alternativa sem nova instância de banco

A cotação do Supabase para um projeto adicional na organização SevenDevX foi **US$ 10/mês**. O usuário autorizou criação somente sem custo adicional; nenhum projeto foi criado e nenhum custo foi confirmado.

Como alternativa técnica, o repositório suporta um schema `leadtrace` no projeto SevenDevX existente. Essa alternativa precisa ser escolhida explicitamente antes de qualquer alteração externa: compartilha a infraestrutura, o serviço Auth, as identidades e os limites do projeto existente. Uma alteração de senha de uma identidade compartilhada vale para todos os aplicativos que usam essa mesma identidade. Não cria nova instância nem novo custo de compute de projeto; consumo continua sujeito aos limites e plano já existentes.

`npm run db:isolated` gera `supabase/isolated-schema.sql` e `supabase/bootstrap-isolated.sql`. A geração preserva o papel PostgreSQL `PUBLIC` e muda apenas os namespaces dos objetos/grants para `leadtrace` e `leadtrace_private`. Um teste executa esse SQL com um produto existente em `public`, confirma que dados/políticas/grants desse produto não mudam e exerce o CRM no schema isolado.

Para essa opção, após a escolha do projeto:

1. Verificar que os schemas `leadtrace` e `leadtrace_private` ainda não existem e revisar os limites do projeto.
2. Aplicar **somente** `supabase/isolated-schema.sql`. Não executar a migration de schema público nesse projeto compartilhado e não usar `db push` com as migrations públicas.
3. Adicionar apenas `leadtrace` aos schemas expostos pela Data API, preservando os schemas já configurados. **Nunca expor `leadtrace_private`.**
4. Usar `supabase/bootstrap-isolated.sql` para o vínculo inicial.
5. Configurar `VITE_SUPABASE_DB_SCHEMA=leadtrace` no frontend e `LEADTRACE_DB_SCHEMA=leadtrace` nos adaptadores. As keys/URL serão do projeto selecionado; continuam valendo todas as políticas de tenant e responsável.
6. Acrescentar as URLs de retorno LeadTrace ao Auth sem substituir o Site URL, os provedores ou os templates usados pelos outros aplicativos. Validar as identidades compartilhadas e os dois aplicativos antes de liberar acesso.

O proprietário autorizou a aplicação dessa opção. Foram criados somente os objetos LeadTrace e acrescentado seu schema à lista de exposição da API. Tabelas, políticas e grants em `public` foram preservados. Consulte [ACTIVATION.md](ACTIVATION.md).
