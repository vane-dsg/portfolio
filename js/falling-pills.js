/* =========================================================
   Pílulas que caem — camada de habilidades sobre a hero
   Depende de: Matter.js (física) e Lucide (ícones), via CDN.

   As pílulas caem do topo (por baixo da navegação), passam por
   cima do conteúdo da hero e param no pé da primeira tela.
   A queda acontece uma vez só, ao abrir a página.

   Marcação esperada (dentro da hero, que precisa de position: relative):
     <div class="pills-layer" data-falling-pills>
       <div class="pills-stage" aria-hidden="true"></div>
       <ul class="pills-list">…</ul>
     </div>
   ========================================================= */

/* ---------------------------------------------------------
   CONTEÚDO — edite aqui textos, ícones e cores.
   - text: texto da pílula (fica em caixa alta pelo CSS).
     Sem "text", vira um círculo só com ícone.
   - icon: nome do ícone no Lucide (lucide.dev/icons).
   - color: fundo da pílula. textColor: opcional (padrão #1C1917).
   Mantenha contraste de pelo menos 4,5:1 entre texto e fundo.
   --------------------------------------------------------- */
var FALLING_PILLS = [
  { text: "Problem Framing",     icon: "frame",               color: "#7C3AED", textColor: "#FFFFFF" },
  { text: "UX Research",         icon: "search",              color: "#FCD34D" },
  { text: "User Interface",      icon: "panels-top-left",     color: "#A9D4FF" },
  { text: "Design Systems",      icon: "component",           color: "#86E0A8" },
  { text: "Clear Communication", icon: "message-square-text", color: "#F7C6E0" },
  { text: "AI-Powered Design",   icon: "sparkles",            color: "#D9CCFF" },
  { text: "Product Strategy",    icon: "target",              color: "#F7A571" },
  { text: "Interaction Design",  icon: "mouse-pointer-click", color: "#E1F5A3" },
  { text: "Usability Testing",   icon: "flask-conical",       color: "#FFE08A" },
  { text: "Critical Thinking",   icon: "brain",               color: "#A9D4FF" },
  { icon: "coffee",      color: "#F7A571" },
  { icon: "pen-tool",    color: "#D9CCFF" },
  { icon: "sticky-note", color: "#FCD34D" }
];

/* Ajustes finos do comportamento */
var FALLING_PILLS_CONFIG = {
  dropInterval: 90,          // ms entre uma pílula e a próxima
  maxStartAngle: 30,         // rotação inicial aleatória, em graus (±)
  restitution: 0.3,          // quanto quica
  friction: 0.5,
  frictionAir: 0.02,
  smallBreakpoint: 640,      // abaixo disso: sem círculos, pílulas menores
  resizeDebounce: 200,
  navSelector: "#site-nav",  // a navegação fixa: as pílulas não ficam atrás dela
  staticAngles: [-4, 3, -2, 5, -3, 2, -5, 4, -1, 3, -3, 2, -2] // pilha sem movimento
};

(function () {
  "use strict";

  var layer = document.querySelector("[data-falling-pills]");
  if (!layer) return;

  var list = layer.querySelector(".pills-list");
  var stage = layer.querySelector(".pills-stage");
  var CFG = FALLING_PILLS_CONFIG;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DEG = Math.PI / 180;

  var state = null;        // mundo físico atual
  var visible = true;      // a primeira tela está visível?
  var lastWidth = 0;

  /* Lista para leitores de tela (gerada do mesmo array) */
  list.innerHTML = "";
  FALLING_PILLS.forEach(function (p) {
    if (!p.text) return;
    var li = document.createElement("li");
    li.textContent = p.text;
    list.appendChild(li);
  });

  /* ---------- utilitários ---------- */
  function rand(min, max) { return min + Math.random() * (max - min); }
  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }
  function isSmall() { return window.innerWidth < CFG.smallBreakpoint; }
  function navHeight() {
    var nav = document.querySelector(CFG.navSelector);
    return nav ? nav.offsetHeight : 0;
  }
  function place(el, x, y, w, h, angleRad) {
    el.style.transform = "translate(" + (x - w / 2).toFixed(2) + "px," + (y - h / 2).toFixed(2) + "px) rotate(" + angleRad.toFixed(4) + "rad)";
  }

  /* ---------- cria as pílulas no DOM ---------- */
  function buildPills() {
    stage.innerHTML = "";
    var items = FALLING_PILLS.filter(function (p) { return p.text || !isSmall(); });
    items = shuffle(items.slice()); // ordem aleatória a cada carregamento

    var pills = items.map(function (p) {
      var el = document.createElement("div");
      el.className = "pill" + (p.text ? "" : " pill--icon");
      el.style.setProperty("--pill-bg", p.color);
      if (p.textColor) el.style.setProperty("--pill-fg", p.textColor);

      if (p.text) {
        var span = document.createElement("span");
        span.className = "pill-text";
        span.textContent = p.text;
        el.appendChild(span);
      }
      var icon = document.createElement("i");
      icon.setAttribute("data-lucide", p.icon);
      el.appendChild(icon);

      stage.appendChild(el);
      return { el: el, isCircle: !p.text };
    });

    if (window.lucide) window.lucide.createIcons({ attrs: { "stroke-width": 2 } });

    // mede depois que texto e ícones estão no lugar
    pills.forEach(function (p) {
      p.w = p.el.offsetWidth;
      p.h = p.el.offsetHeight;
    });
    return pills;
  }

  /* ---------- pilha arrumada no chão (sem queda) ----------
     Usada no modo sem movimento e ao redimensionar a janela. */
  function restingPositions(pills) {
    var W = stage.clientWidth, H = stage.clientHeight;
    var gap = 6, rows = [], row = [], rowW = 0, out = [];

    pills.forEach(function (p) {
      if (row.length && rowW + p.w > W - 16) { rows.push(row); row = []; rowW = 0; }
      row.push(p); rowW += p.w + gap;
    });
    if (row.length) rows.push(row);

    var i = 0;
    rows.forEach(function (r, ri) {
      var total = r.reduce(function (s, p) { return s + p.w + gap; }, -gap);
      var x = (W - total) / 2;
      r.forEach(function (p) {
        out.push({
          pill: p,
          x: x + p.w / 2,
          y: H - p.h / 2 - 4 - ri * (p.h + gap + 2),
          angle: CFG.staticAngles[i % CFG.staticAngles.length] * DEG
        });
        x += p.w + gap; i++;
      });
    });
    return out;
  }

  function layoutStatic(pills) {
    restingPositions(pills).forEach(function (r) {
      place(r.pill.el, r.x, r.y, r.pill.w, r.pill.h, r.angle);
      r.pill.el.classList.add("is-live");
    });
  }

  /* ---------- modo física ----------
     drop = true: pílulas caem do topo (só ao abrir a página).
     drop = false: já começam empilhadas no chão (depois de redimensionar). */
  function startPhysics(pills, drop) {
    var M = window.Matter;
    var W = stage.clientWidth, H = stage.clientHeight, T = 400;
    var top = navHeight();   // teto logo abaixo da navegação

    var engine = M.Engine.create();
    engine.gravity.y = 1;

    // chão e paredes invisíveis (paredes altas para cobrir a área de queda)
    var floor = M.Bodies.rectangle(W / 2, H + T / 2, W + T * 2, T, { isStatic: true });
    var left  = M.Bodies.rectangle(-T / 2, 0, T, H * 6, { isStatic: true });
    var right = M.Bodies.rectangle(W + T / 2, 0, T, H * 6, { isStatic: true });
    M.Composite.add(engine.world, [floor, left, right]);

    var opts = { restitution: CFG.restitution, friction: CFG.friction, frictionAir: CFG.frictionAir };
    var bodies = pills.map(function (p) {
      var b = p.isCircle
        ? M.Bodies.circle(0, 0, p.w / 2, opts)
        : M.Bodies.rectangle(0, 0, p.w, p.h, Object.assign({ chamfer: { radius: p.h / 2 - 0.5 } }, opts));
      b.plugin.pill = p;
      return b;
    });

    var spawned = 0, ceiling = null, timers = [];

    function closeTop() {
      if (ceiling) return;
      ceiling = M.Bodies.rectangle(W / 2, top - T / 2, W + T * 2, T, { isStatic: true });
      M.Composite.add(engine.world, ceiling);
    }

    if (drop) {
      // queda: uma de cada vez, x e rotação aleatórios, acima do topo da tela
      bodies.forEach(function (b, i) {
        timers.push(setTimeout(function () {
          var p = b.plugin.pill;
          var margin = Math.min(p.w / 2 + 2, W / 2);
          M.Body.setPosition(b, { x: rand(margin, W - margin), y: -p.h - rand(0, 80) });
          M.Body.setAngle(b, rand(-CFG.maxStartAngle, CFG.maxStartAngle) * DEG);
          M.Composite.add(engine.world, b);
          p.el.classList.add("is-live");
          spawned++;
        }, i * CFG.dropInterval));
      });
      // plano B: fecha o topo mesmo se algo demorar para passar da navegação
      timers.push(setTimeout(closeTop, bodies.length * CFG.dropInterval + 4000));
    } else {
      // já empilhadas: sem queda
      restingPositions(pills).forEach(function (r, i) {
        var b = bodies[pills.indexOf(r.pill)];
        M.Body.setPosition(b, { x: r.x, y: r.y });
        M.Body.setAngle(b, r.angle);
        M.Composite.add(engine.world, b);
        r.pill.el.classList.add("is-live");
      });
      spawned = bodies.length;
      closeTop();
    }

    // sincroniza DOM ← física a cada passo
    M.Events.on(engine, "afterUpdate", function () {
      var allInside = spawned === bodies.length;
      bodies.forEach(function (b) {
        var p = b.plugin.pill;
        if (!p.el.classList.contains("is-live")) return;

        // segurança: nada escapa da área
        if (ceiling && (b.position.y < top + p.h / 2 - 1 || b.position.x < 0 || b.position.x > W)) {
          M.Body.setPosition(b, {
            x: Math.min(Math.max(b.position.x, p.w / 2), W - p.w / 2),
            y: Math.max(b.position.y, top + p.h / 2)
          });
          M.Body.setVelocity(b, { x: 0, y: 0 });
        }
        if (b.bounds.min.y < top) allInside = false;
        place(p.el, b.position.x, b.position.y, p.w, p.h, b.angle);
      });
      // topo aberto só durante a queda
      if (!ceiling && allInside) closeTop();
    });

    /* ---------- arrastar e jogar ---------- */
    var mouse = M.Mouse.create(stage);
    // não sequestrar a rolagem da página
    stage.removeEventListener("wheel", mouse.mousewheel);
    stage.removeEventListener("mousewheel", mouse.mousewheel);
    stage.removeEventListener("DOMMouseScroll", mouse.mousewheel);
    // toque: removemos o padrão do Matter e só capturamos se começar numa pílula
    stage.removeEventListener("touchstart", mouse.mousedown);
    stage.removeEventListener("touchmove", mouse.mousemove);
    stage.removeEventListener("touchend", mouse.mouseup);

    var mc = M.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: { stiffness: 0.2, damping: 0.1, render: { visible: false } }
    });
    M.Composite.add(engine.world, mc);

    var root = document.documentElement;
    M.Events.on(mc, "startdrag", function () { root.classList.add("pills-dragging"); });
    M.Events.on(mc, "enddrag", function () { root.classList.remove("pills-dragging"); });

    // O palco não recebe cliques (o texto da hero continua selecionável);
    // só as pílulas recebem. Durante o arraste, seguimos o mouse pela janela toda.
    function onWindowMove(e) { mouse.mousemove(e); }
    function onWindowUp(e) {
      mouse.mouseup(e);
      window.removeEventListener("mousemove", onWindowMove);
    }
    stage.addEventListener("mousedown", function () {
      window.addEventListener("mousemove", onWindowMove);
    });
    window.addEventListener("mouseup", onWindowUp);

    var touching = false;
    function touchPoint(e) {
      var r = stage.getBoundingClientRect(), t = e.touches[0];
      return { x: t.clientX - r.left, y: t.clientY - r.top };
    }
    stage.addEventListener("touchstart", function (e) {
      var hit = M.Query.point(bodies, touchPoint(e)).length > 0;
      if (!hit) return;              // toque fora das pílulas: a página rola
      touching = true;
      mouse.mousedown(e);            // o Matter chama preventDefault aqui
    }, { passive: false });
    stage.addEventListener("touchmove", function (e) { if (touching) mouse.mousemove(e); }, { passive: false });
    function onTouchEnd(e) { if (touching) { mouse.mouseup(e); touching = false; } }
    stage.addEventListener("touchend", onTouchEnd);
    stage.addEventListener("touchcancel", onTouchEnd);

    var runner = M.Runner.create();
    if (visible) M.Runner.run(runner, engine);

    return {
      engine: engine, runner: runner, running: visible,
      destroy: function () {
        timers.forEach(clearTimeout);
        M.Runner.stop(runner);
        M.Events.off(engine);
        M.Engine.clear(engine);
        window.removeEventListener("mouseup", onWindowUp);
        window.removeEventListener("mousemove", onWindowMove);
        root.classList.remove("pills-dragging");
        // troca o palco por uma cópia limpa: remove todos os listeners
        var fresh = stage.cloneNode(false);
        stage.replaceWith(fresh);
        stage = fresh;
      }
    };
  }

  /* ---------- ciclo de vida ---------- */
  function start(drop) {
    lastWidth = stage.clientWidth;
    var pills = buildPills();
    if (!reduceMotion && window.Matter) state = startPhysics(pills, drop);
    else layoutStatic(pills);
  }

  function destroy() {
    if (state) { state.destroy(); state = null; }
    else stage.innerHTML = "";
  }

  function pause() {
    if (state && state.running) { window.Matter.Runner.stop(state.runner); state.running = false; }
  }
  function resume() {
    if (state && !state.running) { window.Matter.Runner.run(state.runner, state.engine); state.running = true; }
  }

  // permite que outras partes da página pausem a física (ex.: hero coberta pela gaveta)
  window.fallingPills = { pause: pause, resume: resume };

  // queda uma vez só, ao abrir a página (depois das fontes, para medir certo)
  var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  fontsReady.then(function () { start(true); });

  // pausa a física quando a primeira tela sai de vista
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) resume(); else pause();
    }, { threshold: 0 }).observe(layer);
  }

  // redimensionar: recria o mundo com as pílulas já no chão (sem cair de novo)
  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (stage.clientWidth === lastWidth) return; // ignora a barra do navegador no celular
      destroy();
      start(false);
    }, CFG.resizeDebounce);
  });
})();
