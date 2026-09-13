# Handoff de sessão — vitrio-web

Documento pra retomar o trabalho com contexto zerado. Cobre **processo e estado
atual**, não como consumir a API (isso é `HANDOFF.md`) nem convenções de agente
(isso é `CLAUDE.md` + `docs/agents/*.md`). Leia os três antes de continuar.

## Processo que vem sendo seguido (repita exatamente)

1. **Grilling primeiro**: antes de implementar uma feature nova, rodar `/grilling`
   pra levantar as decisões de arquitetura em rounds (uma pergunta = uma
   recomendação + confirmação do usuário). Só começa a codar depois que a
   árvore de decisão fecha.
2. **Uma feature = um milestone no GitHub**, quebrado em issues menores (uma por
   sub-fluxo). Cada issue é criada **antes** de implementar, com critérios de
   aceite em checklist.
3. **TDD de verdade, seam por seam**: adapter (DTO→domínio) → cliente de API
   (MSW) → hook (TanStack Query) → componente (Testing Library). Um teste por
   vez, red confirmado antes de implementar, minimal implementation pra ficar
   green. Nunca escrever todos os testes primeiro.
4. **E2E com Playwright contra a `vitrio-api` real** (não mock), via
   `docker compose up -d` em `/Users/luisdev/Dev/projetos/vitrio-api`. Local:
   `pnpm exec playwright test`. O `.env` da `vitrio-api` local precisa ter
   `VITRIO_CORS_ALLOWED_ORIGINS=http://localhost:3000` e credenciais AWS S3
   reais (upload de imagem de produto sobe pro S3 de verdade — sem isso, os
   testes que fazem upload falham).
5. **Fechar a issue** com um comentário mapeando critério de aceite → teste que
   prova (ver qualquer issue fechada, ex. #7–#12, pro formato exato), marcar os
   checkboxes, `gh issue close`.
6. **Uma branch por feature** (`feat/<nome>`), todas as issues da mesma feature
   nela, um PR só no final. **Nunca faço merge sozinho** — abro o PR, espero CI
   verde, leio a review do CodeRabbit, decido o que corrigir/discordar/adiar
   (documentando por quê no PR), e só mergeio quando o usuário mandar
   explicitamente ("pode mergear"). Merge commit (não squash) — preserva o
   histórico do TDD.
7. **CodeRabbit está instalado no repo** (plano free, `CodeRabbit` check no PR)
   e adiciona valor real (já achou bugs de verdade: `persist` faltando no auth
   store, cache do React Query vazando entre sessões, race no upload de CSV).
   Triar cada achado com julgamento próprio — nem tudo que ele marca como
   "Major"/"security" é de fato um bug (ver PR #14, discordei explicitamente de
   um achado sobre `src/proxy.ts` sendo "bypass de autorização" — é uma
   decisão arquitetural já tomada, expliquei por quê no comentário do PR).
8. **Commits em inglês** (Conventional Commits), **sem nenhuma atribuição de
   IA** (hook local bloqueia `Co-Authored-By: Claude` etc.). `git add` com
   arquivos explícitos, nunca `-A`/`.`.
9. Ajustes de infra/CI que não são parte de uma feature específica (ex. fix de
   workflow) vão direto pra `main`, sem PR.

## Estado atual (2026-09-13)

### Concluído

- **Scaffold** (Next.js App Router, TypeScript, Tailwind, pnpm, ESLint+Prettier,
  Husky, Vitest+Testing Library+MSW, Playwright, shadcn/ui, Zustand,
  TanStack Query, React Hook Form+Zod) — direto na `main`.
- **Milestone "Auth (login/register)"**: issues #1 e #2 fechadas (login,
  registro). 3 follow-ups abertos, não bloqueiam nada: #4 (a11y nos
  formulários), #5 (metadata do layout ainda é o template do
  `create-next-app`), #6 (erro de rede sem feedback visual).
- **Milestone "Painel da revendedora"**: issues #7–#12 fechadas (proteção de
  rota, dados da loja, WhatsApp, categorias, produtos com upload de imagem,
  import CSV). PR #14 mergeado. 3 follow-ups abertos: #13 (mensagens de erro
  do CSV import vêm em inglês, cru da API), #15 (componentes não distinguem
  erro de consulta de "sem dados"), #16 (upload de imagem do produto não é
  transacional com a criação — depende de endpoint novo na `vitrio-api`,
  cross-repo).
- **PR #17** (fora do meu trabalho, feito pelo usuário/outra sessão em
  paralelo): design system do Vitrio — paleta, tokens em `globals.css`, ADR
  0001 (`docs/adr/0001-design-system-and-tenant-theming.md`), assets de marca
  em `public/brand/`. Já mergeado. **Regra nova no `CLAUDE.md`**: nunca
  hardcode cor (hex/rgb/oklch) em componente/CSS/SVG — sempre token do design
  system. Vale pra código novo, não é retroativa.
- **CI** (`.github/workflows/ci.yml`): job `check` (lint+typecheck+test+build)
  em todo PR; job `e2e` só em push pra `main` (sobe a `vitrio-api` via docker
  compose no runner). Gotchas reais já resolvidos, não repetir:
  - JVM cold start é mais lento no runner do GitHub — timeout de healthcheck
    em 270s (90 tentativas × 3s), com `docker compose logs` no fail.
  - `S3Client` da `vitrio-api` quebra o boot se `AWS_S3_REGION` estiver vazio
    — o workflow seta credenciais fake só pra o bean inicializar.
  - `pnpm/action-setup` precisa de `package_json_file` explícito quando o
    checkout do `vitrio-web` vai pra um subdiretório (job `e2e` faz dois
    checkouts).
  - Teste e2e que faz upload real de imagem (`dashboard-products.spec.ts`) é
    pulado no CI (`test.skip(!!process.env.CI, ...)`) porque as credenciais
    AWS do workflow são fake — decisão do usuário, não mudar sem perguntar
    (as alternativas descartadas foram LocalStack cross-repo ou secret de AWS
    real de teste).
  - `playwright.config.ts`: `workers: 1` — todos os specs batem na mesma
    instância local da API, paralelismo causava flakiness real.

### Bugs de ambiente já resolvidos (não redescobrir)

- **jsdom + undici + multipart**: testes que fazem upload de arquivo real via
  MSW em ambiente jsdom quebram (`webidl.is.File` assertion, ou o nome do
  arquivo se perde). Onde isso importa: se o teste só faz a chamada de API
  (sem renderizar componente), rodar o arquivo em `// @vitest-environment
node`. Se precisa de DOM (Testing Library), evitar `request.formData()` no
  handler MSW — ou testar o comportamento por outro ângulo (ex.
  `dashboard-products.spec.ts` testa "input desabilita durante upload" em vez
  de "arquivo certo chega no servidor").
- **`next typegen`**: `tsc --noEmit` sozinho falha em CI limpo porque o
  `LayoutProps`/`PageProps` do Next só existe depois de `next build`/`dev`
  rodar uma vez. Script `typecheck` já é `next typegen && tsc --noEmit`.

### Próxima feature: Vitrine pública

Ainda não grillada. Endpoints relevantes (`HANDOFF.md`):
`GET /api/v1/public/catalogs/{slug}` (sem autenticação). Regras de negócio a
respeitar (já documentadas no `HANDOFF.md`, reler antes de desenhar a UI):
produto só aparece se `isActive && isVisible`; sem estoque aparece mas não vai
pro carrinho; WhatsApp não verificado desabilita "Tenho interesse" mas não
perde o carrinho local. Carrinho é 100% client-side (sem endpoint no backend).

Existem imagens de produto de exemplo em `public/produtos/` (não commitadas
ainda, adicionadas por fora) — provavelmente pra usar de mock/referência
visual nessa feature. `public/brand/` tem os assets de marca do PR #17.

**Antes de começar**: rodar `/grilling` pra essa feature (rendering
strategy — SSR/ISR pra SEO, já decidido no grilling original da stack, mas os
detalhes de UI/carrossel/carrinho ainda não foram discutidos em detalhe).

### Pendências soltas (não urgentes)

- `.env.example` da `vitrio-api` foi editado numa sessão anterior
  (`VITRIO_CORS_ALLOWED_ORIGINS=http://localhost:3000` como default) — ainda
  não commitado lá, usuário disse que ia revisar.
- `public/produtos/` está untracked no `vitrio-web` — perguntar ao usuário se
  é pra commitar antes de usar na vitrine.
