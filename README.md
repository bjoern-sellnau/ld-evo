# Reels „Björn Sellnau“

Eigener Branch nur für die Videos — getrennt von der Website (kein Website-Code, keine CI).

- [Reel 3 — „Director's Cut“ (2:12 min, Negativ-Logo, SPREE|FALL)](#reel-3--directors-cut)
- [Reel 2 — „BJOERN.EXE“ (80 s, mehr Action)](#reel-2--bjoernexe)
- [Reel 1 — Intro (36 s)](#reel-1--intro)

## Reel 3 — „Director's Cut“

| Datei | Format | Größe |
| --- | --- | --- |
| [`bjoern-sellnau-reel-3.mp4`](bjoern-sellnau-reel-3.mp4) | 1080×1920, 2:12 min, 30 fps, H.264 + AAC, −14 LUFS | 76 MB (beste Qualität) |
| [`bjoern-sellnau-reel-3-1080p-klein.mp4`](bjoern-sellnau-reel-3-1080p-klein.mp4) | 1080×1920, stärker komprimiert | 30 MB |
| [`bjoern-sellnau-reel-3-720p.mp4`](bjoern-sellnau-reel-3-720p.mp4) | 720×1280 | 20 MB |
| [`bjoern-sellnau-reel-3-cover.jpg`](bjoern-sellnau-reel-3-cover.jpg) | Titelbild 1080×1920 | 0,2 MB |

### Ablauf (126 BPM, 68 Takte, fünf Kapitel)

- **Kaltstart mit dem Negativ-Logo:** Das LD-Zeichen zeichnet sich als Linie, füllt sich, L und D gleiten auseinander,
  und der Negativraum dazwischen (L-Kanal + D-Counter) bleibt leuchtend stehen. Dann fliegt die Kamera hinein.
- **Titel:** BJÖRN SELLNAU als Fenster, durch das man Unter den Linden aus SPREE|FALL sieht.
- **01 ORIGIN:** 3D-Karussell der frühen Projekte 2002–2006 (Originalbilder), die bisherige loona-designs.de, PIXELTEX, Berlin
- **02 CRAFT:** Split-Flap-Abfahrtstafel der Stationen, Stack-Walze, Sekundenzähler seit 01.09.2007, Zertifikate
- **03 PLAY:** Corefall, Covert Operations und **SPREE|FALL**: Walk durch Berlin, 12 Schnitte (Tor, Fernsehturm, Reichstag,
  Spree, Nacht, Mechs, Titanfall, Einsturz, Helikopter …), die sieben Spiele
- **04 BUILD:** Live-Build im Zeitraffer (die Seite schreibt sich selbst), Montage von 14 Hero-Animationen der neuen
  Website (mit Negativ-Logo im Menü), GitHub, Labs
- **05 BEYOND:** Materna SE, „Gerade am Lernen“, „Das Web. Meine Leidenschaft.“, Outro: Negativraum und Zeichen
  fügen sich zur LD-Kachel

**Negativ-Logo:** Pfade 1:1 aus `src/components/brand/LoonaNegative.tsx` (L-Kanal `M8 11H16V27H19L22 35H8Z`,
D-Counter `M21 11H24A12 12 0 0 1 24 35L21 27Z`), das Zeichen aus `glyphs.tsx`, beide im selben 46er-System.
Es dient im Video auch als **Blende zwischen den Kapiteln**: Die nächste Szene erscheint in den Formen des
Negativraums, die bis über das ganze Bild wachsen.

### Quellen (geprüft, Stand 24.10.2026)

- **SPREE|FALL** — Repository `bjoern-sellnau/ld-spreefall`: README (Open-World-Shooter in Berlin, aus OpenStreetMap
  generiert, keine Engine, keine 3D-Bibliothek, eigener WebGL2-Renderer, Physik, Sound, sieben Spiele),
  Screenshots aus `docs/screenshots/` und der Walk-Clip `docs/media/gate-to-tower.webm`.
  Die Screenshots entstanden laut `docs/screenshots/index.json` in der Sandbox (Offline-Fallback-Stadt mit 1.663 Gebäuden);
  die veröffentlichte Fassung baut die Stadt aus den echten OSM-Daten. Kartendaten im Spiel: © OpenStreetMap-Mitwirkende (ODbL).
  Szenen mit Gewaltdarstellung (Blut) wurden bewusst nicht verwendet.
- **Neue Website** (`ld-evo`): Hero-Animationen und Live-Build lokal aufgenommen (Einstellung „Logo only negative“,
  Bilder mit gesteuerter Uhr, daher flüssig), Labs, Zahl der Hero-Animationen (27 + 44 = 71), Inhalte aus `content/*.ts`
- **loona-designs.de** — Über mich (Stationen, Zertifikate), Portfolio (Projekte 2002–2006, Originalbilder)
- **github.com/bjoern-sellnau** — Bio, Status „Learning new things like: Rust, Tauri 2, Turborepo, Tailwind …“,
  326 öffentliche Repositories, angepinnte Repos, Pull Shark ×2, YOLO
- Sekundenzähler: 604.206.000 s von 01.09.2007, 09:00 bis 24.10.2026, 12:00 (Berliner Zeit), wie der Zähler der Website

Quelle zum Neu-Rendern: [`quelle-3/reel3.html`](quelle-3/reel3.html). Die Bildfolgen (Hero-Aufnahmen, Live-Build, Walk)
liegen platzsparend als Clips in `quelle-3/clips/`; `sh clips/extract.sh` (im Ordner `quelle-3`) macht daraus wieder
die Einzelbilder. `REEL.frame(t)` ist hier asynchron (lädt die Bildfolgen nach).

## Reel 2 — „BJOERN.EXE“

| Datei | Format | Größe |
| --- | --- | --- |
| [`bjoern-sellnau-reel-2.mp4`](bjoern-sellnau-reel-2.mp4) | 1080×1920, 80 s, 30 fps, H.264 + AAC, −14 LUFS | 48 MB (beste Qualität) |
| [`bjoern-sellnau-reel-2-1080p-klein.mp4`](bjoern-sellnau-reel-2-1080p-klein.mp4) | 1080×1920, stärker komprimiert | 18 MB |
| [`bjoern-sellnau-reel-2-720p.mp4`](bjoern-sellnau-reel-2-720p.mp4) | 720×1280 | 12 MB |
| [`bjoern-sellnau-reel-2-cover.jpg`](bjoern-sellnau-reel-2-cover.jpg) | Titelbild 1080×1920 | 0,2 MB |

### Ablauf (124 BPM, 40 Takte, Schnitte auf dem Beat)

1. **Cold Open:** Boot-Log, „IDENTIFYING OPERATOR“ entschlüsselt sich, `ssh bjoern@loona-designs.de` → `whoami`
2. **Titel-Drop:** BJÖRN SELLNAU mit RGB-Split, Schockwelle, Funkenregen, LD-Logo (elastisch)
3. **Who is Björn?** Senior Developer bei Materna SE · Berlin · IHK-Ausbilder (AEVO) · „Dinge bauen, die bleiben“
4. **Stack-Wand:** diagonale Laufbänder, ein Fokuswort pro Beat; „Gerade am Lernen: Rust · Tauri 2 · Turborepo · Tailwind“ (GitHub-Status)
5. **Zahlen:** 604.238.400 Sekunden seit 01.09.2007 · 18+ Jahre · 10 Zertifikate · 326 Repos
6. **Die Reise 2002 → 2026** als Filmstreifen (14 Stationen, Originalbilder der alten Projekte)
7. **GAME TIME:** Countdown → **Corefall** (Titelbild, Gameplay-Schnitte mit echtem HUD, Missionsbriefing, Pilot-Registrierung)
   → **Covert Operations** (Boot, Titel, 8 Spielmodi) → weitere Labs
8. **GitHub:** Profilkarte, 326 öffentliche Repositories, angepinnte Repos, Pull Shark ×2 · YOLO, Repo-Regen
9. **LD Beyond:** die neue loona-designs.de (Desktop + Mobil, LD Flow CMS, Liquid Glass, DE/EN, 70+ Hero-Animationen)
10. **Zertifikate** (Klappeffekt) → **Outro** mit Ereignishorizont: „Das Web. Meine Leidenschaft.“

**Effekte:** Whip-Pans mit Bewegungsunschärfe, Zoom-Durchflug mit Weichzeichner, Iris-Blende, Glitch-Schnitte,
RGB-Split, Decode-/Scramble-Text, Schockwellen, Partikel, Speed-Lines, Kamera-Shake und Beat-Zoom, Filmkorn.
**Musik:** f-Moll, 124 BPM, Intro → Main → Breakdown mit Countdown → Drop → Outro; im Browser synthetisiert (Web Audio).

### Quellen (geprüft, Stand 24.10.2026)

- **loona-designs.de** — Startseite, `uebermich.htm` (Stationen, Zertifikate), `portfolio.htm` (Projekte 2002–2006, Bilder)
- **github.com/bjoern-sellnau** — Bio, Status („Learning new things like: Rust, Tauri 2, Turborepo, Tailwind …“),
  326 öffentliche Repositories, angepinnte Repos, Achievements (Pull Shark ×2, YOLO), aktuelle Repos
- **Corefall** und **Covert Operations** — die eigenen Spiele (GitHub Pages), lokal gestartet und aufgenommen;
  HUD-Werte, Missions- und Menütexte stammen aus den Aufnahmen
- **Inhalte der neuen Website** (`content/*.ts` im Branch `master`) — Labs-Projekte, Werkzeuge, Zahl der Hero-Animationen (27 + 44)
- Nicht verwendet: Web-Treffer, die sich nicht eindeutig Björn Sellnau zuordnen ließen, sowie das Alter.

Quelle zum Neu-Rendern: [`quelle-2/reel2.html`](quelle-2/reel2.html) (`REEL.frame(t)`, `REEL.music()`), wie unten beschrieben.

## Reel 1 — Intro

| Datei | Format | Größe |
| --- | --- | --- |
| [`bjoern-sellnau-reel.mp4`](bjoern-sellnau-reel.mp4) | 1080×1920, 36 s, 30 fps, H.264 + AAC, −14 LUFS | 26 MB (beste Qualität) |
| [`bjoern-sellnau-reel-1080p-klein.mp4`](bjoern-sellnau-reel-1080p-klein.mp4) | 1080×1920, stärker komprimiert | 6,7 MB |
| [`bjoern-sellnau-reel-720p.mp4`](bjoern-sellnau-reel-720p.mp4) | 720×1280 | 3,4 MB |
| [`bjoern-sellnau-reel-cover.jpg`](bjoern-sellnau-reel-cover.jpg) | Titelbild 1080×1920 | 0,1 MB |

Herunterladen: Datei anklicken → „Download raw file“.

### Ablauf (112 BPM, Schnitte auf dem Beat)

1. Terminal: `whoami` → `bjoern-sellnau`, `cat ~/about.txt`
2. **Björn Sellnau.** — Senior Full-Stack / Software Engineer · Berlin · seit 2007
3. Stack, ein Wort pro Beat: React, Next.js, TypeScript, Node.js, React Native, GraphQL, Stripe, Claude Code
4. 604.238.400 Sekunden im Dienst des Webs (seit 01.09.2007) · 18+ Jahre · 10 Zertifikate
5. Die Reise 2002 → 2026 (ITA-Ausbildung, Flash-Game, Yayci, ld2006, PIXELTEX, OpenBooking, IHK-Ausbilder, Code-b, Materna)
6. Zertifikate (Anthropic, Scaly Academy, Stripe, IHK/AEVO, StrongLoop, Adobe)
7. Labs 2026 — KI-Experimente mit Claude Code und Antigravity 2 (Corefall, Covert Operations, Arena, Death Grid 3D, LD WorkBench, LD Buddy)
8. Die neue loona-designs.de (LD Beyond)
9. Outro: „Das Web. Meine Leidenschaft.“ · loona-designs.de · LinkedIn · GitHub

**Quellen:** loona-designs.de (Startseite, Über mich, Portfolio; Stand 10/2026) und die Inhalte der neuen Website.
**Musik:** im Browser synthetisiert (Web Audio) — keine fremden Rechte. Bilder: eigene Projekt-Screenshots und LD-Logo.
**Schriften:** Space Grotesk, Instrument Sans, JetBrains Mono (SIL Open Font License).

## Quelle neu rendern

`quelle/reel.html` (Reel 1), `quelle-2/reel2.html` (Reel 2) bzw. `quelle-3/reel3.html` (Reel 3) zeichnet jedes Bild deterministisch (`REEL.frame(t)`)
und erzeugt die Musik (`REEL.music()`). Den Ordner über einen lokalen Server öffnen (z. B. `python3 -m http.server`), dann die Bilder per
Playwright abgreifen und mit ffmpeg zu MP4 zusammensetzen (30 fps, libx264, AAC; Lautheit `loudnorm=I=-14:TP=-1.5`).
