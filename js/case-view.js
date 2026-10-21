/* =========================================================
   Página do case com transição tipo "smart animate"

   Ao clicar num card com data-case="<id>":
   1. o fundo cresce do tamanho do card até ocupar a tela toda;
   2. os elementos em comum (data-flip: título e tags)
      viajam da posição no card até a posição na página;
   3. o resto (data-fade: voltar, legenda, informações, mockup) aparece.
   "Voltar" (ou o botão voltar do navegador / Esc) faz o contrário.

   Técnica: FLIP (First, Last, Invert, Play) com a Web Animations API.
   ========================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var EASE = "cubic-bezier(.32, .72, 0, 1)";    // desacelera suave, estilo iOS
  var DURATION = 700;                            // ida e volta usam o mesmo tempo e a mesma curva

  // no card: data-flip do destino → seletor do elemento de origem
  var SHARED = { title: ".case-title", tags: ".case-tags" };   // o mockup não viaja: só aparece

  var root = document.documentElement;
  // o navegador não deve "restaurar" a rolagem ao voltar do case: a home fica exatamente onde estava
  try { history.scrollRestoration = "manual"; } catch (err) {}
  var current = null;          // { card, view }

  function rect(el) { return el.getBoundingClientRect(); }

  // transformação que leva o elemento "last" para cima do "first"
  function invert(first, last, uniformScale) {
    var s = uniformScale != null ? uniformScale : first.width / last.width;
    return "translate(" + (first.left - last.left) + "px," + (first.top - last.top) + "px) scale(" + s + ")";
  }

  // escala de texto: pela razão entre os tamanhos de fonte (texto não pode distorcer)
  function fontRatio(a, b) {
    return parseFloat(getComputedStyle(a).fontSize) / parseFloat(getComputedStyle(b).fontSize);
  }

  function cardClip(r, radius) {
    var vw = window.innerWidth, vh = window.innerHeight;
    return "inset(" + r.top + "px " + (vw - r.right) + "px " + (vh - r.bottom) + "px " + r.left + "px round " + radius + "px)";
  }

  function cardColor(card) {
    // cor de partida do fundo = tom do card (fim do gradiente)
    var bg = getComputedStyle(card).getPropertyValue("--case-bg");
    var m = bg.match(/#[0-9a-f]{6}/gi);
    return m ? m[m.length - 1] : getComputedStyle(root).getPropertyValue("--background");
  }

  function pageColor() { return getComputedStyle(root).getPropertyValue("--background").trim(); }

  /* ---------------- abrir ----------------
     Transformação de contêiner: o card cresce até ocupar a tela, trocando a cor dele pela da página,
     e o conteúdo se reorganiza. Título, tags, descrição e mockup saem do lugar que ocupam no card e
     vão para o lugar deles na página. O resto da página aparece depois, subindo de leve.
     Fechar faz o caminho inverso e termina exatamente no card, que aparece por baixo. */
  // elementos em comum: [no card, na página, tipo]
  var PAIRS = [
    [".case-title", '[data-flip="title"]', "text"],
    [".case-tags", '[data-flip="tags"]', "tags"],
    [".case-desc", ".case-page-lede", "text"],
    [".case-visual", ".case-hero-shot", "media"]
  ];
  var busy = false;
  var lastKey = false;   // a última interação foi pelo teclado?
  document.addEventListener("keydown", function () { lastKey = true; }, true);
  document.addEventListener("pointerdown", function () { lastKey = false; }, true);

  function radii(card) {
    var cs = getComputedStyle(card);
    return [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius]
      .map(function (v) { return parseFloat(v) || 0; });
  }
  function clipOf(r, rd) {
    var vw = window.innerWidth, vh = window.innerHeight;
    return "inset(" + r.top + "px " + (vw - r.right) + "px " + (vh - r.bottom) + "px " + r.left + "px round " +
      rd[0] + "px " + rd[1] + "px " + rd[2] + "px " + rd[3] + "px)";
  }
  var FULL = "inset(0px 0px 0px 0px round 0px 0px 0px 0px)";

  // transformação que leva o elemento da página (last) para cima do elemento do card (first)
  function flipFrom(kind, src, tgt) {
    var f = rect(src), l = rect(tgt);
    if (!l.width || !l.height) return null;
    var s;
    if (kind === "text") s = fontRatio(src, tgt);
    else if (kind === "tags") s = 1;
    else s = Math.min(f.width / l.width, f.height / l.height);
    var dx = kind === "media" ? f.left + (f.width - l.width * s) / 2 - l.left : f.left - l.left;
    var dy = kind === "media" ? f.top + (f.height - l.height * s) / 2 - l.top : f.top - l.top;
    return "translate(" + dx + "px," + dy + "px) scale(" + s + ")";
  }
  function visible(el) { return el && el.getClientRects().length && rect(el).width > 0; }

  function openCase(card, opts) {
    opts = opts || {};
    var view = document.getElementById(card.dataset.case);
    if (!view || current || busy) return;
    current = { card: card, view: view };

    var cardR = rect(card), rd = radii(card);
    var cardBg = getComputedStyle(card).backgroundColor;

    // mostra a página
    view.hidden = false;
    view.scrollTop = 0;
    root.classList.add("case-open");
    if (window.lucide) window.lucide.createIcons();
    if (!opts.fromHistory) {
      try { history.pushState({ caseId: view.id }, "", "#" + view.id); } catch (err) { /* sem histórico: o Voltar fecha direto */ }
    }
    var back = view.querySelector("[data-case-close]");
    if (back) back.focus({ preventScroll: true });

    if (reduceMotion || opts.instant) return;
    busy = true;
    var anims = [];

    // o card cresce até a tela inteira, e a cor dele vira a cor da página
    var bg = view.querySelector(".case-view-bg");
    anims.push(bg.animate([
      { clipPath: clipOf(cardR, rd), backgroundColor: cardBg },
      { clipPath: FULL, backgroundColor: pageColor() }
    ], { duration: DURATION, easing: EASE }));

    // o conteúdo do card vai para o lugar dele na página
    var moved = [];
    PAIRS.forEach(function (p) {
      var src = card.querySelector(p[0]), tgt = view.querySelector(p[1]);
      if (!tgt) return;
      moved.push(tgt);
      var from = visible(src) ? flipFrom(p[2], src, tgt) : null;
      if (!from) {
        anims.push(tgt.animate([{ opacity: 0 }, { opacity: 0, offset: .35 }, { opacity: 1 }], { duration: DURATION, easing: "ease" }));
        return;
      }
      var kf = [{ transformOrigin: "0 0", transform: from }, { transformOrigin: "0 0", transform: "none" }];
      anims.push(tgt.animate(kf, { duration: DURATION, easing: EASE }));
      if (p[2] === "text" && p[0] === ".case-title") {
        // o título sai do card quebrando as linhas igual ao card; no meio do caminho troca para a quebra da página
        var w = rect(src).width / fontRatio(src, tgt) + "px";
        var lh = parseFloat(getComputedStyle(src).lineHeight) / fontRatio(src, tgt) + "px";
        anims.push(tgt.animate([
          { width: w, lineHeight: lh, opacity: 1 }, { width: w, lineHeight: lh, opacity: 0, offset: .26 },
          { width: "auto", lineHeight: getComputedStyle(tgt).lineHeight, opacity: 0, offset: .3 }, { width: "auto", lineHeight: getComputedStyle(tgt).lineHeight, opacity: 1, offset: .52 }, { width: "auto", lineHeight: getComputedStyle(tgt).lineHeight, opacity: 1 }
        ], { duration: DURATION, easing: "linear" }));
      }
    });

    // o resto aparece depois que o card já cresceu
    view.querySelectorAll("[data-fade]").forEach(function (el, i) {
      if (moved.indexOf(el) > -1) return;
      anims.push(el.animate([
        { opacity: 0, transform: "translateY(16px)" },
        { opacity: 1, transform: "none" }
      ], { duration: 460, delay: DURATION * .45 + i * 50, easing: EASE, fill: "backwards" }));
    });
    var bar = view.querySelector(".case-bar");
    if (bar) anims.push(bar.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: DURATION * .5, fill: "backwards" }));

    anims[0].finished.then(function () { busy = false; }, function () { busy = false; });
  }

  /* ---------------- fechar ---------------- */
  function closeCase() {
    if (!current || busy) return;
    var card = current.card, view = current.view;
    current = null;

    function done() {
      view.hidden = true;
      root.classList.remove("case-open");
      // o foco volta para o card; o contorno de foco só aparece para quem navega pelo teclado
      if (!lastKey) {
        card.classList.add("no-ring");
        card.addEventListener("blur", function rm() { card.classList.remove("no-ring"); card.removeEventListener("blur", rm); });
      }
      card.focus({ preventScroll: true });
    }
    if (reduceMotion) return done();

    var cardR = rect(card), rd = radii(card);
    var onScreen = cardR.bottom > 0 && cardR.top < window.innerHeight && cardR.width > 0;
    view.style.pointerEvents = "none";
    busy = true;
    var anims = [];
    function finish() {
      done();
      view.style.pointerEvents = "";
      anims.forEach(function (a) { a.cancel(); });
      busy = false;
    }

    // card fora da tela: só apaga
    if (!onScreen) {
      anims.push(view.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 280, easing: "ease", fill: "forwards" }));
      anims[0].onfinish = finish;
      return;
    }

    var scroller = view;   // a própria página do case rola
    var atTop = scroller.scrollTop < 40;
    var move = { duration: DURATION, easing: EASE, fill: "forwards" };

    // a página volta a ser o card: encolhe até o lugar dele e pega a cor dele
    var bg = view.querySelector(".case-view-bg");
    anims.push(bg.animate([
      { clipPath: FULL, backgroundColor: pageColor() },
      { clipPath: clipOf(cardR, rd), backgroundColor: getComputedStyle(card).backgroundColor }
    ], move));

    var moved = [];
    if (atTop) {
      // título, tags, descrição e mockup voltam para o lugar deles no card
      PAIRS.forEach(function (p) {
        var src = card.querySelector(p[0]), tgt = view.querySelector(p[1]);
        if (!tgt) return;
        moved.push(tgt);
        // a legenda da página tem outro texto que a do card: só some, sem viajar
        var to = visible(src) && p[0] !== ".case-desc" ? flipFrom(p[2], src, tgt) : null;
        if (!to) { anims.push(tgt.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: "ease-out", fill: "forwards" })); return; }
        var kf = [{ transformOrigin: "0 0", transform: "none" }, { transformOrigin: "0 0", transform: to }];
        anims.push(tgt.animate(kf, move));
        if (p[0] === ".case-title") {
          // na volta, o título passa a quebrar as linhas igual ao card, para pousar idêntico a ele
          var w = rect(src).width / fontRatio(src, tgt) + "px";
          var lh = parseFloat(getComputedStyle(src).lineHeight) / fontRatio(src, tgt) + "px";
          var lh0 = getComputedStyle(tgt).lineHeight;
          anims.push(tgt.animate([
            { width: "auto", lineHeight: lh0, opacity: 1 }, { width: "auto", lineHeight: lh0, opacity: 0, offset: .2 },
            { width: w, lineHeight: lh, opacity: 0, offset: .24 }, { width: w, lineHeight: lh, opacity: 1, offset: .44 }, { width: w, lineHeight: lh, opacity: 1 }
          ], { duration: DURATION, easing: "linear", fill: "forwards" }));
        }
      });
    }
    // o resto some logo no começo
    var rest = atTop ? view.querySelectorAll("[data-fade], .cs-body, .case-bar") : view.querySelectorAll(".case-view-scroll, .case-bar");
    [].forEach.call(rest, function (el) {
      if (moved.indexOf(el) > -1) return;
      anims.push(el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: "ease-out", fill: "forwards" }));
    });

    // na reta final, enquanto tudo assenta no lugar, a página se mistura com o card de verdade que está por baixo
    var out = view.animate([{ opacity: 1 }, { opacity: 0 }], { delay: DURATION * .74, duration: DURATION * .26 + 30, easing: "linear", fill: "forwards" });
    anims.push(out);
    out.onfinish = finish;
  }

  /* ---------------- ligações ---------------- */
  document.querySelectorAll(".case-card[data-case]").forEach(function (card) {
    card.addEventListener("click", function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;   // abrir em nova aba continua funcionando
      e.preventDefault();
      openCase(card);
    });
  });

  // fecha na hora e só depois atualiza o histórico (sem esperar o navegador responder)
  function closeAndGoBack() {
    if (busy || !current) return;   // no meio de uma animação, espera ela acabar
    var hadState = history.state && history.state.caseId;
    closeCase();
    if (hadState) history.back();
  }

  document.querySelectorAll("[data-case-close]").forEach(function (btn) {
    btn.addEventListener("click", closeAndGoBack);
  });

  // link de um case para outro (ex.: "sistema de envio das solicitações" no case SGDAE):
  // fecha o case aberto e abre o outro já pronto
  document.querySelectorAll("[data-goto-case]").forEach(function (link) {
    link.addEventListener("click", function (e) {
      var card = document.querySelector('.case-card[data-case="' + link.dataset.gotoCase + '"]');
      if (!card) return;
      e.preventDefault();
      if (current) closeCase();
      setTimeout(function () {
        openCase(card, { instant: true, fromHistory: true });
        try { history.replaceState({ caseId: card.dataset.case }, "", "#" + card.dataset.case); } catch (err) {}
      }, reduceMotion ? 0 : DURATION + 260);
    });
  });

  window.addEventListener("popstate", function () {
    var id = location.hash.slice(1);
    if (current && current.view.id !== id) closeCase();
    else if (!current && id) {
      var card = document.querySelector('.case-card[data-case="' + id + '"]');
      if (card) openCase(card, { fromHistory: true });
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && current) closeAndGoBack();
  });

  // link direto (…/#case-dividas): abre já pronta, sem animação
  var initial = location.hash.slice(1);
  if (initial) {
    var initialCard = document.querySelector('.case-card[data-case="' + initial + '"]');
    if (initialCard) openCase(initialCard, { instant: true, fromHistory: true });
  }
})();
