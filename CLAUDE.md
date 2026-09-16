@AGENTS.md

## Comunicação

Ao explicar decisões técnicas, planos, testes ou arquitetura neste projeto: use os
termos técnicos corretos (não simplifique o vocabulário), mas sempre acompanhe cada
termo/ponto de uma explicação em linguagem natural do que ele significa na prática —
não assuma que o termo por si só é suficiente. Ex.: ao listar seams de um plano de TDD,
não só nomear cada um, mas dizer em português simples o que aquele teste está
verificando e por quê.

## Design system

Nunca hardcode cores (hex, rgb, oklch literais) em componentes, CSS ou SVGs de
UI. Toda cor deve referenciar um token do design system definido em
`src/app/globals.css` (`--primary`, `--secondary`, `--muted`, etc., consumidos
via `bg-primary`, `text-foreground` etc.). Se a cor que você precisa não existe
como token ainda, pare e proponha adicionar o token — não invente um valor solto
no meio do componente. Regra vale pra código novo ou alterado a partir de agora;
não é retroativa — `src/app/page.tsx` ainda tem hex literais do boilerplate do
`create-next-app` (página nunca foi tocada pelo produto), migrar fica pra quando
essa página for reescrita de fato, não motivo pra uma limpeza avulsa agora.

## CI e merges

Antes de mergear qualquer PR, rodar `gh pr checks <n>` (ou a API de check-runs) e
confirmar que não há falha real — nunca basta `gh pr view --json
mergeable,mergeStateStatus`, que só diz se dá pra mergear sem conflito, não se os
checks passaram.

O job `e2e` do CI só roda em **push pra `main`** (`.github/workflows/ci.yml`), nunca
em pull_request — ele não aparece nos checks da PR de forma alguma. Depois de todo
merge, conferir a run disparada pelo push antes de considerar o trabalho concluído:

```
gh run list --branch main --limit 1 --json databaseId,status,conclusion
gh run view <id> --json jobs --jq '.jobs[] | {name, conclusion}'
```

Se `e2e` falhar, investigar antes de seguir pra próxima issue — não presumir que é
flakiness sem checar o log (`gh run view <id> --log-failed`).

Esse repo depende do `vitrio-api` (repositório irmão, em
`/Users/luisdev/Dev/projetos/vitrio-api` neste ambiente) via handoffs entre sessões.
Depois de qualquer handoff do backend confirmando um campo/endpoint novo, antes de
confiar em curl ou e2e local contra a API:

1. Conferir que o container local foi rebuildado depois do commit relevante
   (`docker inspect vitrio-api-app-1 --format '{{.Created}}'` vs `git log -1
--format=%cI -- <arquivo>`).
2. Conferir que o commit foi de fato enviado pro GitHub, não só feito localmente
   (`git -C /Users/luisdev/Dev/projetos/vitrio-api status -sb` ou `git log
origin/main..main --oneline`) — o CI clona o `vitrio-api` fresco do GitHub a cada
   run, então um commit só local passa despercebido em testes locais e quebra
   silenciosamente no CI.

## Agent skills

### Issue tracker

Issues live in this repo's GitHub Issues (uses the `gh` CLI). See `docs/agents/issue-tracker.md`.

### Triage labels

Padrão traduzido pra pt-br: `precisa-triagem`, `precisa-info`, `pronto-para-agente`, `pronto-para-humano`, `nao-vai-corrigir`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` + `docs/adr/` na raiz do repo. See `docs/agents/domain.md`.
