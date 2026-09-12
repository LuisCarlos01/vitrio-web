# 0001 — Design system do Vitrio e tema por revendedora

## Status

Aceito (2026-09-12).

## Contexto

O Vitrio é um catálogo digital multi-tenant: cada revendedora publica o próprio
catálogo, e revendedoras atendem nichos muito diferentes entre si (perfumaria,
joias, moda, etc.). O dashboard (esta codebase) usava até aqui a paleta padrão
do shadcn — neutra, sem nenhum token de marca — e não havia nenhuma logo,
favicon ou definição tipográfica formal.

Isso levanta duas questões distintas que precisavam de decisões separadas:

1. Qual é a identidade visual do **produto Vitrio** (dashboard, e-mails,
   marketing)?
2. Como o **catálogo público de cada revendedora** pode ter identidade visual
   própria sem que o Vitrio precise fixar uma paleta/estilo que sirva pra todo
   nicho?

## Decisão

### Escopo da personalização por revendedora

A personalização por loja fica limitada a **cor + logo**. Não se estende a
fonte ou layout por nicho — o custo de manutenção de variações estruturais por
segmento não se justifica para o estágio atual do produto. Essa decisão pode
ser revisitada se surgir demanda real de um nicho que não funcione com o
layout padrão.

Hoje já existe suporte parcial a isso no código: `primaryColorHex` e
`buttonColorHex` no modelo de catálogo
(`src/lib/api/adapters/catalog.ts`), consumidos no formulário em
`src/features/dashboard/components/catalog-form.tsx`. Falta:

- Curadoria de paleta (ver abaixo).
- Aviso de contraste.
- Consumo do endpoint de upload de logo por catálogo, já documentado em
  `HANDOFF.md` (`POST /api/v1/catalogs/{catalogId}/assets`) mas não chamado
  pelo frontend ainda.

### Cor do catálogo da revendedora: híbrido

O formulário de cor do catálogo oferece paletas curadas como padrão, com opção
avançada de hex customizado — em vez de só hex livre (status quo) ou só
paletas fechadas.

Paletas curadas iniciais (6 estilos genéricos, não por nicho — nicho engessa e
exige manutenção a cada segmento novo):

| Estilo   | Cor primária | Cor do botão |
| -------- | ------------ | ------------ |
| Clássico | `#1C1917`    | `#B8860B`    |
| Vibrante | `#DB2777`    | `#7C3AED`    |
| Pastel   | `#F472B6`    | `#A78BFA`    |
| Terroso  | `#C2703D`    | `#6B7A4F`    |
| Noturno  | `#111827`    | `#F59E0B`    |
| Moderno  | `#1E3A8A`    | `#3B82F6`    |

Nenhuma reaproveita o accent do próprio Vitrio (ciano petróleo), para não
confundir "cor da plataforma" com "cor da loja".

O formulário emite um aviso não-bloqueante de contraste (WCAG AA) quando a
combinação escolhida (curada ou custom) fica difícil de ler — não bloqueia o
salvamento.

### Marca do Vitrio (dashboard/produto)

- Paleta neutra + um único accent, substituindo `--primary` em light e dark:
  - Light: `#0E7490` (ciano petróleo)
  - Dark: `#22D3EE` (mesma família, mais claro/saturado para contraste em
    fundo escuro)
- Tipografia: Geist em toda a aplicação — sem fonte de display separada.
- Dark mode é roadmap real (não boilerplate morto — antes deste ADR, o bloco
  `.dark` em `globals.css` existia mas nada no código o ativava). Os tokens de
  dark acima foram definidos junto com os de light nesta mesma decisão.
- Sem tokens de `success`/`warning` por enquanto (YAGNI — nenhuma tela usa
  esses estados hoje; definir cor sem caso de uso real é palpite).

### Logo

Decisão final: a arte gerada (sacola + "V" com acabamento cromado/facetado,
acompanhada do wordmark `VITRIO` em caixa alta) é a logo oficial do produto,
substituindo a proposta anterior de wordmark tipográfico puro que havia sido
explorada e descartada nesta mesma rodada de decisão.

Variantes produzidas:

- `public/brand/logo-branca.png` / `logo-preta.png` — lockup completo (ícone +
  wordmark). Branca para fundo escuro, preta para fundo claro.
- `public/brand/icon-branca.png` / `icon-preta.png` — só o ícone (sacola + V),
  recortado do lockup completo, para usos que não cabem o wordmark (ex. ícone
  de app em tamanho médio/grande).
- `public/brand/icon-flat.png` — versão simplificada em silhueta sólida (cor
  accent, sem gradiente/bisel). Também é uma variante oficial da logo (marca
  isolada para avatar/contextos pequenos), não só um fallback técnico.
- `src/app/favicon.ico`, `src/app/icon.png`, `src/app/apple-icon.png` —
  gerados a partir da silhueta flat, nos file conventions que o Next.js
  reconhece automaticamente (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/app-icons.md`).
  A arte com bisel/gradiente não é legível em 16px (tamanho real de aba de
  navegador); a silhueta flat resolve isso mantendo a mesma marca.

## Consequências

- Regra correlata em `CLAUDE.md`: nenhuma cor pode ser hardcoded em
  componentes/CSS/SVG de UI — sempre via token do design system definido em
  `globals.css`. Isso vale para a marca do Vitrio; a cor do catálogo da
  revendedora é dado dinâmico (setado em runtime via custom property), não uma
  exceção à regra.
- Trabalho de implementação decorrente deste ADR foi registrado como issues no
  GitHub (tokens de marca, assets de logo/favicon, seletor de paleta curada,
  aviso de contraste, consumo do endpoint de upload de logo).
