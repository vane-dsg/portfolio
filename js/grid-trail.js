/* =========================================================
   Rastro pixelado na grade do fundo

   Ao passar o mouse, os quadrados da grade por onde ele passa se
   preenchem e somem em 150ms. O quadrado onde o mouse está fica
   pintado (com a última cor do degradê) até o mouse sair dele.
   A cor muda aos poucos conforme o mouse anda:
   roxo (o mesmo de "óbvios") → rosa → azul claro → roxo...

   Só funciona com mouse (não em toque) e fica desligado para quem
   pediu menos movimento no sistema.
   ========================================================= */
(function () {
  "use strict";

  var CELL = 32;          // tamanho do quadrado: igual a --grid-size no CSS
  var FADE = 150;         // ms até o quadrado sumir
  var ALPHA = 0.85;       // opacidade do quadrado no início
  var STEP = 280;         // px de movimento para ir de uma cor à próxima
  var COLORS = [[124, 58, 237], [255, 113, 229], [61, 173, 255]];   // #7c3aed, #FF71E5, #3DADFF

  var mq = window.matchMedia;
  if (!mq("(hover: hover) and (pointer: fine)").matches) return;
  if (mq("(prefers-reduced-motion: reduce)").matches) return;

  var canvas = document.createElement("canvas");
  canvas.className = "grid-trail";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);
  var ctx = canvas.getContext("2d");

  var cells = new Map();    // "x,y" -> { x, y, t, c }
  var curKey = null;        // quadrado onde o mouse está agora (não some)
  var last = null;          // última posição do mouse
  var travel = 0;           // distância percorrida (define a cor)
  var running = false;
  var dpr = 1;
  var offY = 0;             // a grade começa na borda de baixo da navegação (CSS: background-position)
  var nav = document.querySelector(".site-nav");

  var sx = 1, sy = 1;        // pixels do canvas por px da tela (para os quadrados caírem certinho na grade)
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    // usa o tamanho real do canvas na tela: window.innerWidth inclui a barra de rolagem,
    // e isso esticava o desenho alguns px, desalinhando os quadrados da grade
    var r = canvas.getBoundingClientRect();
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    sx = canvas.width / r.width;
    sy = canvas.height / r.height;
    offY = nav ? nav.offsetHeight - 1 : 0;   // altura da navegação sem a borda de 1px
  }

  function colorAt(d) {
    var p = (d / STEP) % COLORS.length;
    var i = Math.floor(p), f = p - i;
    var a = COLORS[i], b = COLORS[(i + 1) % COLORS.length];
    return [0, 1, 2].map(function (k) { return Math.round(a[k] + (b[k] - a[k]) * f); });
  }

  function mark(px, py, now) {
    var x = Math.floor(px / CELL), y = Math.floor((py - offY) / CELL);
    var key = x + "," + y;
    var c = colorAt(travel);
    cells.set(key, { x: x, y: y, t: now, c: c });
    return key;
  }

  function kick() { if (!running) { running = true; requestAnimationFrame(draw); } }

  // o quadrado que o mouse deixou começa a sumir a partir de agora
  function release(key, now) {
    var cell = key && cells.get(key);
    if (cell) cell.t = now;
  }

  function onMove(e) {
    var now = performance.now();
    var x = e.clientX, y = e.clientY;
    var key;
    if (last) {
      var dx = x - last.x, dy = y - last.y;
      var dist = Math.hypot(dx, dy);
      // preenche os quadrados no caminho, para o rastro não ficar com buracos
      var n = Math.max(1, Math.ceil(dist / (CELL / 2)));
      for (var i = 1; i <= n; i++) {
        travel += dist / n;
        key = mark(last.x + dx * i / n, last.y + dy * i / n, now);
      }
    } else {
      key = mark(x, y, now);
    }
    if (key !== curKey) { release(curKey, now); curKey = key; }
    last = { x: x, y: y };
    kick();
  }

  function leave() {
    release(curKey, performance.now());
    curKey = null; last = null;
    kick();
  }

  function draw(now) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(sx, 0, 0, sy, 0, 0);
    var fading = 0;
    cells.forEach(function (cell, key) {
      var a;
      if (key === curKey) {
        a = ALPHA;                              // embaixo do mouse: fica pintado
      } else {
        var age = now - cell.t;
        if (age >= FADE) { cells.delete(key); return; }
        a = ALPHA * (1 - age / FADE);
        fading++;
      }
      ctx.fillStyle = "rgba(" + cell.c[0] + "," + cell.c[1] + "," + cell.c[2] + "," + a.toFixed(3) + ")";
      ctx.fillRect(cell.x * CELL, cell.y * CELL + offY, CELL, CELL);
    });
    // só continua animando enquanto houver quadrado sumindo
    if (fading) requestAnimationFrame(draw);
    else running = false;
  }

  resize();
  window.addEventListener("resize", function () { resize(); kick(); });
  window.addEventListener("pointermove", onMove, { passive: true });
  document.documentElement.addEventListener("mouseleave", leave);
  window.addEventListener("blur", leave);
})();
