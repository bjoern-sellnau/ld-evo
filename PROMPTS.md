# Claude-Code-Prompts — Loona! Designs Logo

Reihenfolge einhalten; jeder Prompt setzt den vorigen voraus. Vor dem ersten Prompt: `README.md` und den Ordner `assets/` ins Repo legen (z. B. `docs/design_handoff_loona_logo/`) und Claude Code darauf zeigen.

---

## Prompt 1 — Logo-Komponente

```
Lies docs/design_handoff_loona_logo/README.md, Abschnitt 1–2.

Baue eine React/TypeScript-Komponente <LoonaMark /> für das LD-Monogramm 20a als inline SVG (keine <img>), damit Farbe über CSS steuerbar ist.

Anforderungen:
- Props: size (number | string, default 40 → Höhe; Breite ergibt sich aus 44:40), color (CSS-Farbe, default 'currentColor'), title (a11y; default "Loona! Designs"), decorative (boolean → aria-hidden).
- Pfade exakt aus README Abschnitt 1 übernehmen (viewBox "0 0 44 40", <g transform="translate(0 -3)">, D-Pfad mit fill-rule="evenodd"). Keine Rundungen/Änderungen an Koordinaten.
- Zusätzlich <LoonaLetterL /> und <LoonaLetterD /> (viewBox 0 0 22 40 bzw. 0 0 33 40, Pfade aus assets/l.svg und assets/d.svg).
- Storybook-Story oder Beispielseite: Mark in Orange (#FF7816) auf Ink (#171310) und in Ink auf Paper (#FAF7F2), in 16 / 32 / 46 / 120 px. Bei 16 px muss der Kanal (Negativ-L) noch sichtbar sein — prüfe im Browser.
- Design-Tokens aus README Abschnitt 2 als CSS Custom Properties in unserem bestehenden Token-File anlegen (Prefix --loona-), keine neuen Farbwerte erfinden.
Nutze die bestehenden Konventionen des Repos (Komponentenordner, Export-Style, Tests).
```

## Prompt 2 — Wortmarke & Lockup

```
Baue <LoonaLockup /> nach README Abschnitt 2 + assets/lockup-dark.svg / lockup-light.svg:

- Layout: flex, align-items center, gap 20px (bei Mark-Höhe 40; skaliere gap proportional zur Mark-Höhe).
- Links <LoonaMark size={markSize} />, rechts zwei Zeilen: "loona!" (Space Grotesk 700, font-size 0.75 × Mark-Höhe, letter-spacing -0.03em, alles klein; das "!" als <span> in Orange bzw. Orange-deep #C2410C auf hellem Grund) und darunter "designs" (Space Grotesk 500, 0.275 × Mark-Höhe, letter-spacing 0.32em, Farbe --loona-muted-dark bzw. --loona-muted-light).
- Prop theme: 'dark' | 'light' (steuert Mark-Farbe, Textfarben, "!"-Farbe). Prop variant: 'full' | 'mark' (nur Monogramm, z. B. für die Navbar auf Mobile).
- Space Grotesk 500/700 über unsere bestehende Font-Loading-Lösung einbinden (next/font oder Fonts-Ordner), mit font-display: swap und system-ui-Fallback.
- Setze das Lockup in die Site-Navigation (Link auf "/"), Mark-Höhe 28 px im Header, 'mark'-Variante unter 480 px Breite.
```

## Prompt 3 — Favicon, PWA-Icons, Meta

```
Übernimm die finalen Icon-Assets aus docs/design_handoff_loona_logo/assets/ nach public/ (Dateinamen beibehalten): favicon.svg, favicon-16.png, favicon-32.png, favicon-48.png, apple-touch-icon-180.png, android-icon-192.png, android-icon-512.png.

- Head-Tags nach README Abschnitt 3 setzen (SVG-Favicon zuerst, PNG-Fallback, apple-touch-icon, manifest, theme-color #171310). In Next.js über das Metadata-API bzw. app/icon-Konventionen, sonst im Layout-Head.
- site.webmanifest anlegen: name "Loona! Designs", short_name "Loona!", background_color und theme_color #171310, display "standalone", icons 192 + 512 mit purpose "any maskable".
- Erzeuge zusätzlich favicon.ico (16+32+48) aus den PNGs per Script (z. B. sharp/to-ico) und lege das Script unter scripts/ ab, damit es reproduzierbar ist.
- Prüfe im Browser-Tab (hell + dunkel) und im Lighthouse-PWA-Check, dass alle Icons gefunden werden.
```

## Prompt 4 — Kurzes Intro-Reveal für die Website

```
Implementiere ein kurzes Logo-Reveal für den Hero der Startseite, Referenz: docs/design_handoff_loona_logo/design/Logo Animationen 20a Set2.html (öffnen und Nr. 1 "Laser-Kontur", Nr. 6 "Kinetic Lock" und Nr. 8 "Neon" anschauen — wir bauen "Kinetic Lock").

Ablauf (Gesamtdauer 2.4 s, danach statisches Lockup):
1. 0.2–1.4 s: das L kommt von links (Start −700 px), das D von rechts (+700 px), beide mit easeOutBack (c1 = 1.70158); D startet 0.15 s später.
2. Bei 1.5 s "rasten" sie ein: 0.5 s horizontales Zittern sin(t·60)·6 px, abklingend; ein kurzer weißer Blitz (0.4 s) auf L-Stem-Kante und D-Stem; 60–70 Funken-Partikel aus der Fuge, die nach 0.6 s verglühen (Schwerkraft ≈ 400 px/s²).
3. 1.9–2.4 s: Wortmarke fadet ein (ease-out, 10 px Aufwärts-Drift).

Technik: <LoonaMark>-Pfade als SVG, Bewegung mit unserer bestehenden Animations-Lib (Framer Motion, wenn vorhanden; sonst CSS + Web Animations API). Partikel als <canvas> Overlay oder max. 70 absolut positionierte <span>s. Respektiere prefers-reduced-motion: dann nur 300 ms Fade des fertigen Lockups. Die Animation läuft genau einmal pro Session (sessionStorage-Flag), danach zeigt der Hero sofort das statische Lockup.
```

## Prompt 5 — Langer Reveal als Video-Asset (optional)

```
Referenz: docs/design_handoff_loona_logo/design/Logo Animation WebGL 20a.html (README Abschnitt 4.1, Cue-Tabelle). Diese ~24 s lange WebGL-Sequenz soll NICHT nachgebaut, sondern als Video exportiert und als "About"-Intro eingebunden werden.

- Öffne die HTML-Datei in Chromium (Playwright), stelle Glow-Farbe Weiß und Loch-Abstand 20 im ⚙-Panel sicher (localStorage-Key loona-webgl:settings = {"glow":"#FFFFFF","margin":20}), setze loona-webgl-20a:t auf 0 und nimm per Playwright video/recordVideo oder CDP Screencast 1280×720 bei 60 fps auf, bis 24.5 s erreicht sind. Alternativ: puppeteer-screen-recorder.
- Transkodiere mit ffmpeg zu H.264 MP4 (CRF 18) + WebM (VP9) + ein Poster-Frame bei 23.5 s (PNG).
- Baue <LogoIntroVideo /> mit <video muted playsInline preload="metadata" poster=…>, Autoplay nur mit IntersectionObserver, wenn ≥ 60 % sichtbar; bei prefers-reduced-motion nur das Poster. Einbau auf der About-Seite über dem Text.
```

## Prompt 6 — Social & OG-Images

```
Erzeuge Open-Graph-/Twitter-Card-Bilder mit dem Logo-System (README Abschnitt 2–3):
- 1200×630: Ink-Hintergrund (#171310), <LoonaLockup theme="dark"> zentriert mit Mark-Höhe 160, darunter 48 px Abstand, Tagline "The Web. my Passion." Space Grotesk 500, 28 px, letter-spacing 1.5px, Farbe #E8DCC4.
- 1200×1200 (quadratisch) für Messenger-Previews: nur das Mark, 46 % Breite, zentriert.
- In Next.js über opengraph-image.tsx (ImageResponse), sonst als Build-Script mit satori/resvg. Space Grotesk als Font-Buffer laden.
- metadata.openGraph / twitter im Root-Layout verdrahten, Title "Loona! Designs — Bjoern Sellnau", Description aus der bestehenden Site-Config.
```

## Prompt 7 — Qualitätscheck

```
Prüfe das gesamte Logo-System gegen docs/design_handoff_loona_logo/README.md:
1. Pixel-Vergleich: rendere <LoonaMark size={400} color="#FF7816"> auf #171310 und lege assets/ld-mark.svg in gleicher Größe darüber (Playwright-Screenshot + pixelmatch, Toleranz 0.1 %). Abweichung = Pfad-Fehler.
2. Kontrast aller Kombinationen (Orange/Ink, Ink/Paper, Cream/Ink, muted-Texte) ≥ 4.5:1 mit axe oder eigenem Check.
3. Favicon in 16 px: Screenshot des Browser-Tabs oder Render der 16er-PNG, visuell prüfen, dass der Kanal zwischen L und D sichtbar bleibt.
4. Reduced-Motion-Pfade der Intro-Animation und des Videos testen.
5. Lighthouse: PWA-Icons, theme-color, keine Layout-Shifts durch Font-Loading (font-display swap, size-adjust falls nötig).
Liste Abweichungen und behebe sie.
```

## Prompt 8 — Produktfamilie (Flow., Nova., Buddy., Ivy.)

```
Lies README Abschnitt 9. Erweitere die Mark-Komponente aus Prompt 1 um `product: 'ld' | 'flow' | 'nova' | 'buddy' | 'ivy'` (Pfade, Breite W und Farbe aus der Tabelle; `tone: 'color' | 'ink' | 'cream'`). Übernimm die fertigen Dateien aus `assets/family/<produkt>/` 1:1 (Favicon-Set, App-Icons, Lockups) — keine neuen Varianten. Wortmarke: „LD Flow“ 700 + Punkt in Produktfarbe (Deep-Variante auf hell), Unterzeile „cms · loona! designs“ 500, letter-spacing 0.32 em. Prüfe die Favicons bei 16 px im Browser-Tab (hell und dunkel) gegen `favicon-16.png`.
```
