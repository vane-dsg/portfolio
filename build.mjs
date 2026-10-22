// Monta as páginas do site a partir de src/:
//   index.html  (português)  ← src/index.html     + src/cases/*.html
//   en.html     (inglês)     ← src/en/index.html  + src/en/cases/*.html
// Uso: node build.mjs   (precisa só do Node, sem instalar nada)
//
// - A ordem dos cases na home vem de src/cases/ordem.txt (vale para os dois idiomas)
// - Cada case tem duas partes: <!-- @card --> e <!-- @pagina -->
// - Não edite index.html nem en.html da raiz: eles são gerados e serão sobrescritos.
// - Mudou um texto em português? Atualize também o arquivo equivalente em src/en/.

import { readFileSync, writeFileSync, existsSync } from "node:fs";

const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");

const ordem = read("src/cases/ordem.txt")
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith("#") && !l.startsWith("_"));

// versão nos arquivos de CSS e JS: o navegador baixa a versão nova a cada build (sem cache antigo)
const v = Date.now().toString(36);

const IDIOMAS = [
  { dir: "src", saida: "index.html", pagina: "index.html" },
  { dir: "src/en", saida: "en.html", pagina: "en.html" },
];

for (const lang of IDIOMAS) {
  if (!existsSync(new URL(`${lang.dir}/index.html`, import.meta.url))) {
    console.log(`(sem ${lang.dir}/index.html, ${lang.saida} não foi gerado)`);
    continue;
  }
  const cards = [];
  const paginas = [];

  ordem.forEach((slug, i) => {
    const arq = `${lang.dir}/cases/${slug}.html`;
    if (!existsSync(new URL(arq, import.meta.url))) throw new Error(`falta ${arq}`);
    const src = read(arq);
    const c = src.indexOf("<!-- @card -->");
    const p = src.indexOf("<!-- @pagina -->");
    if (c < 0 || p < 0) throw new Error(`${arq} precisa ter <!-- @card --> e <!-- @pagina -->`);
    const card = src.slice(c + "<!-- @card -->".length, p).trim();
    const pagina = src.slice(p + "<!-- @pagina -->".length).trim();
    // posição na pilha (--i) é calculada pela ordem
    cards.push("          " + card.replace(/<li class="deck-item([^"]*)"/, `<li class="deck-item$1" style="--i:${i}"`));
    paginas.push("  " + pagina);
  });

  let html = read(`${lang.dir}/index.html`);
  html = html.replace("          <!-- @cards -->", cards.join("\n"));
  html = html.replace("  <!-- @paginas -->", paginas.join("\n\n"));
  html = html.replace("<!DOCTYPE html>", "<!DOCTYPE html>\n<!-- ARQUIVO GERADO por build.mjs. Edite os arquivos em src/ -->");
  // links internos apontam para a página do mesmo idioma
  html = html.replace(/href="index\.html#/g, `href="${lang.pagina}#`);
  html = html.replace(/(href|src)="((?:css|js)\/[^"?]+\.(?:css|js))"/g, `$1="$2?v=${v}"`);

  writeFileSync(new URL(lang.saida, import.meta.url), html);
  console.log(`${lang.saida} gerado com ${ordem.length} cases: ${ordem.join(", ")}`);
}
