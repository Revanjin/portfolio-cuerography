# Portfolio Cyrill Kraehenbuehl

Landingpage mit Video, Fotos und Weiterleitung zu Instagram. Statische Website, gebaut mit
SvelteKit. Es gibt keinen Server: Nach dem Bauen entsteht ein Ordner mit fertigen Dateien, den man
auf einen beliebigen Webspace lädt.

Wer am Code weiterarbeitet, liest zuerst [instructions.md](instructions.md) und
[project.md](project.md).

## Voraussetzungen

- [Node.js](https://nodejs.org) ab Version 22 (bringt `npm` mit)

## Einrichten

Einmalig im Projektordner:

```
npm install
```

Für das Kontaktformular die Datei `.env.example` nach `.env` kopieren und den Zugangsschlüssel von
[web3forms.com](https://web3forms.com) eintragen:

```
VITE_WEB3FORMS_KEY=dein-schlüssel
```

Ohne Schlüssel läuft alles trotzdem. Das Formular öffnet dann das Mailprogramm, statt selbst zu
senden.

## Starten

```
npm run dev
```

Die Adresse steht danach im Terminal, normalerweise `http://localhost:5173`. Ist der Port belegt:

```
npm run dev -- --port 5180
```

Änderungen am Code erscheinen sofort im Browser. Der Service Worker ist in diesem Modus aus,
Offline-Betrieb und Installation als App lassen sich hier also nicht testen.

## Bauen

```
npm run build
```

Das Ergebnis liegt im Ordner `build/`. Der Schlüssel aus `.env` wird beim Bauen fest in die
Dateien geschrieben: Er muss also **vor** dem Bauen eingetragen sein. Wer ihn später ändert, baut
neu.

Den fertigen Stand vor dem Hochladen lokal ansehen, mit Service Worker und Offline-Betrieb:

```
npm run preview
```

Nach jedem neuen Build den Preview-Server beenden und neu starten, sonst findet er die neuen
Dateien nicht.

Vor dem Hochladen prüfen, ob alles sauber ist:

```
npm run lint
```

## Hochladen

Hochgeladen wird **der komplette Inhalt des Ordners `build/`**, sonst nichts:

```
build/
  index.html               Startseite
  contact.html             Kontakt
  imprint.html             Impressum
  privacy.html             Datenschutz
  manifest.webmanifest     Angaben für die Installation als App
  service-worker.js        Offline-Betrieb
  _app/                    JavaScript und CSS
  fonts/                   Schrift
  icons/                   App-Icons
  poster/                  Standbilder des Videos
  video/                   Videodateien
```

Nicht hochladen: `src/`, `static/`, `node_modules/`, `.svelte-kit/`, `.env` und alle übrigen
Dateien aus dem Projektordner. Was die Website braucht, steckt bereits in `build/`.

Bei jedem Update den alten Stand auf dem Webspace vollständig durch den neuen ersetzen. Die
Dateien in `_app/` bekommen bei jedem Build neue Namen; alte Reste stören nicht, werden aber
nicht mehr gebraucht.

### Was der Webspace können muss

- **HTTPS.** Ohne HTTPS startet der Service Worker nicht, und die Seite läuft weder offline noch
  als App.
- **Wurzelverzeichnis der Domain.** Die Dateien gehören direkt nach `https://deine-domain.tld/`,
  nicht in einen Unterordner. In einem Unterordner stimmen die Pfade zu Schrift, Poster und Video
  nicht.
- **Adressen ohne `.html`.** Die Links zeigen auf `/contact`, `/imprint` und `/privacy`. Der Server
  muss dafür `contact.html` usw. ausliefern. Netlify, Vercel, Cloudflare Pages und GitHub Pages
  tun das von selbst. Bei klassischem Webspace mit Apache braucht es eine `.htaccess` im
  Wurzelverzeichnis:

  ```
  RewriteEngine On
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME}.html -f
  RewriteRule ^(.*)$ $1.html [L]
  ```

- **`service-worker.js` nicht lange cachen.** Die meisten Anbieter machen das richtig. Wer
  Cache-Zeiten selbst einstellt: für `service-worker.js` und die HTML-Dateien keine lange
  Cache-Dauer setzen, sonst kommen Updates verspätet an.

### Nach dem Hochladen

Besucher, die die Seite schon einmal offen hatten, sehen ein Update erst beim übernächsten
Öffnen: Die neue Version lädt im Hintergrund und gilt, sobald alle Tabs der Seite geschlossen
waren.

## Inhalte ändern

| Was | Wo |
|---|---|
| Name, Stadt, Instagram, E-Mail, Videotitel | `src/lib/settings.ts` |
| Galerie als Masonry oder Slider, Spalten, Beschriftung, Video-Modus | `src/lib/settings.ts` |
| Fotos | `src/lib/photos.ts` |
| Videodateien | `static/video/` |
| Standbilder des Videos | `static/poster/` |
| Text im Info-Overlay | `src/lib/components/InfoDialog.svelte` |
| Impressum, Datenschutz | `src/routes/imprint/`, `src/routes/privacy/` |

Nach jeder Änderung neu bauen und `build/` neu hochladen.

Wer das Video tauscht, ersetzt die drei Dateien in `static/video/` unter denselben Namen und
erzeugt die Standbilder in `static/poster/` neu, jeweils aus dem ersten Bild des Videos. Sonst
springt das Bild beim Einblenden.
