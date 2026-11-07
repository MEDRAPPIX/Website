/* =========================================================
   MEDRAPPIX – Hero-Animation & Logo-Intro (nur Startseite)

   Dramaturgie (≈ 12,5 s):
     0.0 – 2.1  Logo baut sich groß im oberen Bereich auf und gleitet in den Header
     1.4 – 5.0  Phase A · medizinische Fragmente erscheinen, leicht ungeordnet
     5.0 – 8.4  Phase B · Fragmente ordnen sich in ein Raster, werden zu
                Wireframe-Bausteinen; Leiterbahnen, Code, Gerätekonturen entstehen
     8.2 – 12.5 Phase C · drei fertige Oberflächen entstehen aus den Bausteinen
   Endzustand = statisches HTML (identisch zur Anzeige ohne Animation).

   Debug: ?heroT=6 hält die Animation bei Sekunde 6 an.
   ========================================================= */
(function () {
  'use strict';

  var d = document.documentElement;
  var wrap = document.getElementById('heroStage');
  var stage = document.getElementById('stage');
  if (!wrap || !stage) return;
  window.__mxHeroStarted = true;

  /* ---------- Bühne proportional skalieren ---------- */
  function fit() { wrap.style.setProperty('--s', (wrap.clientWidth / 960).toFixed(4)); }
  fit();
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(wrap);
  else window.addEventListener('resize', fit);

  var gsap = window.gsap;
  var replay = document.getElementById('heroReplay');
  var replayLabel = replay && replay.querySelector('span');
  var reduced = false;
  try { reduced = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  if (!gsap) { d.classList.remove('hero-anim', 'logo-intro'); return; }

  var $ = function (sel, root) { return (root || stage).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || stage).querySelectorAll(sel)); };

  var devBrowser = $('#devBrowser'), devTablet = $('#devTablet'), devPhone = $('#devPhone');
  var devices = [devBrowser, devTablet, devPhone];
  var grid = $('#stageGrid'), wires = $('#stageWires'), fragsLayer = $('#stageFrags'), code = $('#stageCode');
  var frags = $$('.frag');
  var textEls = Array.prototype.slice.call(document.querySelectorAll('.hero__text > *'));
  var caption = wrap.querySelector('.stage__caption');
  var claimHl = document.querySelector('.hero__claim .hl');
  var tl = null;

  function markSeen() { try { sessionStorage.setItem('mx-intro', '1'); } catch (e) {} }

  /* Zielrechteck eines UI-Bausteins im Designraster (unabhängig von der Skalierung) */
  function slotRect(name) {
    var el = $('[data-slot="' + name + '"]');
    var s = wrap.clientWidth / 960;
    var r = el.getBoundingClientRect(), sr = stage.getBoundingClientRect();
    return { x: (r.left - sr.left) / s, y: (r.top - sr.top) / s, w: r.width / s, h: r.height / s };
  }

  function deviceOf(frag) {
    var el = $('[data-slot="' + frag.getAttribute('data-target') + '"]');
    return el ? el.closest('.dev') : devBrowser;
  }

  function prepLines(paths) {
    paths.forEach(function (p) {
      var len = p.getTotalLength ? p.getTotalLength() : 1000;
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
    });
  }

  /* ---------- Hero-Zeitleiste ---------- */
  function buildHero(offset) {
    var t0 = offset || 0;
    var h = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });

    // Ziele messen, bevor irgendetwas verschoben wird
    var targets = frags.map(function (f) { return slotRect(f.getAttribute('data-target')); });

    // Ausgangszustände
    gsap.set(devices, { autoAlpha: 0, y: 14 });
    gsap.set([grid, wires, fragsLayer, code], { autoAlpha: 0 });
    gsap.set(fragsLayer, { autoAlpha: 1 });
    gsap.set($$('.code-chip'), { autoAlpha: 0, y: 6 });
    gsap.set($$('.w-node', wires), { scale: 0, transformOrigin: '50% 50%' });
    prepLines($$('.w-outline, .w-trace', wires));
    prepLines($$('.ecg'));
    prepLines($$('.chart-line'));
    gsap.set($$('.chart-area'), { opacity: 0 });
    gsap.set($$('.chart-pts'), { opacity: 0 });
    gsap.set($$('.dev .ui-card, .dev .br__side, .dev .br__top, .dev .tb__head, .dev .ph__head, .dev .seg, .dev .tb__foot, .dev .ph__tabs'), { opacity: 0 });
    if (claimHl) gsap.set(claimHl, { '--hl': 0 });

    frags.forEach(function (f) {
      var a = (f.getAttribute('data-from') || '0,0,100,60,0').split(',').map(Number);
      gsap.set(f, { x: a[0], y: a[1], width: a[2], height: a[3], rotation: a[4], autoAlpha: 0, scale: .94 });
      gsap.set(f.querySelector('.frag__med'), { opacity: 1 });
      gsap.set(f.querySelector('.frag__wire'), { opacity: 0 });
    });

    /* Phase A · medizinische Ausgangsinformationen */
    // untere Fragmente zuerst – oben gleitet in dieser Zeit noch das Logo in den Header
    var order = [6, 8, 11, 12, 7, 10, 5, 9, 13, 0, 3, 1, 2, 4];
    order.forEach(function (idx, k) {
      var f = frags[idx]; if (!f) return;
      var soft = k % 4 === 3; // einige Fragmente bleiben leicht unscharf / transparent
      h.to(f, { autoAlpha: soft ? .55 : .92, scale: 1, filter: soft ? 'blur(1.5px)' : 'blur(0px)', duration: .9, ease: 'power2.out' }, t0 + .6 + k * .17);
      // sanftes räumliches Treiben
      h.to(f, { x: '+=' + ((k % 2 ? -1 : 1) * (8 + (k * 7) % 14)), y: '+=' + ((k % 3 ? 1 : -1) * (6 + (k * 5) % 10)), duration: 3.6, ease: 'sine.inOut' }, t0 + .6 + k * .17);
    });
    h.to($$('.ecg'), { strokeDashoffset: 0, duration: 1.8, ease: 'none' }, t0 + .9);

    /* Phase B · Strukturierung und Entwicklung */
    var B = t0 + 4.2;
    h.to(grid, { autoAlpha: 1, duration: .9 }, B);
    frags.forEach(function (f, i) {
      var r = targets[i];
      h.to(f, { x: r.x, y: r.y, width: r.w, height: r.h, rotation: 0, scale: 1, autoAlpha: 1, filter: 'blur(0px)', duration: 1.35, ease: 'power3.inOut' }, B + .2 + i * .055);
      h.to(f.querySelector('.frag__med'), { opacity: 0, duration: .55 }, B + .75 + i * .055);
      h.to(f.querySelector('.frag__wire'), { opacity: 1, duration: .55 }, B + .75 + i * .055);
    });
    h.to(wires, { autoAlpha: 1, duration: .3 }, B + .8);
    h.to($$('.w-trace', wires), { strokeDashoffset: 0, duration: 1, stagger: .12, ease: 'power2.inOut' }, B + .9);
    h.to($$('.w-node', wires), { scale: 1, duration: .4, stagger: .08, ease: 'back.out(2.4)' }, B + 1.5);
    h.to(code, { autoAlpha: 1, duration: .2 }, B + .9);
    h.to($$('.code-chip'), { autoAlpha: 1, y: 0, duration: .5, stagger: .28 }, B + 1);
    h.to($$('.w-outline', wires), { strokeDashoffset: 0, duration: 1.2, stagger: .16, ease: 'power2.inOut' }, B + 1.7);

    /* Phase C · fertige digitale Anwendungen */
    var C = t0 + 7.4;
    h.to($$('.code-chip'), { autoAlpha: 0, y: -6, duration: .5, stagger: .08 }, C - .2);
    [devBrowser, devTablet, devPhone].forEach(function (dev, k) {
      var at = C + k * .55;
      var mine = frags.filter(function (f) { return deviceOf(f) === dev; });
      h.to(dev, { autoAlpha: 1, y: 0, duration: .9, ease: 'power3.out' }, at);
      h.to($$('.br__side, .br__top, .tb__head, .ph__head, .seg, .tb__foot, .ph__tabs', dev), { opacity: 1, duration: .6, stagger: .06 }, at + .2);
      h.to($$('.ui-card', dev), { opacity: 1, duration: .55, stagger: .07 }, at + .3);
      h.to(mine, { autoAlpha: 0, duration: .6, stagger: .05 }, at + .35);
    });
    h.to($$('#bpChart .chart-line'), { strokeDashoffset: 0, duration: 1.5, stagger: .15, ease: 'power2.inOut' }, C + .7);
    h.to($$('#bpChart .chart-area'), { opacity: 1, duration: .9 }, C + 1.4);
    h.to($$('#bpChart .chart-pts'), { opacity: 1, duration: .4 }, C + 2.1);
    h.to($$('#phChart .chart-line'), { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' }, C + 1.6);
    h.to($$('#phChart .chart-area'), { opacity: 1, duration: .9 }, C + 2.3);
    h.to($$('.ph__chart .chart-pts'), { opacity: 1, duration: .4 }, C + 2.9);
    h.to($$('.dev .lab .spark, .dev--tablet .steps'), { opacity: 1, duration: .3 }, C + 1);
    h.to([grid, wires], { autoAlpha: 0, duration: 1.1 }, C + 1.2);
    if (claimHl) h.to(claimHl, { '--hl': 1, duration: .8, ease: 'power3.inOut' }, C + 3.2);
    if (caption) h.fromTo(caption, { opacity: 0 }, { opacity: 1, duration: .6 }, C + 3.6);
    h.to({}, { duration: .2 }, C + 4.2); // ruhiges Ausklingen → Gesamtlänge ≈ 12,5 s
    return h;
  }

  /* ---------- Logo-Intro: groß aufbauen, dann in den Header gleiten ---------- */
  function buildLogoIntro(master) {
    var brand = document.getElementById('brand');
    var svg = brand && brand.querySelector('svg.logo');
    if (!brand || !svg || !window.MedrappixLogo) return 0;
    var r = brand.getBoundingClientRect();
    var vw = window.innerWidth, vh = window.innerHeight;
    var w = Math.min(560, vw * (vw < 700 ? .78 : .42));
    var k = w / r.width;
    var x = (vw - w) / 2 - r.left;
    var y = Math.max(r.bottom + 24, vh * .26 - (w * 492 / 2000) / 2) - r.top;
    var draw = window.MedrappixLogo.draw(svg);

    gsap.set(brand, { x: x, y: y, scale: k, transformOrigin: '0 0', opacity: 0 });
    d.classList.remove('logo-intro');
    gsap.set(['.main-nav', '.menu-toggle'], { opacity: 0 });
    master.to(brand, { opacity: 1, duration: .35, ease: 'power1.out' }, 0);
    if (draw) master.add(draw.paused(false), .05);
    master.to(brand, { x: 0, y: 0, scale: 1, duration: .9, ease: 'power3.inOut' }, 1.2);
    master.to(['.main-nav', '.menu-toggle'], { opacity: 1, duration: .6, clearProps: 'opacity' }, 1.75);
    master.set(brand, { clearProps: 'transform,opacity' }, 2.15);
    return 1.5; // Text erscheint, während das Logo in den Header gleitet
  }

  function finish() {
    d.classList.remove('hero-anim', 'logo-intro');
    gsap.set([grid, wires, code], { autoAlpha: 0 });
    gsap.set(fragsLayer, { autoAlpha: 0 });
    gsap.set(devices.concat(textEls, [caption]), { clearProps: 'all' });
    gsap.set($$('.dev *'), { clearProps: 'opacity,strokeDasharray,strokeDashoffset' });
    if (claimHl) gsap.set(claimHl, { clearProps: '--hl' });
    var brand = document.getElementById('brand');
    if (brand) gsap.set(brand, { clearProps: 'transform,opacity' });
    gsap.set(['.main-nav', '.menu-toggle'], { clearProps: 'opacity' });
    showReplay('Animation erneut abspielen');
  }

  function showReplay(label) {
    if (!replay || reduced) return;
    replay.hidden = false;
    if (replayLabel) replayLabel.textContent = label;
    gsap.to(replay, { opacity: 1, duration: .4 });
  }

  function play(withLogo) {
    if (tl) { tl.kill(); tl = null; }
    d.classList.add('hero-anim');
    markSeen();
    var master = gsap.timeline({ paused: true, onComplete: finish });
    var textAt = .3;
    if (withLogo) textAt = buildLogoIntro(master);
    master.add(buildHero(withLogo ? .8 : -.3).play(), 0);
    // Text links: früh lesbar, ruhig eingeblendet
    master.fromTo(textEls, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .8, stagger: .12, ease: 'power2.out' }, textAt);
    tl = master;
    if (replay) { showReplay('Animation überspringen'); }
    var tParam = /[?&]heroT=([\d.]+)/.exec(location.search);
    if (tParam) { master.seek(parseFloat(tParam[1])); master.pause(); return; }
    master.play(0);
  }

  if (replay) {
    replay.addEventListener('click', function () {
      if (tl && tl.isActive()) { tl.progress(1); return; }
      play(false);
    });
  }

  // Animation beenden, sobald der Hero den Bildschirm verlässt – kein Neustart beim Zurückscrollen
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (!en.isIntersecting && tl && tl.isActive()) tl.progress(1); });
    }, { threshold: 0.1 }).observe(document.getElementById('start') || wrap); // ganzer Hero, nicht nur die Bühne (auf Smartphones liegt sie unter dem ersten Bildschirm)
  }

  if (d.classList.contains('hero-anim') && !reduced) {
    var start = function () { play(d.classList.contains('logo-intro')); };
    var go = function () {
      (window.MedrappixLogo ? window.MedrappixLogo.ready : Promise.resolve()).then(function () {
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(start); else start();
      });
    };
    go();
  } else {
    d.classList.remove('hero-anim', 'logo-intro');
    showReplay('Animation abspielen');
  }
})();
