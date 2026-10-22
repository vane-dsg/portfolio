(function () {
  "use strict";

  // Ícones Lucide
  if (window.lucide) window.lucide.createIcons();

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // idioma da página (index.html = português, en.html = inglês)
  var EN = /^en/i.test(document.documentElement.lang);
  function tr(pt, en) { return EN ? en : pt; }

  /* ---------------------------------------------------------
     Hero: entrada com "slide up text".
     Cada palavra da frase principal sobe de dentro de uma máscara, em sequência.
     Em seguida aparecem a saudação, o texto de apoio, a pílula e o convite para rolar,
     e o grifo de "produtos complexos" se desenha. Tudo termina em ~1,8s.
     --------------------------------------------------------- */
  (function revealHero() {
    var title = document.getElementById("hero-title");
    var heroEl = title && title.closest(".hero");
    if (!title || !heroEl) return;
    if (reduceMotion) { heroEl.classList.add("is-in"); return; }

    title.setAttribute("aria-label", title.textContent.replace(/\s+/g, " ").trim());
    var words = [];
    var textNodes = [];
    (function collect(node) {
      [].forEach.call(node.childNodes, function (n) {
        if (n.nodeType === 3) textNodes.push(n);
        else if (n.nodeType === 1) collect(n);
      });
    })(title);
    textNodes.forEach(function (n) {
      var parts = n.textContent.replace(/\s+/g, " ").split(/( )/);
      var frag = document.createDocumentFragment();
      parts.forEach(function (part) {
        if (!part) return;
        if (part === " ") { frag.appendChild(document.createTextNode(" ")); return; }
        var w = document.createElement("span"); w.className = "w"; w.setAttribute("aria-hidden", "true");
        var wi = document.createElement("span"); wi.className = "wi"; wi.textContent = part;
        w.appendChild(wi); frag.appendChild(w); words.push(wi);
      });
      n.parentNode.replaceChild(frag, n);
    });
    words.forEach(function (wi, i) { wi.style.setProperty("--wi", i); });
    heroEl.classList.add("is-ready");
    requestAnimationFrame(function () { requestAnimationFrame(function () { heroEl.classList.add("is-in"); }); });
  })();

  /* ---------------------------------------------------------
     Tema claro/escuro
     O tema inicial é aplicado no <head> (sem piscar). Aqui o botão
     sol/lua troca o tema e salva a escolha neste navegador.
     --------------------------------------------------------- */
  // há mais de um botão de tema (navegação e página do case): todos fazem a mesma coisa
  // depois que a página aparece, as transições de cor voltam a funcionar
  requestAnimationFrame(function () { requestAnimationFrame(function () { document.documentElement.classList.remove("no-anim"); }); });
  var themeBtns = [].slice.call(document.querySelectorAll(".theme-toggle"));
  var themeBtn = themeBtns[0];
  var THEME_EFFECT = "fade";   // "circle" = círculo a partir do botão · "fade" = fade da página inteira
  function currentTheme() { return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"; }
  function syncThemeBtn() {
    var dark = currentTheme() === "dark";
    themeBtns.forEach(function (b) {
      b.setAttribute("aria-label", dark ? tr("Ativar modo claro", "Switch to light mode") : tr("Ativar modo escuro", "Switch to dark mode"));
      b.setAttribute("aria-pressed", String(dark));
    });
  }
  if (themeBtn) {
    syncThemeBtn();
    var root = document.documentElement;
    function applyTheme(next) {
      root.setAttribute("data-theme", next);
      syncThemeBtn();
    }
    // o site acompanha o tema do aparelho: se a pessoa trocar no sistema, a página troca junto
    var mq = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
    if (mq) {
      var onSystem = function (e) { applyTheme(e.matches ? "dark" : "light"); };
      if (mq.addEventListener) mq.addEventListener("change", onSystem); else if (mq.addListener) mq.addListener(onSystem);
    }
    themeBtns.forEach(function (btn) { btn.addEventListener("click", function () {
      var clicked = btn;
      var next = currentTheme() === "dark" ? "light" : "dark";
      if (reduceMotion) return applyTheme(next);
      // troca suave (View Transitions). Sem suporte, as cores fazem a transição juntas.
      if (document.startViewTransition) {
        if (THEME_EFFECT === "circle") {
          // o tema novo se espalha em círculo a partir do botão sol/lua
          var r = clicked.getBoundingClientRect();
          var x = r.left + r.width / 2, y = r.top + r.height / 2;
          var end = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
          root.classList.add("theme-vt-circle");
          var vt = document.startViewTransition(function () { applyTheme(next); });
          vt.ready.then(function () {
            root.animate(
              { clipPath: ["circle(0px at " + x + "px " + y + "px)", "circle(" + end + "px at " + x + "px " + y + "px)"] },
              { duration: 650, easing: "cubic-bezier(.3, 0, .2, 1)", pseudoElement: "::view-transition-new(root)" }
            );
          });
          vt.finished.then(function () { root.classList.remove("theme-vt-circle"); });
        } else {
          // fade da página inteira; durante a troca nada faz transição própria (o tema novo entra pronto)
          root.classList.add("theme-vt");
          document.startViewTransition(function () { applyTheme(next); })
            .finished.then(function () { root.classList.remove("theme-vt"); });
        }
        return;
      }
      root.classList.add("theme-switching");
      applyTheme(next);
      clearTimeout(applyTheme.t);
      applyTheme.t = setTimeout(function () { root.classList.remove("theme-switching"); }, 600);
    }); });
  }

  /* ---------------------------------------------------------
     Navigation: some ao rolar para baixo, volta ao rolar para cima
     --------------------------------------------------------- */
  var nav = document.getElementById("site-nav");
  var menuBtn = document.getElementById("menu-btn");
  var lastY = window.scrollY;
  var ticking = false;
  var THRESHOLD = 8;

  function setMenuIcon(open) {
    menuBtn.innerHTML = '<i data-lucide="' + (open ? "x" : "menu") + '" aria-hidden="true"></i>';
    if (window.lucide) window.lucide.createIcons();
  }
  var backdrop = document.getElementById("nav-backdrop");
  function setMenu(open) {
    nav.classList.toggle("menu-open", open);
    if (backdrop) backdrop.classList.toggle("is-open", open);
    document.documentElement.style.overflow = open ? "hidden" : ""; // página não rola com o menu aberto
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? tr("Fechar menu", "Close menu") : tr("Abrir menu", "Open menu"));
    setMenuIcon(open);
  }

  // A navegação fica visível enquanto os projetos sobem por cima da hero
  // e só começa a sumir (ao descer) quando eles já cobrem boa parte da tela.
  var NAV_HIDE_AT = 0.72;
  // depois de clicar numa opção do menu, a navegação fica à vista durante a rolagem até a seção
  // (a pessoa vê onde está). Volta ao normal no próximo gesto de rolagem dela.
  var keepNav = false, autoScrolling = false;
  function releaseNav() { if (keepNav && !autoScrolling) keepNav = false; }
  window.addEventListener("wheel", releaseNav, { passive: true });
  window.addEventListener("touchstart", releaseNav, { passive: true });
  window.addEventListener("keydown", releaseNav);

  var work = document.getElementById("trabalho");
  var about = document.getElementById("sobre");
  var hero = document.querySelector(".hero");
  var lastHp = null;
  function coverage() {
    if (!work) return 1;
    // 0 com a página no topo, 1 quando os projetos chegam ao topo da tela
    var start = work.getBoundingClientRect().top + window.scrollY;
    return window.scrollY / Math.max(1, start);
  }

  function onScroll() {
    var y = window.scrollY;
    var delta = y - lastY;
    var canHide = coverage() >= NAV_HIDE_AT;
    if (!canHide) nav.classList.remove("is-hidden");
    if (Math.abs(delta) > THRESHOLD) {
      if (delta > 0 && canHide && !keepNav && !nav.classList.contains("menu-open")) {
        nav.classList.add("is-hidden");
      } else if (delta < 0) {
        nav.classList.remove("is-hidden");
      }
      lastY = y;
    }
    updateHero();

    updateCards();
    updateDeck();
    ticking = false;
  }

  /* ---------------------------------------------------------
     Hero → projetos → sobre mim
     A grade de fundo continua o tempo todo. A hero fica presa no topo e, conforme
     os projetos sobem, ela recua (sobe devagar, diminui e apaga) até sumir:
     os projetos tomam a tela. --hp vai de 0 (projetos fora da tela) a 1 (cobrindo tudo).
     (A versão com a "gaveta" e o ímã está salva em portfolio-snapshots/v129-com-gaveta.)
     --------------------------------------------------------- */
  // a seção de projetos começa fora da tela e "alcança" o lugar nos primeiros 50% de tela rolados
  function updateLift() {
    if (!work) return;
    var vh = window.innerHeight;
    var t = reduceMotion ? 1 : Math.min(1, window.scrollY / (vh * 0.5));
    work.style.setProperty("--lift", ((1 - t) * (vh * 0.24 + 60)).toFixed(1) + "px");   // +60: nem a sombra do card aparece ao abrir
  }
  function updateHero() {
    updateLift();
    var cov = Math.min(Math.max(coverage(), 0), 1);
    if (hero && !reduceMotion) {
      var hp = cov.toFixed(3);
      if (hp !== lastHp) {
        lastHp = hp;
        hero.style.setProperty("--hp", hp);
        hero.classList.toggle("is-gone", cov >= .45);   // invisível: não recebe clique nem foco
      }
    }
    // link ativo: a seção que ocupa a metade de cima da tela
    var mid = window.innerHeight * .5;
    if (about && about.getBoundingClientRect().top < mid) setActive("sobre");
    else if (work && work.getBoundingClientRect().top < mid) setActive("trabalho");
    else setActive("inicio");
  }

  /* ---------------------------------------------------------
     Rolagem suave e contínua (Lenis): a roda do mouse e o trackpad deslizam
     de forma linear, sem "ímã" nem trava entre as seções.
     As páginas dos cases e o visualizador de imagens têm rolagem própria (prevent).
     --------------------------------------------------------- */
  // Rolagem 100% nativa do navegador em todo o site (igual à das páginas dos cases).
  // Sem biblioteca de rolagem: no iPhone ela fazia a página voltar para o topo.
  function smoothTo(y) {
    window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
  }

  // links do menu e da hero: rolagem suave até a seção, com a navegação à mostra
  document.querySelectorAll('a[href$="#trabalho"]:not(.case-card), a[href$="#inicio"], a[href$="#sobre"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href").split("#")[1];
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      keepNav = true; autoScrolling = true;
      nav.classList.remove("is-hidden");
      var y = id === "inicio" ? 0 : target.getBoundingClientRect().top + window.scrollY - (id === "sobre" ? nav.offsetHeight : 0);
      // "Trabalho": para onde o primeiro card já fica centralizado na tela
      if (id === "trabalho" && deckLive) y = deck.getBoundingClientRect().top + window.scrollY - stickyTop + 2 - (parseFloat(work.style.getPropertyValue("--lift")) || 0);
      smoothTo(y);
      clearTimeout(a._t); a._t = setTimeout(function () { autoScrolling = false; }, 1200);
      try { history.replaceState(null, "", "#" + id); } catch (err) {}
    });
  });
  window.addEventListener("resize", updateHero);
  window.addEventListener("load", updateHero);
  window.addEventListener("scroll", function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });

  // Se o foco do teclado entrar na nav escondida, ela reaparece
  nav.addEventListener("focusin", function () { nav.classList.remove("is-hidden"); });

  menuBtn.addEventListener("click", function () { setMenu(!nav.classList.contains("menu-open")); });
  if (backdrop) backdrop.addEventListener("click", function () { setMenu(false); });
  document.querySelectorAll("#mobile-panel a").forEach(function (a) {
    a.addEventListener("click", function () { setMenu(false); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("menu-open")) { setMenu(false); menuBtn.focus(); }
  });

  /* Link ativo: Início, Trabalho ou Sobre mim, conforme a seção na tela (updateHero) */
  var activeId = null;
  function setActive(id) {
    if (id === activeId) return;
    activeId = id;
    document.querySelectorAll("[data-section]").forEach(function (l) {
      var on = l.dataset.section === id;
      l.classList.toggle("is-active", on);
      if (on) l.setAttribute("aria-current", "location"); else l.removeAttribute("aria-current");
    });
  }
  updateHero();

  /* ---------------------------------------------------------
     Saudação em vários idiomas ("Olá, me chamo" → …)
     --------------------------------------------------------- */
  var GREETINGS = [
    { text: "Olá, me chamo", lang: "pt-BR" },
    { text: "Hi, my name is", lang: "en" },
    { text: "Hola, me llamo", lang: "es" },
    { text: "Bonjour, je m'appelle", lang: "fr" },
    { text: "Ciao, mi chiamo", lang: "it" },
    { text: "Hallo, ich heiße", lang: "de" },
    { text: "こんにちは、私は", lang: "ja" }
  ];
  /* Troca de idioma: leva junto o case aberto (ou a seção do endereço) */
  document.querySelectorAll(".lang-opt").forEach(function (a) {
    a.addEventListener("click", function (e) {
      if (a.classList.contains("is-active")) { e.preventDefault(); return; }
      var hash = location.hash;
      if (hash) { e.preventDefault(); location.href = a.getAttribute("href").split("#")[0] + hash; }
    });
  });

  var GREETING_INTERVAL = 2600; // ms que cada idioma fica na tela

  var greetBox = document.getElementById("greeting");
  if (greetBox) {
    // começa pela saudação no idioma da página
    var gi = Math.max(0, GREETINGS.findIndex(function (g) { return g.lang.slice(0, 2) === (EN ? "en" : "pt"); }));
    var fitWidth = function () {
      var w = greetBox.querySelector(".greeting-word:not(.is-leaving)");
      if (w) greetBox.style.width = w.offsetWidth + "px";
    };
    fitWidth();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitWidth);
    window.addEventListener("resize", fitWidth);

    var nextGreeting = function () {
      var current = greetBox.querySelector(".greeting-word:not(.is-leaving)");
      gi = (gi + 1) % GREETINGS.length;

      var el = document.createElement("span");
      el.className = "greeting-word is-entering";
      el.lang = GREETINGS[gi].lang;
      el.textContent = GREETINGS[gi].text;
      greetBox.appendChild(el);

      greetBox.style.width = el.offsetWidth + "px"; // a largura acompanha a nova palavra
      void el.offsetWidth;                          // força o reflow para a transição rodar
      el.classList.remove("is-entering");
      if (current) {
        current.classList.add("is-leaving");
        setTimeout(function () { current.remove(); }, 550);
      }
    };

    if (!reduceMotion) {
      var greetTimer = setInterval(nextGreeting, GREETING_INTERVAL);
      document.addEventListener("visibilitychange", function () {
        clearInterval(greetTimer);
        if (!document.hidden) greetTimer = setInterval(nextGreeting, GREETING_INTERVAL);
      });
    }
  }

  /* ---------------------------------------------------------
     Cards de case
     1. Entrada: o card "acende" conforme sobe na tela (ligado à rolagem).
     2. Cursor estilo Figma sobre os cards.
     --------------------------------------------------------- */
  var cards = document.querySelectorAll(".case-card");
  // entram do mesmo jeito: os cards e os blocos do "Sobre mim" ([data-rise])
  var risers = document.querySelectorAll(".case-card:not(.deck .case-card), [data-rise]");
  // progresso de entrada de cada card, ligado à rolagem (para todos os cards, inclusive o 1º)
  var CARD_START = 1.0;   // começa quando o topo do card chega ao pé da tela
  var CARD_END = 0.6;    // termina quando o topo do card chega a 45% da altura da tela
  function updateCards() {
    if (reduceMotion) return;
    var vh = window.innerHeight;
    risers.forEach(function (c) {
      var top = c.getBoundingClientRect().top;
      var p = (vh * CARD_START - top) / (vh * (CARD_START - CARD_END));
      p = Math.max(0, Math.min(1, p));
      c.style.setProperty("--p", p.toFixed(3));
    });
  }
  if (reduceMotion) risers.forEach(function (c) { c.style.setProperty("--p", 1); });

  /* ---------------------------------------------------------
     Pilha de cards (pasta): o palco fica preso no topo enquanto a pessoa rola.
     Cada card sobe de baixo por cima do anterior; os que ficam atrás recuam
     STEP px para cima e diminuem um pouco, deixando a aba à mostra.
     --------------------------------------------------------- */
  var deck = document.querySelector("[data-deck]");
  var deckItems = deck ? [].slice.call(deck.querySelectorAll(".deck-item")) : [];
  var deckStage = deck ? deck.querySelector(".deck-stage") : null;
  var deckLive = !!deck && !reduceMotion && deckItems.length > 1;
  var STEP = 48, SEG = 0.8, stickyTop = 0, segPx = 0, holdPx = 0, exitPx = 0;
  var aboutSec = document.getElementById("sobre");
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  var shiftK = 0;   // quanto a pilha desce a cada card que entra, para continuar centralizada
  function measureDeck() {
    if (!deckLive) return;
    var vh = window.innerHeight, n = deckItems.length, mobile = window.innerWidth <= 760;
    // abas mais juntas em telas baixas, para sobrar altura para o card
    STEP = Math.round(Math.max(30, Math.min(mobile ? 44 : 54, vh * 0.06)));
    deck.style.height = ""; deckStage.style.height = "";
    var navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 59;
    var tabH = parseFloat(getComputedStyle(deck).getPropertyValue("--tab-h")) || 48;
    var GAP = 20;
    // altura do card: alta (cerca de 2/3 da tela), mas a pilha inteira sempre cabe entre a navegação e o pé da tela
    deck.style.setProperty("--deck-card-h", "0px");
    var hNat = 0;
    deckItems.forEach(function (it) { it.style.transform = ""; hNat = Math.max(hNat, it.offsetHeight); });
    var desired = tabH + Math.min(720, vh * (mobile ? 0.68 : 0.66));
    var maxItem = vh - navH - (n - 1) * STEP - GAP * 2;
    var itemH = Math.max(hNat, Math.min(desired, maxItem));
    deck.style.setProperty("--deck-card-h", Math.round(itemH - tabH) + "px");
    var hMax = 0;
    deckItems.forEach(function (it) { hMax = Math.max(hMax, it.offsetHeight); });
    // centralização: a pilha (abas de trás + card da frente) fica no meio da área abaixo da navegação.
    // Com um card só, ele fica no meio; a cada card que entra a pilha desce meia aba, e continua no meio.
    var free = vh - navH - hMax - (n - 1) * STEP;
    if (free >= 16) {
      stickyTop = Math.round(navH + (vh - navH - hMax) / 2);
      shiftK = STEP / 2;
    } else {
      // tela baixa demais para a pilha toda: abas mais juntas e o card encostado embaixo, sempre inteiro
      STEP = Math.round(Math.max(24, Math.min(STEP, (vh - navH - hMax - 16) / (n - 1))));
      stickyTop = Math.round(Math.max((n - 1) * STEP + 8, vh - 8 - hMax));
      shiftK = 0;
    }
    // cada card sobe na mesma velocidade da rolagem (1 para 1), igual ao resto da página
    segPx = vh - stickyTop + 40;
    deckStage.style.top = stickyTop + "px";
    deckStage.style.height = hMax + "px";
    // depois do último card: pausa curta e a saída (a pilha recua como a hero, e o "Sobre mim" sobe por cima)
    holdPx = vh * 0.12; exitPx = vh * 0.55;
    deck.style.height = (hMax + (n - 1) * segPx + holdPx + exitPx) + "px";
    if (aboutSec) aboutSec.style.marginTop = (-exitPx) + "px";
    updateDeck();
  }
  function updateDeck() {
    if (!deckLive) return;
    var n = deckItems.length, vh = window.innerHeight;
    var scrolled = stickyTop - deck.getBoundingClientRect().top;
    var k = Math.max(0, Math.min(n - 1, scrolled / segPx));   // 0 → n-1: quantos cards já subiram
    // saída: 0 → 1 enquanto o "Sobre mim" sobe (mesmo recuo da hero: sobe, diminui, desfoca e apaga)
    // a saída segue a chegada do "Sobre mim": a pilha só termina de sumir quando a foto e o texto já estão no alto da tela
    var intro = aboutSec && aboutSec.querySelector(".about-intro");
    var e = intro ? Math.max(0, Math.min(1, (vh * 0.92 - intro.getBoundingClientRect().top) / (vh * 0.62)))
                  : Math.max(0, Math.min(1, (scrolled - (n - 1) * segPx - holdPx) / exitPx));
    deckStage.style.setProperty("--xp", e.toFixed(3));
    deckStage.style.setProperty("--ks", (k * shiftK).toFixed(1) + "px");
    deckStage.classList.toggle("is-gone", e >= .98);
    deckItems.forEach(function (it, i) {
      var enter = i === 0 ? 1 : Math.max(0, Math.min(1, k - (i - 1)));
      var depth = Math.max(0, k - i);
      var y = enter < 1 ? (1 - enter) * segPx : -depth * STEP;
      var s = 1 - depth * 0.038;
      it.style.transform = "translate3d(0," + y.toFixed(1) + "px,0) scale(" + s.toFixed(4) + ")";
      it.style.zIndex = 10 + i;
      it.style.setProperty("--dd", depth.toFixed(3));
      it.classList.toggle("is-behind", depth > .5);
    });
  }
  if (deckLive) {
    deck.classList.add("is-live");
    measureDeck();
    // no celular, a barra de endereço aparece e some ao rolar e muda a altura da tela:
    // só remede a pilha quando a largura muda ou a altura muda muito (girar o aparelho)
    var lastW = window.innerWidth, lastH = window.innerHeight;
    window.addEventListener("resize", function () {
      var w = window.innerWidth, h = window.innerHeight;
      if (w === lastW && Math.abs(h - lastH) < 160) { updateDeck(); return; }
      lastW = w; lastH = h; measureDeck();
    });
    window.addEventListener("load", measureDeck);
    // clicar na aba de um card que ficou atrás leva até ele
    deckItems.forEach(function (it, i) {
      var tab = it.querySelector(".case-tab");
      if (tab) tab.addEventListener("click", function () {
        var y = deck.getBoundingClientRect().top + window.scrollY - stickyTop + i * segPx + 2;
        smoothTo(y);
      });
    });
  }
  updateCards();
  window.addEventListener("resize", updateCards);

  /* Cursor estilo Figma: seta colorida + etiqueta com o texto do card (data-cursor) */
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (finePointer && cards.length) {
    document.documentElement.classList.add("has-figma-cursor");
    var cursor = document.createElement("div");
    cursor.className = "figma-cursor";
    cursor.setAttribute("aria-hidden", "true");
    cursor.innerHTML = '<i data-lucide="mouse-pointer-2"></i><span class="figma-cursor-label"></span>';
    document.body.appendChild(cursor);
    if (window.lucide) window.lucide.createIcons();
    var cursorLabel = cursor.querySelector(".figma-cursor-label");

    // O card sob o mouse é recalculado a cada movimento E a cada rolagem:
    // ao rolar sem mexer o mouse, os cards passam por baixo do cursor e o
    // navegador não avisa "entrou/saiu", então verificamos na mão.
    var ptrX = -1, ptrY = -1, currentCard = null, scrollTick = false;
    var syncCursor = function () {
      if (ptrX < 0) return;
      cursor.style.translate = ptrX + "px " + ptrY + "px";
      var el = document.elementFromPoint(ptrX, ptrY);
      var card = el ? el.closest(".case-card:not(.case-card--soon), [data-cursor]") : null;
      if (card !== currentCard) {
        currentCard = card;
        if (card) {
          cursorLabel.textContent = card.dataset.cursor || "Ver case";
          var cs = getComputedStyle(card);
          cursor.style.setProperty("--cursor-color", cs.getPropertyValue("--cursor-color"));
          // cor do texto da etiqueta (cores claras, como o turquesa do Meu Ônibus, pedem texto escuro)
          cursor.style.setProperty("--cursor-ink", cs.getPropertyValue("--cursor-ink").trim() || "#fff");
        }
      }
      cursor.classList.toggle("is-on", !!card);
      // com a etiqueta à mostra, a seta do sistema some em qualquer elemento (não depende do :hover,
      // que o navegador só atualiza quando o mouse mexe, e por isso falhava ao rolar com o mouse parado)
      document.documentElement.classList.toggle("figma-on", !!card);
    };
    window.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      ptrX = e.clientX; ptrY = e.clientY;
      syncCursor();
    }, { passive: true });
    // capture: também pega a rolagem da página do case (que rola dentro de .case-view)
    document.addEventListener("scroll", function () {
      if (scrollTick) return;
      scrollTick = true;
      requestAnimationFrame(function () { scrollTick = false; syncCursor(); });
    }, { passive: true, capture: true });
    document.documentElement.addEventListener("mouseleave", function () {
      currentCard = null; cursor.classList.remove("is-on"); document.documentElement.classList.remove("figma-on");
    });
  }
})();
