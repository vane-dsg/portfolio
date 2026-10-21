/* =========================================================
   Visualizador da página do case
   - [data-viewer="diagram"]: o quadro cresce até preencher a tela.
     Zoom só com a rolagem do mouse (ou pinça no toque) e arrastar
     para mover, como a mãozinha do Figma. Botão X e Esc fecham.
   - [data-viewer="photo"]: a foto sai do lugar e fica por cima da
     página, com o fundo escurecido e borrado. Clique fora, X ou Esc fecham.
   As duas transições usam a mesma curva e duração da troca card → case.
   ========================================================= */
(function () {
  "use strict";

  var EASE = "cubic-bezier(.32, .72, 0, 1)";   // igual a js/case-view.js
  var DUR = 600;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;

  /* ---------- estrutura (criada uma vez) ---------- */
  var vw = document.createElement("div");
  vw.className = "vw";
  vw.hidden = true;
  vw.setAttribute("role", "dialog");
  vw.setAttribute("aria-modal", "true");
  vw.innerHTML =
    '<div class="vw-backdrop"></div>' +
    '<div class="vw-stage"><img class="vw-img" alt="" draggable="false"></div>' +
    '<button class="vw-close vw-chrome" type="button" aria-label="Fechar"><i data-lucide="x" aria-hidden="true"></i></button>' +
    '<p class="vw-hint vw-chrome" aria-hidden="true"></p>';
  document.body.appendChild(vw);
  if (window.lucide) window.lucide.createIcons();

  var backdrop = vw.querySelector(".vw-backdrop");
  var stage = vw.querySelector(".vw-stage");
  var img = vw.querySelector(".vw-img");
  var closeBtn = vw.querySelector(".vw-close");
  var hint = vw.querySelector(".vw-hint");

  var st = null;          // estado do que está aberto
  var busy = false;       // durante as animações de abrir/fechar

  function frameRect(el) { return el.getBoundingClientRect(); }
  function radiusOf(el) { return parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0; }
  function insetOf(r, rad) {
    var W = window.innerWidth, H = window.innerHeight;
    return "inset(" + r.top + "px " + (W - r.right) + "px " + (H - r.bottom) + "px " + r.left + "px round " + rad + "px)";
  }
  function tf(x, y, s) { return "translate(" + x + "px, " + y + "px) scale(" + s + ")"; }

  /* Nitidez no zoom: durante o gesto a imagem só é esticada (rápido), e quando o gesto para
     ela é redesenhada no tamanho real da tela (largura e altura de verdade, escala 1).
     Assim o navegador volta a usar os pixels do arquivo em vez de ampliar um bitmap pequeno,
     que era o que deixava tudo borrado no celular. st.cs = escala já "assentada". */
  var settleT = 0;
  function size(cs) {
    st.cs = cs;
    img.style.width = st.bw * cs + "px"; img.style.height = st.bh * cs + "px";
  }
  function apply() {
    img.style.transform = tf(st.tx, st.ty, st.s / st.cs);
    clearTimeout(settleT);
    if (st.cs !== Math.min(st.s, st.nw / st.bw)) settleT = setTimeout(settle, 140);
    vw.classList.toggle("is-zoomed", st.s > 1.01);
  }
  function settle() {
    if (!st || busy || pts.size) return;   // espera os dedos saírem da tela
    // além do tamanho real do arquivo não há mais detalhe: dali em diante só estica (e poupa memória no celular)
    size(Math.min(st.s, st.nw / st.bw));
    img.style.transform = tf(st.tx, st.ty, st.s / st.cs);
  }

  // tamanho em que a imagem cabe inteira na tela (escala 1 do zoom)
  function fit() {
    var W = window.innerWidth, H = window.innerHeight;
    var small = W < 700;
    var padX = st.mode === "photo" ? (small ? 16 : 64) : (small ? 12 : 48);
    var padY = st.mode === "photo" ? (small ? 72 : 72) : (small ? 72 : 80);
    var k = Math.min((W - padX * 2) / st.nw, (H - padY * 2) / st.nh);
    if (st.mode === "photo") k = Math.min(k, 1);   // foto não passa do tamanho real
    st.bw = st.nw * k; st.bh = st.nh * k;
    size(1);
    st.fx = (W - st.bw) / 2; st.fy = (H - st.bh) / 2;
    st.s = 1; st.tx = st.fx; st.ty = st.fy;
    st.maxS = Math.max(3, (st.nw / st.bw) * 1.6);   // até ~1,6× o tamanho real do arquivo
  }

  /* ---------- abrir ---------- */
  function open(trigger) {
    if (st || busy) return;
    var src = trigger.querySelector("img");
    if (!src) return;
    st = {
      trigger: trigger, src: src, mode: trigger.dataset.viewer === "diagram" ? "diagram" : "photo",
      nw: src.naturalWidth || +src.getAttribute("width"), nh: src.naturalHeight || +src.getAttribute("height")
    };
    img.src = src.currentSrc || src.src;
    img.alt = src.alt || "";
    vw.setAttribute("aria-label", trigger.getAttribute("aria-label") || "Imagem ampliada");
    hint.innerHTML = "";
    vw.className = "vw is-" + st.mode;
    vw.hidden = false;
    root.classList.add("vw-open");
    fit();

    var r = frameRect(src);
    var s0 = r.width / st.bw;
    var from = tf(r.left, r.top, s0);
    apply();

    trigger.style.visibility = "hidden";
    if (reduceMotion) { ready(); return; }
    busy = true;
    var anims = [img.animate([{ transform: from }, { transform: img.style.transform }], { duration: DUR, easing: EASE })];
    if (st.mode === "diagram") {
      // o fundo do quadro cresce do lugar dele até a tela toda
      anims.push(backdrop.animate([
        { clipPath: insetOf(frameRect(trigger), radiusOf(trigger)) },
        { clipPath: "inset(0px 0px 0px 0px round 0px)" }
      ], { duration: DUR, easing: EASE }));
    } else {
      anims.push(backdrop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: DUR * .8, easing: "ease" }));
      anims.push(img.animate([{ borderRadius: radiusOf(trigger) / s0 + "px" }, { borderRadius: "10px" }], { duration: DUR, easing: EASE }));
    }
    anims[0].onfinish = ready;
  }
  function ready() {
    busy = false;
    vw.classList.add("is-ready");
    closeBtn.focus({ preventScroll: true });
  }

  /* ---------- fechar ---------- */
  function close() {
    if (!st || busy) return;
    var cur = st, trigger = cur.trigger;
    vw.classList.remove("is-ready");
    function done() {
      busy = false;
      vw.hidden = true;
      vw.className = "vw";
      root.classList.remove("vw-open");
      trigger.style.visibility = "";
      clearTimeout(settleT);
      img.removeAttribute("src");
      img.style.transform = "";
      vw.classList.remove("is-zoomed");
      st = null;
      trigger.focus({ preventScroll: true });
    }
    if (reduceMotion) { done(); return; }
    busy = true;
    // volta para o lugar de origem (que pode ter mudado se a janela mudou de tamanho)
    trigger.style.visibility = "hidden";
    var r = frameRect(cur.src);
    var to = tf(r.left, r.top, r.width / (cur.bw * cur.cs));
    var a = img.animate([{ transform: img.style.transform }, { transform: to }], { duration: DUR, easing: EASE, fill: "forwards" });
    if (cur.mode === "diagram") {
      backdrop.animate([
        { clipPath: "inset(0px 0px 0px 0px round 0px)" },
        { clipPath: insetOf(frameRect(trigger), radiusOf(trigger)) }
      ], { duration: DUR, easing: EASE, fill: "forwards" });
    } else {
      backdrop.animate([{ opacity: 1 }, { opacity: 0 }], { duration: DUR * .8, easing: "ease", fill: "forwards" });
    }
    a.onfinish = function () {
      img.getAnimations().forEach(function (x) { x.cancel(); });
      backdrop.getAnimations().forEach(function (x) { x.cancel(); });
      done();
    };
  }

  /* ---------- zoom com a rolagem (só nos diagramas) ---------- */
  function zoomAt(cx, cy, ns) {
    ns = Math.max(.6, Math.min(st.maxS, ns));
    st.tx = cx - (cx - st.tx) * (ns / st.s);
    st.ty = cy - (cy - st.ty) * (ns / st.s);
    st.s = ns;
    apply();
  }
  // pinça do trackpad (chega como ctrl + rolagem) dá zoom; a rolagem comum só move a imagem ampliada
  stage.addEventListener("wheel", function (e) {
    e.preventDefault();
    if (!st || busy) return;
    var k = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
    if (e.ctrlKey || e.metaKey) {
      zoomAt(e.clientX, e.clientY, st.s * Math.exp(-e.deltaY * k * 0.01));
    } else if (st.s > 1.01) {
      st.tx -= e.deltaX * k; st.ty -= e.deltaY * k; apply();
    }
  }, { passive: false });

  function onImage(x, y) {
    var r = img.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  }
  // clique na imagem: amplia no ponto clicado; com zoom, volta ao tamanho inteiro (animado)
  function toggleZoom(x, y) {
    var from = img.style.transform;
    if (st.s > 1.01) { st.s = 1; st.tx = st.fx; st.ty = st.fy; size(1); }
    else zoomAt(x, y, Math.min(st.maxS, Math.max(2.2, st.nw / st.bw)));
    apply();
    if (!reduceMotion) img.animate([{ transform: from }, { transform: img.style.transform }], { duration: 380, easing: EASE });
  }

  /* ---------- arrastar (mãozinha) e pinça no toque ---------- */
  var pts = new Map(), pinch = null, moved = false;
  stage.addEventListener("pointerdown", function (e) {
    if (!st || busy) return;
    if (e.button !== undefined && e.button !== 0) return;
    moved = false;
    // sem zoom, o mouse não arrasta: o clique amplia (na imagem) ou fecha (fora dela)
    if (st.s <= 1.01 && e.pointerType === "mouse") return;
    stage.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    stage.classList.add("is-dragging");
    if (pts.size === 2) {
      var p = Array.from(pts.values());
      pinch = { d: Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y), s: st.s };
    }
  });
  stage.addEventListener("pointermove", function (e) {
    if (!st || !pts.has(e.pointerId)) return;
    var prev = pts.get(e.pointerId);
    var cur = { x: e.clientX, y: e.clientY };
    pts.set(e.pointerId, cur);
    if (Math.abs(cur.x - prev.x) + Math.abs(cur.y - prev.y) > 2) moved = true;
    if (pts.size === 1) {
      st.tx += cur.x - prev.x; st.ty += cur.y - prev.y; apply();
    } else if (pts.size === 2 && pinch) {
      var p = Array.from(pts.values());
      var mx = (p[0].x + p[1].x) / 2, my = (p[0].y + p[1].y) / 2;
      var d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
      // o ponto médio acompanha os dedos e a escala segue a distância entre eles
      st.tx += (cur.x - prev.x) / 2; st.ty += (cur.y - prev.y) / 2;
      zoomAt(mx, my, pinch.s * d / pinch.d);
    }
  });
  function endPointer(e) {
    pts.delete(e.pointerId);
    if (pts.size < 2) pinch = null;
    if (!pts.size) { stage.classList.remove("is-dragging"); if (st) settle(); }
  }
  stage.addEventListener("pointerup", endPointer);
  stage.addEventListener("pointercancel", endPointer);

  // padrão de visualizador: clique na imagem dá/tira o zoom, clique fora fecha
  stage.addEventListener("click", function (e) {
    if (!st || busy || moved) return;
    if (onImage(e.clientX, e.clientY)) toggleZoom(e.clientX, e.clientY);
    else close();
  });
  // cursor: lupa + sobre a imagem, lupa - quando ampliada, seta normal fora dela
  stage.addEventListener("mousemove", function (e) {
    if (!st || pts.size) return;
    stage.classList.toggle("is-over", onImage(e.clientX, e.clientY));
  });
  closeBtn.addEventListener("click", close);

  /* ---------- teclado ---------- */
  window.addEventListener("keydown", function (e) {
    if (!st) return;
    if (e.key === "Escape") {
      e.preventDefault(); e.stopPropagation();   // não fecha o case junto
      close();
    } else if (e.key === "Tab") {
      e.preventDefault(); closeBtn.focus();      // o foco fica no visualizador
    } else if ((e.key === "+" || e.key === "=" || e.key === "-")) {
      zoomAt(window.innerWidth / 2, window.innerHeight / 2, st.s * (e.key === "-" ? 1 / 1.25 : 1.25));
    }
  }, true);

  window.addEventListener("resize", function () {
    if (st && !busy) { fit(); apply(); vw.classList.remove("is-zoomed"); }
  });

  /* ---------- gatilhos ---------- */
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-viewer]");
    if (t) { e.preventDefault(); open(t); }
  });
  document.addEventListener("keydown", function (e) {
    if (st || (e.key !== "Enter" && e.key !== " ")) return;
    var t = e.target.closest && e.target.closest("[data-viewer]");
    if (t) { e.preventDefault(); open(t); }
  });
})();
