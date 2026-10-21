/* =========================================================
   Página do case: barra de seções + "Telas em destaque"

   1. Barra fixa com o "Voltar": funciona como a navegação do site,
      some ao rolar para baixo e volta ao rolar para cima.
   2. Seções aparecem ao rolar: cada [data-reveal] ganha .is-in quando
      entra na tela, e os filhos diretos dele sobem em sequência (CSS).
   3. Parallax na Solução: o título de cada etapa fica preso no topo
      (CSS sticky) e a tela e o texto [data-parallax] sobem em velocidades
      um pouco diferentes da rolagem (data-parallax = fração do desvio).
   4. Telas em destaque (.cs-story), se existirem.
   ========================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll(".case-view").forEach(function (view) {
    var bar = view.querySelector(".case-bar");
    var stories = [].slice.call(view.querySelectorAll(".cs-story")).map(setupStory);
    var ticking = false;
    var lastTop = 0;
    var upRun = 0;          // quanto já subiu seguido
    var THRESHOLD = 8;      // px de rolagem antes de reagir (evita piscar)
    var SHOW_AFTER = 120;   // perto do topo, o "Voltar" da própria página já aparece
    var parallax = reduceMotion ? [] : [].slice.call(view.querySelectorAll("[data-parallax]")).map(function (el) {
      return { el: el, k: parseFloat(el.dataset.parallax) || 0 };
    });

    // desvio = distância do centro do elemento até o centro da tela × k (limitado)
    // título da etapa preso no topo (e com conteúdo passando por baixo): liga o degradê
    var stepHeads = [].slice.call(view.querySelectorAll(".cs-step-head"));
    // o que passa por baixo do título preso é recortado na linha de baixo dele, com os cantos
    // arredondados (a tela parece entrar numa janela, em vez de ser cortada reta)
    function updateStuck() {
      stepHeads.forEach(function (h) {
        var edge = h.getBoundingClientRect().bottom;
        h.parentElement.querySelectorAll(".cs-step-body > *:not(.cs-step-grid), .cs-step-grid > *").forEach(function (el) {
          var r = el.getBoundingClientRect();
          var cut = edge - r.top;
          if (cut > 0 && r.bottom > edge) {
            var round = el.classList.contains("cs-shot") ? " round 8px" : "";
            el.style.clipPath = "inset(" + cut.toFixed(1) + "px 0 0 0" + round + ")";
          } else if (el.style.clipPath) el.style.clipPath = "";
        });
      });
    }
    var wide = window.matchMedia("(min-width: 901px)");   // no celular a tela e o texto ficam empilhados: sem parallax
    function updateParallax() {
      if (!parallax.length) return;
      if (!wide.matches) { parallax.forEach(function (p) { p.el.style.translate = ""; }); return; }
      var vh = view.clientHeight;
      var barOn = view.classList.contains("bar-on") && bar ? bar.offsetHeight : 0;
      parallax.forEach(function (p) {
        var body = p.el.parentElement;
        var r = body.getBoundingClientRect();     // mede pelo pai (não muda com o próprio desvio)
        if (r.bottom < -200 || r.top > vh + 200) return;
        // o conteúdo entra um pouco atrasado (mais baixo) e alcança a posição real quando
        // chega na linha do título preso. Nunca sobe além dela: o começo do texto não fica escondido
        var step = body.closest(".cs-step");
        var head = step ? step.querySelector(".cs-step-head") : body.previousElementSibling;
        var line = barOn + (head ? head.offsetHeight : 0);
        var y = Math.max(0, Math.min(60, (r.top - line) * Math.abs(p.k)));
        p.el.style.translate = "0 " + y.toFixed(1) + "px";
      });
    }

    function update() {
      ticking = false;
      if (view.hidden) return;
      var top = view.scrollTop;
      var delta = top - lastTop;

      if (bar) {
        if (top <= SHOW_AFTER) {
          bar.classList.remove("is-visible");
          lastTop = top;
        } else if (delta > THRESHOLD) {
          bar.classList.remove("is-visible");            // descendo: some
          lastTop = top; upRun = 0;
        } else if (delta < 0) {
          // subindo: aparece depois de um tanto de subida. No antes e depois é preciso subir
          // mais, para a barra não pular na frente ao ajustar a leitura de uma tela
          upRun += -delta; lastTop = top;
          var sol = view.querySelector(".cs-solution");
          var r = sol ? sol.getBoundingClientRect() : null;
          var inSol = r && r.top < view.clientHeight * .5 && r.bottom > view.clientHeight * .5;
          if (upRun > (inSol ? 220 : THRESHOLD)) bar.classList.add("is-visible");
        }
        // com a barra à mostra, o título preso da etapa desce para ficar logo abaixo dela
        view.classList.toggle("bar-on", bar.classList.contains("is-visible"));
      }

      updateParallax();
      updateStuck();

      stories.forEach(function (s) { s.update(); });
    }

    function scrollToY(y) {
      view.scrollTo({ top: Math.max(0, y), behavior: reduceMotion ? "auto" : "smooth" });
    }

    // foco do teclado no "Voltar" da barra: ela aparece
    if (bar) bar.addEventListener("focusin", function () { bar.classList.add("is-visible"); });

    /* ---------- Seções aparecem ao rolar ---------- */
    var reveals = [].slice.call(view.querySelectorAll("[data-reveal]"));
    reveals.forEach(function (el) {
      [].forEach.call(el.children, function (c, i) { c.style.setProperty("--ri", Math.min(i, 6)); });
    });
    var revealIO = null;
    if (!reduceMotion && "IntersectionObserver" in window) {
      revealIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          en.target.classList.add("is-in");
          revealIO.unobserve(en.target);
        });
      }, { root: view, rootMargin: "0px 0px -12% 0px" });
    }
    // (re)arma ao abrir o case: tudo começa escondido e aparece conforme a rolagem
    function armReveals() {
      reveals.forEach(function (el) {
        if (revealIO) { el.classList.remove("is-in"); revealIO.observe(el); }
        else el.classList.add("is-in");
      });
    }
    armReveals();

    /* ---------- Telas em destaque ---------- */
    function setupStory(story) {
      var pin = story.querySelector(".cs-story-pin");
      var steps = [].slice.call(story.querySelectorAll(".cs-step"));
      var shots = [].slice.call(story.querySelectorAll(".cs-story-shot"));
      var btns = [].slice.call(story.querySelectorAll(".cs-step-btn"));
      var cur = story.querySelector(".cs-story-cur");
      var n = steps.length;
      var active = -1;

      function range() { return Math.max(1, story.offsetHeight - pin.offsetHeight); }
      function pinned() { return getComputedStyle(pin).position === "sticky"; }

      function setActive(i) {
        if (i === active) return;
        active = i;
        steps.forEach(function (s, k) { s.classList.toggle("is-active", k === i); });
        shots.forEach(function (s, k) { s.classList.toggle("is-active", k === i); });
        btns.forEach(function (b, k) { if (k === i) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current"); });
        if (cur) cur.textContent = String(i + 1).padStart(2, "0");
      }

      function update() {
        if (!pinned()) return;   // telas baixas: tudo aparece em sequência, sem trava
        var p = -story.getBoundingClientRect().top / range();
        p = Math.max(0, Math.min(1, p));
        story.style.setProperty("--story-p", p.toFixed(3));
        setActive(Math.min(n - 1, Math.floor(p * n)));
      }

      // clicar no nome de uma tela leva até o trecho da rolagem dela
      btns.forEach(function (b, i) {
        b.addEventListener("click", function () {
          var top = view.scrollTop + story.getBoundingClientRect().top;
          scrollToY(top + range() * (i + .5) / n);
        });
      });

      setActive(0);
      return { update: update };
    }

    view.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener("resize", update);

    // ao abrir/fechar o case, recomeça do topo (barra escondida, primeira tela)
    new MutationObserver(function () {
      lastTop = view.scrollTop; if (bar) bar.classList.remove("is-visible"); view.classList.remove("bar-on");
      if (!view.hidden) armReveals();
      requestAnimationFrame(update);
    })
      .observe(view, { attributes: true, attributeFilter: ["hidden"] });
  });
})();
