# Vitrio Web

Frontend do Vitrio — catálogo digital multi-tenant para revendedoras. Consome a API
em [`vitrio-api`](https://github.com/LuisCarlos01/vitrio-api).

Stack decidida: Next.js, React, TypeScript, Tailwind (ver `../ideia.md`).

Repositório recém-criado, ainda sem app scaffolded. **Antes de escrever qualquer
código, leia [`HANDOFF.md`](HANDOFF.md)** — cobre autenticação, CORS, contrato da
API, regras de negócio e duas pegadinhas reais (cookie `SameSite=Strict` e métodos
faltando no CORS) que vão travar telas de edição se ignoradas.
