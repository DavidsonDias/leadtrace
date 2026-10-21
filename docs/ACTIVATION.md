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

O acesso por e-mail foi habilitado e os provedores Google e Lovable foram configurados. O formulário agora permite cadastro com nome e confirmação de e-mail, e o cliente de acesso é o mesmo usado pelos métodos sociais. Google, Lovable e recuperação permanecem indisponíveis na interface até verificar os endereços de retorno.

Foi aplicada a migration `drizzle/migrations/0000_create_team_profiles.sql`: perfis são criados automaticamente após o cadastro, com nome válido e acesso individual de leitura/edição. O cadastro não cria organização nem concede função administrativa. Os testes executam o SQL real em PGlite e validam criação, nome padrão e isolamento. A interface oferece edição do próprio nome e saída com limpeza dos dados em memória.

Os 51 testes passaram e o formulário de cadastro foi verificado no navegador sem erros de execução. A inspeção remota confirmou zero contas cadastradas; a geração de sessão de teste foi recusada por esse motivo. **Cadastro confirmado, edição de perfil e saída com uma sessão real ainda não foram validados.** É necessário criar e confirmar a primeira conta na interface; nenhuma conta ou senha fictícia foi criada no ambiente real.

O esquema comercial completo ainda não foi aplicado: somente `profiles` existe no ambiente Cloud. A migration histórica de CRM precisa ser aplicada de forma compatível com esse perfil existente antes de consultar organizações ou salvar leads reais. A demonstração continua isolada.

Validação da continuação: 48 testes passaram; no navegador, a edição de lead sobreviveu à atualização, a mudança de etapa apareceu em propostas, a mensagem simulada apareceu na Inbox e a navegação mobile manteve o tema claro sem transbordamento horizontal. Nenhum erro de execução foi observado nesses fluxos. Os metadados das páginas foram completados sem dados privados e a referência a uma imagem de compartilhamento inexistente foi removida.
