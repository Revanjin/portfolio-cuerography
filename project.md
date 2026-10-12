# Projekt: Portfolio Cyrill Kraehenbuehl

Landingpage für einen Videokünstler und Fotografen: erst das Video, dann die Fotos, dazu eine
prominente Weiterleitung zu Instagram. Die Seite muss extrem schnell laden, auf Smartphone, iPad
und Desktop funktionieren und als PWA offline laufen.

Die Arbeitsregeln stehen in [instructions.md](instructions.md). Stand dieser Datei: 12.10.2026.

Die Website ist englisch. Die Routen heißen `/contact`, `/imprint` und `/privacy`.

## Befehle

| Befehl | Zweck |
|---|---|
| `npm run dev` | Dev-Server. Der Service Worker ist hier nicht aktiv. |
| `npm run build` | Produktions-Build nach `build/` |
| `npm run preview` | Build ausliefern, mit Service Worker. Nach jedem Build neu starten. |
| `npm run lint` | ESLint und danach `svelte-check` |

Node 22. Port 5173 ist auf dem Entwicklungsrechner oft von einem anderen Projekt belegt, dann
`npm run dev -- --port 5180`.

## Stack

SvelteKit 3, Svelte 5 (Runes), TypeScript 6, Vite 8, `adapter-static`, SCSS über `sass-embedded`.
Zum Prüfen: ESLint 10 mit `eslint-plugin-svelte` und `typescript-eslint`, dazu `svelte-check`.
Laufzeit-Dependencies gibt es keine.

## Designvorlage

- Artifact: https://claude.ai/artifact/LHkY9WBqx39dMCUt92WMNV, Seite „2 Passepartout –
  Ausarbeitung“, Artboards `project/P-*.dc.html`.
- `design-reference.html` im Projektordner ist ein gebündelter Export desselben Canvas.

Die Werte daraus stehen in `src/lib/styles/tokens.scss`:

| | Smartphone | iPad hoch, ab 720 px | Desktop, ab 1024 px |
|---|---|---|---|
| Grundschrift | 14 px | 15 px | 14 px |
| Seitenrand | 24 px | 48 px | Inhaltsspalte 64 % |
| Header oben | 12 px | 24 px | 24 px |
| Abstand Header zu Video | 24 px | 40 px | 48 px |
| Abstand Video zu Fotos | 64 px | 96 px | 120 px |
| Abstand Fotos zu Instagram-Block | 72 px | 120 px | 160 px |
| Innenabstand Instagram-Block | 28 px | 36 px | 40 px |
| Handle-Schriftgröße | 34 px | 48 px | 64 px |
| Fußzeile Abstand oben | 40 px | 56 px | 64 px |
| Masonry-Spalten | 2 | 2 | 3 (oder 2) |
| Spaltenabstand | 12 px | 24 px | 32 px (40 px bei 2 Spalten) |
| Zeilenabstand | 20 px | 28 px | 32 px |
| Slider-Höhe | 300 px | 360 px | 420 px |

Farben: Wand `#FAFAF8`, Tinte `#161616`, Grau `#686761`, Fläche `#EFEEE9`, Linie `#D8D6D0`,
Unterstreichung `#C4C2BB`. Zeilenhöhe 1.45.

## Aufbau

```
src/
  app.html                      Gerüst: Schrift-Preload, Manifest, Icons
  app.d.ts                      Typen für navigator.connection, VITE_WEB3FORMS_KEY, iPhone-Vollbild
  lib/
    settings.ts                 alle Schalter und Stammdaten
    photos.ts                   Fotoliste
    media.ts                    Bild-URLs (Unsplash) und Poster-Pfade
    masonry.ts                  Verteilung der Fotos auf Spalten, je Breakpoint
    network.svelte.ts           Offline-Status und Nachladen der Vorschauen für den Cache
    whitebox/gestures.ts        Pointer-Gesten: Wischen, Zoom, Ziehen, Schließen
    styles/                     tokens.scss, base.scss, _layout.scss (Mixins)
    components/                 siehe unten
  routes/
    +layout.svelte              Basis-Styles, Offline-Streifen
    +page.svelte                Startseite, lädt die Whitebox bei Bedarf
    contact/                    Kontaktformular
    imprint/, privacy/          Impressum und Datenschutz, noch Platzhalter
    manifest.webmanifest/       erzeugt das Manifest aus settings.ts
  service-worker/index.ts       Service Worker
static/
  fonts/, icons/, poster/, video/
```

Komponenten:

| Komponente | Aufgabe |
|---|---|
| `SiteHeader` | Name, Unterzeile, „Info“ (ab 720 px), Instagram-Pille |
| `VideoWork` | Poster als `<picture>`, hängt das Video nach dem Laden an, Ton und Vollbild |
| `PhotoSection` | Überschrift mit Anzahl, wählt Masonry oder Slider, Zähler und Pfeile |
| `PhotoMasonry` | Spalten aus `masonry.ts`, je Breakpoint eine fertige Verteilung im HTML |
| `PhotoSlider` | horizontaler Streifen mit `scroll-snap` |
| `PhotoFigure` | ein Foto mit Beschriftung, von Masonry und Slider genutzt |
| `Whitebox` | Vollbild-Ansicht der Fotos, wird erst beim ersten Öffnen geladen |
| `InstagramBlock` | der große Link über die ganze Spalte |
| `SiteFooter`, `LegalLinks` | Fußzeile, © und Links zu Impressum und Datenschutz |
| `InfoDialog` | Info-Overlay als natives `<dialog>` |
| `OfflineBar` | Streifen „Offline – saved version“ |
| `SubPage` | Gerüst für die Seiten contact, imprint und privacy |
| `Icon` | alle Linien-Icons |

## Einstellungen

Alles in `src/lib/settings.ts`. Die andere Variante steht jeweils auskommentiert darunter.

| Schalter | Werte | Standard |
|---|---|---|
| `gallery` | `'masonry'`, `'slider'` | `'masonry'` |
| `columnsDesktop` | `3`, `2` (nur Masonry) | `3` |
| `captions` | `true`, `false` | `true` |
| `video.mode` | `'two'` (Handy eigene 4:5-Datei), `'one'` (16:9 für alle) | `'two'` |
| `video.offline` | `true` speichert die Handy-Datei im Service Worker | `false` |

Stammdaten in derselben Datei: `name`, `city`, `instagramHandle`, `email`, `videoTitle`,
`videoYear`. Daraus abgeleitet: `instagramUrl` und `emailLabel`.

## Wie die Teile zusammenspielen

**Video.** Das vorgerenderte HTML enthält nur das Poster. Nach dem Laden wählt `VideoWork` die
Datei: ab 720 px `loop-16x9.mp4`; darunter im Modus `'two'` `loop-4x5.mp4`, bei langsamem Netz
(`downlink` unter 1,5 Mbit/s oder `effectiveType` 2g/3g) `loop-4x5-low.mp4`; bei `saveData` nur
das Poster. Im Modus `'one'` lädt das Handy immer die 16:9-Datei, auch bei langsamem Netz. Fehlt
eine Datei, bleibt das Poster stehen und die Knöpfe erscheinen nicht. Bei
`prefers-reduced-motion` gibt es statt Autoplay einen Knopf „Play“.

**Poster.** Das Poster ist das erste Bild des Videos, damit das Einblenden nicht springt. Es liegt
als WebP in `static/poster/` (wide 640/960/1600, tall 480/720). Wer das Video tauscht, muss die
Poster neu erzeugen und die Dominantfarben in `media.ts` anpassen.

**Fotos.** `photos.ts` hält `id`, `title`, `year`, `width`, `height`, `dominantColor`. Die Bilder
kommen von `images.unsplash.com`, die Größe über URL-Parameter. `width` und `height` sind die
Maße des gelieferten Ausschnitts: Foto 03 und 08 sind auf 1:1 und 16:9 beschnitten.

**Masonry.** `masonry.ts` legt jedes Foto in die gerade kürzeste Spalte und rechnet Beschriftung
und Zeilenabstand mit ein. Weil das von der Spaltenbreite abhängt, wird je Breakpoint gerechnet.
Gleiche Nachbarn werden zusammengelegt; aktuell stehen zwei Verteilungen im HTML (2 Spalten bis
1023 px, 3 Spalten ab 1024 px), sichtbar ist per Media Query immer eine. Die versteckte lädt
keine Bilder, weil alle `loading="lazy"` sind.

**Whitebox.** `+page.svelte` importiert sie dynamisch beim ersten Klick. Sie ist ein `div` mit
`role="dialog"`, kein `<dialog>`, weil die Fullscreen-API auf `<dialog>` nicht erlaubt ist. Die
Seite dahinter wird `inert`. Das Foto passt sich über Container-Query-Einheiten ein. Gesten:
Wischen blättert, Doppeltippen zoomt auf 2×, zwei Finger bis 4×, Ziehen verschiebt den Ausschnitt,
nach unten wischen schließt; am Desktop Klick, Strg + Mausrad, Pfeiltasten, F, Esc. Auf dem iPhone
entfällt der Vollbild-Knopf, weil Safari dort Vollbild nur für Videos kennt.

**Service Worker.** HTML: erst Netz, sonst Cache. CSS, JS, Schrift, Icons, Poster: aus dem
versionierten Cache `shell-<version>`. Unsplash-Bilder: erst Cache `media`, sonst Netz und
speichern; offline notfalls dasselbe Foto in einer anderen Größe. Nach 2,5 s meldet die Seite
schon geladene Bilder nach und lässt die übrigen Vorschauen laden, danach läuft die Seite
komplett offline.

**Offline-Status.** `navigator.onLine` reicht nicht, bei totem Mobilfunk bleibt es oft `true`.
Deshalb merkt sich der Service Worker, ob er die Seite aus dem Cache liefern musste, und die
Seite fragt das nach dem Laden ab.

**Kontakt.** Mit `VITE_WEB3FORMS_KEY` sendet das Formular per POST an Web3Forms (Name, E-Mail,
Nachricht, Honeypot). Ohne Schlüssel gibt es kein E-Mail-Feld und der Knopf öffnet das
Mailprogramm. Vorlage für die Variable: `.env.example`.

## Inhalte und Platzhalter

Eingetragen: Name „Cyrill Kraehenbuehl“, Instagram `cyrill_kraehenbuehl`, E-Mail
`hello@cyrillkraehenbuehl.com`.

Noch Platzhalter:

- `[City]`, `[Video title]`, `[Year]` in `settings.ts`
- alle Fototitel und Jahre in `photos.ts`
- `© [Year]` in `LegalLinks.svelte`
- der gesamte Text im Info-Overlay (`InfoDialog.svelte`)
- Impressum und Datenschutz (`/imprint`, `/privacy`)
- die zehn Fotos: Platzhalter von Unsplash
- das Video: Stock-Clip von Mixkit (Nr. 11, Stadtkreuzung bei Nacht, 12,5 s, ohne Tonspur).
  Lizenz ungeprüft, vor Veröffentlichung ersetzen.
- die App-Icons: schlichtes Platzhaltermotiv

## Messwerte

Produktions-Build, Chrome, erster Besuch ohne Service Worker. Gemessen mit dem früheren
Unsplash-Poster, mit dem neuen Video und den lokalen Postern nicht neu gemessen.

| | Wert |
|---|---|
| HTML mit Inline-CSS | 8,6 KB |
| JavaScript beim Start | 49,9 KB |
| Schrift | 30,4 KB |
| Poster | rund 20 KB |
| zehn Vorschaubilder | rund 240 KB |
| Startseite ohne Video | rund 350 KB |
| Whitebox mit Gesten | 3,5 KB JS, 1,4 KB CSS |
| Service Worker | 1,8 KB |
| Layout Shift | 0 |

Das Ziel von 150 KB wird verfehlt. HTML, JS, Schrift und Poster liegen bei rund 107 KB; den Rest
machen die Vorschauen aus, die Chrome trotz `loading="lazy"` weit vor dem Viewport lädt.
Videodateien: 1,0 MB (16:9), 0,74 MB (4:5), 0,25 MB (4:5 low). Richtwerte: höchstens 6 MB am
Desktop und 2,5 MB auf dem Handy, 10–20 s, H.264.

## Offen

- **Web3Forms-Schlüssel fehlt.** Der echte Versand ist ungeprüft; getestet wurde nur gegen eine
  nachgestellte Antwort.
- **Datenschutzerklärung:** Das Formular schickt Daten an Web3Forms, Bilder kommen von Unsplash.
  Beides muss dort stehen.
- **Nicht getestet:** echtes iPhone und Safari (natives Video-Vollbild, Safari-Gesten, Video aus
  dem Cache), Firefox. Touch wurde nur in der Chrome-Emulation geprüft.
- **Nach dem Videotausch nicht erneut geprüft:** Handy-Fassung, Offline-Betrieb und Ladebudget.
- **`mailto`** kann im Instagram-In-App-Browser blockiert sein. Das betrifft die Adresse auf der
  Kontaktseite und das Formular ohne Schlüssel.
- **Kein Git-Repository**, kein Hosting festgelegt. Die Pfade gehen von einer Auslieferung im
  Wurzelverzeichnis der Domain aus.
- **Echte Fotos:** Unsplash fällt dann weg. `media.ts`, die Bildregeln im Service Worker und der
  `preconnect` in `app.html` müssen dann angepasst werden.
