---
name: case-portfolio-vanessa
description: Use para criar, estruturar, escrever ou implementar um novo estudo de caso do portfólio da Vanessa Sousa a partir dos insumos dela, no padrão dos cases publicados.
---

# Estudo de caso do portfólio (Vanessa Sousa)

Use esta skill sempre que a Vanessa pedir um case novo, revisar um case ou transformar insumos (contexto, imagens, prints, Figma, entrevistas, .md, anotações) em um case do portfólio. Funciona no chat, no Claude Code ou em outra IA: as regras abaixo são completas e não dependem de ferramenta específica.

Os cases de referência são os 4 já publicados no portfólio:

| Case | Tipo | Força do case |
| --- | --- | --- |
| Solicitação de dívidas (redesenho do envio da dívida ativa) | Profissional, sob NDA | Antes e depois por etapa do fluxo, proto-personas, próximas iterações, o que medir |
| Gestão da dívida ativa (sistema do zero) | Profissional, sob NDA | Metodologia, caderno, problema com legado, quem usa, design system, padronização, fluxos em destaque |
| Cabine de fotos (evento UXFor) | Pessoal / voluntário | Objetivo, desafios, processo em etapas numeradas, conversa com a IA, tabelas de decisão e bugs, iterações, resultado em número |
| Meu Ônibus (redesign do app) | Pessoal / estudo | Pesquisa (avaliações + observação), persona, mapa de jornada, problemas, wireframes, antes e depois por fluxo, tabela "o que mudou" |

---

## 1. Fluxo de trabalho (siga nesta ordem)

1. **Ler todos os insumos** antes de escrever qualquer coisa. Liste para si: o que é o produto, quem usa, qual era o problema, o que ela fez, quais telas existem, o que é fato e o que falta.
2. **Classificar o case** (ver seção 3) e escolher o roteiro de seções que se aplica. Nunca force uma seção sem insumo.
3. **Montar o mapa do case** e mostrar para ela antes de implementar, quando houver dúvida de escopo: seções na ordem, o que vai em cada uma, quais imagens entram onde, o que está faltando.
4. **Escrever os textos** no estilo dela (seção 5). Use as palavras dela sempre que existirem nos insumos. Não melhore o que ela escreveu sem motivo; ajuste só clareza, tamanho e consistência.
5. **Implementar** com os componentes e medidas do sistema (seções 6 a 9).
6. **Verificar** (seção 11) no desktop e no celular antes de entregar.
7. **Entregar** com um resumo curto do que foi feito e uma lista do que ficou faltando ou do que foi inferido.

Se o Figma do case existir, ele é a fonte de verdade de ordem, textos e espaçamentos. Quando o Figma contradiz os insumos (texto duplicado, numeração repetida, tag que parece de outro case), implemente o que faz sentido e **avise o desvio** no fim, em lista.

---

## 2. Regras que nunca podem ser quebradas

- **Não inventar.** Nenhum número, métrica, resultado, teste de usabilidade, depoimento, nome, prazo ou decisão que não esteja nos insumos. Se faltar, deixe de fora e avise ("ficou de fora: duração, número de stories"). Se for inferência sua, diga que é inferência.
- **Não fabricar pesquisa.** Nunca criar dados de teste, respostas de usuários ou SUS/SEQ que não existam.
- **NDA (cases profissionais):** não citar estado, órgão, nomes reais dos sistemas, contribuintes ou empresas. Borrar CPF/CNPJ, nomes e valores em todas as telas. Trocar URLs e nomes reais nas imagens exportadas (ex.: domínio do sistema → "sistema.gov.br", órgão real → nome genérico). O cliente aparece como função ("Procuradoria"), nunca como nome próprio.
- **Privacidade:** telefone dela fica fora do site. Nomes e fotos de pessoas reais (colegas, usuários entrevistados) não são publicados. Rostos em mosaicos de terceiros ficam desfocados.
- **Não mudar o que não foi pedido.** Ajuste só o escopo pedido; se notar outro problema, aponte, não corrija sozinha.
- **Ícones:** só Lucide. Marcas (Claude, Figma, Instagram etc.) vêm do Simple Icons, em uma cor só. Ícone sempre na cor do texto do título ao lado (nunca na cor de destaque).
- **Fontes:** só as do design system (Inter Tight nos títulos, DM Sans no texto, Arbutus Slab apenas na frase da hero da home). Não adicionar fontes.
- **Sem travessão** em nenhum texto (nem "—" nem "–" como pausa). Use ponto, vírgula ou dois pontos.

---

## 3. Classificar o case e escolher o roteiro

Escolha o roteiro pelo tipo de trabalho. As seções em **negrito** são obrigatórias; as outras só entram se houver insumo.

### A. Redesenho de fluxo existente (modelo: Solicitação de dívidas)
**Contexto** (faixa) → Proto-personas ou Quem usa → **Problema** → Redesenho do fluxo (diagrama) → **Solução** (antes e depois por etapa) → Próximas iterações (faixa) → O que vou medir após o lançamento

### B. Sistema novo / grande escopo (modelo: Gestão da dívida ativa)
**Contexto** (faixa: Como era / Objetivo) → Metodologia → Meu caderno ou artefatos de processo → **Problema** (cards + telas do legado) → Quem usa (+ "O que dizem") → Design system → Padronização → **Solução** (áreas do sistema + Fluxos em destaque) → Próximos passos (faixa)

### C. Projeto pessoal / experimental / com IA (modelo: Cabine de fotos)
**Objetivo** → **Desafios** (faixa) → **Processo** (etapas numeradas 01, 02, 03…) → **Resultado** (faixa, número grande) → **O que eu aprendi**

### D. Redesign de app com pesquisa (modelo: Meu Ônibus)
**Contexto** (faixa) → Pesquisa → Persona → Mapa de jornada → **Principais problemas** → Wireframes (faixa) → **Resultado** (antes e depois por fluxo) → O que mudou no uso do app (tabela) → Conclusão (faixa)

Regras de ordem que valem para todos: problema antes de solução; quem usa antes da solução; a seção de telas é a mais longa; o case termina com o que vem depois (próximos passos, o que medir, o que aprendi) e o botão "Voltar para os projetos".

**Nome da seção de telas:** "Solução" quando mostra só a solução final; "Resultado" quando mostra antes e depois; "Fluxos em destaque" para a amostra dentro de um sistema grande. Ela não precisa mostrar tudo o que foi feito: mostre os fluxos que melhor provam as decisões e diga no texto que são uma amostra.

---

## 4. Linha de raciocínio do case

O case é uma prova de decisão, não um tour de telas. Cada bloco responde a uma pergunta:

1. **O que é e para quem** (topo + contexto): produto, usuário, situação.
2. **Por que mexer** (problema): dores concretas, com evidência (fala, avaliação, observação, tela do legado).
3. **Como ela trabalhou** (processo/metodologia/pesquisa): o que fez para entender, com que ritmo, que artefatos.
4. **O que decidiu e por quê** (solução): cada tela vem com o que mudou e o efeito para o usuário.
5. **O que aconteceu e o que vem depois** (resultado, medir, aprender, próximos passos).

Cada decisão de tela segue a forma **o que a tela faz → efeito para o usuário**. Ex.: "O app já abre na parada mais próxima, com as linhas que passam nela e quanto tempo falta para cada ônibus." Nunca escreva o "porquê" como dilema ou trade-off filosófico; diga o fato e o efeito.

Diferencie no texto: decisão dela, regra de negócio, limitação técnica. Quando algo veio de pesquisa, diga de onde ("Pelo que percebi do dia a dia da equipe…", "Analisei os comentários em destaque…").

Quando não houve teste com usuários, não finja: troque por "O que vou medir após o lançamento" ou "Próximos passos" com testes planejados.

---

## 5. Escrita (estilo da Vanessa)

Este é o ponto mais sensível. Ela rejeita texto narrativo, floreado ou "de IA".

**Como ela escreve**
- Português do Brasil, simples, humano, primeira pessoa ("Analisei", "Desenhei", "Percebi").
- Frases curtas e diretas, uma ideia por frase. Fato primeiro, sem preâmbulo.
- Listas curtas quando há mais de dois itens paralelos.
- Concreta: diz o que a tela faz, qual campo saiu, quantos cliques eram, o que o usuário precisava fazer antes.
- Coloquial leve é bem-vindo quando é dela ("pra", "a gente pensou"). Não corrija a voz dela.
- Negrito só no ponto principal de uma frase (ex.: "com **autonomia.**", "**experiência diferente e divertida.**").

**Nunca**
- Travessão.
- Contrastes de efeito ("não é X, é Y"), frases de impacto no fim de parágrafo, tríades forçadas, "jornada", "transformar", "potencializar", "robusto", "intuitivo e moderno", "mais do que…".
- Trade-offs e "porquês" longos ao lado das telas.
- Termos internos que o leitor não entende (ex.: "épicos"); troque por palavra comum ("módulos", "etapas").
- Exagero de resultado ou adjetivo sem fato.

**Tamanhos de referência**
- Legenda do card na home: 1 frase, com o resultado em negrito no fim.
- Lede do topo do case: 1 a 2 frases.
- Abertura de seção: 1 a 3 frases.
- Texto ao lado de tela: 1 a 3 frases ou lista de até 4 itens.
- Itens de lista numerada: 1 a 2 frases.

**Exemplos aprovados por ela (use como régua)**
- Card: "Evoluí um fluxo de envio para um sistema em que o servidor cadastra, acompanha e corrige suas solicitações **com autonomia.**"
- Lede: "Construí do zero um sistema que reúne todo o ciclo da dívida ativa de um estado a partir de um sistema legado."
- Tela: "Abas na inscrição em vez de páginas separadas. A pessoa troca de assunto sem perder o contexto do devedor."
- Antes: "Os anexos ficavam numa aba separada, o servidor precisava ler um texto para saber o que anexar."
- Depois: "Os anexos viraram uma seção desta etapa, e o tipo de documento é escolhido numa lista."
- Processo: "Nada saiu perfeito de primeira. Para cada bug, eu dizia à IA o que aconteceu, onde aconteceu e mandava um print."
- Mobile: "Por isso usei degradação graciosa: em 17 dos 21 módulos, o mobile tem só a visualização e o histórico, para consultas rápidas quando surgir a necessidade."

**Rótulos e títulos**
- Títulos de seção em MAIÚSCULAS (estilo `section`): "Contexto", "Problema", "Quem usa", "Solução", "Resultado", "Próximos passos", "O que eu aprendi".
- Subtítulos de item em MAIÚSCULAS menores (estilo `label`): "Gestão fragmentada", "Uso rápido e sem instrução".
- Itens numerados: "01", "02"… (dois dígitos). Subetapas: "02.1".
- Ficha do topo: rótulos curtos ("Meu papel", "Cliente", "Equipe", "Período", "Tipo", "Ferramentas", "Tipo de projeto").

---

## 6. Estrutura fixa da página do case

```
[Voltar]                                              [tema]
TÍTULO (display, até 3 linhas)        | MOCKUP (área 3:2)
Lede (1–2 frases)                     |
[tag] [tag]                           |
───────────────────────────────────────────────────────────
FICHA: 3 ou 4 colunas (Meu papel · Cliente/Tipo · Equipe/Ferramentas · Período)
───────────────────────────────────────────────────────────
O QUE EU FIZ (1 parágrafo, pode ter link para outro case)   ← ou OBJETIVO no modelo C
[números do projeto] (opcional, 4 itens: número grande + rótulo)
SEÇÕES do roteiro escolhido (alternando fundo normal e faixa)
[Voltar para os projetos]
```

- **Título do case = título do card** na home, palavra por palavra (a transição de abrir depende disso).
- **Tags:** 2, iguais no card e no topo do case (ex.: "Setor público · Problem solving", "Design System · Sistema complexo", "Design com IA · Projeto voluntário", "Mobile · Pesquisa com usuários").
- **Mockup do topo:** notebook com a tela (web), dois celulares (mobile) ou imagem pronta exportada do Figma. A área tem sempre proporção 3:2 e o mockup fica centralizado dentro dela, para todos os cases terem a mesma altura.
- **Link entre cases:** quando um case cita outro, use link inline com seta (↗) que fecha um case e abre o outro.

---

## 7. Layout e medidas (seguir à risca)

**Grid e largura**
- Desktop: conteúdo com 70% da largura da tela (≥1100px); seções de leitura longa podem usar coluna de ~880px.
- Topo do case: 2 colunas (texto ~500 / mockup ~554).
- Celular (≤640px): uma coluna, título e lede acima do mockup.

**Espaços verticais (desktop / celular)**
- Mockup → ficha: **80px / 48px**.
- Ficha → primeira seção ("O que eu fiz" ou "Objetivo"): **80px / 48px**.
- Entre seções: **80px / 48–56px** (padding vertical da seção).
- Título da seção → texto → itens: **32px** (24px no celular).
- Entre etapas de um processo: **48px**; título da etapa → texto → conteúdo: **16px**.
- Faixa de seção (`is-band`): fundo `--color-surface-band`, mesma medida interna das outras seções.

**Tipografia (tokens fluidos; nunca valores soltos)**
- display 30→64, card 22→44, heading 24→32, title 18→20, body 16→18, section 14→16, label/tag 13→14.
- Cores só semânticas: `--color-text` (títulos), `--color-text-muted` (texto corrido), `--color-border`, `--color-surface-band`. Cor de destaque do case (`--case-accent`) só em foco, cursor e detalhes, nunca em ícones de título.

**Componentes do sistema (reutilizar, não criar novos sem necessidade)**
| Componente | Uso |
| --- | --- |
| `cs-head` | Título de seção + texto de abertura |
| `cs-cols` / `cs-effects` | 2 ou 3 colunas de rótulo + texto (Como era / Objetivo; Para quem usa / Para o time / Para o projeto; desafios) |
| `cs-pains--row` | Cards de problema: 4 em linha no desktop, quadro 2×2 em telas médias (≤1200px), lista com divisórias no celular |
| `cs-rowlist` / `cs-numlist` | Lista numerada 01, 02… (metodologia, próximos passos, aprendizados) |
| `cs-persona-grid` / `cs-persona` | Persona ou "quem usa": 2×2 com ícone + lista |
| `cs-voices` / `cs-quote` | Falas reais de usuários ou da equipe, em itálico, com rótulo da dor |
| `cs-table` | Tabelas (antes/depois, decisões, bugs): 3 colunas no desktop, empilhada com rótulo no celular |
| `cs-steps` | Antes e depois por etapa: barra "01 Dados da dívida · Antes/Depois", tela + lista ao lado |
| `cs-flow` / `cs-flow-row` | Fluxo em destaque: título com ícone, tela à esquerda (~700) e texto à direita (~359) |
| `cs-mphones` | 3 telas de celular lado a lado |
| `cs-media` / `cs-media-pair` | Imagem larga ou par de imagens com legenda em itálico |
| `cs-notebooks` | Fotos de caderno em mockup de caderno de capa dura (levemente inclinados) |
| `cs-chat` | Conversa com IA: avatar dela (P&B) + prompt em itálico; marca do Claude + resumo da resposta |
| `cs-iter` | Iterações: celular + rótulo + texto, 2 lado a lado |
| `cs-result` | Número grande (ex.: "50+") + texto + imagem |
| `cs-stats` | Números do projeto (até 4) |
| `cs-areas` | Áreas/módulos do sistema com pílulas de módulos |

---

## 8. Apresentação das telas

- **Escolha:** mostre só as telas que provam uma decisão. Prefira a tela final; use antes e depois só quando o "antes" explica o problema.
- **Texto ao lado de cada tela:** o que a tela faz e o efeito para o usuário (seção 5). Sem trade-offs, sem "eu pensei que".
- **Ordem:** na ordem do fluxo do usuário, numerada (01, 02, 02.1, 03…).
- **Web:** tela inteira, cantos arredondados, borda clarinha de 1px desenhada por cima da imagem (sem fresta, sem canto escuro vindo do Figma). Exporte em ~2100px de largura, .webp.
- **Mobile:** telas de celular sem moldura pesada, cantos proporcionais; em grupo de 3 (`cs-mphones`) ou lado a lado no antes/depois. Exporte ~590–790px de largura.
- **Degradação graciosa / responsivo:** quando o mobile tem menos funções, diga quais e por quê, em uma frase.
- **Diagramas e quadros grandes** (fluxograma, jornada, quadro de pesquisa): abrem em tela cheia com zoom e arrastar.
- **NDA nas imagens:** antes de exportar, troque textos sensíveis só nas cópias de exportação, nunca no arquivo original dela; apague os frames temporários depois.
- **Texto alternativo (alt):** descreve o que a tela mostra, sem dados sensíveis.
- **Imagens:** lazy loading em todas, menos as do topo (que precisam aparecer na transição de abrir).

---

## 9. Interações (devem funcionar igual em todos os cases)

**Card na home (pilha de pastas)**
- Cada case é uma "pasta" com aba no canto esquerdo: ícone + nome curto. Maleta (`briefcase`) para projeto profissional, pessoa (`user`) para projeto pessoal. Ícone na cor do texto.
- Texto à esquerda, mockups à direita vazando pela borda direita e pela base (no celular: texto em cima, mockup embaixo).
- A pilha fica presa no meio da tela; cada card sobe por cima do anterior, na mesma velocidade da rolagem; os de trás recuam, diminuem e escurecem, e o conteúdo deles só some quando estão totalmente cobertos.
- Hover: o card não cresce; só os mockups sobem e inclinam levemente e a seta do "Ver case" anda.
- Ordem dos cards: profissionais primeiro, depois pessoais. Um case novo entra na posição que ela pedir.

**Abrir e fechar o case**
- Abrir: o card cresce até a tela inteira, a cor dele vira a cor da página; título, tags, descrição e mockup viajam do lugar no card para o lugar na página; o resto aparece depois, subindo de leve.
- Fechar: o caminho inverso, terminando exatamente sobre o card; a home volta no mesmo ponto de rolagem.
- O topo do case (incluindo "O que eu fiz"/"Objetivo") aparece já na abertura; o resto revela ao rolar.

**Imagens**
- Hover: zoom sutil (1.02) em todas as imagens clicáveis, com o mesmo tempo de transição.
- Clique: abre o visualizador. Clique na imagem dá zoom no ponto clicado; clique de novo volta; pinça do trackpad dá zoom; clique fora, X ou Esc fecham. Sem legenda de instrução. Cursor: lupa + sobre a imagem, lupa − ampliada.
- Cursor estilo Figma sobre imagens: "Clique para bisbilhotar".

**Rolagem e tema**
- Rolagem suave e contínua, sem ímã entre seções.
- A página sempre abre no modo claro; o botão de tema troca na sessão.

**Acessibilidade**
- Foco visível só para teclado; imagens clicáveis com `role="button"`, `tabindex="0"` e `aria-label` ("Ampliar a tela de…").
- Títulos de seção removidos visualmente continuam no código como `sr-only`.
- Movimento reduzido: tudo aparece no lugar, sem animação.
- Contraste mínimo AA em textos sobre faixas e sobre a cor de destaque.

---

## 10. Implementação técnica (quando for codar)

- Site estático. Edite `src/index.html` e `src/cases/<slug>.html` (nunca o `index.html` da raiz, que é gerado) e rode `node build.mjs`. Case novo: copie `src/cases/_modelo.html` e adicione o nome em `src/cases/ordem.txt`. Arquivos: `css/tokens.css`, `css/styles.css`, `css/case-page.css` + `js/main.js`, `js/case-view.js`, `js/viewer.js`. Imagens em `assets/cases/<slug>/`.
- Novo case = (1) `deck-item` com `case--<slug>` no deck da home, (2) `div.case-view.case--<slug>#case-<slug>` com a estrutura da seção 6, (3) cor do case em `.case--<slug> { --case-accent; --cursor-color; --ring }` (contorno de foco num tom mais fechado se a cor for clara).
- IDs das seções com prefixo curto do case (`cb-`, `on-`, `sg-`, `cs-`), cada seção com `aria-labelledby`.
- Só tokens semânticos; nada de cor ou tamanho solto fora de exceções documentadas.
- Salve uma cópia (snapshot) antes de mudanças grandes.
- Ao publicar, envie junto todo arquivo de imagem novo ou alterado (imagem que não subiu = capa quebrada).

---

## 11. Checklist antes de entregar

- [ ] Nada inventado; o que faltou está listado na resposta.
- [ ] NDA conferido em textos e em todas as imagens (inclusive URL na barra do navegador e nomes em tabelas).
- [ ] Texto sem travessão, sem frases de efeito, no tamanho de referência.
- [ ] Título e tags do card iguais aos do case.
- [ ] Mockup do topo na área 3:2; espaços 80/80 (48/48 no celular) medidos.
- [ ] Ícones Lucide na cor do título; marcas do Simple Icons em uma cor.
- [ ] Todas as imagens com borda clara, zoom no hover, abrem no visualizador, sem corte de sombra ou caderno.
- [ ] Abrir e fechar o case sem salto; topo visível na abertura.
- [ ] Testado em 1440px, ~1100px e 390px, claro e escuro.
- [ ] Resposta final curta: o que foi feito, desvios do Figma/insumos em lista, o que falta dela.

---

## 12. Como responder à Vanessa

- Português, curto, direto, em lista quando há várias mudanças.
- Diga o que mudou e o efeito; explique a causa só quando ela perguntar "por quê" ou quando um bug voltou.
- Se ela estiver frustrada, reconheça o erro em uma frase e corrija; sem desculpas longas.
- Quando houver decisão de design relevante, explique em 1 ou 2 frases como parceira sênior de UX (princípio aplicado e efeito para o usuário).
