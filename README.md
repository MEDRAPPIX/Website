# MEDRAPPIX – Website V4

Statische Website (HTML, CSS, JavaScript, SVG, GSAP). Kein Framework, kein Build-Schritt.

## Lokal ansehen

Im Projektordner:

```
python -m http.server 8000
```

Dann im Browser: <http://localhost:8000>

Hinweise:
- Die Hero-Animation läuft **einmal pro Browser-Sitzung**. Zum erneuten Ansehen: Button „Animation erneut abspielen“ unter den Mockups, oder ein neues privates Fenster öffnen.
- Debug: `http://localhost:8000/?heroT=6` hält die Animation bei Sekunde 6 an.
- Reduzierte Bewegung testen: in den Chrome-DevTools → Rendering → „prefers-reduced-motion: reduce“.

## Seiten

| Datei | Inhalt |
| --- | --- |
| `index.html` | Vier Hauptseiten: `#start` (Hero), `#warum`, `#leistungen`, `#kontakt` |
| `anwendungsfelder.html` | Nebenseite links von „Warum MEDRAPPIX?“ |
| `vorgehen.html` | Nebenseite rechts von „Warum MEDRAPPIX?“ (So arbeiten wir) |
| `ueber-uns.html` | Nebenseite links von „Kontakt“ |
| `erfahrung.html` | Nebenseite rechts von „Kontakt“ (Erfahrung & Hintergrund) |
| `impressum.html`, `datenschutz.html` | Rechtliches – Inhalt unverändert aus der bisherigen Website |
| `leistungen.html`, `kontakt.html` | Weiterleitungen alter URLs auf `index.html#…` |
| `404.html` | Fehlerseite (absolute Pfade, für GitHub Pages) |

Header und Fußzeile stehen in jeder Datei – Änderungen an der Navigation bitte in allen Seiten vornehmen.

## Technik

```
assets/css/style.css     Gesamtdesign; Farben als Variablen oben in :root
assets/css/hero.css      Hero und die drei Mockups (Designraster 960 × 700, wird skaliert)
assets/js/logo.js        Logo als SVG aus vier Masken-Ebenen des Originallogos + Aufbau-Animation
assets/js/hero.js        Logo-Intro und Hero-Animation (GSAP)
assets/js/main.js        Navigation, Seitenübergänge, Einblendungen, Kontaktformular
assets/js/vendor/        GSAP 3.12.5 (lokal, keine externen Server)
assets/img/logo/         Logo-Ebenen, erzeugt aus „Medrappix Logo.png“
assets/fonts/            Sora, Manrope, JetBrains Mono (lokal)
```

## Kontaktformular

Das Formular hat drei Pflichtfelder (Name, E-Mail, Nachricht), Validierung, einen unsichtbaren Honeypot, eine Mindest-Ausfüllzeit und eine 60-Sekunden-Sendepause.

**Aktueller Stand:** Es ist **kein Formulardienst angebunden** (`data-endpoint=""` in `index.html`). Beim Absenden öffnet sich deshalb das E-Mail-Programm der Besucherin bzw. des Besuchers mit vorausgefüllter Nachricht an `kontakt@medrappix.de`. Eine Erfolgsmeldung erscheint in diesem Fall bewusst **nicht**, weil der Versand nicht bestätigt werden kann.

**Echten Versand aktivieren:** einen Formulardienst einrichten, der JSON per `POST` annimmt und CORS erlaubt (z. B. Formspree, Web3Forms oder ein eigener Endpunkt beim Hoster), und dessen URL eintragen:

```html
<form … data-endpoint="https://formspree.io/f/XXXXXXX">
```

Gesendet wird `{ name, email, message, _subject }`. Die Erfolgsmeldung erscheint nur bei einer erfolgreichen Serverantwort (HTTP 2xx). **Danach muss die Datenschutzerklärung um den Dienst ergänzt werden.**

## Vor der Veröffentlichung prüfen

- [ ] Impressum und Datenschutz: Platzhalter ausfüllen und rechtlich prüfen lassen
- [ ] Datenschutz: erwähnt noch das frühere Feld „Organisation“; bei Anbindung eines Formulardienstes ergänzen
- [ ] Berufsbezeichnung auf `ueber-uns.html` durch Kay bestätigen
- [ ] Porträtfoto einsetzen (`ueber-uns.html`, Anleitung im HTML-Kommentar)
- [ ] E-Mail-Adresse `kontakt@medrappix.de` einrichten bzw. bestätigen
- [ ] Domain `medrappix.de` in Canonical-/Open-Graph-Angaben, `robots.txt` und `sitemap.xml` bestätigen
- [ ] Mausrad- und Touchpad-Einrasten auf echten Geräten prüfen (Windows, macOS, iOS, Android)
