# Design system: portfólio Vanessa Sousa

Fonte: Figma "Portfólio", frames "Case PDO — Web (1440)" em light (232:1682) e dark (231:1225). Out/2026.
No código, os tokens ficam em `css/tokens.css`. Todo o CSS usa só os tokens semânticos (`--color-*` e `--text-*`), nunca hex solto.

Por enquanto o sistema cobre **cores e tipografia**. A frase da hero ("Faço produtos complexos parecerem óbvios.") fica fora dele.

## Cores

### Primitivos

| Token | Valor |
|---|---|
| neutral-50 | #fafafa |
| neutral-300 | #d4d4d4 |
| neutral-600 | #525252 |
| neutral-700 | #404040 |
| neutral-850 | #282828 |
| neutral-900 | #171717 |
| slate-600 | #4a637b (usado com transparência) |
| purple-600 | #7c3aed (marca) |
| pink-400 / sky-400 | #ff71e5 / #3dadff (rastro da grade) |

### Semânticos

| Token | Uso | Light | Dark |
|---|---|---|---|
| color-bg | fundo da página e dos cards de conteúdo | #fafafa | #171717 |
| color-text | títulos, rótulos, texto forte | #171717 | #fafafa |
| color-text-muted | texto corrido, valores | #525252 | #d4d4d4 |
| color-border | bordas, divisórias, contorno de tags | #4a637b a 25% | #404040 |
| color-surface-band | faixa de seção (ex.: Problema) e fundo dos cards de case da home | #4a637b a 6% | #282828 |
| color-surface-band-solid | a mesma faixa, opaca, para recortes sobre ela (pontos da linha do tempo) | #4a637b a 6% sobre #fafafa | #282828 |
| color-line | linhas e pontos da timeline | #171717 | #fafafa |
| color-grid-line | grade do fundo e borda de baixo da navegação | #ececef | #232323 |
| color-brand | destaque da marca | #7c3aed | #7c3aed |

## Tipografia

| Estilo | Família | Peso | Tamanho / entrelinha | Espaçamento | Caixa | Cor | Onde |
|---|---|---|---|---|---|---|---|
| display | Inter Tight (Inter no Figma) | 700 | 64 / 108% | -1,5% | normal | text | título do case |
| display (card) | igual ao display | 700 | 44 / 108% (desce até 28 em telas menores) | -1,5% | normal | text | título dos cards de case da home |
| display (card, celular) | igual ao display | 700 | 28 / 108% | -1,5% | normal | text | título dos cards de case até 760px |
| section | DM Sans | 800 | 16 / 130% | 4% | MAIÚSCULAS | text | título de seção (CONTEXTO, PROBLEMA…) |
| heading | Inter Tight | 700 | 32 / 115% (mín. 26) | -1,5% | normal | text | frase da seção no case, logo abaixo do section ("Três pessoas no mesmo fluxo") e títulos das partes da solução |
| title | Inter Tight | 700 | 20 / 130% | -0,5% | normal | text | título de card e de item ("Servidor do órgão", "Uma inscrição por vez") |
| label | DM Sans | 700 | 14 / 160% | 4% | MAIÚSCULAS | text (ou muted em dados) | rótulos, títulos de item, "MEU PAPEL" |
| body | DM Sans | 400 | 18 / 160% | 0 | normal | text-muted | todo texto corrido |
| action | DM Sans | 500 | 16 / 100% | 0 | normal | text-muted | links de ação ("Voltar") |
| tag | DM Sans | 600 | 14 / 120% | 0 | normal | text | tags em pílula (borda color-border, raio 999, padding 6×12) |

## Regras de uso

- Título de seção (section) + 20px + texto de abertura (body).
- Rótulo (label) + 12px + texto (body) nos itens em coluna.
- Bordas e divisórias sempre em `color-border`; cards de conteúdo (ex.: proto-persona) têm o mesmo fundo da página (`color-bg`) e raio 20.
- Faixa de destaque de seção em `color-surface-band`, de ponta a ponta. No case, as seções alternam entre fundo da página e faixa.
- Dark mode troca só os semânticos; componentes não têm cor própria.
- Imagens de trabalho (prints, quadro de análise) não invertem no dark.

## Componentes

### Card de case (home)

Tokens: `--text-display-card-size` (44px) e `--text-display-card-size-mobile` (28px), em `css/tokens.css`.

**Fundo e forma**
- Fundo `color-surface-band` nos dois temas. Não há cor própria por projeto.
- Raio entre 20 e 32px, conforme a largura da tela. Padding entre 20 e 48px.
- Altura mínima entre 380 e 470px no computador.

**Computador e tablet (acima de 760px)**
- Duas colunas: mockups à esquerda e texto à direita. A coluna de texto tem até 460px (44% do card), com respiro de 32 a 64px entre as colunas.
- Texto, de cima para baixo: título (display card), descrição (body) e tags (tag). O espaço entre eles é de 20px.
- Não há botão: o card inteiro é o link.
- Os mockups ficam presos no lado do texto e vazam pela borda esquerda e pela base do card. Eles são medidos pela altura do card, então sempre vazam, mesmo quando um título longo deixa o card mais alto.
  - **Notebook e navegador:** começam a 14% da altura, a partir do topo. A largura é 160% da altura do card (152% no navegador), ou 110% da área, o que for maior. Com isso, a base sempre passa uns 14% para fora do card.
  - **Celulares:** são dois, e cada um tem até metade da área (no máximo 64% da altura do card). O da frente começa a 10% do topo; se for estreito demais, desce até vazar pelo menos 8% pela base. O de trás fica 12% mais baixo e encosta no da frente.

**Celular (até 760px)**
- Uma coluna: título (28px), descrição e o botão "Ver case" (outline). As tags não aparecem no card, só na página do case.
- O mockup fica embaixo, numa faixa de 240px que vai até as bordas do card e vaza pela base.

**Interação**
- Entrada com a rolagem: o card vai de 35% para 100% de opacidade, sobe 40px e cresce de 96% para 100%. O mockup entra deslizando.
- Hover e foco: o card cresce um pouco e ganha sombra, e o mockup sobe 12px e gira 1,2 grau. O foco tem contorno de 3px.
- Ao abrir o case, o título e as tags "viajam" do card para a página. As tags escondidas no celular não viajam, só aparecem na página.

### Página do case (Figma 263:8)

- Texto corrido no case usa body 16/160% (o estilo body do Figma). Na home continua 18.
- Título do case: display em 48px, entrelinha 1.2, ao lado do notebook (duas colunas: 500 + 554).
- **Card de persona:** fundo `color-surface-band`, borda `color-border`, raio 20. Linhas: perfil (ícone + label + body), objetivo (label + texto na mesma linha), necessidades e dores em duas colunas com lista.
- **Quadro com diagrama:** fundo claro fixo (#fafafa com grade de pontos) nos dois temas, raio 20, ícone maximize-2 no canto inferior direito. No hover, o cursor estilo Figma mostra "Clique para bisbilhotar". Ao clicar, o quadro cresce até a tela toda; zoom só com a rolagem (ou pinça no toque), arrastar com a mãozinha, X no canto e Esc para sair.
- **Foto ampliável:** abre por cima da página, com fundo escurecido e borrado e X no canto. Clique fora ou Esc fecham.
- **Etapa da solução:** título (section) e tipo (Antes, Depois ou Iteração) presos no topo enquanto a tela e o texto sobem com parallax leve (só no computador). Tela 695 + texto 373, respiro 51.
- Transições de abrir e fechar: 600 ms, curva cubic-bezier(.32, .72, 0, 1), a mesma da troca card → case.

