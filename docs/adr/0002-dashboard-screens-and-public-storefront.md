# 0002 — Telas do dashboard e primeira versão da vitrine pública

## Status

Aceito (2026-09-13).

## Contexto

O ADR 0001 fechou a identidade visual (fontes, logo, cores, tokens) e a
navegação do dashboard (sidebar desktop + bottom tab bar mobile), mas não
prototipou o conteúdo de cada tela. Esta sessão (branch
`docs/design-system-screens`) prototipou visualmente, em HTML fora do repo
(`.design-prototypes/*.html`, local, não versionado — mesma convenção da
sessão anterior), o restante das telas do dashboard e, como extensão nova, a
primeira versão da vitrine pública (`vitrio.com/<slug-da-loja>`), que até
aqui não tinha nenhuma decisão nem rota no código.

Papel desta sessão: decide e documenta design (fontes, cores, layout,
interação). **Não implementa código de feature** — isso é escopo de outra
sessão de trabalho, que consome o que sai daqui via este ADR + issues no
GitHub.

Gap real encontrado ao revisar o código: a navegação de 5 destinos do ADR
0001 (Catálogo, Produtos, Categorias, Loja, WhatsApp) não mapeia 1:1 pras
rotas que já existem em `src/app/(dashboard)/*`. Hoje `/dashboard` mistura
`CatalogForm` (loja) e `WhatsappForm` na mesma página, sem nenhuma tela de
overview/resumo, e não existe rota nenhuma pra vitrine pública. Isso exige
uma decisão de reestruturação de rotas, registrada abaixo.

## Decisão

### Telas de autenticação (login, registro)

Já prototipadas e aprovadas na sessão de trabalho anterior (mesma branch),
mas sem issue aberta ainda — ficou combinado abrir junto com o resto da
leva, o que faço agora.

- Card branco centralizado sobre fundo cinza, sem split-screen: o dashboard é
  uma "ferramenta discreta", não compete visualmente com o catálogo da
  revendedora.
- Toggle de mostrar/ocultar senha (ícone de olho, estilo lucide) no login e
  no registro.
- Registro usa o mesmo template visual do login — só 2 campos (e-mail,
  senha) + dica "Mínimo de 8 caracteres" abaixo do campo de senha.
- Light/dark e desktop/mobile aprovados nos dois formulários. O
  form/validação em si já existe e funciona
  (`src/features/auth/components/login-form.tsx` e `register-form.tsx`) —
  este ADR cobre só a camada visual.

### Reestruturação de rotas do dashboard (decisão nova)

Pré-requisito estrutural pra mapear os 5 itens de navegação do ADR 0001 em
páginas reais:

- **`/dashboard`** — vira a página de overview ("Catálogo"). Não existe
  hoje; é conteúdo novo (ver seção abaixo).
- **`/store`** (nome proposto, ajustável pela sessão de implementação) —
  extraído do `/dashboard` atual: só o `CatalogForm` (identidade, cor,
  Instagram) + upload de logo.
- **`/whatsapp`** (nome proposto) — extraído do `/dashboard` atual: só o
  `WhatsappForm`.
- **`/products`** e **`/categories`** — já existem, mantêm a rota, só ganham
  o layout desta leva.
- A issue #23 (já aberta) cobre a implementação do _componente_ de
  navegação (sidebar/bottom bar) em si; este ADR detalha o _conteúdo_ de
  cada destino.

### Catálogo (`/dashboard`, home/overview)

Tela nova — hoje `/dashboard` não tem overview nenhum, só os formulários de
loja/WhatsApp misturados.

- 4 cards de resumo: produtos ativos (+ quantos sem foto), categorias,
  status do WhatsApp (conectado/verificado há X dias), última importação
  CSV.
- Ações rápidas: "+ Adicionar produto", "Importar CSV", "Configurar
  WhatsApp".
- Tabela de produtos recentes (nome, categoria, status — sem preço, ver
  seção "Regra de preço" abaixo).
- **Sem métrica de venda/pedido em lugar nenhum** — o Vitrio não tem
  checkout gerenciado nem pedido no backend, só vitrine + link de WhatsApp.
  Os cards mostram só o que existe de fato no domínio.
- Saudação usa o nome da pessoa (revendedora), não o nome da loja — "Olá,
  Ana", não "Olá, Loja da Ana". Quem acessa esse dashboard é sempre a
  pessoa, nunca a loja em si.

### Loja (`/store`)

- **Identidade**: endereço público (slug, somente leitura), nome, logo
  (preview + trocar/remover — consome o endpoint da issue #22), Instagram.
- **Cor da loja** (híbrido, ver issue #20/#21): 6 paletas curadas + hex
  customizado, com refinamento novo desta sessão — **cada swatch de cor
  (primária e botão), tanto das paletas curadas quanto do campo hex
  customizado, é um `<input type="color">` nativo**, não só texto/div
  estático. Clicar num swatch abre o seletor de cor nativo do sistema e
  permite ajustar aquela cor específica sem sair do fluxo de paleta curada
  — não é preciso migrar pro modo "hex customizado" só pra afinar uma cor
  de uma paleta pronta. Isso é um detalhe de implementação da issue #20,
  registrado aqui pra ela não perder esse requisito.
- Aviso de contraste (issue #21) some/aparece conforme a combinação
  primária/botão escolhida.
- Preview ao vivo do botão "Falar no WhatsApp" com a cor escolhida.

### Produtos (`/products`)

- Lista (tabela no desktop, cards no mobile): foto, nome, SKU, categoria,
  estoque, badges de status (Ativo/Inativo, Visível/Oculto, Sem estoque),
  Editar/Excluir.
- "Adicionar produto": nome, SKU opcional, descrição opcional, categoria,
  upload de imagem — mesmos campos do `CreateProductForm` já existente.
- Modal de editar: só o que a API de fato aceita mudar por essa tela —
  quantidade disponível + 3 toggles (Visível, Disponível para compra,
  Ativo). Sem campo de preço — não existe no domínio.
- Modal de excluir com aviso de que é destrutivo (distinto de "desativar",
  que já existe como toggle).
- **Clicar numa linha/card abre um modal com a foto do produto** — no
  desktop é um modal centralizado; no **mobile é um bottom sheet** (desliza
  da base da tela, não o mesmo modal do desktop redimensionado) — o
  componente de visualização de foto é responsivo por tipo de dispositivo,
  não só por tamanho de tela.
- Mobile: FAB (+) pra adicionar produto, em vez de formulário sempre
  visível (o formulário de criação ocupa espaço demais pra ficar sempre
  aberto numa tela pequena).

### Categorias (`/categories`)

- A tela mais enxuta: `Category` no domínio só tem `id`/`name` (sem cor,
  ícone ou ordem).
- Lista: nome + contagem de produtos (**derivada** — conta produtos que já
  têm aquela `categoryId`, não é campo novo no schema) + Editar/Excluir.
- "Adicionar categoria": só o campo nome, inline (não é modal), igual ao
  `CreateCategoryForm` já existente.
- Excluir categoria não apaga produto — `categoryId` é opcional no
  domínio, produto só fica sem categoria.
- **Sem aba própria na bottom tab bar mobile** — o ADR 0001 já fixou essa
  barra em 4 itens (Catálogo, Produtos, Loja, WhatsApp); Categorias é
  acessada a partir de Produtos (breadcrumb "‹ Produtos" no topo da tela
  mobile, bottom nav mostra "Produtos" ativo enquanto o usuário está em
  Categorias).

### WhatsApp (`/whatsapp`)

- Só número + status (Verificado/Não verificado) + botão salvar + botão
  "Verificar número" — bate com o `WhatsappForm` real, que não tem passo de
  código/OTP na UI (o backend expõe um único `POST /whatsapp/verify`).
- Preview mostra como o botão "Falar no WhatsApp" aparece pro cliente final
  na vitrine pública, com a cor de botão escolhida em "Loja" — **nunca**
  uma cor fixa da marca WhatsApp.
- O texto e o ícone do botão de preview trocam automaticamente entre
  claro/escuro (cálculo de luminância relativa) conforme a cor de fundo
  escolhida, pra manter contraste legível com qualquer cor que a
  revendedora escolher — isso vale tanto aqui quanto em qualquer lugar que
  renderize esse botão (loja, vitrine pública).

### Vitrine pública (`vitrio.com/<slug>`) — decisão nova

Não existe rota nem decisão de design anterior pra essa tela — é o que o
**cliente da revendedora** vê (público, sem autenticação), distinto do
dashboard (que só a revendedora usa). Proposta desta sessão, ainda mais
aberta a ajuste que o resto deste ADR por ser território novo:

- **Cor**: usa a paleta escolhida pela revendedora em "Loja", nunca a cor
  do Vitrio.
- **Sem preço em lugar nenhum** — reforça decisão já registrada na memória
  de integração: não existe campo de preço no domínio, o carrinho nunca
  reserva estoque, e o checkout termina num link `wa.me/<numero>?text=...`
  sem incluir valor. A pessoa combina preço direto na conversa.
- **Carrinho**: 100% client-side (no app real, `localStorage` — nunca
  backend), oculto por padrão atrás de um ícone de sacola no header (badge
  com contagem) que abre um **drawer da direita no desktop** / **bottom
  sheet no mobile** — não uma coluna sempre visível ao lado do grid (esse
  era o erro da v1 do protótipo, corrigido: nenhum e-commerce deixa o
  carrinho permanentemente aberto ocupando layout).
- **Seletor de quantidade**: stepper (−/+) no card do produto e dentro do
  modal/bottom sheet de detalhe, antes de adicionar ao carrinho.
- **Produto esgotado** (`quantityAvailable == 0` ou `!isOrderable`)
  aparece com badge "Esgotado" e não entra no fluxo de adicionar — mas
  continua visível no grid (cliente sabe que existe).
- **Carrossel** de banners no topo, com avanço automático, setas e dots.
  Usa fotos reais de produto como plano de fundo (com overlay de gradiente
  pra legibilidade do texto) em vez de só cor sólida.
- **Botão flutuante de WhatsApp** (fala geral com a loja, não amarrado a um
  produto específico) sempre visível, canto inferior — usa a mesma cor de
  botão da loja, **não** o verde da marca WhatsApp (mesma regra da seção
  "WhatsApp" acima).
- Modal/bottom sheet de produto: foto, categoria, descrição, seletor de
  quantidade, "Adicionar ao carrinho" (ou "Esgotado" desabilitado).
- Rodapé "Catálogo por Vitrio" — chute de app freemium típico, **não
  confirmado**, sinalizado como proposta em aberto.
- Não decidido: se a vitrine pública precisa de modo escuro. É a marca da
  revendedora, não a do Vitrio — não presumi uma resposta.

## Consequências

- **Regra de preço, reforçada em todas as telas novas**: nenhuma tela do
  dashboard ou da vitrine pública mostra preço. Não existe esse campo em
  `Product`/`CreateProductPayload`/`UpdateProductPayload` no domínio real —
  isso não é omissão, é a decisão de produto já registrada na memória de
  integração vitrio-web ↔ vitrio-api.
- Reestruturação de rotas (`/dashboard` overview novo, `/store` e
  `/whatsapp` extraídos do `/dashboard` atual) é pré-requisito de código
  pra várias das issues abaixo — não é só estilo.
- Trabalho de implementação decorrente deste ADR foi registrado como
  issues no GitHub: telas de auth, reestruturação de rotas, overview do
  Catálogo, layout de Loja/Produtos/Categorias/WhatsApp, e a vitrine
  pública (dividida em rota+grid, carrinho+modal de produto, e
  carrossel+botão flutuante). Ver issues linkadas a partir deste ADR.
