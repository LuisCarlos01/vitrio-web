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
no meio do componente.

## Agent skills

### Issue tracker

Issues live in this repo's GitHub Issues (uses the `gh` CLI). See `docs/agents/issue-tracker.md`.

### Triage labels

Padrão traduzido pra pt-br: `precisa-triagem`, `precisa-info`, `pronto-para-agente`, `pronto-para-humano`, `nao-vai-corrigir`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` + `docs/adr/` na raiz do repo. See `docs/agents/domain.md`.
