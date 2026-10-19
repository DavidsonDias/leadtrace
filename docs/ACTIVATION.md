# Ativação revertida

Em 18/10/2026, por solicitação do proprietário, a ativação do LeadTrace no projeto Supabase SevenDevX existente foi desfeita. Esse projeto pertence a outro sistema e não deve ser reutilizado.

- Schemas `leadtrace` e `leadtrace_private` removidos, incluindo tabelas, funções, políticas e membership criados na ativação.
- Data API restaurada para `public, graphql_public`.
- Valores das seis variáveis adicionadas na Vercel esvaziados; produção republicada sem conexão Supabase.
- Conta Auth existente preservada; nenhuma senha ou configuração de e-mail foi alterada.
- Impressão de controle das tabelas, permissões e RLS de `public` idêntica antes/depois da reversão.
- Não havia leads reais nas tabelas removidas.

O histórico de migrations permanece como registro da aplicação e reversão. O CRM demonstrativo permanece disponível. Um backend operacional requer projeto exclusivo e aprovação específica; não há provisionamento pago autorizado.

## Ambiente exclusivo Lovable Cloud

Na continuação autorizada pelo proprietário, foi criado um ambiente Lovable Cloud gerenciado exclusivo deste projeto. A inspeção confirmou que não há tabelas de aplicação em `public`; nenhuma migration do CRM ou dado demonstrativo foi aplicado nele. O projeto SevenDevX anterior não foi reutilizado.

As variáveis de acesso geradas agora permitem que a plataforma encaminhe visitantes sem sessão ao login, mas isso **não comprova login operacional**: métodos de acesso, confirmação, callbacks, organização e permissões ainda precisam de configuração e validação real. Google e recuperação continuam bloqueados pelas flags de configuração até verificar os endereços de retorno.

Validação da continuação: 48 testes passaram; no navegador, a edição de lead sobreviveu à atualização, a mudança de etapa apareceu em propostas, a mensagem simulada apareceu na Inbox e a navegação mobile manteve o tema claro sem transbordamento horizontal. Nenhum erro de execução foi observado nesses fluxos. Os metadados das páginas foram completados sem dados privados e a referência a uma imagem de compartilhamento inexistente foi removida.
