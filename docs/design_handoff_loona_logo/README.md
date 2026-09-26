# Handoff: Loona! Designs — Logo „20a“ (Monogramm, Favicon, App-Icons, Reveal-Animationen)

## Überblick
Logo-System für das Online-Portfolio **Loona! Designs** (Bjoern Sellnau — Senior Full-Stack & Software Engineer, React/TypeScript, Web & Mobile).
Kern ist das Monogramm **„LD“, Entwurf 20a**: zwei geometrische Lettern in einer Strichstärke, deren **Negativraum selbst wieder L und D** bildet. Dazu: Wortmarke, Kachel-/Favicon-/App-Icon-Set und Reveal-Animationen (eine lange „Laser & Roboterarme“-Sequenz plus 60 kurze Intro-Varianten).

## Über die Design-Dateien
Alle Dateien in `design/` sind **Design-Referenzen in HTML/SVG/WebGL** — Prototypen, die Aussehen und Verhalten zeigen, **kein Produktionscode zum Kopieren**. Aufgabe ist, das System in der bestehenden Codebasis nachzubauen (React + TypeScript; Web und ggf. React Native / Expo) mit deren Patterns. Existiert noch keine Umgebung, ist Next.js (App Router) + TypeScript die passende Wahl.
Einzige Ausnahme: die **SVG/PNG-Assets in `assets/` sind final** und können 1:1 übernommen werden.

## Fidelity
**High-fidelity.** Geometrie, Farben, Typografie und Proportionen sind final und exakt nachzubauen. Die Animationen sind Referenzen für Timing/Ablauf; Rendering-Technik (Canvas 2D, WebGL, CSS/SVG, Framer Motion …) ist frei, solange Ablauf, Timing und Look erhalten bleiben.

---

## 1 · Das Monogramm (20a)

Raster **44 × 40 Einheiten** (Pfade sind im 46er-Koordinatensystem definiert, sichtbare Form liegt zwischen y = 3 und y = 43; viewBox `0 0 44 40` mit `translate(0 -3)`). Eine Einheit = 1⁄8 Strichstärke. **Strichstärke 8** für L-Stem, Kanal, D-Balken und Ring.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 40">
  <g transform="translate(0 -3)">
    <!-- L -->
    <path d="M0 3H8V35H19L22 43H0Z" fill="#FF7816"/>
    <!-- D mit Counter (evenodd!) -->
    <path d="M11 3H24A20 20 0 0 1 24 43H25L19 27H16V11H11ZM21 11H24A12 12 0 0 1 24 35L21 27Z" fill="#FF7816" fill-rule="evenodd"/>
  </g>
</svg>
```

Konstruktion (Koordinaten im 46er-System):
- **L**: Stem x 0–8, Fuß y 35–43, Fußende in der Schräge (19,35)→(22,43).
- **D**: Box oben x 11–24 (y 3–11), Stem x 16–24, Außenbogen r 20 um (24,23), Schräge (19,27)→(25,43) — parallel zum L-Fuß, Abstand 3.
- **Counter**: linke Kante x 21 durchgehend, Innenbogen r 12 um (24,23), Fase (21,27)→(24,35) trifft den Bogen exakt in seinem Fußpunkt.
- **Negativraum**: Kanal `M8 11H16V27H19L22 35H8Z` ist ein exaktes L (Stem 8, Fuß 8); Spalt oben `M8 3H11V11H8Z` (3 breit) und Fuge unten `M19 35H22L25 43H22Z` (3 breit) öffnen es symmetrisch.
- **Schräge** überall Steigung 3⁄8.
- **Schutzraum**: mind. 8 Einheiten (eine Strichstärke) rundum. **Mindestgröße 16 px Höhe.**
- Beide Pfade dürfen in einer `<path>` mit `fill-rule="evenodd"` zusammengefasst werden (sie überlappen nicht).

Einzelbuchstaben: `assets/l.svg` (viewBox `0 0 22 40`), `assets/d.svg` (viewBox `0 0 33 40`, Pfad um −11 verschoben).

## 2 · Farben & Typografie

| Token | Wert | Verwendung |
|---|---|---|
| `orange` | `#FF7816` | Logo, Akzent „!“ auf dunkel |
| `orange-deep` | `#C2410C` | „!“ auf hellem Grund |
| `ink` | `#171310` | Dunkler Grund, Logo auf hell |
| `cream` | `#F7F2EA` | Wortmarke auf dunkel |
| `paper` | `#FAF7F2` | Heller Grund |
| `muted-dark` | `#B3A78F` | „designs“ auf dunkel |
| `muted-light` | `#6E6455` | „designs“ auf hell |
| `sand` | `#E8DCC4` | Tagline in Animationen |

Kontrast: Orange auf Ink 7.0:1, Ink auf Orange 7.0:1, Cream auf Ink 15:1, Orange-deep auf Paper 4.9:1 (Text auf hell immer in orange-deep).

Schrift: **Space Grotesk** (Google Fonts, 500/700). Fallback: system-ui.
- Wortmarke: `loona!` 700, letter-spacing −0.03em, alles klein, „!“ in Orange (bzw. Orange-deep auf hell).
- Unterzeile: `designs` 500, letter-spacing 0.32em, kleingeschrieben, muted.
- Lockup-Verhältnis: Mark-Höhe 40 → Wortmarke 30 px, Unterzeile 11 px, Abstand Mark→Text 20 px (siehe `assets/lockup-dark.svg`).
- Tagline (Animationen): „The Web. my Passion.“ 500, letter-spacing 1.5 px, Farbe sand.

## 3 · Kachel, Favicon, App-Icons

- **Squircle-Kachel** (viewBox 46): `M23 0C40 0 46 6 46 23S40 46 23 46 0 40 0 23 6 0 23 0Z`. Mark darin bei 62 % Breite, zentriert (`translate(9.36 10.6) scale(0.62)`). Zwei Varianten: Orange-Kachel mit Ink-Mark, Ink-Kachel mit Orange-Mark.
- **Favicon**: Ink-Quadrat, Radius 22 %, Orange-Mark. SVG `assets/favicon.svg` (64er) + PNG 16/32/48. Mark-Breite skaliert leicht mit der Größe (74 % bei 16 px → 66 % bei 48 px), damit es klein nicht zuläuft.
- **App-Icons**: vollflächig Ink, **kein Radius** (das OS maskiert), Orange-Mark 52–56 % Breite, zentriert. Vorhanden: 180 (Apple Touch), 192/512 (Android/PWA), 1024 (Store).

Empfohlenes `<head>`:
```html
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon-180.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#171310">
```
Manifest-Icons: `android-icon-192.png`, `android-icon-512.png` (purpose `any maskable`, Hintergrund `#171310`).

## 4 · Animationen

### 4.1 Haupt-Reveal „Laser & Roboterarme“ (`design/Logo Animation WebGL 20a.html`, ~24 s, 1280×720)
WebGL2-Referenz, Ablauf mit Cue-Zeiten (Sekunden ab Start):

| Cue | t | Beschreibung |
|---|---|---|
| Plattform | 0.0 | Dunkler Raum. Im Boden öffnet sich eine Luke (bleibt offen), warmes Licht fällt in den Raum, eine Plattform mit einem massiven Orange-Block (Rechteck 44×40) fährt bis 3.05 s nach oben. |
| Laser D-Kurve | 3.9 | Laser (von oben rechts) schneidet den Außenbogen r 20; Ecken fallen mit Rotation nach unten und verglühen. Schnittkante glüht nach (Decay ≈ 1.4/s). Funken: ~260 Partikel, Lebensdauer 0.6 s, Schwerkraft 950 px/s². |
| Laser L | 6.3 | Laser schneidet den Kanal (Negativ-L) heraus, Teil fällt. |
| Laser D | 8.6 | Laser schneidet den Counter heraus, Teil fällt. |
| Roboterarme | 10.6 | Zwei Greifarme kommen von unten, greifen links/rechts, spannen; Risse wachsen oben (Spalt) und unten (Fuge). |
| Riss | 13.2 | Block reißt in L und D (Recoil 18 px, Partikel), Arme halten, **drücken beide Teile wieder zusammen** (Bewegung kommt von den Armen, nicht automatisch), lassen los und fahren ab. |
| Squircle | 15.8 | Zweiter Laser (von links) schneidet ein Squircle in die Rückwand (Abstand 20 px zu Oberkante/Boden, Setting). Die Platte kippt nach hinten weg (perspektivisch), durchs Loch fällt warmes Licht; Logo bekommt Kantenlicht, Schatten auf dem Boden. |
| Blackout | 18.6 | Licht flackert (Loch, Schacht, Raum), fällt nach 0.72 s komplett aus. Raum, Plattform und Logo sind schwarz. |
| Glow | 19.9 | Logo leuchtet selbst auf (THX-artig: Intensität 0 → 1.2 → 1 über 1.6 s, Bloom in Logo-Farbe), dann erscheinen zwei Zeilen darunter: „Loona! Designs“ (46 px, 700) und „The Web. my Passion.“ (24 px, 500), beide mit Glow. |

Settings-Panel (persistiert in localStorage): **Glow-Farbe** (Weiß default; Orange, Creme, Eisblau, frei) und **Loch-Abstand** (10–140 px). Playback-Position wird in localStorage gehalten.

### 4.2 60 kurze Reveals (`design/Logo Animationen 20a Set2.html`, je 5 s + 1.2 s Hold, 1280×720)
Alle auf Schwarz, Logo zentriert (Mark 308×280 px bei 1280×720), Text-Einblendung bei 3.4 s / 3.7 s (ease-out 0.6 s, 10 px Aufwärts-Drift). Tabs 1–60, ‹ › / Pfeiltasten, „Auto“ spielt alle durch, Logo-Farbe als Setting.
Familien: Wipes & Masken (Scanline, Radial, Iris, Aufzug, Säulen, Jalousie, Lamellen, Quadranten …), Bewegung/Physik (Stempel, Bounce, Jelly, Pendel, Spirale, Zoom-Trail, Aufblasen …), 3D (Flip, Münze, Klappe, Falten, Domino, Kachel-Rotation, Puzzle), Licht (Neon, Fokus, Herzschlag, Spotlight, Stroboskop, RGB, Doppelbelichtung, Negativ), Konstruktion (Laser-Kontur, Blueprint, Handschrift, Zirkel & Lineal, Vektor-Editor, Konstellation, Schraffur, Circuit), Sonstiges (Partikel, Liquid, Welle, Tinte, Glitch, Radar, Sonar, Loader-Ring, Equalizer, Ken Burns, Stapel, Extrusion).
Für die Website werden **1–3 davon** gebraucht (siehe Prompts) — die Datei ist der Katalog zur Auswahl.

Easing-Referenzen: `easeOutCubic` 1−(1−u)³ · `easeInOutCubic` · `easeOutBack` (c1 = 1.70158) · Bounce (Standard easeOutBounce).

## 5 · Handout
`design/Loona Designs Logo Handout.dc.html` — A4-Handout, 7 Seiten (Cover, Konzept, Konstruktion, Farbe & Schrift, Icons, Bewegung, Produktfamilie). Nicht Teil der Implementierung, nur Kontext.

## 6 · Assets (final, 1:1 übernehmen) — `assets/`
- `ld-mark.svg` / `ld-mark-ink.svg` / `ld-mark-cream.svg` — Monogramm Orange / Ink / Cream, viewBox 0 0 44 40
- `l.svg`, `d.svg` — Einzelbuchstaben
- `tile-orange.svg`, `tile-ink.svg` — Squircle-Kacheln
- `favicon.svg`, `favicon-16.png`, `favicon-32.png`, `favicon-48.png`
- `apple-touch-icon-180.png`, `android-icon-192.png`, `android-icon-512.png`, `app-icon-1024.png`, `app-icon-1024.svg`
- `lockup-dark.svg`, `lockup-light.svg` — Mark + Wortmarke (Space Grotesk, Fallback Arial)
- `negative-space-demo.svg` — Negativraum hervorgehoben (Erklärgrafik)
- `construction.svg` — Konstruktionszeichnung mit Raster
- `ld-mark-512.png`, `ld-mark-ink-512.png`, `ld-mark-cream-512.png` — Monogramm als PNG, transparent, 512 px hoch
- `og-image-1200x630.png` — Social/OG-Bild (Mark + Wortmarke auf Ink)
- `head-snippet.html`, `site.webmanifest` — fertige `<head>`-Zeilen und Web-Manifest (Pfade anpassen)
- `manifest.json` — maschinenlesbare Liste aller Assets, Farben, Produkte
- `family/<produkt>/` — Produktfamilie (Abschnitt 9): `mark.svg`, `mark-ink.svg`, `mark-cream.svg`, `tile-ink.svg`, `tile-color.svg`, `favicon.svg`, `favicon-16/32/48.png`, `apple-touch-icon-180.png`, `android-icon-192/512.png`, `app-icon-1024.png/.svg`, `lockup-dark.svg`, `lockup-light.svg`, `mark-512.png` / `mark-ink-512.png` / `mark-cream-512.png` (transparent), `og-image-1200x630.png`; dazu `family/family-tiles-dark.svg`, `family-tiles-color.svg`

## 7 · Dateien — `design/`
- `Logo Explorationen.dc.html` — alle 37 Explorationsrunden (Historie; 20a ist Turn 20, Option a; Produktfamilie final in Turn 37)
- `Logo Animation WebGL 20a.html` — Haupt-Reveal (Referenz für 4.1)
- `Logo Animationen 20a Set2.html` — 60 kurze Reveals (Katalog, 4.2)
- `Logo Animationen 20a.html` — die ersten 10 davon als eigene Datei
- `Loona Designs Logo Handout.dc.html` — Handout (Kontext)

## 8 · Claude-Code-Prompts
Siehe `PROMPTS.md` — in Reihenfolge abarbeiten, jeder Prompt ist eigenständig.

## 9 · Produktfamilie — LD Flow., LD Nova., LD Buddy., LD Ivy.

Gleiche Grammatik wie das Monogramm: Raster 40 hoch (Pfade im 46er-System, sichtbar y 3–43, viewBox `0 0 W 40` mit `translate(0 -3)`), **Strich 8**, Bögen r 20/12 bzw. r 16/8, Schräge 3⁄8 (20,556°). Jedes Produkt hat **eine** Farbe; Ink/Cream/Typografie bleiben. Punkt der Wortmarke („LD Flow**.**“) in Produktfarbe, auf hellem Grund in der Deep-Variante.

| Produkt | Zeichen | Breite W | Farbe | Deep (auf hell) | Hue |
|---|---|---|---|---|---|
| Loona! Designs (Beyond) | LD-Monogramm | 44 | `#FF7816` Orange | `#C2410C` | 25° |
| LD Ivy. (Evergreen) | Blatt | 40 | `#3DDC84` Grün | `#15803D` | 150° |
| LD Nova. (Design-System) | Funke | 40 | `#38BDF8` Sky | `#0369A1` | 199° |
| LD Flow. (CMS) | kursives ƒ | 49 | `#A78BFA` Violet | `#6D28D9` | 255° |
| LD Buddy. (App) | „b“ | 24 | `#F472B6` Rose | `#BE185D` | 330° |

Pfade (46er-Koordinaten, fill = Produktfarbe):
- **Flow** (`stroke-width 8`, `fill none`, innerhalb `<g transform="translate(14.125 0) skewX(-20.556)">`): `M30 7H26A8 8 0 0 0 18 15V31A8 8 0 0 1 10 39H6` und `M8 23H18`; dazu **unverzerrt** der Punkt `<circle cx="35.5" cy="23" r="4">`.
- **Nova**: `M20 3L24 19L40 23L24 27L20 43L16 27L0 23L16 19Z`
- **Buddy** (`fill-rule evenodd`): `M0 3H8V11A16 16 0 0 1 8 43H0ZM8 19A8 8 0 0 1 8 35Z`
- **Ivy** (`transform="translate(1.5 -2.5) rotate(-38 20 23)"`): `M20 3C29 14 40 20 40 27A20 20 0 0 1 0 27C0 20 11 14 20 3Z`

Kachel/Favicon/App-Icon wie Abschnitt 3, Skalierung nach **Höhe**: Kachel scale = min(0.62, 27/W); Favicon-SVG (64er-Box, rx 14) Markhöhe 66 %, Breite max. 80 %; PNG 16/32/48 Höhe 66/63/60 %; Apple 180 und App-Icon 1024 Höhe 50 % (Breite max. 60 %); Android 192/512 Höhe 46 %. Farb-Kachel = Produktfarbe mit Ink-Zeichen. Mindest-Farbabstand 49° (Grün/Sky); kein Verlauf, keine Zweitfarbe im Zeichen.

## 10 · Einbau (Web)
`assets/head-snippet.html` in den `<head>` übernehmen, `assets/site.webmanifest` ins Web-Root legen, Pfade anpassen. Für Produkt-Sites dieselben Zeilen mit den Dateien aus `assets/family/<produkt>/` und dem Produktnamen im Manifest. `theme-color` bleibt überall Ink `#171310`.
