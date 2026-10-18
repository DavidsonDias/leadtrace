# Ativação revertida

Em 18/10/2026, por solicitação do proprietário, a ativação do LeadTrace no projeto Supabase SevenDevX existente foi desfeita. Esse projeto pertence a outro sistema e não deve ser reutilizado.

- Schemas `leadtrace` e `leadtrace_private` removidos, incluindo tabelas, funções, políticas e membership criados na ativação.
- Data API restaurada para `public, graphql_public`.
- Valores das seis variáveis adicionadas na Vercel esvaziados; produção republicada sem conexão Supabase.
- Conta Auth existente preservada; nenhuma senha ou configuração de e-mail foi alterada.
- Impressão de controle das tabelas, permissões e RLS de `public` idêntica antes/depois da reversão.
- Não havia leads reais nas tabelas removidas.

O histórico de migrations permanece como registro da aplicação e reversão. O CRM demonstrativo permanece disponível. Um backend operacional requer projeto exclusivo e aprovação específica; não há provisionamento pago autorizado.
