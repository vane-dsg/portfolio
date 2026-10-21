// Monta o index.html a partir de src/index.html e dos cases em src/cases/.
// Uso: node build.mjs   (precisa só do Node, sem instalar nada)
//
// - A ordem dos cases na home vem de src/cases/ordem.txt
// - Cada case tem duas partes: <!-- @card --> e <!-- @pagina -->
// - Não edite o index.html da raiz: ele é gerado e será sobrescrito.

import { readFileSync, writeFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");

const ordem = read("src/cases/ordem.txt")
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith("#") && !l.startsWith("_"));

const cards = [];
const paginas = [];

ordem.forEach((slug, i) => {
  const src = read(`src/cases/${slug}.html`);
  const c = src.indexOf("<!-- @card -->");
  const p = src.indexOf("<!-- @pagina -->");
  if (c < 0 || p < 0) throw new Error(`src/cases/${slug}.html precisa ter <!-- @card --> e <!-- @pagina -->`);
  const card = src.slice(c + "<!-- @card -->".length, p).trim();
  const pagina = src.slice(p + "<!-- @pagina -->".length).trim();
  // posição na pilha (--i) é calculada pela ordem
  cards.push("          " + card.replace(/<li class="deck-item([^"]*)"/, `<li class="deck-item$1" style="--i:${i}"`));
  paginas.push("  " + pagina);
});

let html = read("src/index.html");
html = html.replace("          <!-- @cards -->", cards.join("\n"));
html = html.replace("  <!-- @paginas -->", paginas.join("\n\n"));
html = html.replace("<!DOCTYPE html>", "<!DOCTYPE html>\n<!-- ARQUIVO GERADO por build.mjs. Edite src/index.html e src/cases/*.html -->");

writeFileSync(new URL("index.html", import.meta.url), html);
console.log(`index.html gerado com ${ordem.length} cases: ${ordem.join(", ")}`);
