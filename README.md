# Portfólio · Vanessa Sousa

Site estático em HTML, CSS e JavaScript puro. Não precisa instalar nada para abrir; para montar a página depois de editar, só precisa do [Node](https://nodejs.org).

## Pastas

```
src/
  index.html          home, "Sobre mim" e a estrutura geral (os cases entram nos marcadores @cards e @paginas)
  cases/
    ordem.txt         ordem dos cases na pilha da home
    dividas.html      cada case: o card da home (@card) + a página do case (@pagina)
    sgdae.html
    cabine.html
    onibus.html
    _modelo.html      modelo para criar um case novo
  en/                 versão em inglês: mesma estrutura (en/index.html e en/cases/*.html)
css/                  tokens.css (design system), styles.css (home), case-page.css (páginas dos cases)
js/                   main.js (home, pilha, rolagem), case-view.js (abrir e fechar case), viewer.js (zoom das imagens)
assets/               imagens (assets/cases/<case>/)
index.html            GERADO (português). Não edite este arquivo.
en.html               GERADO (inglês). Não edite este arquivo.
build.mjs             monta o index.html e o en.html
DESIGN-SYSTEM.md      documentação do design system
.claude/skills/       skill com as regras dos cases (para o Claude Code)
```

## Editar

1. Edite `src/index.html` (home, sobre mim) ou `src/cases/<case>.html`.
2. No terminal, dentro da pasta do projeto: `node build.mjs`
3. Abra o `index.html` com o Live Server (VS Code) para ver.

Mudou um texto em português? Mude também o mesmo trecho em `src/en/`, senão o inglês fica desatualizado.
O botão PT | EN leva para a outra página e mantém o case aberto.

## Criar um case novo

1. Copie `src/cases/_modelo.html` para `src/cases/<nome>.html`.
2. Siga as instruções do topo do arquivo (trocar SLUG, textos e imagens).
3. Coloque as imagens em `assets/cases/<nome>/` (.webp).
4. Crie a versão em inglês em `src/en/cases/<nome>.html` (o build avisa se faltar).
5. Adicione `<nome>` em `src/cases/ordem.txt`.
6. Rode `node build.mjs`.

Com o Claude Code: entregue os insumos (contexto, imagens, Figma, .md) e peça
"crie o case <nome> seguindo a skill case-portfolio-vanessa".

## Mudar a ordem dos cards

Troque a ordem das linhas em `src/cases/ordem.txt` e rode `node build.mjs`.

## Publicar no GitHub Pages

1. Rode `node build.mjs` antes de publicar.
2. Suba a pasta inteira para um repositório no GitHub.
3. No repositório: Settings → Pages → Branch `main`, pasta `/ (root)` → Save.
