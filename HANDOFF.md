# Handoff — consumindo a `vitrio-api`

Este documento existe pra próxima sessão (ou você, do futuro) não precisar
redescobrir nada disso lendo código do zero. É sobre **como consumir a API**, não
sobre como construir o frontend — decisões de stack/UI ficam pra spec do `vitrio-web`
em si.

## Onde a API está

- **Produção**: `https://16-59-88-232.sslip.io` (EC2, IP fixo via Elastic IP — hostname
  `sslip.io` calculado a partir do IP, não é domínio próprio; se a instância for
  recriada, o hostname muda). Swagger UI: `/swagger-ui.html`.
- **Local (dev)**: clonar `vitrio-api`, `docker compose up`, API em
  `http://localhost:8080`.
- **Repo**: `github.com/LuisCarlos01/vitrio-api`.

## Contrato da API (fonte da verdade)

Gerado automaticamente pelo `springdoc-openapi` a partir do código — nunca escrito à
mão, então mais confiável que qualquer descrição manual (inclusive este documento).
Duas formas de consumir:

- **Ao vivo**: `/v3/api-docs` (JSON), `/v3/api-docs.yaml` (YAML), `/swagger-ui.html` —
  todos públicos, sem token, contra local ou produção.
- **Snapshot committed** no repo `vitrio-api`: `docs/api/openapi.yaml` /
  `docs/api/openapi.json` — um retrato do momento em que foi exportado, não
  atualizado automaticamente. Se algo aqui parecer desatualizado, esse snapshot (ou o
  `/v3/api-docs` ao vivo) manda mais que este handoff.

Para gerar cliente TypeScript tipado a partir do contrato (`openapi-typescript`,
`orval`, etc.), qualquer uma das três fontes acima serve de entrada.

## Autenticação

Fluxo: Access token (JWT, curto) + Refresh token (opaco, mais longo).

- `POST /api/v1/auth/register` — cria conta, role padrão `RESELLER`. Retorna
  `accessToken` + `refreshToken` no corpo (login automático).
- `POST /api/v1/auth/login` — idem, sem o registro.
- `POST /api/v1/auth/refresh` — troca o refresh token por um par novo.
- `POST /api/v1/auth/logout` — revoga o refresh token (autenticado — precisa do
  Access token no header).

Endpoints autenticados esperam `Authorization: Bearer <accessToken>`.

### Cookie do refresh token: `SameSite=None` (corrigido em 2026-09-12)

`login`/`register`/`refresh` também setam o refresh token num cookie `httpOnly`,
`Secure`, `SameSite=None`, `Path=/api/v1/auth`
(`vitrio-api/src/main/java/dev/vitrio/api/auth/RefreshTokenCookie.java`, commit
`c0f29ce`). Originalmente era `SameSite=Strict`, o que quebrava silenciosamente o
cookie em qualquer chamada cross-site (frontend e API em domínios diferentes) — já
corrigido, o cookie chega normalmente com `credentials: 'include'`.

Mesmo assim, **prefira depender do `refreshToken` do corpo da resposta**
(`localStorage`/estado da aplicação) em vez do cookie: é mais simples de debugar no
frontend e não depende de nenhuma configuração de cookie do navegador. O cookie
continua existindo como mecanismo alternativo (`POST /api/v1/auth/refresh` aceita os
dois — cookie tem prioridade sobre o corpo quando os dois vêm preenchidos), mas o
`vitrio-web` não precisa se apoiar nele.

Trade-off aceito na correção: `SameSite=None` reabre uma CSRF de baixo impacto em
`/refresh`/`/logout` (uma página maliciosa pode forçar rotação/revogação do token da
vítima), mitigada pela allowlist de origem do CORS (nunca wildcard) — sem
exfiltração de token possível. Ver Javadoc de `SecurityConfig.java` na API.

### CORS métodos: `PATCH`/`PUT`/`DELETE` liberados (corrigido em 2026-09-12)

`SecurityConfig.corsConfigurationSource()` só liberava `GET`/`POST` em
`allowedMethods`, apesar da API ter endpoints `PATCH`/`PUT`/`DELETE` reais (editar
produto, editar categoria, deletar produto, configurar WhatsApp da loja). Corrigido
no commit `0764c6c` — os 5 verbos usados por rotas reais agora estão liberados, com
teste de regressão cobrindo os três que faltavam. Telas de edição/exclusão podem ser
implementadas normalmente.

### CORS — origem precisa ser configurada

`VITRIO_CORS_ALLOWED_ORIGINS` (env var da API) está **vazia hoje** — nenhuma origem
liberada ainda. Assim que o `vitrio-web` tiver uma URL (mesmo de preview/staging),
atualizar:

- o secret `VITRIO_CORS_ALLOWED_ORIGINS` no GitHub Actions do repo `vitrio-api`
  (o `deploy.yml` reescreve o `.env` da instância a partir dos secrets a cada deploy —
  não precisa mexer na instância na mão);
- múltiplas origens são separadas por vírgula (dev local + produção, por exemplo).

Sem isso, toda chamada do navegador é bloqueada por CORS, independente do método.

## Autorização (roles)

- `RESELLER`: role default no registro. Dona de um `Catalog` (na prática, 1 conta = 1
  loja no MVP — não há endpoint de convite/membership múltiplo ainda).
- `ADMIN`: role manual (só o mantenedor tem hoje), usada em `GET /api/v1/users`
  (listagem de contas — provavelmente não é consumida pelo `vitrio-web`, é mais
  ferramenta interna).

Todo endpoint sob `/api/v1/**` exige `Authorization: Bearer` **exceto**:
`/api/v1/auth/{register,login,refresh}` e `/api/v1/public/**`.

## Endpoints (visão geral — shapes exatos no OpenAPI)

| Método           | Path                                                   | Autenticado  | Observação                                                                                                                                                                                           |
| ---------------- | ------------------------------------------------------ | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST             | `/api/v1/auth/register`                                | não          |                                                                                                                                                                                                      |
| POST             | `/api/v1/auth/login`                                   | não          |                                                                                                                                                                                                      |
| POST             | `/api/v1/auth/refresh`                                 | não          |                                                                                                                                                                                                      |
| POST             | `/api/v1/auth/logout`                                  | sim          |                                                                                                                                                                                                      |
| GET/POST         | `/api/v1/catalogs`                                     | sim          | lista/cria catálogo(s) da conta                                                                                                                                                                      |
| GET/PATCH        | `/api/v1/catalogs/{id}`                                | sim          | dados/personalização da loja                                                                                                                                                                         |
| PUT              | `/api/v1/catalogs/{id}/whatsapp`                       | sim          | configura número                                                                                                                                                                                     |
| POST             | `/api/v1/catalogs/{id}/whatsapp/verify`                | sim          | fluxo de verificação                                                                                                                                                                                 |
| POST             | `/api/v1/catalogs/{catalogId}/assets`                  | sim          | upload de imagem, `multipart/form-data`, campo `file`, limite **11MB** (server proxya pro S3 — não é upload direto do navegador pro storage, ao contrário do que o `ideia.md` do projeto especulava) |
| GET/POST         | `/api/v1/catalogs/{catalogId}/categories`              | sim          |                                                                                                                                                                                                      |
| PATCH/DELETE     | `/api/v1/catalogs/{catalogId}/categories/{id}`         | sim          |                                                                                                                                                                                                      |
| GET/POST         | `/api/v1/catalogs/{catalogId}/products`                | sim          |                                                                                                                                                                                                      |
| GET/PATCH/DELETE | `/api/v1/catalogs/{catalogId}/products/{id}`           | sim          |                                                                                                                                                                                                      |
| POST             | `/api/v1/catalogs/{catalogId}/products/import/preview` | sim          | **CSV**, ver seção abaixo                                                                                                                                                                            |
| POST             | `/api/v1/catalogs/{catalogId}/products/import/confirm` | sim          | rate-limit: 10/hora por conta                                                                                                                                                                        |
| GET              | `/api/v1/public/catalogs/{slug}`                       | não          | vitrine pública — é isso que o cliente final vê                                                                                                                                                      |
| GET              | `/api/v1/users`                                        | sim, `ADMIN` | provavelmente fora de escopo do `vitrio-web`                                                                                                                                                         |

## ⚠️ Divergência real: import é CSV, não PDF

`ideia.md` (contexto de produto, na raiz de `Dev/projetos/`) documenta a decisão de
"**import via PDF, não CSV/XLSX**" herdada do protótipo `wacatolog`. **Isso não é o
que foi implementado.** O que existe de verdade em produção é
`specs/006-csv-import/spec.md` no `vitrio-api` — importação via **CSV**, com preview
antes de confirmar. Ao construir a tela de importação no `vitrio-web`, siga o spec 006
e o contrato real (`CsvImportPreviewResponse`/`CsvImportConfirmResponse` no OpenAPI),
não o `ideia.md`. Vale atualizar o `ideia.md` em algum momento pra refletir a decisão
real, mas isso é debt de documentação, não bloqueio pro frontend.

## Regras de negócio que não aparecem no schema (ler antes de montar as telas)

- Produto só aparece na vitrine pública se `isActive && isVisible`.
- Produto visível e sem estoque (`quantityAvailable == 0` ou `!isOrderable`) aparece
  na vitrine, mas não pode ir pro carrinho.
- Desativar produto (`isActive=false`) preserva o cadastro mas remove da vitrine;
  reativar **não** restaura `isVisible`/`isOrderable` automaticamente — a revendedora
  precisa reconfirmar os dois.
- SKU é opcional, mas único por catálogo quando preenchido.
- Slug da loja (`/api/v1/public/catalogs/{slug}`) é único e define a URL pública —
  **não é segredo nem prova de autorização**, é só identificador público.
- Envio pro WhatsApp exige número validado (`whatsapp/verify`); enquanto não validado,
  o "Tenho interesse" deve ficar indisponível na vitrine, mas o carrinho local não é
  perdido.

## Carrinho: não existe no backend (é client-side puro)

Não há endpoint de carrinho/pedido — decisão deliberada (ver `ideia.md`): "sem
e-commerce completo, carrinho temporário, nunca persiste, nunca reserva estoque".
O `vitrio-web` monta e mantém o carrinho inteiramente no cliente (estado/local
storage) usando os dados de `GET /api/v1/public/catalogs/{slug}`, e ao confirmar
constrói o link `wa.me/<numero>?text=<mensagem>` — **sem incluir preço na mensagem**
(decisão deliberada do produto, evita atrito com preço desatualizado).

## Rate limiting a considerar no frontend (tratar 429)

- `login`: 5 tentativas / 60s (por IP e por e-mail).
- `register`: 10 / 60s (por IP).
- `products/import/confirm`: 10 / hora (por conta autenticada).

Tratar `429` nesses fluxos com mensagem amigável, não como erro genérico.

## Stack decidida pro `vitrio-web` (não é este handoff que decide, só registra)

Per `ideia.md`: **Next.js, React, TypeScript, Tailwind**. Repositório separado do
`vitrio-api`, sem monorepo. (Não confundir com `sentinel-auth-web`, o projeto de
referência do módulo de auth — aquele é React/Vite, não Next.js; a stack do
`vitrio-web` foi decidida independente, direto no `ideia.md`.)
