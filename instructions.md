# Arbeitsregeln

Regeln für alle, die an diesem Projekt weiterarbeiten, Menschen wie AI-Agents. Was das Projekt ist,
wie es aufgebaut ist und was noch offen ist, steht in [project.md](project.md). Lies beide Dateien,
bevor du etwas änderst.

## Vor jeder Änderung

1. Die betroffene Datei ganz lesen, dazu die Nachbarkomponenten.
2. Bestehende Muster übernehmen, auch wenn du es anders lösen würdest.
3. Den kleinsten Diff bauen, der die Aufgabe löst. Keine Refactorings oder Umformatierungen nebenbei.
4. `npm run lint` und `npm run build` laufen lassen, beides muss grün sein.
5. Im Browser prüfen bei 375, 768, 1024 und 1440 px. Nichts darf horizontal scrollen.

## Nicht ohne Rückfrage

- Dependencies hinzufügen oder upgraden. Das gilt auch für kleine Helfer.
- Design-Tokens in `src/lib/styles/tokens.scss` ändern.
- Routen umbenennen oder entfernen.
- Inhalte erfinden: Namen, Titel, Jahre, Texte, Preise. Was fehlt, bleibt als Platzhalter in
  eckigen Klammern stehen, zum Beispiel `[City]`.
- Auf Produktion deployen.
- `build/`, `.svelte-kit/` und `node_modules/` anfassen.

## Stack: was nicht anders gemacht wird

- **Kein Tailwind, kein UI-Framework, keine Utility-Klassen.** Styles sind SCSS, `scoped` in der
  jeweiligen Komponente.
- **Keine Slider-, Lightbox-, Gesten- oder PWA-Library.** Galerie, Whitebox, Gesten und Service
  Worker sind Eigenbau und bleiben es.
- **Kein Service-Worker-Plugin** (kein Workbox, kein vite-plugin-pwa). Der Service Worker ist
  `src/service-worker/index.ts` und nutzt SvelteKits eingebauten Mechanismus.
- **Svelte 5 mit Runes** (`$state`, `$derived`, `$props`, `$effect`). Keine Stores, kein
  `export let`, keine `$:`-Statements.
- **TypeScript ohne `any` und ohne `@ts-ignore`.**
- **Alles ist vorgerendert** (`adapter-static`, `prerender = true`). Es gibt keinen Server: keine
  Server-Routen mit Laufzeitlogik, keine Form Actions, keine serverseitigen Secrets.
- **Native Elemente zuerst:** `<dialog>` für das Info-Overlay, `<button>` für Aktionen, `<a>` für
  Navigation. Kein `div` mit Klick-Handler.

## SvelteKit 3: Stolperfallen

Das Projekt läuft auf SvelteKit 3. Vieles, was man aus Version 2 kennt, gibt es nicht mehr.

- Die Konfiguration steht in `vite.config.ts` als Optionen von `sveltekit({...})`. Eine
  `svelte.config.js` gibt es nicht.
- `$lib` gibt es nicht mehr. Importe laufen über `#lib/...` (Subpath-Import aus `package.json`)
  und **immer mit Dateiendung**: `#lib/settings.ts`, `#lib/network.svelte.ts`,
  `#lib/components/Icon.svelte`. Die Option `alias` ist deprecated, nicht benutzen.
- In SCSS funktioniert `#lib` nicht. Dort relativ einbinden: `@use '../styles/layout' as *;`.
- `$service-worker` gibt es nicht mehr. Der Service Worker importiert aus `$app/manifest`
  (`immutable`, `assets`, `prerendered`), `$app/env` (`version`) und `$app/service-worker` (`self`).
  Die Pfade aus `$app/manifest` haben keinen führenden Schrägstrich, die Startseite ist ein leerer
  String.
- Der Service Worker hat ein eigenes `tsconfig.json` in `src/service-worker/`.
- Interne Links brauchen `resolve()` aus `$app/paths`, sonst schlägt ESLint an. Externe Links
  bekommen den vorhandenen `eslint-disable-next-line`-Kommentar mit Begründung.
- `npm run preview` liest die Dateiliste nur beim Start. Nach jedem Build den Preview-Server neu
  starten, sonst liefert er 404 für die neuen Dateien.

## Styles

- **Keine Hex-Werte und keine Magic Numbers in Komponenten.** Farben, Abstände und Schriftgrößen
  kommen als CSS Custom Properties aus `tokens.scss`. Fehlt ein Wert, erst fragen, dann als Token
  anlegen.
- **Mobile first.** Basis-Styles gelten für das Smartphone, größere Breiten kommen per
  `@include from($tablet)` (720 px) und `@include from($desktop)` (1024 px) dazu. Nie per
  `max-width` zurückbauen.
- Die Mixins liegen in `src/lib/styles/_layout.scss`: `from`, `column`, `plain-button`,
  `link-button`, `icon-button`, `truncate`. Erst dort nachsehen, dann neu bauen.
- BEM-nah benennen: `.photo`, `.photo__caption`, `.photo--strip`. Höchstens drei Ebenen schachteln.
- Kein `!important`. Die einzige Ausnahme steht in `base.scss` für `prefers-reduced-motion`.
- Inline-Styles nur als Custom Properties für Daten pro Element (`style:--ratio`, `style:--tone`).
- Nur `transform` und `opacity` animieren, gezielt per `transition` auf einzelne Eigenschaften.
  Dauer und Kurve aus `--duration-micro`, `--duration-move` und `--ease`.

## Gestaltung

Die Idee: Das Video hängt wie eine Arbeit an der Wand, die Beschriftung darunter ist der Wandtext.

- Ruhig, viel Weißraum, klare linke Kante. Nichts ist zentriert außer der Spalte selbst.
- **Keine Schatten, keine Radien.** Die einzige Rundung ist die Instagram-Pille im Header.
- Keine Akzentfarbe, keine Gradients. Links sind unterstrichen, Instagram trägt einen Rahmen.
- Eine Schrift: Instrument Sans in 400, 500 und 600, selbst gehostet und vorgeladen. Keine weitere
  Schrift, kein Google-Fonts-Link.
- Der Hintergrund ist Wandweiß, auch in der Whitebox. Die Whitebox wird nie schwarz.
- Jedes interaktive Element ist mindestens 44 × 44 px groß und hat `:hover`, `:focus-visible` und
  `:active`.
- Instagram bleibt dreimal erreichbar: Header, großer Block, Info-Overlay. Der Knopf im Header
  steht auf jeder Breite ganz oben.
- Keine Emojis, weder in der Oberfläche noch im Code oder in Commit-Messages.
- Seitenwechsel: kurzes Ausblenden, die neue Seite steigt von unten ein. Kein seitliches Schieben,
  das gehört in der Galerie dem Blättern.
- Texte auf der Seite sind englisch, auch `aria-label` und Platzhalter. Kommentare im Code sind deutsch.

## Performance

Die Besucher kommen meist aus dem Instagram-In-App-Browser über Mobilfunk. Das hat Vorrang vor
Komfort beim Entwickeln.

- Das Poster ist das LCP-Element: `fetchpriority="high"`, nie lazy.
- Das Video wird erst nach dem Laden per Script angehängt und blendet über dem Poster ein. Nicht
  als `<video>` mit `autoplay` ins vorgerenderte HTML schreiben.
- Die Vorschau lädt nie das große Foto. Vorschaubilder: 480 und 960 px. Große Fotos (1600 px an
  der langen Kante) lädt erst die Whitebox.
- Jedes Bild hat `width`, `height`, passende `sizes`, `decoding="async"` und eine Platzhalterfläche
  in seiner Dominantfarbe. Layout Shift ist 0 und bleibt 0.
- Whitebox und Gesten kommen per dynamischem Import beim ersten Klick. Sie dürfen nicht ins
  Start-Bundle wandern, also nirgends statisch importieren.
- Die Masonry-Verteilung steht fertig im vorgerenderten HTML. Keine CSS-`columns`, keine
  Neuverteilung nach dem Hydrieren.
- Alle Unsplash-Bilder tragen `crossorigin="anonymous"`. Ohne das landen opake Antworten im Cache
  und belegen pauschal mehrere MB.

## Service Worker

- So klein wie möglich halten, derzeit rund 1,8 KB komprimiert.
- Kein `skipWaiting`. Eine neue Version gilt ab dem nächsten Öffnen.
- Cache-Abfragen laufen mit `ignoreVary`. Ohne das findet der Cache seine eigenen Dateien nicht,
  sobald der Server `Vary: Origin` schickt. Nicht entfernen.
- Videos werden nicht gespeichert, außer `video.offline` ist an. Dann müssen Range-Requests mit
  206 und `Content-Range` beantwortet werden, sonst spielt Safari nicht.
- Alles unter `/video/` ist vom Vorab-Cache ausgenommen. Poster liegen deshalb in `static/poster/`.

## Datenschutz

- Keine Anfragen an Dritte beim Laden der Seite: keine Google Fonts, keine eingebetteten
  Instagram-Posts, keine Analyse- oder Tracking-Skripte, keine Captchas von Drittanbietern.
  Einzige Ausnahme sind derzeit die Platzhalterfotos von Unsplash, und die müssen vor dem Livegang weg.
- Keine Cookies. Im Gerätespeicher liegen nur der Offline-Cache und der Zeitstempel `last-online`.
- Instagram wird nur verlinkt, nie eingebettet.
- Neue Seiten bekommen `Seo.svelte`, Seiten ohne Inhalt für Suchende zusätzlich `noindex`.

## Barrierefreiheit

- Ein `h1` pro Seite, Überschriften ohne Sprünge.
- `aria-label` auf Icon-Knöpfen, `aria-hidden="true"` auf dekorativen Icons.
- Die Whitebox ist ein Dialog: `role="dialog"`, `aria-modal`, die Seite dahinter ist `inert`, Esc
  schließt, der Fokus geht zurück auf das angeklickte Foto, die Scrollposition bleibt.
- `prefers-reduced-motion` beachten: kein Autoplay, Zoom und Blättern ohne Animation.
- Externe Links immer mit `target="_blank"` und `rel="noopener noreferrer"`.

## Code-Stil

- Kommentare nur für das Warum, nie für das Was. Keine Banner, keine JSDoc-Blöcke über trivialen
  Funktionen, kein auskommentierter Code, kein `console.log`.
- `try/catch` nur an echten Grenzen: Fetch, Storage, `play()`, Fullscreen.
- Handler heißen `onSubmit`, `onClose`. Booleans beginnen mit `is`, `has` oder `can`.
- Namen aus der Domäne (`photo`, `poster`, `whitebox`), nicht `data` oder `item`.
- Alles Umschaltbare gehört in `src/lib/settings.ts`. Die jeweils andere Variante steht
  auskommentiert direkt darunter, sodass man nur eine Zeile tauschen muss. Dieses Muster beibehalten.
- Die echte E-Mail-Adresse darf nicht ins vorgerenderte HTML. Im Markup steht `emailLabel` in der
  Schreibweise mit `(at)` und `(dot)`, die echte Adresse wird erst beim Klick benutzt.
- Im Client nur öffentliche `VITE_*`-Variablen. Fehlt eine, schaltet sich das Feature still ab,
  statt zu crashen.

## Commits und Abschluss

- Commit-Messages: `fix: ...`, `feature: ...`, `chore: ...`.
- Am Ende kurz berichten: was geändert wurde, wo, welche Annahmen. Messwerte ehrlich nennen, auch
  wenn ein Ziel verfehlt wird. Keine zusätzlichen Zusammenfassungs-Dateien anlegen.
