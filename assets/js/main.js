/* =========================================================
   MEDRAPPIX – allgemeine Seitenlogik
   · Header-Zustand, mobiles Menü
   · aktive Hauptseite (Navigation, Rahmenlabel, URL-Hash)
   · horizontale Übergänge zu den Nebenseiten
   · dezente Einblendungen
   · Kontaktformular
   ========================================================= */
(function () {
  'use strict';

  var d = document.documentElement;
  var reduced = false;
  try { reduced = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  /* ---------- Jahr ---------- */
  document.querySelectorAll('.js-year').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Header ---------- */
  var header = document.getElementById('siteHeader');
  function onScroll() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 8); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobiles Menü ---------- */
  var toggle = document.getElementById('menuToggle');
  var nav = document.getElementById('mainNav');
  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    nav.classList.toggle('is-open', open);
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('is-open') && !nav.contains(e.target) && !toggle.contains(e.target)) setMenu(false);
    });
  }

  /* ---------- Aktive Hauptseite (nur Startseite) ---------- */
  var panels = Array.prototype.slice.call(document.querySelectorAll('.panel[id]'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.main-nav a[data-nav]'));
  var frameLabel = document.getElementById('frameLabel');
  var current = null;

  function setActive(id) {
    if (id === current) return;
    current = id;
    navLinks.forEach(function (a) {
      if (a.getAttribute('data-nav') === id) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    var p = document.getElementById(id);
    if (frameLabel && p) frameLabel.innerHTML = '<b>' + p.getAttribute('data-panel') + '</b> / 04 · ' + p.getAttribute('data-title');
    // URL aktuell halten (ohne neue Verlaufseinträge), damit „Zurück“ an die richtige Stelle führt
    if (document.body.classList.contains('home') && history.replaceState) {
      var url = id === 'start' ? location.pathname + location.search : '#' + id;
      if ((location.hash || '#start') !== '#' + id) history.replaceState(null, '', url);
    }
  }

  if (panels.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) setActive(en.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    panels.forEach(function (p) { io.observe(p); });
  }

  /* ---------- Horizontale Übergänge ----------
     data-dir="left"  → Ziel liegt links: aktuelle Seite gleitet nach rechts
     data-dir="right" → Ziel liegt rechts: aktuelle Seite gleitet nach links */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-dir]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank') return;
    var dir = a.getAttribute('data-dir');
    try { sessionStorage.setItem('mx-dir', dir); } catch (err) {}
    if (reduced) return; // normale Navigation, ohne Bewegung
    e.preventDefault();
    setMenu(false);
    d.classList.remove('enter-from-left', 'enter-from-right');
    d.classList.add(dir === 'left' ? 'leave-right' : 'leave-left');
    setTimeout(function () { window.location.href = a.href; }, 380);
  });
  // Zurück/Vorwärts aus dem Browser-Cache: Ausgangszustand wiederherstellen
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) d.classList.remove('leave-left', 'leave-right', 'enter-from-left', 'enter-from-right');
  });

  /* ---------- Dezente Einblendungen ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); rio.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { rio.observe(el); });
  }

  /* ---------- Kontaktformular ---------- */
  var form = document.getElementById('contactForm');
  if (form) initForm(form);

  function initForm(form) {
    var card = document.getElementById('formCard');
    var status = document.getElementById('formStatus');
    var submit = document.getElementById('formSubmit');
    var success = document.getElementById('formSuccess');
    var endpoint = (form.getAttribute('data-endpoint') || '').trim();
    var mailto = form.getAttribute('data-mailto') || '';
    var loadedAt = Date.now();
    var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    var rules = {
      name: function (v) { return v.length >= 2 ? '' : 'Bitte geben Sie Ihren Namen an.'; },
      email: function (v) { return !v ? 'Bitte geben Sie Ihre E-Mail-Adresse an.' : (EMAIL.test(v) ? '' : 'Bitte prüfen Sie die E-Mail-Adresse – sie scheint unvollständig zu sein.'); },
      message: function (v) { return v.length >= 10 ? '' : 'Bitte beschreiben Sie Ihr Anliegen in wenigen Worten (mindestens 10 Zeichen).'; }
    };

    function check(name, show) {
      var input = form.elements[name];
      var msg = rules[name](input.value.trim());
      var field = input.closest('.field');
      var err = document.getElementById(input.getAttribute('aria-describedby'));
      if (show) {
        field.classList.toggle('is-invalid', !!msg);
        if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
        if (err) err.textContent = msg;
      }
      return !msg;
    }

    Object.keys(rules).forEach(function (name) {
      var input = form.elements[name];
      input.addEventListener('blur', function () { if (input.value.trim()) check(name, true); });
      input.addEventListener('input', function () { if (input.closest('.field').classList.contains('is-invalid')) check(name, true); });
    });

    function setStatus(text, kind) {
      status.className = 'form__status' + (kind ? ' is-' + kind : '');
      status.textContent = text;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      setStatus('');
      var firstInvalid = null;
      Object.keys(rules).forEach(function (name) {
        if (!check(name, true) && !firstInvalid) firstInvalid = form.elements[name];
      });
      if (firstInvalid) { firstInvalid.focus(); return; }

      // Einfacher Missbrauchsschutz: Honeypot, Mindestzeit, Sendepause
      if (form.elements.website.value) return;
      if (Date.now() - loadedAt < 3000) { setStatus('Bitte versuchen Sie es in einem Moment noch einmal.', 'error'); return; }
      var last = 0;
      try { last = +localStorage.getItem('mx-form-sent') || 0; } catch (err) {}
      if (Date.now() - last < 60000) { setStatus('Ihre Nachricht wurde gerade erst gesendet. Bitte warten Sie einen Moment, bevor Sie eine weitere Nachricht senden.', 'error'); return; }

      var data = {
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
        message: form.elements.message.value.trim(),
        _subject: 'Neue Anfrage über medrappix.de'
      };

      if (!endpoint) { openMail(data); return; }

      submit.disabled = true;
      submit.firstChild.nodeValue = 'Wird gesendet … ';
      var ctrl = 'AbortController' in window ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 15000);

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data),
        signal: ctrl ? ctrl.signal : undefined
      }).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        // Erfolg erst nach bestätigter Annahme durch den Server
        try { localStorage.setItem('mx-form-sent', String(Date.now())); } catch (err) {}
        form.reset();
        card.classList.add('is-sent');
        success.focus();
      }).catch(function () {
        setStatus('Ihre Nachricht konnte leider nicht gesendet werden. Bitte versuchen Sie es später erneut oder schreiben Sie uns direkt an ' + mailto + '.', 'error');
      }).then(function () {
        clearTimeout(timer);
        submit.disabled = false;
        submit.firstChild.nodeValue = 'Nachricht senden ';
      });
    });

    /* Ohne konfigurierten Formulardienst: Nachricht im eigenen E-Mail-Programm öffnen.
       Es wird bewusst KEINE Erfolgsmeldung angezeigt, da der Versand nicht bestätigt werden kann. */
    function openMail(data) {
      var body = data.message + '\n\n—\n' + data.name + '\n' + data.email;
      window.location.href = 'mailto:' + mailto + '?subject=' + encodeURIComponent(data._subject) + '&body=' + encodeURIComponent(body);
      setStatus('Ihr E-Mail-Programm wurde mit Ihrer Nachricht geöffnet. Bitte senden Sie die E-Mail dort ab. Falls sich kein Programm geöffnet hat, schreiben Sie uns direkt an ' + mailto + '.', 'info');
    }
  }
})();
