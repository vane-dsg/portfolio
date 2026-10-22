/* ---------------------------------------------------------
   Rolagem suave só para a roda do mouse, no computador.
   - Trackpad, teclado, barra de rolagem e celular continuam com a rolagem nativa.
   - Vale para a home e para as páginas dos cases (mesma sensação em todo o site).
   - Quem pede menos movimento no sistema fica com a rolagem nativa.
   --------------------------------------------------------- */
(function () {
  "use strict";

  if (!window.matchMedia) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  // só em telas com mouse (celular e tablet ficam de fora)
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  // Sensação parecida com a do trackpad: cada "dente" da roda anda pouco
  // e a página desliza e desacelera, em vez de pular um bloco grande de uma vez.
  var EASE = 6;          // quanto maior, mais rápido chega ao destino (6 ≈ 0,6s até parar)
  var STEP = 110;        // px por dente da roda
  var STEP_MAX = 170;    // limite por evento (o Mac acelera a roda e manda saltos enormes)
  var GESTURE_GAP = 80;  // ms: eventos mais próximos que isso são o mesmo gesto

  var lastTime = 0, lastKind = null;

  // Mouse: a roda manda "dentes" (wheelDelta em múltiplos de 120, ou em linhas no Firefox).
  // Trackpad: valores contínuos, quebrados, às vezes na diagonal.
  function kindOf(e) {
    var now = e.timeStamp || Date.now();
    var sameGesture = now - lastTime < GESTURE_GAP;
    lastTime = now;
    if (sameGesture && lastKind) return lastKind;   // um gesto não muda de tipo no meio
    var k, wd = e.wheelDeltaY;
    if (e.deltaMode === 1 || e.deltaMode === 2) k = "mouse";
    else if (e.deltaX !== 0) k = "trackpad";
    else if (typeof wd === "number" && wd !== 0 && wd % 120 === 0) k = "mouse";
    else if (isSafariNotch(e.deltaY)) k = "mouse";
    // no trackpad o navegador manda wheelDelta = -3 × deltaY; no mouse, não
    else if (typeof wd === "number" && wd !== 0 && Math.abs(wd + 3 * e.deltaY) > 2) k = "mouse";
    else if (Number.isInteger(e.deltaY) && Math.abs(e.deltaY) >= 50) k = "mouse";
    else k = "trackpad";
    lastKind = k;
    return k;
  }

  // Safari no Mac: cada dente da roda vale 4,000244 (ou múltiplos, com a aceleração)
  var SAFARI_NOTCH = 4.000244140625;
  function isSafariNotch(dy) {
    var n = Math.abs(dy) / SAFARI_NOTCH;
    return !Number.isInteger(dy) && n >= 0.99 && Math.abs(n - Math.round(n)) < 0.001;
  }

  // distância de um evento do mouse, já normalizada
  function stepOf(e) {
    var dir = e.deltaY > 0 ? 1 : -1;
    var notches = typeof e.wheelDeltaY === "number" && e.wheelDeltaY !== 0 && e.wheelDeltaY % 120 === 0
      ? Math.abs(e.wheelDeltaY) / 120
      : isSafariNotch(e.deltaY) ? Math.round(Math.abs(e.deltaY) / SAFARI_NOTCH)
      : e.deltaMode === 1 ? Math.abs(e.deltaY) / 3
      : e.deltaMode === 2 ? 3
      : Math.abs(e.deltaY) / 100;
    return dir * Math.min(STEP_MAX, Math.max(1, notches) * STEP);
  }

  // diagnóstico: abra o site com ?wheel no endereço para ver o que o mouse envia
  var debug = /[?&]wheel\b/.test(location.search) && document.createElement("pre");
  if (debug) {
    debug.style.cssText = "position:fixed;left:8px;bottom:8px;z-index:99999;margin:0;padding:8px 10px;font:12px/1.4 monospace;background:#000c;color:#fff;border-radius:6px;pointer-events:none";
    document.addEventListener("DOMContentLoaded", function () { document.body.appendChild(debug); });
  }

  function isWindow(s) { return s === window; }
  function getTop(s) { return isWindow(s) ? window.scrollY : s.scrollTop; }
  function getMax(s) {
    return isWindow(s)
      ? document.documentElement.scrollHeight - window.innerHeight
      : s.scrollHeight - s.clientHeight;
  }
  function setTop(s, y) {
    // scrollTo(x, y) simples: versões do Safari recusam behavior "instant" e a rolagem travava
    if (isWindow(s)) window.scrollTo(0, y);
    else s.scrollTop = y;
  }

  // algum elemento entre o alvo e a página rola sozinho nessa direção? então deixa nativo
  function innerScrollable(el, stop, dy) {
    while (el && el !== stop && el !== document.body && el !== document.documentElement) {
      if (el.nodeType === 1) {
        var oy = getComputedStyle(el).overflowY;
        if ((oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight + 1) {
          if (dy > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 0) return true;
        }
      }
      el = el.parentNode;
    }
    return false;
  }

  var state = new Map(); // scroller → { target, current, last, raf }

  function step(s, st, t0) {
    st.raf = requestAnimationFrame(function (t) {
      // se a página foi rolada por outro meio (barra, teclado, link), para e respeita
      if (Math.abs(getTop(s) - st.last) > 2) { st.raf = 0; return; }
      var dt = Math.min(0.05, (t - t0) / 1000);
      st.current += (st.target - st.current) * (1 - Math.exp(-EASE * dt));
      if (Math.abs(st.target - st.current) < 0.5) st.current = st.target;
      setTop(s, st.current);
      st.last = getTop(s);
      if (st.current === st.target) { st.raf = 0; return; }
      step(s, st, t);
    });
  }

  window.addEventListener("wheel", function (e) {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.shiftKey) return;   // zoom e rolagem lateral: nativo
    var kind = kindOf(e);
    if (debug) debug.textContent = kind + "\ndeltaY " + e.deltaY + "  deltaX " + e.deltaX + "\nwheelDeltaY " + e.wheelDeltaY + "  mode " + e.deltaMode;
    if (kind !== "mouse") return;
    if (document.documentElement.style.overflow === "hidden") return;         // menu aberto
    var target = e.target;
    if (target.closest && target.closest(".vw, [data-native-wheel]")) return; // visualizador de imagens

    var view = target.closest && target.closest(".case-view");
    var s = view && getComputedStyle(view).overflowY !== "visible" ? view : window;

    var dy = stepOf(e);
    if (innerScrollable(target, isWindow(s) ? null : s, dy)) return;

    var st = state.get(s);
    if (!st) { st = { target: 0, current: 0, last: 0, raf: 0 }; state.set(s, st); }
    if (!st.raf) { st.current = st.target = st.last = getTop(s); }

    var max = getMax(s);
    var next = Math.max(0, Math.min(max, st.target + dy));
    if (next === st.target && !st.raf) return; // já no limite
    e.preventDefault();
    st.target = next;
    if (!st.raf) step(s, st, performance.now());
  }, { passive: false });
})();
