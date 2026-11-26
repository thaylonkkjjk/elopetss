# Mundo ONG — Documentação do Projeto

Plataforma web que conecta ONGs de proteção animal a pessoas que querem adotar
um pet ou ajudar com doações. ONGs se cadastram, publicam anúncios (adoção ou
pedido de ajuda) e o público navega, entra em contato e pode denunciar posts
problemáticos. Um painel administrativo aprova/rejeita ONGs, modera posts e
denúncias, e mantém um histórico de ações.

> Nome do pacote (`package.json`): `mundo-ong`. A pasta do projeto se chama
> `Mundo Ong-main`.

---

## Índice

1. [Stack técnica](#stack-técnica)
2. [Como rodar o projeto](#como-rodar-o-projeto)
3. [Estrutura de pastas](#estrutura-de-pastas)
4. [Backend (server/)](#backend-server)
5. [Frontend — Páginas](#frontend--páginas-clientsrcpages)
6. [Frontend — Componentes](#frontend--componentes-clientsrccomponents)
7. [Frontend — Hooks](#frontend--hooks-clientsrchooks)
8. [Frontend — Lib](#frontend--lib-clientsrclib)
9. [Outros arquivos do frontend](#outros-arquivos-do-frontend)
10. [Variáveis de ambiente](#variáveis-de-ambiente)
11. [Observações / pontos de atenção](#observações--pontos-de-atenção)
12. [Backlog — histórico de desenvolvimento](#backlog--histórico-de-desenvolvimento)

---

## Stack técnica

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + Vite + TypeScript + Tailwind CSS + shadcn/ui (Radix) |
| Roteamento | [wouter](https://github.com/molefrog/wouter) |
| Comunicação cliente↔servidor | [tRPC](https://trpc.io) (API tipada ponta a ponta) + React Query |
| Backend | Node.js + Express |
| Banco de dados / Storage | Supabase (Postgres + Storage de imagens) |
| Autenticação | Cookies de sessão próprios (sem OAuth/terceiros) + `bcrypt` para senhas |
| E-mail | Gmail SMTP via `nodemailer` |
| Testes | Vitest |

---

## Como rodar o projeto

```bash
pnpm install          # instala as dependências
pnpm run dev           # inicia o servidor de desenvolvimento (porta 3000, com hot-reload)
pnpm run build         # gera o build de produção (client + server) em dist/
pnpm run start         # roda o build de produção
pnpm run check         # checagem de tipos TypeScript
pnpm run test          # roda os testes (Vitest)
pnpm run format        # formata o código com Prettier
```

Antes de rodar, crie um arquivo `.env` na raiz (veja a seção
[Variáveis de ambiente](#variáveis-de-ambiente) abaixo).

---

## Estrutura de pastas

```
client/              → frontend (React)
  src/
    pages/           → uma página por rota do site
    components/      → componentes reutilizáveis específicos do site
    components/ui/   → primitivos genéricos do shadcn/ui (botão, dialog, input, etc. — não documentados aqui individualmente)
    hooks/            → hooks utilitários do React
    lib/              → funções auxiliares (tRPC client, máscaras, dados mock, etc.)
    contexts/         → React Contexts (tema claro/escuro)
server/               → backend (Express + tRPC)
  _core/              → infraestrutura do servidor (entry point, cookies, env, tRPC, Vite middleware)
  routers/            → routers tRPC (toda a lógica de negócio exposta à API)
  supabase.ts         → todas as funções de acesso ao banco de dados/storage
  email.ts            → envio de e-mails (templates + Gmail SMTP)
  cpfCnpj.ts           → validação de CPF/CNPJ e consulta de empresa
shared/                → código compartilhado entre client e server (tipos, constantes, erros)
```

---

## Backend (`server/`)

### `server/_core/index.ts` — ponto de entrada real
Usado pelos scripts `dev`/`build`/`start`. A função `startServer()`:
- cria a aplicação Express;
- aplica `express.json`/`express.urlencoded` com limite de **50 MB** (necessário
  porque imagens são enviadas em base64 pelo próprio corpo da requisição, sem
  `multipart/form-data`);
- monta o router tRPC em `/api/trpc`;
- em desenvolvimento, usa o middleware do Vite (`setupVite`); em produção, serve
  os arquivos estáticos já compilados (`serveStatic`).

`isPortAvailable(port)` / `findAvailablePort(startPort)`: testam portas a partir
de 3000 (até +20) para não travar se a 3000 já estiver ocupada.

> `server/index.ts` (sem `_core`) é uma versão **antiga e não utilizada** desse
> mesmo entry point — nenhum script do `package.json` o referencia. É código
> órfão que pode ser removido com segurança.

### `server/_core/vite.ts`
- `setupVite(app, server)`: em desenvolvimento, liga o Vite em modo middleware
  (HMR via WebSocket) e injeta um parâmetro `?v=<id>` no script principal do
  `index.html` para evitar cache do navegador durante o desenvolvimento.
- `serveStatic(app)`: em produção, serve os arquivos já buildados de
  `dist/public` e devolve `index.html` para qualquer rota não encontrada
  (necessário para o roteamento client-side do wouter funcionar em refresh de
  página).

### `server/_core/cookies.ts`
- `isSecureRequest(req)`: verifica se a requisição é HTTPS, olhando tanto
  `req.protocol` quanto o header `x-forwarded-proto` (necessário porque, atrás
  de um proxy como o túnel Cloudflare, o Express não vê o HTTPS diretamente).
- `getSessionCookieOptions(req)`: monta as opções do cookie de sessão —
  `httpOnly: true`, `path: "/"`, e `secure`/`sameSite` ajustados dinamicamente
  (`"lax"` + não-seguro em `localhost`; `"none"` + seguro quando servido via
  HTTPS/túnel), para funcionar nos dois cenários.

### `server/_core/context.ts`
Define o tipo `TrpcContext` (`req`, `res`, `user: null` — sempre `null`, pois a
autenticação real não passa por aqui) e `createContext()`, chamado pelo tRPC a
cada requisição.

### `server/_core/env.ts`
Objeto `ENV` com getters que leem `process.env` sob demanda: `cookieSecret`,
`databaseUrl`, `isProduction`, `supabaseUrl`, `supabaseServiceRoleKey`,
`resendApiKey` (legado, não usado mais), `emailFrom`, `gmailUser`,
`gmailAppPassword`, `siteUrl`.

### `server/_core/trpc.ts`
Cria a instância do tRPC (`initTRPC.context<TrpcContext>()`, com `superjson`
como serializador) e exporta `router` e `publicProcedure`. **Todos** os
endpoints do site são tecnicamente `publicProcedure` — o controle de acesso
(ONG dona do recurso, ou admin) é feito manualmente dentro de cada
procedure, via cookie.

### `server/routers.ts`
Monta o `appRouter` final, unindo três sub-routers: `ongs` (`ongsRouter`),
`adminAuth` (`adminAuthRouter`) e `ongAuth` (`ongAuthRouter`). O tipo exportado
`AppRouter` é o que dá autocomplete e checagem de tipos no cliente.

### `server/routers/ongs.ts` — o maior e mais importante

**Helpers internos de autenticação:**
- `getCookie` / `getAdminEmailFromCookie` / `getOngSessionFromCookie`:
  decodificam o cookie de sessão (um JSON `{ type, email, id }` em base64 —
  não é um JWT assinado, é um token simples lido diretamente do cookie).
- `requireOngSession(req, ongId?)`: exige um cookie de ONG válido; se `ongId`
  for passado, garante que a ONG logada é a dona do recurso.
- `requireAdminSession(req)`: exige um cookie de admin válido.
- `requireOwnerOrAdminForPost(req, postId)`: admin passa livre; caso contrário,
  busca o post e exige que o cookie pertença à ONG dona dele.

**`ongsRouter`:**
| Procedure | O que faz |
|---|---|
| `lookupCnpj` | Consulta dados de uma empresa pelo CNPJ na BrasilAPI |
| `register` | Cadastra uma ONG como pendente (valida se o CNPJ é de empresa "relacionada a animais", envia e-mail de confirmação) |
| `listPending` / `getAllApplications` | Lista candidaturas pendentes / todas (admin) |
| `approve` / `reject` | Aprova (migra pendente → aprovada, envia e-mail) ou rejeita uma ONG (admin) |
| `getAllOngsAdmin` | Lista todas as ONGs aprovadas, incluindo inativas (admin) |
| `deleteOng` | Soft-delete da ONG + desativa todos os posts dela (admin) |
| `getAllApproved` | Lista pública de ONGs ativas (remove campos sensíveis) |
| `getPostsByOng` / `getAllPosts` / `getAllPostsAdmin` / `getOngPostsAdminAll` | Consultas de posts, públicas e administrativas |
| `createPost` | Cria um post (doação/adoção ou pedido de ajuda) de uma ONG |
| `updateProfile` | Atualiza campos "seguros" do perfil (nome, descrição, estado, banner, avatar) |
| `requestProfileChange` / `confirmProfileChange` | Fluxo de 2 passos para alterar telefone/site/cidade/Instagram (exige código por e-mail) |
| `listContactMethods` / `listMyContactMethods` / `addContactMethod` / `updateContactMethod` / `deleteContactMethod` | CRUD dos meios de contato da ONG (WhatsApp, Instagram, etc.) |
| `getById` | Busca ONG aprovada por id (público, sem campos sensíveis) |
| `deletePost` / `updatePost` | A ONG dona ou um admin podem editar/apagar um post |
| `reportPost` / `getPostReportsCount` / `getReportedPosts` | Denúncia de anúncios (máx. 1 por pessoa) e listagem admin ordenada por nº de denúncias |
| `getPostById` | Busca um post ativo por id (público) |
| `uploadImage` | Sobe uma imagem (base64) para o Supabase Storage |
| `getLogs` / `getOngLoginHistory` / `getOngPostHistory` | Dados do painel admin: logs de ação, histórico de login, histórico de posts |

**`adminAuthRouter`:** `me` (quem está logado), `login` (verifica senha, grava
cookie, registra login), `logout` (limpa cookie), `createAdmin` (cria um novo
admin — usado pela página interna `/ssenhas`).

**`ongAuthRouter`:** `me`, `login`, `logout` (iguais ao admin, mas para ONGs —
login bloqueado se `is_active = false`), `emailConfirmedStatus`,
`resendConfirmation`, `confirmEmail` (confirmação de e-mail por código),
`requestPasswordReset` / `resetPassword` (redefinição de senha por código).

### `server/supabase.ts` — todo o acesso ao banco de dados

`getSupabase()`: cria/cacheia o client Supabase (usando a service role key).
Demais funções, por área:

- **Logs de admin:** `createAdminLog`, `getAdminLogs`.
- **ONGs pendentes:** `checkOngEmailOrPhoneTaken`, `checkCnpjTaken`,
  `createOngPending`, `getPendingOngs`, `getAllOngApplications`, `approveOng`
  (também já cria os meios de contato iniciais via `seedContactMethodsForOng`),
  `rejectOng`.
- **Admins:** `createAdminUser`, `getAdminByEmail`, `verifyAdminPassword`
  (compara hash com `bcrypt`).
- **ONGs aprovadas:** `getOngByEmail`, `getOngById`, `verifyOngPassword`,
  `getAllApprovedOngs`, `getAllOngsAdmin`, `deleteOngAndPosts` (soft-delete).
- **Meios de contato:** `getOngContactMethods`, `addOngContactMethod`,
  `updateOngContactMethod`, `deleteOngContactMethod`.
- **Posts:** `createOngPost`, `getOngPosts`, `getOngPostsAdminAll`,
  `updateOngPost`, `getAllOngPosts`, `getAllPostsAdmin`, `deleteOngPost`
  (soft-delete + log).
- **Denúncias:** `reportPost`, `hasUserReportedPost`, `getPostReportsCount`,
  `getReportedPostsAdmin`.
- **Perfil da ONG:** `updateOngProfile` (campos livres),
  `requestOngProfileChange` / `confirmOngProfileChange` (campos sensíveis,
  exigem código por e-mail).
- **Busca por id:** `getApprovedOngById`, `getPostById` (só ativos),
  `getPostByIdAny` (ignora `is_active`, usado internamente para checar o dono
  antes de autorizar uma ação).
- **Histórico de login:** `recordLogin`, `getLoginHistory`.
- **Histórico de posts:** `getPostHistory` — alimentado automaticamente por um
  *trigger* no Postgres (`log_post_history`), que registra qualquer alteração
  em `ong_posts` independente de qual código a causou.
- **Confirmação de e-mail / redefinição de senha:**
  `createEmailConfirmationCode`, `confirmEmailCode`, `createPasswordResetCode`,
  `resetPasswordWithCode`, `getOngEmailConfirmedStatus` — códigos de 6 dígitos
  que expiram em 15 minutos.
- **Storage:** `uploadImage` — decodifica a imagem em base64 e sobe para o
  bucket `elopets-images`, retornando a URL pública.
- `stripSensitiveOngFields`: remove `responsible_name`/`responsible_cpf` antes
  de expor os dados de uma ONG publicamente.

### `server/email.ts`
- `getTransporter()`: cria o client `nodemailer` configurado para Gmail SMTP.
- `baseTemplate()` / `codeBlockHtml()`: montam o HTML comum dos e-mails
  (cabeçalho, cores da marca, botão "Ir para Mundo ONG" apontando para
  `ENV.siteUrl`).
- Funções de envio: `sendConfirmationEmail`, `sendPasswordResetEmail`,
  `sendProfileChangeCode`, `sendOngApprovedEmail`.

### `server/cpfCnpj.ts`
- `isValidCPF` / `isValidCNPJ`: validam os dígitos verificadores.
- `isAnimalRelatedCompany`: verifica se a razão social/nome fantasia contém
  palavras-chave de ONG de proteção animal.
- `lookupCnpj`: consulta a BrasilAPI e retorna os dados da empresa junto com o
  resultado do filtro acima.

### `shared/`
- `const.ts`: `COOKIE_NAME`, `ONE_YEAR_MS` e mensagens de erro padrão.
- `_core/errors.ts`: `HttpError` e construtores auxiliares (`BadRequestError`,
  etc.) — hoje não usados pelos routers (que lançam `TRPCError` diretamente),
  mantidos para uso futuro.
- `types.ts`: ponto único de re-export de tipos compartilhados entre
  client/server.

### Schema do banco (Supabase)
O schema já está aplicado diretamente no projeto Supabase em produção —
tabelas `ongs_pending`, `ongs_approved`, `admin_users`, `ong_posts`,
`post_reports`, `login_history`, `post_history`, colunas de perfil/pet, e o
bucket público `elopets-images` no Storage. Os scripts SQL usados para criar
isso foram descartados depois de aplicados; para recriar o schema do zero,
use o painel do Supabase (SQL Editor) consultando as funções de
`server/supabase.ts` como referência das tabelas/colunas esperadas.

### `package.json`
Scripts: `dev`, `build`, `start`, `check`, `format`, `test` (ver seção
[Como rodar](#como-rodar-o-projeto)). Dependências centrais: `express`
(servidor HTTP), `@trpc/server`/`@trpc/client`/`@trpc/react-query` (API
tipada), `@supabase/supabase-js` (banco + storage), `bcrypt` (hash de senha),
`nodemailer` (e-mail), `zod` (validação de entrada), `react`/`react-dom`/
`wouter` (frontend + rotas), `vite` (build/dev server), `tailwindcss`
(estilo), `@radix-ui/*` (componentes acessíveis), `vitest` (testes).

---

## Frontend — Páginas (`client/src/pages/`)

Mapa de rotas (definido em `client/src/App.tsx`):

| Rota | Página |
|---|---|
| `/` | `Home` |
| `/adocao` | `Adocao` |
| `/adocao/:id` | `AnimalDetalhe` |
| `/ajuda` | `Ajuda` |
| `/ajuda/:id` | `AjudaDetalhe` |
| `/ongs` | `Ongs` |
| `/ongs/:id` | `OngDetalhe` |
| `/ongs/cadastrar` | `CadastrarOng` |
| `/ong-login`, `/ong-dashboard` | `OngLogin` (mesmo componente) |
| `/admin` | `Admin` |
| `/ssenhas` | `GerenciarSenhas` |
| `/termos-de-uso` | `TermosDeUso` |
| `/politica-de-privacidade` | `PoliticaDePrivacidade` |
| `/404` e qualquer rota não mapeada | `NotFound` |

### `Home.tsx` (`/`)
Landing page: hero, 3 cards de navegação rápida, contador animado de
estatísticas (hoje **mockadas**, não vêm do banco — ver nota em
[Observações](#observações--pontos-de-atenção)), seção "Área de Adoção" (4
primeiros posts de doação), seção "Pedidos de Ajuda" (3 primeiros posts que
não são de doação), e CTA final "Cadastrar ONG" (só aparece se ninguém
estiver logado, nem ONG nem admin).

### `Adocao.tsx` (`/adocao`)
Lista todos os posts de adoção/doação, com busca por nome/raça/cidade e
filtros de porte/sexo (tudo no cliente). Clique no card leva para
`/ongs/:ongId?post=:postId` (o post abre num modal dentro da página da ONG).

### `AnimalDetalhe.tsx` (`/adocao/:id`)
⚠️ Usa dados **mockados** de `lib/data.ts`, não tRPC — e o botão "Tenho
interesse" só mostra um toast local, sem registrar nada no banco. Como nenhum
link real do site aponta para esta rota (todos usam `/ongs/:id?post=...`),
esta página é efetivamente código morto hoje.

### `Ajuda.tsx` (`/ajuda`)
Lista posts de pedido de ajuda (ração, remédio, outros), com busca, filtro por
tipo e checkbox de "Urgentes".

### `AjudaDetalhe.tsx` (`/ajuda/:id`)
Detalhe real (via tRPC) de um pedido de ajuda: descrição, itens necessários,
dados da ONG e painel de contato (WhatsApp/Instagram/site/e-mail).

### `Ongs.tsx` (`/ongs`)
Lista todas as ONGs aprovadas, com busca por nome/cidade/descrição e filtro
por estado. Botão "Cadastrar ONG" só aparece se ninguém estiver logado.

### `OngDetalhe.tsx` (`/ongs/:id`)
Perfil público de uma ONG: banner, avatar, descrição, contagem de posts,
lista de posts de doação e de pedidos (cada um abre o `PostDetailModal`).
Suporta deep-link `?post=:id` para abrir um post específico direto ao
carregar a página — é assim que os links de `Adocao`/`Ajuda`/`Home` abrem o
detalhe de um post.

### `OngLogin.tsx` (`/ong-login`, `/ong-dashboard`)
Se não logado: formulário de login. Se logado: dashboard da ONG com 3 abas —
**Meus Posts** (listar/editar/excluir), **Criar Post** (formulário completo,
incluindo campos de pet quando o tipo é "doação", com upload de imagem
convertida em base64 no próprio navegador), **Meu Perfil** (editar dados —
telefone/cidade/site/Instagram exigem confirmação por código de 6 dígitos
enviado por e-mail; gerenciar meios de contato).

### `CadastrarOng.tsx` (`/ongs/cadastrar`)
Formulário público de cadastro de ONG: busca automática de dados pelo CNPJ
(valida se é empresa relacionada a proteção animal), dados básicos,
credenciais, responsável, contato e localização. Ao enviar, exige confirmação
de e-mail por código de 6 dígitos antes de mostrar a tela final de "cadastro
enviado, aguardando aprovação".

### `Admin.tsx` (`/admin`) — painel administrativo
Login próprio → dashboard com 6 abas:
- **Pendentes** — ONGs aguardando aprovação (aprovar/rejeitar).
- **ONGs Ativas** — lista ONGs aprovadas, mostra último login, permite excluir
  (ONG + todos os posts), abre um modal com histórico de posts/logins.
- **Posts** — todos os posts de todas as ONGs, com opção de excluir.
- **Candidaturas** — histórico somente leitura de todas as solicitações de
  cadastro (aprovadas/rejeitadas/pendentes).
- **Denúncias** — posts denunciados, ordenados por número de denúncias.
- **Logs** — histórico de ações do admin (aprovar/rejeitar/apagar ONG/apagar
  post), com quem fez e quando.

### `GerenciarSenhas.tsx` (`/ssenhas`)
Página "escondida" (não linkada em nenhum menu) para criar novos admins.
⚠️ **Ponto de atenção de segurança:** ela é protegida só por uma chave fixa
escrita no código-fonte do cliente (`const GATE = "elopets2026"`), visível a
qualquer pessoa que abra o JavaScript do site no navegador — não é uma
proteção real. Veja [Observações](#observações--pontos-de-atenção).

### `TermosDeUso.tsx` / `PoliticaDePrivacidade.tsx`
Páginas estáticas de texto legal (conteúdo hardcoded no próprio arquivo), sem
chamadas de API.

### `NotFound.tsx`
Página 404 simples, com botões para voltar ao início ou ver adoções.

---

## Frontend — Componentes (`client/src/components/`)

> A subpasta `components/ui/` contém **53 primitivos genéricos do shadcn/ui**
> (botão, dialog, input, tabs, sidebar, etc.) — são blocos de construção
> padrão da biblioteca de UI, não específicos do Mundo ONG, por isso não são
> detalhados individualmente aqui.

| Componente | O que faz |
|---|---|
| `AnimalCard.tsx` | Card de um animal para adoção: foto, badge de espécie, nome, idade, selos de vacinado/castrado, botão de favoritar (local, não persiste) |
| `ErrorBoundary.tsx` | Captura erros não tratados em qualquer lugar da árvore React e mostra uma tela de erro com opção de recarregar a página. Envolve toda a `App` |
| `FloatingChat.tsx` | Widget de chat flutuante com um **FAQ pré-programado** (não é IA real): responde perguntas fixas sobre adoção, cadastro de ONG, recuperação de senha, etc. |
| `Footer.tsx` | Rodapé: esconde "Cadastrar ONG" se já estiver logado; mostra links rápidos, contato e redes sociais |
| `HelpRequestCard.tsx` | Card de um pedido de ajuda (ração, remédio, item, dinheiro, voluntariado), com badge de urgência |
| `ImageCropPicker.tsx` | Upload + recorte de imagem no navegador (arrastar e dar zoom num canvas), gera um JPEG em base64 — usado em avatar/banner de ONG e fotos de posts |
| `LoginModal.tsx` | Modal de login único para ONG e Admin (tenta ONG primeiro, depois Admin); também contém o fluxo de "esqueci minha senha" em 2 etapas |
| `Map.tsx` | ⚠️ Componente **não utilizado** (wrapper de Google Maps que dependia de infraestrutura de template, já removida do backend) |
| `Navbar.tsx` | Barra de navegação fixa: mostra estado de login (ONG/Admin) com dropdown de conta, ou botão "Entrar"/"Cadastrar ONG" se deslogado |
| `OngCard.tsx` | Card de uma ONG parceira na listagem `/ongs` |
| `PostDetailModal.tsx` | Modal central de detalhe de qualquer post (adoção ou pedido de ajuda); inclui botão de denúncia, painel de contato da ONG e os painéis específicos de pet/pedido |
| `SafeImage.tsx` | `<img>` com fallback automático caso a imagem não carregue |
| `ScrollToTop.tsx` | Rola a página para o topo a cada troca de rota |

---

## Frontend — Hooks (`client/src/hooks/`)

| Hook | O que faz |
|---|---|
| `useComposition.ts` | Evita que teclas como Escape/Enter disparem ações indesejadas durante digitação com IME (ex: métodos de entrada chinês/japonês) |
| `useIntersectionObserver.ts` | Adiciona a classe `visible` a elementos `.fade-in-up` quando entram na tela, para animações de entrada ao rolar |
| `useMobile.tsx` → `useIsMobile()` | Retorna `true`/`false` se a tela for menor que 768px, reagindo a redimensionamento |
| `usePersistFn.ts` → `usePersistFn(fn)` | Retorna uma função com referência estável que sempre chama a versão mais recente de `fn` (alternativa ao `useCallback`) |

---

## Frontend — Lib (`client/src/lib/`)

| Arquivo | O que faz |
|---|---|
| `data.ts` | Dados **estáticos/mock** (não são os dados reais do site, que vêm do Supabase) — usado hoje só pela página morta `AnimalDetalhe` e pelas estatísticas da Home |
| `docMasks.ts` | Máscaras visuais de CPF/CNPJ (`maskCPF`, `maskCNPJ`) e validação dos dígitos verificadores |
| `errorMessage.ts` → `getErrorMessage()` | Traduz erros de tRPC/Zod/JS para mensagens amigáveis em português |
| `reporterKey.ts` → `getReporterKey()` | Gera/recupera um identificador anônimo salvo no `localStorage`, usado só para limitar denúncias a 1 por pessoa por post |
| `trpc.ts` | Cria o cliente React do tRPC, tipado contra o `AppRouter` do servidor |
| `utils.ts` → `cn()` | Combina classes Tailwind condicionalmente (helper padrão do shadcn/ui) |

---

## Outros arquivos do frontend

- **`client/src/contexts/ThemeContext.tsx`** — contexto de tema claro/escuro
  (`ThemeProvider`/`useTheme`); hoje o site roda fixo no tema claro.
- **`client/src/const.ts`** — re-exporta constantes compartilhadas e
  `getLoginUrl()` (retorna `/ong-login`).
- **`client/src/main.tsx`** — entry point do React: cria o `QueryClient`, o
  client tRPC (apontando para `/api/trpc`, enviando cookies) e monta `<App />`.
- **`client/src/App.tsx`** — componente raiz: envolve tudo em
  `ErrorBoundary` → `ThemeProvider` → `TooltipProvider`, renderiza o roteador
  (wouter) com todas as páginas, o `Toaster` de notificações e o
  `FloatingChat` fixo.

---

## Variáveis de ambiente

| Variável | Para quê serve |
|---|---|
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Conexão com o banco de dados e storage |
| `JWT_SECRET` | Segredo usado para assinar/validar sessão |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | Conta Gmail usada para enviar e-mails (confirmação, aprovação, redefinição de senha) |
| `EMAIL_FROM` | Nome/endereço exibido como remetente dos e-mails |
| `SITE_URL` | URL pública do site em produção, usada nos links dos e-mails (`https://mundoong.onrender.com`) |
| `DATABASE_URL` | Não obrigatória — pode ficar em branco |

---

## Observações / pontos de atenção

Achados durante o mapeamento do projeto que não fazem parte de nenhuma
funcionalidade ativa, mas vale conhecer:

- **`client/src/pages/AnimalDetalhe.tsx`** usa dados mockados e não é
  realmente alcançada por nenhum link do site (todo link real de adoção abre
  o post dentro de `OngDetalhe`, não essa rota) — página morta na prática.
- **`client/src/lib/data.ts`** contém dados fictícios (ONGs, animais e
  estatísticas de exemplo) — os contadores da Home (`+127 ONGs`, etc.) **não
  refletem números reais do banco**.
- **`/ssenhas` (`GerenciarSenhas.tsx`)** usa uma chave fixa no código do
  cliente como única proteção para criar contas de admin — qualquer pessoa
  que inspecione o JavaScript do site consegue ver essa chave. Não é uma
  proteção de segurança real; se essa página continuar em produção, vale
  trocar por um controle no servidor.
- **Hospedagem (Render, plano gratuito)**: o site está em
  `https://mundoong.onrender.com`. No plano free, a instância "dorme" após um
  período de inatividade — a primeira requisição depois disso pode demorar
  até ~50 segundos para responder, enquanto o servidor acorda. Isso é
  esperado e não é um bug.

---

## Backlog — histórico de desenvolvimento

### Fase 1 — Configuração inicial (Backend e Banco de Dados)
- [x] Configurar variáveis de ambiente Supabase (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`)
- [x] Integrar Supabase no servidor
- [x] Criar routers tRPC para autenticação (Admin e ONG)
- [x] Implementar cookies de sessão para Admin e ONG

### Fase 2 — Interface de login
- [x] Adicionar botão "Entrar" na Navbar
- [x] Criar modal para login unificado (ONG ou Admin)
- [x] Implementar página/dashboard de login para Admin
- [x] Implementar página/dashboard de login para ONG

### Fase 3 — Cadastro de ONG
- [x] Formulário `CadastrarOng.tsx` com busca automática por CNPJ
- [x] Validação de CNPJ/CPF e de empresa "relacionada a animais"
- [x] Armazenar cadastro pendente no Supabase (`ongs_pending`)
- [x] Confirmação de e-mail por código de 6 dígitos no cadastro

### Fase 4 — Painel Admin
- [x] Página `Admin.tsx` com painel completo (abas)
- [x] Listar ONGs pendentes com todas as informações
- [x] Aprovar ONG (gera credenciais e meios de contato automaticamente)
- [x] Rejeitar ONG
- [x] Listar e gerenciar ONGs ativas (ver histórico, excluir)
- [x] Listar e moderar posts de todas as ONGs
- [x] Histórico de candidaturas (aprovadas/rejeitadas/pendentes)
- [x] Logs de ações do admin (quem fez o quê, e quando)

### Fase 5 — Dashboard da ONG
- [x] Dashboard para ONG logada com abas (Posts, Criar Post, Perfil)
- [x] Criar posts de doação/adoção (com campos específicos de pet)
- [x] Criar posts de pedido de ajuda (ração, remédio, item, dinheiro, voluntariado)
- [x] Listar, editar e excluir posts da própria ONG
- [x] Editar perfil (nome, descrição, estado, banner, avatar)
- [x] Alterar dados sensíveis (telefone/cidade/site/Instagram) com confirmação por código
- [x] Gerenciar meios de contato (WhatsApp, Instagram, etc.)

### Fase 6 — Exibição pública
- [x] Página `Ajuda.tsx` com posts de pedidos de ajuda
- [x] Página `Ongs.tsx` com listagem de ONGs aprovadas
- [x] Página `Adocao.tsx` com posts de adoção/doação
- [x] Página `OngDetalhe.tsx` com perfil público da ONG e seus posts
- [x] Filtrar sempre apenas ONGs/posts aprovados e ativos nas páginas públicas
- [x] Modal de detalhe de post (`PostDetailModal`) reutilizável em todas as listagens

### Fase 7 — Segurança e moderação
- [x] Corrigir falha de segurança: `updatePost`/`deletePost` não tinham nenhuma checagem de dono (agora exigem ser a ONG dona ou um admin)
- [x] Adicionar guarda de admin (`requireAdminSession`) a endpoints administrativos que estavam sem proteção real
- [x] Sistema de denúncia de posts (1 denúncia por pessoa, via identificador anônimo)
- [x] Aba "Denúncias" no painel admin, ordenada por número de denúncias, com acesso rápido para revisar/excluir
- [x] Histórico de login (quem logou e quando, ONG e Admin)
- [x] Histórico de posts (criação/edição/exclusão), capturado automaticamente por trigger no banco

### Fase 8 — Dados de teste
- [x] Geração de 15 ONGs fictícias com nome, foto, banner e dados de contato
- [x] Geração de 3 a 9 posts por ONG (doação ou pedido de ajuda)
- [x] Correção das fotos dos posts para usar imagens reais correspondentes à espécie do animal (cães via dog.ceo, gatos via TheCatAPI)

### Fase 9 — Sistema de e-mail
- [x] Diagnóstico do bug de confirmação de e-mail não chegando (limitação do domínio de testes do Resend, que só entrega para o próprio dono da conta)
- [x] Migração completa do sistema de e-mail de Resend para Gmail SMTP (100% gratuito, sem domínio próprio)
- [x] Confirmação de e-mail, redefinição de senha e aprovação de ONG funcionando de ponta a ponta
- [x] Ajuste do nome/remetente exibido nos e-mails

### Fase 10 — Acesso externo para testes
- [x] Túnel público temporário (Cloudflare Tunnel) para acessar o site fora da rede local
- [x] Link do túnel usado automaticamente nos botões dos e-mails (`SITE_URL`)

### Fase 11 — Limpeza e organização do código
- [x] Remoção de todos os vestígios da plataforma de template usada para gerar o projeto (script de telemetria que capturava cliques/digitação dos usuários, proxies de LLM/Maps nunca usados, SDK de OAuth morto, páginas de demonstração não roteadas, sub-router de autenticação morto, variáveis de ambiente órfãs)
- [x] Verificação de que nada foi quebrado (typecheck, testes, build de produção, navegação no site)
- [x] Renomeação da pasta do projeto para `Mundo Ong-main`

### Fase 12 — Documentação
- [x] Documentação completa do projeto (este arquivo): stack, como rodar, estrutura de pastas, e explicação de cada arquivo/função importante do backend e do frontend
- [x] Backlog histórico de tudo o que foi desenvolvido, marcado como concluído

### Fase 13 — Limpeza final de arquivos inúteis
- [x] Remoção de `server/index.ts` (entry point antigo e duplicado, não usado por nenhum script)
- [x] Remoção de `client/src/components/Map.tsx` (componente morto, não importado em nenhuma página)
- [x] Remoção de `scratch_test_email.ts` e `transcribe.py` (scripts de teste/experimentos avulsos, sem relação com o site)
- [x] Remoção de `todo.md` (backlog antigo, substituído pelo backlog consolidado neste arquivo)
- [x] Verificação de que nada quebrou (typecheck limpo após a remoção)

### Fase 14 — Deploy em produção (Render)
- [x] Tentativa de hospedagem na Vercel (adaptação para função serverless, bundling corrigido) — descartada por instabilidade de conexão com o banco
- [x] Código versionado em repositório Git próprio (GitHub: `OlliverOlli/mundo-ongs`)
- [x] Serviço web reaproveitado/reconectado na Render (plano gratuito), build e start via `pnpm run build` / `pnpm run start`
- [x] Variáveis de ambiente configuradas no painel da Render (Supabase, e-mail, segredo de sessão)
- [x] Testado de ponta a ponta em produção: listagem de ONGs/posts, login de ONG e painel admin funcionando com dados reais
- [x] URL final trocada para um nome próprio do projeto: novo serviço `mundoong` criado na Render
  (o nome `mundo-ong` com hífen ficou reservado pela plataforma após uma tentativa de rename e
  não pôde ser reaproveitado de imediato), domínio final `https://mundoong.onrender.com`,
  `SITE_URL` e links dos e-mails atualizados; serviço antigo (`elopets`/`mundo-ong-old`) a ser
  removido

### Fase 15 — Limpeza final de arquivos só de referência
- [x] Remoção dos scripts SQL de setup/migração (`init-supabase.sql`, `SUPABASE_SETUP_COMPLETO.sql`, `MIGRACAO_V2.sql`, `MIGRACAO_V3.sql`, `STORAGE_SETUP.sql`) — já aplicados no Supabase, mantidos só como histórico até aqui
- [x] Remoção de `SUPABASE_SETUP.md` (guia substituído por esta documentação) e `ideas.md` (notas de design do início do projeto)
- [x] Remoção dos resquícios da tentativa de hospedagem na Vercel: `vercel.json`, `server/_core/vercel-entry.ts`, script `vercel-build` do `package.json`, e `.env.local` (token da Vercel CLI, nunca usado em produção)
- [x] Verificação de que nada quebrou (typecheck e build limpos) após a limpeza
