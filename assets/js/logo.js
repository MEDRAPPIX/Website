/* =========================================================
   MEDRAPPIX – Logo
   Das Originallogo („Medrappix Logo.png“) ist in vier Farbebenen
   zerlegt (Buchstaben, Leiterbahnen, Orange, Unterzeile), die als
   SVG-Masken dienen. So bleibt das Logo exakt das Original, die
   Farben sind per CSS steuerbar und jede Ebene ist animierbar.
   Koordinatensystem: 2000 × 492 (Seitenverhältnis des Originals).
   ========================================================= */
(function () {
  'use strict';

  var script = document.currentScript;
  var BASE = (script && script.src.replace(/js\/logo\.js.*$/, '')) || 'assets/';
  var IMG = BASE + 'img/logo/';
  var LAYERS = ['ink', 'blue', 'orange', 'grey'];
  var uid = 0;

  // Buchstaben-Spalten (für das schrittweise Aufbauen)
  var LETTERS = [[0, 297], [336, 535], [574, 772], [792, 990], [1010, 1247], [1267, 1466], [1485, 1684], [1703, 1743], [1763, 2000]];

  // Verlauf der Leiterbahnen (für das „Zeichnen“)
  var LINES = [
    'M578 178 V162 Q578 120 620 120 H1222 Q1270 120 1270 168 V178',
    'M1000 100 V82 Q1000 40 1042 40 H1657 Q1705 40 1705 88 V178',
    'M1728 120 H1907 Q1953 120 1953 166 V178',
    'M148 410 V420 Q148 466 194 466 H852',
    'M1826 466 H1907 Q1953 466 1953 420 V410'
  ];
  // Knoten: Punkte, Quadrate, Kreuz-Symbol
  var NODES = [
    ['c', 782, 120, 30], ['c', 1270, 40, 30], ['c', 316, 466, 30],
    ['r', 1000, 120, 34], ['r', 1705, 120, 34], ['r', 673, 466, 34],
    ['x', 1485, 50, 62]
  ];

  // Masken einmal vorladen – erst danach wird das SVG sichtbar geschaltet
  var ready = Promise.all(LAYERS.map(function (n) {
    return new Promise(function (resolve) {
      var im = new Image();
      im.onload = im.onerror = function () { resolve(); };
      im.src = IMG + 'logo-' + n + '.png';
    });
  }));

  function markup() {
    var id = 'mx' + (++uid);
    var mask = function (name) {
      return '<mask id="' + id + name + '" maskUnits="userSpaceOnUse" x="0" y="0" width="2000" height="492">' +
        '<image href="' + IMG + 'logo-' + name + '.png" width="2000" height="492" preserveAspectRatio="none"/></mask>';
    };
    var full = '<rect class="logo__fill" x="-10" y="-10" width="2020" height="512"/>';
    var s = '<svg class="logo" viewBox="0 0 2000 492" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' + LAYERS.map(mask).join('') + '</defs>';

    // Leiterbahnen + Knoten
    s += '<g class="logo__blue" mask="url(#' + id + 'blue)">' + full;
    LINES.forEach(function (d) { s += '<path class="logo__line" d="' + d + '"/>'; });
    NODES.forEach(function (n) {
      if (n[0] === 'c') s += '<circle class="logo__node" cx="' + n[1] + '" cy="' + n[2] + '" r="' + n[3] + '"/>';
      else s += '<rect class="logo__node' + (n[0] === 'x' ? ' logo__cross' : '') + '" x="' + (n[1] - n[3]) + '" y="' + (n[2] - n[3]) + '" width="' + n[3] * 2 + '" height="' + n[3] * 2 + '"/>';
    });
    s += '</g>';

    // Buchstaben
    s += '<g class="logo__ink" mask="url(#' + id + 'ink)">' + full;
    LETTERS.forEach(function (l) { s += '<rect class="logo__letter" x="' + (l[0] - 3) + '" y="185" width="' + (l[1] - l[0] + 6) + '" height="220"/>'; });
    s += '</g>';

    // Orange Akzente (Balken im E, Akzent am X)
    s += '<g class="logo__orange" mask="url(#' + id + 'orange)">' + full +
      '<rect class="logo__bar" x="330" y="262" width="172" height="62"/>' +
      '<rect class="logo__tick" x="1880" y="185" width="130" height="106"/></g>';

    // „Medical Software“
    s += '<g class="logo__grey" mask="url(#' + id + 'grey)">' + full + '<rect class="logo__tag" x="870" y="420" width="935" height="80"/></g>';
    return s + '</svg>';
  }

  function mount(el) {
    if (el.querySelector('svg.logo')) return el.querySelector('svg.logo');
    var holder = document.createElement('span');
    holder.innerHTML = markup();
    var svg = holder.firstChild;
    el.insertBefore(svg, el.firstChild);
    ready.then(function () { el.classList.add('has-logo'); });
    return svg;
  }

  /* Aufbau-Animation: Buchstaben, Leiterbahnen, Knoten, Unterzeile */
  function draw(svg) {
    var gsap = window.gsap;
    if (!gsap || !svg) return null;
    var q = function (sel) { return svg.querySelectorAll(sel); };
    var lines = q('.logo__line'), nodes = q('.logo__node'), letters = q('.logo__letter');
    var tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });

    gsap.set(q('.logo__fill'), { opacity: 0 });
    lines.forEach(function (p) {
      var len = p.getTotalLength();
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
    });
    gsap.set(letters, { y: 225 });
    gsap.set(nodes, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(q('.logo__bar'), { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(q('.logo__tick'), { scale: 0, transformOrigin: '0% 100%' });
    gsap.set(q('.logo__tag'), { scaleX: 0, transformOrigin: '0% 50%' });

    tl.to(letters, { y: 0, duration: .7, stagger: .045, ease: 'power4.out' }, 0)
      .to(q('.logo__bar'), { scaleX: 1, duration: .45, ease: 'power3.inOut' }, .32)
      .to(lines, { strokeDashoffset: 0, duration: .8, stagger: .07, ease: 'power2.inOut' }, .3)
      .to(nodes, { scale: 1, duration: .35, stagger: .04, ease: 'back.out(2.2)' }, .62)
      .to(q('.logo__tick'), { scale: 1, duration: .4 }, .7)
      .to(q('.logo__tag'), { scaleX: 1, duration: .6, ease: 'power2.inOut' }, .72)
      // Endzustand absichern: vollständige Ebenen einblenden, Hilfsformen zurücksetzen
      .set(q('.logo__fill'), { opacity: 1 })
      .set([lines, nodes, letters, q('.logo__bar'), q('.logo__tick'), q('.logo__tag')], { clearProps: 'all' });
    return tl;
  }

  window.MedrappixLogo = { mount: mount, draw: draw, ready: ready };

  document.querySelectorAll('[data-logo]').forEach(mount);
})();
