# LeadTrace

Documentação atual do MVP, execução, testes e pendências: [docs/MVP.md](docs/MVP.md).

LEADTRACE CRM — MASTER DEVELOPMENT PROMPT v2.0

Enterprise MVP | Powered by SevenDevX

Projeto piloto: Resende Torres Engenharia

Nome do produto: LeadTrace CRM
Assinatura: by SevenDevX
Slogan oficial: Track every lead. Grow every opportunity.
Tradução: Rastreie cada lead. Desenvolva cada oportunidade.

Empresa desenvolvedora: SevenDevX
Site: https://sevendevx.com/
Cliente piloto: Resende Torres Engenharia
Site de referência: https://www.resendetorres.com/

«MISSÃO: Desenvolver um CRM SaaS moderno, intuitivo, responsivo e funcional, com identidade própria, governança enterprise e arquitetura preparada para múltiplos clientes.»

---

0. DIRETRIZES FUNDAMENTAIS

Atue como uma equipe multidisciplinar sênior composta por:

- Product Manager.
- UX/UI Designer.
- Brand Designer.
- Software Architect.
- Full Stack Engineer.
- Database Engineer.
- Security Engineer.
- CRM Specialist.
- WhatsApp Business API Specialist.
- SEO/AEO/GEO Specialist.
- QA Engineer.
- DevOps Engineer.

Não entregar apenas protótipos, wireframes ou páginas estáticas.

Implementar um MVP navegável, visualmente premium e funcional, com persistência real quando possível e demonstrações controladas quando integrações externas ainda não estiverem disponíveis.

Prioridades absolutas:

1. Experiência visual premium.
2. Simplicidade operacional.
3. Rastreamento da origem dos leads.
4. Centralização do atendimento.
5. Gestão comercial por Kanban.
6. Controle de propostas e follow-up.
7. Segurança, governança e escalabilidade.

Não criar complexidade desnecessária para um cliente que recebe aproximadamente 20 leads semanais.

O produto deverá funcionar como uma solução personalizada para a Resende Torres, mas sua arquitetura e identidade devem permitir a comercialização futura para outras empresas.

---

1. BRANDING — LEADTRACE CRM

1.1 Identidade do produto

Nome: LeadTrace
Categoria: CRM & Lead Intelligence Platform
Assinatura: by SevenDevX

Slogan:

"Track every lead. Grow every opportunity."

Posicionamento:

"LeadTrace é uma plataforma inteligente de relacionamento comercial que conecta conversas, identifica a origem dos leads e transforma oportunidades em resultados."

A marca deve transmitir:

- Tecnologia.
- Inteligência comercial.
- Conectividade.
- Rastreabilidade.
- Confiança.
- Crescimento.
- Organização.
- Eficiência.

O LeadTrace deve possuir identidade visual independente da SevenDevX e da Resende Torres.

A SevenDevX será identificada como desenvolvedora.

A Resende Torres será a primeira organização demonstrativa e cliente piloto.

O nome LeadTrace é provisório até a verificação de disponibilidade de marca e domínio. Não utilizar símbolo de marca registrada nem afirmar exclusividade jurídica.

1.2 Logotipo

Utilizar a arte de referência do LeadTrace fornecida no projeto, caso esteja disponível.

O símbolo deverá representar:

- Letra L estilizada.
- Movimento ascendente.
- Direção e rastreamento.
- Evolução de oportunidades.
- Conectividade.

Criar aplicações consistentes:

- Logo horizontal.
- Logo vertical.
- Versão clara.
- Versão escura.
- Símbolo isolado.
- Favicon.
- Ícone PWA.
- Ícone para dispositivos móveis.
- Versão monocromática.

Se a arte de referência não estiver disponível, criar uma identidade vetorial original seguindo esses conceitos, sem copiar marcas existentes.

Evitar o uso de emojis como logotipo.

1.3 Paleta de cores

Definir tokens de design a partir desta paleta inicial:

Primary Navy: #0D1828
Deep Background: #081321
Electric Blue: #1677FF
LeadTrace Teal: #19D8BB
Mint Accent: #74F5DD
Surface Dark: #142235
Text Light: #F8FAFC
Text Secondary: #94A3B8
Border Dark: #26364A

Ajustar contrastes para acessibilidade.

Não utilizar gradientes em todos os componentes. Reservá-los para elementos de destaque, branding e ações prioritárias.

1.4 Tipografia

Priorizar:

- Inter.
- Manrope.
- Plus Jakarta Sans.

Utilizar tipografia consistente, legível e profissional.

1.5 Design System

Implementar:

- Design tokens.
- Componentes reutilizáveis.
- Dark mode.
- Light mode.
- Sidebar responsiva.
- Cards executivos.
- Tabelas profissionais.
- Badges de origem.
- Inputs e selects.
- Modais.
- Drawers.
- Tooltips.
- Skeleton loading.
- Empty states.
- Toast notifications.
- Microinterações.
- Estados de erro.
- Navegação por teclado.
- WCAG 2.2 AA como objetivo.

A experiência deve ser sofisticada, mas não visualmente sobrecarregada.

---

2. LANDING PAGE — LEADTRACE

Criar uma landing page SaaS premium.

Ela deve apresentar o LeadTrace como produto tecnológico desenvolvido pela SevenDevX.

Header

- Logotipo LeadTrace.
- Funcionalidades.
- Como funciona.
- Benefícios.
- Acessar plataforma.
- Explorar demonstração.

Hero

Headline principal:

"Every lead has a story. Track it."

Subheadline:

"Centralize conversations, discover where your leads come from, and manage every opportunity in one intelligent CRM."

Disponibilizar conteúdo em português como idioma inicial, mantendo o slogan original em inglês.

Versão portuguesa:

"Cada lead tem uma história. Acompanhe cada oportunidade."

CTA principal:

"Explorar demonstração"

CTA secundário:

"Acessar plataforma"

Adicionar mockup realista e visualmente sofisticado do dashboard LeadTrace.

O mockup deve refletir as funcionalidades realmente implementadas.

Seções

1. Hero com apresentação do produto.
2. Indicadores e demonstração visual.
3. Central de atendimento.
4. Inteligência de origem dos leads.
5. Pipeline comercial.
6. Gestão de propostas.
7. Alertas e follow-up.
8. Benefícios comerciais.
9. Como funciona.
10. CTA final.
11. Footer institucional.

Não inventar depoimentos, números de clientes, resultados comerciais ou integrações já realizadas.

SEO

Implementar:

- Title e meta description.
- Open Graph.
- Twitter Cards.
- Canonical.
- Sitemap.
- Robots.
- Schema.org pertinente.
- Semantic HTML.
- SEO técnico.
- AEO/GEO quando aplicável.
- Core Web Vitals.
- Imagens otimizadas.
- Responsividade.

Não indexar páginas privadas.

---

3. EXPERIÊNCIA DE AUTENTICAÇÃO

Criar:

- Login.
- Cadastro, se habilitado.
- Recuperação de senha.
- Redefinição de senha.
- Sessão expirada.
- Acesso negado.

Métodos:

- E-mail e senha.
- Google OAuth.
- Modo demonstração.

Utilizar Supabase Auth quando configurado.

Google OAuth deverá utilizar autenticação real.

Não simular autenticação externa como se estivesse conectada.

Login visual

Criar layout premium com:

- Logo LeadTrace.
- Formulário de acesso.
- Botão Google.
- Recuperação de senha.
- Link para demonstração.
- Elementos gráficos relacionados a dados, conexões e oportunidades.

Rodapé:

"LeadTrace CRM — Desenvolvido por SevenDevX"

Modo demo

Disponibilizar:

"Entrar na demonstração"

Esse acesso deve abrir um ambiente demonstrativo isolado, com dados fictícios e permissões limitadas.

Não utilizar o modo demo como bypass de autenticação para dados reais.

---

4. DASHBOARD EXECUTIVO

Criar dashboard com indicadores:

- Total de leads.
- Novos leads.
- Leads qualificados.
- Propostas pendentes.
- Propostas enviadas.
- Negócios fechados.
- Leads desqualificados.
- Conversas aguardando resposta.
- Oportunidades sem movimentação.
- Taxa de conversão, quando calculável.

Gráficos

- Leads por origem.
- Leads por período.
- Evolução do pipeline.
- Distribuição por etapa.
- Propostas por status.

Componentes adicionais

- Atividades recentes.
- Próximos acompanhamentos.
- Alertas comerciais.
- Leads que precisam de atenção.
- Conversas pendentes.

Filtros

- Hoje.
- Últimos 7 dias.
- Últimos 30 dias.
- Período personalizado.
- Responsável.
- Origem.

Os dados devem ser consistentes entre todos os módulos.

Não utilizar números aleatórios fixos como indicadores operacionais.

---

5. LEADTRACE INBOX — CENTRAL DE ATENDIMENTO

Criar módulo de conversas centralizadas.

Layout em três painéis.

Painel esquerdo

- Lista de conversas.
- Busca.
- Nome do contato.
- Telefone.
- Última mensagem.
- Data.
- Status de leitura.
- Origem do lead.
- Responsável.

Painel central

- Histórico de mensagens.
- Mensagens recebidas.
- Mensagens enviadas.
- Campo de resposta.
- Horários.
- Indicadores de status.
- Scroll adequado.
- Estados de carregamento.

Painel direito

- Perfil do lead.
- Telefone.
- Empresa/condomínio.
- Origem.
- Campanha.
- Pipeline.
- Tags.
- Observações.
- Responsável.
- Histórico de atividades.

Integração WhatsApp

Preparar integração oficial com Meta WhatsApp Business Platform / Cloud API.

Prever:

- Webhooks.
- Recebimento.
- Envio.
- Identificação de contatos.
- Histórico.
- Estados de mensagens.
- Tratamento de erros.
- Templates aprovados.
- Regras de janela de atendimento.
- Armazenamento seguro de tokens.

Não usar automações não oficiais do WhatsApp Web.

Demonstração

Se não houver credenciais Meta:

- Criar conversas fictícias.
- Permitir envio simulado.
- Persistir mensagens no ambiente demo.
- Simular respostas recebidas.
- Atualizar contadores.
- Demonstrar a associação entre conversa e lead.

Exibir:

"Modo demonstração — nenhuma mensagem será enviada pelo WhatsApp."

---

6. LEADTRACE ORIGIN — INTELIGÊNCIA DE ORIGEM

Este será o principal diferencial competitivo do LeadTrace.

Criar módulo dedicado à identificação da origem dos leads.

Origens

- Google Ads.
- Google Orgânico.
- Google Business Profile.
- Instagram.
- Facebook.
- WhatsApp direto.
- Site institucional.
- Indicação.
- IA / Assistentes de IA.
- Outras fontes.
- Origem desconhecida.

Informações

- Fonte principal.
- Canal.
- Campanha.
- Primeira interação.
- Data de captura.
- Landing page.
- Referrer.
- Parâmetros UTM.
- Identificadores de campanha.
- Evidência de atribuição.
- Método de identificação.
- Grau de confiança.

Dados técnicos

Preparar suporte a:

- utm_source.
- utm_medium.
- utm_campaign.
- utm_content.
- utm_term.
- gclid.
- Outros identificadores disponíveis.
- Referrer.
- First touch.
- Last touch.
- Eventos de conversão.

Regras

Não assumir que mensagens do WhatsApp revelam automaticamente sua origem.

A origem só deverá ser atribuída automaticamente quando houver evidência técnica suficiente.

Utilizar:

- Links rastreáveis.
- UTMs.
- Formulários.
- Identificadores disponibilizados pelas plataformas.
- Eventos do site.
- Dados declarados pelo contato.

Não identificar automaticamente ChatGPT, Gemini ou outras ferramentas de IA sem evidência.

Quando não houver informação:

"Origem desconhecida"

Permitir atribuição manual com auditoria.

Interface

Criar:

- Badges de origem.
- Filtros.
- Histórico de atribuição.
- Detalhamento de campanha.
- Visualização de leads por canal.
- Indicadores de confiança.

No ambiente demo, incluir exemplos fictícios de diferentes origens.

---

7. LEADTRACE PIPELINE — KANBAN

Criar Kanban comercial interativo.

Etapas:

1. Novo lead.
2. Lead qualificado.
3. Enviar proposta.
4. Proposta enviada.
5. Lead desqualificado.
6. Negócio fechado.

Cards

Cada card deve mostrar:

- Nome.
- Empresa/condomínio.
- Origem.
- Data de entrada.
- Responsável.
- Última interação.
- Status.
- Valor estimado, se disponível.
- Indicador de pendência.

Interações

- Drag-and-drop.
- Atualização persistente.
- Edição.
- Comentários.
- Histórico.
- Responsável.
- Próxima atividade.
- Timeline.

Ao desqualificar:

Solicitar motivo.

Opções:

- Sem orçamento.
- Fora do escopo.
- Sem interesse.
- Contato inválido.
- Concorrência.
- Outro.

Permitir observação complementar.

As alterações devem atualizar os demais módulos.

---

8. LEADTRACE DEALS — PROPOSTAS

Criar módulo de acompanhamento comercial.

Campos:

- Lead.
- Empresa.
- Responsável.
- Valor.
- Data de envio.
- Status.
- Última interação.
- Próximo acompanhamento.
- Observações.

Status:

- A preparar.
- Enviada.
- Aguardando retorno.
- Aceita.
- Recusada.
- Expirada, quando aplicável.

Não é obrigatório gerar PDFs nesta fase.

Priorizar o acompanhamento de propostas.

---

9. LEADTRACE FOLLOW-UP — ALERTAS

Criar alertas internos configuráveis.

Regras iniciais:

- 7 dias sem retorno.
- 15 dias sem retorno.
- 30 dias sem retorno.
- Atividade vencida.
- Proposta aguardando resposta.

Exemplo:

"A proposta do Condomínio Exemplo foi enviada há 30 dias e ainda não recebeu retorno."

Permitir:

- Visualizar alerta.
- Abrir lead.
- Registrar acompanhamento.
- Definir nova data.
- Marcar como resolvido quando aplicável.
- Filtrar pendências.

Alertas devem ser calculados a partir de dados persistidos.

Notificações externas ficam para fases posteriores.

---

10. GESTÃO DE LEADS

Criar módulo com:

- Listagem.
- Pesquisa.
- Filtros.
- Ordenação.
- Paginação.
- Cadastro manual.
- Edição.
- Visualização detalhada.
- Origem.
- Responsável.
- Status.
- Último contato.
- Histórico.
- Exportação CSV, se viável.

Permitir operação mesmo sem integração WhatsApp.

O LeadTrace não pode depender de um único canal para funcionar.

---

11. ARQUITETURA TÉCNICA

Frontend

Preferir:

- React.
- TypeScript.
- Vite.
- Tailwind CSS.
- shadcn/ui.
- Lucide React.
- TanStack Query.
- React Hook Form.
- Zod.
- Biblioteca de gráficos adequada.
- Drag-and-drop acessível.

Backend

- Supabase PostgreSQL.
- Supabase Auth.
- Row Level Security.
- Edge Functions quando necessárias.
- Realtime quando agregar valor.

Infraestrutura

- Vercel.
- Variáveis de ambiente.
- Ambientes separados.
- Deploy seguro.
- Migrations versionadas.

Modelo de dados

Projetar:

- organizations.
- profiles.
- organization_members.
- leads.
- lead_sources.
- attribution_events.
- conversations.
- messages.
- pipeline_stages.
- pipeline_history.
- proposals.
- activities.
- notes.
- notifications.
- integration_settings.
- audit_logs.

Incluir:

- UUIDs.
- Timestamps.
- Foreign keys.
- Índices.
- Restrições.
- Soft delete quando necessário.
- Auditoria de alterações relevantes.

Multi-tenancy

Preparar arquitetura para múltiplas organizações.

Cada organização deve possuir:

- Leads próprios.
- Conversas próprias.
- Pipeline próprio.
- Usuários próprios.
- Configurações próprias.
- Integrações próprias.

Aplicar isolamento por organização com RLS.

Perfis:

- Administrador.
- Gestor.
- Atendente.

Não permitir acesso cruzado entre organizações.

---

12. PERSONALIZAÇÃO POR ORGANIZAÇÃO

O LeadTrace deve ser um produto independente, com possibilidade futura de personalização para clientes.

Criar estrutura para:

- Nome da organização.
- Logotipo.
- Cores institucionais opcionais.
- Dados comerciais.
- Usuários.
- Preferências.
- Funil.
- Integrações.

Para o projeto piloto:

Organização: Resende Torres Engenharia.

Utilizar a identidade da Resende Torres nas áreas apropriadas, preservando a marca principal LeadTrace.

Não substituir a marca LeadTrace pelo logotipo do cliente em toda a plataforma.

O objetivo é permitir uma experiência SaaS personalizada e consistente.

---

13. AMBIENTE DEMONSTRATIVO

Criar ambiente completo de demonstração.

Dados

Gerar entre 30 e 50 leads fictícios, incluindo:

- Condomínios.
- Síndicos.
- Administradoras.
- Empresas.
- Responsáveis por obras.

Serviços:

- Reforma de fachadas.
- Recuperação estrutural.
- Pintura predial.
- Impermeabilização.
- Manutenção.
- Orçamentos de engenharia.

Incluir:

- Conversas.
- Origens.
- Propostas.
- Comentários.
- Histórico.
- Alertas.
- Campanhas fictícias.

Todos os dados devem ser coerentes entre módulos.

Interatividade

Permitir:

- Abrir conversas.
- Enviar mensagens simuladas.
- Mover cards.
- Criar leads.
- Editar informações.
- Registrar comentários.
- Alterar propostas.
- Aplicar filtros.
- Visualizar alertas.

Incluir opção para restaurar os dados demonstrativos.

O ambiente demo deve ser isolado de dados reais.

---

14. GOVERNANÇA SEVENDEVX

Aplicar a governança técnica, visual e operacional da SevenDevX.

Governança visível

Na landing page:

"LeadTrace CRM — by SevenDevX"

No login:

"Uma solução digital desenvolvida pela SevenDevX."

No footer:

"Desenvolvido por SevenDevX"

Link:

https://sevendevx.com/

No dashboard, utilizar uma assinatura discreta, sem comprometer a experiência.

Governança invisível

Implementar:

- Arquitetura modular.
- Componentização.
- Clean Code.
- TypeScript estrito.
- Separação de responsabilidades.
- Validação de dados.
- Tratamento de erros.
- Segurança de autenticação.
- Autorização por papéis.
- Row Level Security.
- Gestão de secrets.
- Logs estruturados.
- Auditoria.
- Controle de dependências.
- Performance.
- Lazy loading.
- Acessibilidade.
- Responsividade.
- SEO/AEO/GEO na landing page.
- Noindex no ambiente privado.
- Observabilidade.
- Documentação.
- Testes automatizados.
- CI/CD.
- Versionamento.
- Migrations.
- LGPD.
- Minimização de dados.
- Segurança por padrão.

Não expor chaves privadas.

Não utilizar service role key no frontend.

Não registrar mensagens sensíveis desnecessariamente.

Não criar integrações fictícias apresentadas como reais.

---

15. PWA AVANÇADO

Preparar o LeadTrace como Progressive Web App.

Implementar:

- Web App Manifest.
- Ícones LeadTrace.
- Splash screen quando suportada.
- Instalação.
- Cache seguro de assets.
- Atualização de versão.
- Estados offline.
- Responsividade mobile.
- Experiência semelhante a aplicativo.

Não armazenar conversas sensíveis em cache offline sem proteção apropriada.

O CRM deve funcionar bem em desktop, tablet e smartphone.

---

16. CONFIGURAÇÕES E INTEGRAÇÕES

Criar área administrativa.

Módulos:

- Meu perfil.
- Organização.
- Usuários.
- Permissões.
- Pipeline.
- Origens.
- Alertas.
- Aparência.
- Integrações.

Integrações previstas:

- WhatsApp Business.
- Google OAuth.
- Google Ads.
- Site institucional.
- Webhooks.

Estados:

- Conectado.
- Não configurado.
- Erro.
- Demonstração.

Criar adaptadores desacoplados para facilitar a evolução.

Nunca exibir integrações simuladas como conectadas.

---

17. CRITÉRIOS DE ACEITE

O MVP será considerado apresentável quando:

1. Landing page LeadTrace implementada.
2. Branding consistente.
3. Login funcional ou acesso demo isolado.
4. Dashboard navegável.
5. Indicadores consistentes.
6. Conversas demonstrativas interativas.
7. Origem dos leads visível.
8. Kanban com drag-and-drop.
9. Movimentações persistentes.
10. Comentários funcionais.
11. Desqualificação com motivo.
12. Gestão de propostas.
13. Alertas internos.
14. Filtros por data.
15. Filtros por origem.
16. Interface responsiva.
17. PWA configurado.
18. Governança SevenDevX aplicada.
19. Isolamento entre dados demo e produção.
20. Testes dos fluxos críticos executados.

Não declarar funcionalidades concluídas sem implementação e validação.

---

18. ROADMAP DE EVOLUÇÃO

Fase 1 — MVP Demonstrável

- Branding LeadTrace.
- Landing page.
- Login/demo.
- Dashboard.
- Inbox demonstrativa.
- Origem dos leads.
- Kanban.
- Propostas.
- Follow-up.
- Filtros.
- Governança.
- PWA.

Fase 2 — MVP Operacional

- Autenticação real.
- Banco de produção.
- Usuários.
- Permissões.
- Integração com site.
- Captura de origem.
- Auditoria.
- Homologação.

Fase 3 — Integrações Oficiais

- WhatsApp Cloud API.
- Webhooks.
- Envio e recebimento reais.
- Campanhas.
- Atribuição de origem.
- Tratamento de erros.
- Monitoramento.

Fase 4 — SaaS Comercial

- Onboarding de organizações.
- Planos e assinaturas, se aprovados.
- Administração multi-tenant.
- Configurações comerciais.
- Relatórios avançados.
- Automações.
- Notificações.
- Inteligência artificial quando houver necessidade comprovada.

Não implementar cobrança, assinaturas ou recursos complexos antes da validação comercial.

---

19. EXPERIÊNCIA DE APRESENTAÇÃO AO CLIENTE

O MVP deve permitir uma demonstração comercial de aproximadamente 5 a 10 minutos.

Fluxo recomendado:

1. Apresentar a landing page.
2. Mostrar o posicionamento LeadTrace.
3. Entrar na demonstração.
4. Visualizar indicadores comerciais.
5. Abrir uma conversa simulada.
6. Mostrar a origem do lead.
7. Mover a oportunidade no Kanban.
8. Registrar comentário.
9. Simular o envio de proposta.
10. Mostrar alerta de follow-up.
11. Filtrar leads por Google Ads.
12. Demonstrar responsividade.

A experiência deve transmitir confiança e mostrar claramente o valor comercial do sistema.

---

20. INSTRUÇÕES FINAIS DE EXECUÇÃO

COMECE A IMPLEMENTAÇÃO DO LEADTRACE CRM AGORA.

Não se limite a planejamento.

Não entregue apenas componentes isolados ou telas sem navegação.

Implemente uma experiência completa e integrada.

Caso faltem credenciais externas:

- Continue a implementação.
- Utilize dados demonstrativos seguros.
- Identifique recursos simulados.
- Prepare interfaces para integração futura.
- Documente pendências.

Não inventar funcionalidades concluídas.

Não adicionar serviços pagos sem necessidade.

Priorizar simplicidade, consistência e qualidade.

Ao concluir, entregar:

1. Resumo das funcionalidades.
2. Telas implementadas.
3. Fluxos funcionais.
4. Recursos demonstrativos.
5. Integrações pendentes.
6. Estrutura de banco.
7. Arquitetura.
8. Testes realizados.
9. Instruções de execução.
10. Próximos passos para produção.

RESULTADO ESPERADO

Criar o LeadTrace CRM, uma plataforma SaaS moderna de gestão de leads, relacionamento comercial, rastreamento de origem e acompanhamento de oportunidades.

O primeiro ambiente será personalizado para a Resende Torres Engenharia, preservando a identidade do produto e a governança da SevenDevX.

O resultado deverá ser um MVP profissional, elegante, responsivo, navegável e funcional, preparado para demonstração comercial e evolução futura.

LeadTrace CRM
Track every lead. Grow every opportunity.

Developed by SevenDevX.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6f6b3b04-8df6-48b5-936a-42c697817476).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
