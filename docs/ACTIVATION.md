# Ativação do ambiente operacional

O proprietário aprovou o uso do projeto Supabase SevenDevX existente, sem criar nova instância. A instalação foi aplicada em `leadtrace` e `leadtrace_private`; o schema `public` e os outros sistemas foram preservados.

## Banco e acesso

- 17 tabelas instaladas, todas com RLS ativo.
- Organização piloto Resende Torres Engenharia criada sem leads fictícios.
- Conta indicada pelo proprietário vinculada como administradora; o e-mail existente está confirmado no Auth e utiliza autenticação por e-mail.
- Data API preserva `public` e `graphql_public`, acrescentando somente `leadtrace`.
- `leadtrace_private` não está exposto pela Data API.
- Requisição sem sessão ao schema LeadTrace é rejeitada; o schema privado é recusado como não exposto.
- Identificadores/grants e flags de RLS das tabelas em `public` tiveram a mesma impressão de controle antes/depois da instalação.

A ferramenta recusou migrations grandes com erro de estado expirado. A instalação foi aplicada em etapas menores, habilitando RLS na criação das tabelas e mantendo a API não exposta até as políticas estarem completas. A política de leitura de auditoria foi restringida com `ALTER POLICY`, com a mesma condição da fonte versionada. A política de `webhook_events` permite somente `service_role`.

## Verificação remota

Uma transação de QA executou cadastro de lead, avanço para proposta enviada, atualização de valor/agenda, comentário, atribuição auditada e desqualificação com motivo. Em seguida, uma identidade sem membership não conseguiu consultar organizações/leads nem executar comando comercial. A transação foi revertida e a consulta final confirmou zero leads de QA persistidos.

Os advisors não apontaram novos avisos de segurança nas funções/tabelas LeadTrace. Os avisos pré-existentes dos outros sistemas e do Auth compartilhado não foram alterados. A proteção contra senhas vazadas permanece uma configuração herdada do Auth; referência: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection.

## Configuração do frontend

A produção utiliza URL/chave publishable do projeto selecionado e `VITE_SUPABASE_DB_SCHEMA=leadtrace`. A chave pública não é uma service-role key. Credenciais privadas não entram no frontend. Preview e CI permanecem sem acesso configurado à produção.

O acesso por e-mail e senha usa a conta já existente no Auth. Nenhuma senha foi criada, lida, alterada ou enviada pelo assistente. O projeto compartilha identidades com os outros aplicativos; uma alteração de senha dessa conta também afeta seu acesso nesses aplicativos.

Google e recuperação por e-mail permanecem bloqueados até confirmar a configuração das URLs de retorno do LeadTrace no Auth compartilhado. `VITE_AUTH_REDIRECTS_CONFIGURED=false` torna esse limite explícito e impede enviar um link que possa retornar ao outro aplicativo. Não substituir o Site URL ou os templates existentes ao acrescentar callbacks LeadTrace.

WhatsApp e captura do site continuam pendentes de secrets, configuração oficial e homologação externa. Nenhuma mensagem/e-mail real foi enviado e nenhuma nova instância de banco foi contratada.
