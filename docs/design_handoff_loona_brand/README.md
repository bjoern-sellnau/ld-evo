# Handoff: loona! designs — Brand System (Zeichen, Badge, Bewegtes Zeichen, Animationen)

## Stand
31.10.2026 — Badge neu konstruiert: zusammengeschoben ist der Negativraum exakt das Zeichen (1 : 1), auseinandergezogen um den Kanal 3. Alle Badge-Pfade in diesem README, in `assets/` und in den HTML-Referenzen sind auf diesem Stand.

## Overview
Markensystem für **loona! designs**, Plattform und Online-Portfolio von Bjoern Sellnau (Senior Fullstack & Software Engineer — React, Mobile, TypeScript). Das System besteht aus vier Logo-Formen (Zeichen, Badge, Bewegtes Zeichen, Bewegtes Zeichen als Badge-Umkehr), einer Wortmarke, einer Farb- und Typo-Palette, dem adaptiven Prinzip (das Zeichen passt Farbe/Material dem Umfeld an) und sechs Logo-Animationen plus einer Intro-Transformation.

Ziel der Implementierung: ein wiederverwendbares `<LoonaMark>`-Komponentenset (React + TypeScript), das alle Formen, Farbmodi und Animationen aus diesem Paket abbildet, sowie Favicon/App-Icon-Exporte.

## About the Design Files
Die Dateien in diesem Paket sind **Design-Referenzen in HTML/SVG** — Prototypen, die Aussehen und Verhalten zeigen, kein Produktionscode zum Kopieren. Aufgabe ist es, diese Designs in der bestehenden Codebasis (React/TypeScript, bzw. React Native für Mobile) mit deren Patterns nachzubauen. Gibt es noch keine Codebasis, ist ein Vite + React + TypeScript-Setup die passende Wahl. Die SVG-Pfade in `assets/` und in diesem README sind dagegen **final** und können 1:1 übernommen werden.

## Fidelity
**High-fidelity.** Geometrie (Pfade), Farben, Radien, Timings und Easings sind final und exakt zu übernehmen. Die Portfolio-Screens im Brand Kit (Runde 1, 1d–1i) sind dagegen Richtungs-Konzepte (mid-fi) und **nicht** Teil dieses Handoffs.

---

## Die vier Logo-Formen

Alle Pfade teilen dasselbe Koordinatensystem; Einheiten sind frei skalierbar. Keine Strokes, nur Füllungen. Fuge/Slash sind immer **transparent** (nie mit Grundfarbe gefüllt), damit das Zeichen auf jedem Grund funktioniert.

### 1. Zeichen (Primär) — `assets/loona-zeichen.svg`
- viewBox `6 9 32 28` (Box 28 × 24, umlaufend 2 Einheiten Luft)
- Zwei Pfade, eine Farbe:
  - L: `M8 12A1 1 0 0 1 9 11L15 11A1 1 0 0 1 16 12L16 27L19 27L22 35L9 35A1 1 0 0 1 8 34Z`
  - Mond (D): `M21 12A1 1 0 0 1 22 11H24A12 12 0 0 1 24 35L21 27Z`
- Konstruktion: Stamm und Fuß des L sind 8 stark, Mondradius 12 (= halbe Höhe). Fuge oben 5, unten 2 (Steigung 3 : 8).
- Radius 1 an genau vier Ecken: L oben links, L oben rechts, L unten links, Mond oben links. **Alles an der Fuge und an der Unterkante ist scharf.**
- Mindestgröße 16 px (Favicon), Druck 5 mm. Schutzraum: eine Stammbreite (8/28 der Breite) rundum.

### 2. Badge — `assets/loona-badge.svg`
- viewBox `0 0 64 64`, Grund `rect rx=14 fill=#171310` (Tinte; der Grund ist **immer** Tinte)
- Gruppe `transform="translate(9.44 9.92) scale(0.96)"` (zentriert das LD im Quadrat), darin:
  - Großes L: `M0 4A1 1 0 0 1 1 3L8 3A1 1 0 0 1 9 4L9 11A1 1 0 0 0 8 12L8 34A1 1 0 0 0 9 35L22 35L25 43L1 43A1 1 0 0 1 0 42Z`
  - Großes D mit Negativ-Mond (fill-rule evenodd): `M12 4A1 1 0 0 1 13 3H27A20 20 0 0 1 27.99 42.975L22 27H19V12A1 1 0 0 0 18 11H12ZM24 12A1 1 0 0 1 25 11H27A12 12 0 0 1 27 35L24 27Z`
- Konstruktion: großes L (Stamm 8, Höhe 40) und großes D (Ring 8: r 20 außen, r 12 innen). **Zusammengeschoben** (D um −3 in x, keine Lücke) ist der Negativraum exakt das Primärzeichen im Maßstab 1 : 1 — gleiche Ecken, gleiche Radien, Fuge 5 → 2. **Auseinandergezogen** um den Kanal 3 wird das innere L 11 statt 8 breit; der innere Mond bleibt unverändert.
- Trennkante: oben senkrecht bei x = 9 (1 rechts vom Stamm, damit die r-1-Ecke L oben links im Negativ erhalten bleibt — das große L ist oben deshalb 9 breit), unten entlang der Fußschräge 3 : 8.
- Radius 1 außen an L oben links/rechts, L unten links, D oben links; innen an den Ecken des Zeichens (8/11, 19/11, 8/35, 24/11).
- Mindestgröße 24 px, Druck 8 mm. Einsatz: App-Icon, Favicon ab 24 px, Social-Profil, Sticker.

### 3. Bewegtes Zeichen — `assets/loona-bewegt.svg`
- viewBox `6 9 32 28`
- Silhouette (Zeichen ohne Fuge, Radius 1 an den beiden Außenecken links): `M8 12A1 1 0 0 1 9 11H24A12 12 0 0 1 24 35H9A1 1 0 0 1 8 34Z`
- Slash als **Maske/Ausschnitt** (transparent): `M13 11H16.5L28.5 35H25Z` — 3,5 breit, startet 5 vom linken Rand, Steigung 1 : 2 (12 über Höhe 24)
- Nur für Zustände: Loader, Favicon-Blinken, Hover, Sticker. **Nie das statische Logo, nie im Druck.**

### 4. Bewegtes Zeichen als Badge-Umkehr — `assets/loona-bewegt-badge.svg`
- viewBox `0 0 64 64`, Grund `rect rx=14 fill=#171310`, Gruppe `transform="translate(9.6 8.6) scale(1.018)"`
- Ebenen in dieser Reihenfolge:
  1. große Silhouette Orange: `M0 4A1 1 0 0 1 1 3H24A20 20 0 0 1 24 43H1A1 1 0 0 1 0 42Z`
  2. kleine Silhouette Tinte (#171310): `M8 12A1 1 0 0 1 9 11H24A12 12 0 0 1 24 35H9A1 1 0 0 1 8 34Z`
  3. Slash Tinte: `M9 3H12.5L32.5 43H29Z`
  4. derselbe Slash Orange, geclippt auf die kleine Silhouette (`clipPath` mit Pfad aus 2.)
- Effekt: ein Slash läuft in einer Linie durch das große Zeichen und kehrt innerhalb des kleinen die Farbe um. Nur als Endbild einer Animation, nie als statisches Icon.

### Wortmarke
- Text `loona! designs` — immer klein, das `!` ist Teil des Namens, **nie gefärbt oder weggelassen**.
- Manrope 800 für „loona!“, Manrope 500 für „designs“, letter-spacing −0,035 em, line-height 1. Einfarbig in Textfarbe.
- Lockup: Zeichen links, Abstand zum Wort = eine Stammbreite; Höhe des Zeichens = Versalhöhe + Unterlänge der Wortmarke.
- Unterzeile (optional): JetBrains Mono 500, 12–14 px: „Bjoern Sellnau · Senior Fullstack & Software Engineer · React, Mobile, TypeScript“.

---

## Adaptives Prinzip (Farbmodi)
Das Zeichen ist kein Fremdkörper: Geometrie bleibt immer gleich, nur Farbe/Material passen sich an. Als Prop `tone` umsetzen:

| tone | Umfeld | Füllung |
|---|---|---|
| `orange` (default) | Creme, Weiß, Tinte, Nacht | #FF7816 |
| `cream` | orange Flächen | #F6F1E8 |
| `white` | Fremdfarben, Fotos | #FFFFFF (auf Fotos zusätzlich `filter: drop-shadow(0 2px 6px rgba(0,0,0,.35))`) |
| `ink` | einfarbiger Druck, helle Flächen ohne Orange | #171310 |
| `glass` | Splash, App-Icon, große Hero-Flächen auf Tinte (≥ 48 px, nur digital) | vertikaler Verlauf #FFB366 → #FF7816 (55 %) → #FF4D1C, plus Glanz: Ellipse (Mitte x, oben), weiß 32 % Opazität, geclippt auf das Zeichen |
| `liquid` | bewegte/farbige Gründe (iOS 26 / visionOS) | Linse ohne eigene Farbe, siehe unten |

**Liquid Glass (Refraktion)** — Referenz: Brand Kit 8b / Guide S. 11. Aufbau im SVG (funktioniert ohne backdrop-filter, auch im Druck):
1. Szene (Grund) als `<g id="scene">` einmal zeichnen.
2. Innerhalb eines `clipPath` mit den beiden Zeichen-Pfaden: Szene mit `<use>` um Faktor 1,22 um die Zeichenmitte vergrößert und mit `feTurbulence (fractalNoise, baseFrequency 0.012, 2 Oktaven) → feDisplacementMap (scale 14)` verzerrt.
3. Kantenbrechung: dieselbe Szene um Faktor 1,5 vergrößert, nur durch eine Kantenmaske (Stroke 14 der Zeichenpfade, weiß) sichtbar.
4. Körper: vertikaler Verlauf weiß 42 % → weiß 8 % (45 %) → schwarz 28 %.
5. Innenschatten: Zeichenpfade als Stroke schwarz 30 %, Breite 7, um 3 nach unten versetzt, blur 3; Innenlicht: Stroke weiß 35 %, Breite 5, um 3 nach oben versetzt, blur 3 (beides innerhalb des Clips).
6. Zweifarbige Kante außerhalb des Clips: Stroke 2,4 mit Verlauf transparent → schwarz 40 % (oben links → unten rechts), darüber Stroke 1,8 weiß 95 % → 20 % → 70 %.
7. Zwei Glanzpunkte: Ellipsen weiß 70 % / 65 % im oberen Drittel.
Im Web alternativ via `backdrop-filter: blur(12px) saturate(1.6)` auf einem Element mit `clip-path: path(...)` — dann Schritte 4–7 als Box-Shadow/Overlay. Nie auf einfarbigen Gründen einsetzen.

Regel: nie zwei Varianten nebeneinander auf einer Fläche.

---

## Animationen
Grundsätze: Der Slash bewegt sich, das Zeichen steht. Jede Bewegung hat genau eine Bedeutung, dauert < 3 s (außer Intro) und **endet immer im Primärzeichen**. Bei `prefers-reduced-motion` steht alles: Loader zeigen das Zeichen mit pulsierendem Punkt, Favicon blinkt nicht, Übergänge werden zu Überblendungen. Technik: nur transform/opacity auf Formen mit Clip auf die Silhouette — keine Pfad-Morphs.

| Name | Bedeutung | Dauer | Easing | Loop | Einsatz |
|---|---|---|---|---|---|
| Sweep | es lädt | 1,5 s | cubic-bezier(.65,0,.35,1) | ∞ | Seitenladen, Skeleton |
| Füllstand | Fortschritt | echt | linear, 200 ms Glättung | — | Upload, Build, Scroll |
| Blinken | Seite baut | 1,1 s | steps(1) | ∞ | Favicon, Cursor |
| Mondphase | Badge wird aktiv | 0,9 s | cubic-bezier(.2,.8,.2,1) | 1× | Badge aktiv, App-Start |
| Reveal | Intro | 1,2 s | cubic-bezier(.2,.8,.2,1) | 1× | Intro, Video-Vorspann |
| Slash-Wipe | Seitenwechsel | 0,6 s | cubic-bezier(.7,0,.3,1) | 1× | Routing-Transition, Reel-Schnitt |
| Transformation Alt → Neu | Intro-Motiv | 6 s | cubic-bezier(.65,0,.35,1) | 1× | Splash/Intro einmalig |

Konkrete Umsetzung (Koordinaten im Zeichen-System, viewBox 6 9 32 28):

- **Sweep**: Silhouette Orange; der Slash-Pfad (als Ausschnitt in Grundfarbe) wandert per `translateX` von −22 bis +8 innerhalb eines Clips auf die Silhouette. Endbild: Zeichen (Slash wird zur Fuge; Übergang per Opacity-Crossfade 150 ms).
- **Füllstand**: Silhouette in Ghost-Ton (#FFE3CC auf hellem Grund, #3B2B1F auf Tinte); darüber Orange-Fläche, deren rechte Kante der Slash ist (`M-40 11H13L25 35H-40Z` + Slash-Ausschnitt), `translateX` = Fortschritt × 30 − 22.
- **Blinken**: zwei Frames im Wechsel, 1,1 s, steps(1): Silhouette mit Slash → Silhouette ohne Slash. Endet im Zeichen, sobald geladen. Unter 16 px nie animieren.
- **Reveal**: L von `translateX(-14)` + opacity 0 nach 0; Mond ab 10 % von `translateY(12)` + opacity 0 nach 0; dann als Lockup verkleinern (scale .72), Textzeilen erscheinen.
- **Hover Zeichen → Bewegtes Zeichen**: Fuge-Pfad `M16 11H21V27L24 35H22L19 27H16Z` füllt sich von oben (`scaleY` 0 → 1, transform-origin 16 11), dann erscheint der Slash (steps(1)). Rückweg beim Verlassen umgekehrt.
- **Mondphase** (Badge, viewBox 0 0 64 64, in der Gruppe `translate(9.44 9.92) scale(0.96)`): In einer Untergruppe mit `transform="translate(3 0)"` liegt ein Clip auf den kleinen Mond `M21 12A1 1 0 0 1 22 11H24A12 12 0 0 1 24 35L21 27Z`, darin eine Tinte-Scheibe (Kreis cx 24 cy 23 r 12), die per `translateX` von 0 bis −26 wandert — der Mond füllt sich.
- **Slash-Wipe** (viewBox 0 0 48 30): Orange Fläche `M-60 0H-10L5 30H-60Z` (rechte Kante Steigung 1 : 2) wandert `translateX` 0 → 75 über den Inhalt, dahinter kommt die neue Seite.
- **Transformation Alt → Neu** (6 s, Brand Kit 8a), Ebenen in viewBox 0 0 48 48 auf Tinte:
  1. 0–25 %: Glaskugel — Ring r 21 Radialverlauf #9CC8F2 → #0B2A4A, weiße Scheibe r 12 bei (26, 24), Tinte-Scheibe r 10,5 um (2,5, −2) versetzt (= Sichel), Glanz-Ellipse weiß 35 %.
  2. 25–40 %: Ring wird oranger Linienring (stroke 1,2), Scheibe wird Orange, Glanz blendet aus.
  3. 40–60 %: Tinte-Scheibe wandert nach (−7, 0): Sichel wendet sich zum Halbmond.
  4. 60–72 %: Scheiben blenden aus, Mond-Pfad des Zeichens blendet ein.
  5. 65–85 %: L kommt von `translateX(-16)` nach 0; Ring blendet bis 78 % aus. Endbild: Zeichen.

Weitere Ideen (nicht final): Scroll-Fortschritt als Füllstand im Header · Dark-Mode-Schalter: Mond dreht zur Sichel · 404: Finsternis (Mond wird dunkel) · Build-Status im Terminal: Slash Orange = ok, Signalorange = Fehler · Hover auf Projektkarten: kleiner Sweep.

---

## Komponenten-API (Vorschlag)

```ts
type Tone = 'orange' | 'cream' | 'white' | 'ink' | 'glass' | 'liquid';
type Variant = 'mark' | 'badge' | 'motion' | 'motionBadge';
type Motion = 'none' | 'sweep' | 'progress' | 'blink' | 'moonphase' | 'reveal' | 'hover';

<LoonaMark variant="mark" tone="orange" size={48} />
<LoonaMark variant="badge" size={64} motion="moonphase" />
<LoonaMark variant="motion" motion="sweep" />            // Loader
<LoonaMark variant="motion" motion="progress" value={0.4} />
<LoonaLockup size="md" tagline />                         // Zeichen + "loona! designs"
<SlashWipe active={isRouting} />                           // Seitenwechsel
<IntroTransform onDone={...} />                            // 6 s, einmalig
```
- `variant="badge"` erzwingt Tinte-Grund; `tone` wirkt dort nur auf das LD (orange/cream/white).
- `motion` ≠ none nur mit `variant="motion"` oder `"badge"`; bei `prefers-reduced-motion` rendert die Komponente das statische Zeichen mit pulsierendem Punkt.
- Alle Animationen als CSS `@keyframes` (siehe Tabelle), kein JS-Ticker; Füllstand per CSS-Variable `--progress`.

## Design Tokens
Farben
- Loona Orange `#FF7816` (Zeichen, Akzent, Aktion) · Aprikose `#FFB366` (Tint, Hover, Chips) · Signalorange `#FF4D1C` (Sekundär: Status, Hover, Tiefe im Glas-Verlauf — nie Füllung des Standardzeichens)
- Tinte `#171310` (Badge-Grund, Text) · Nacht `#0B1026` (Hero, Mondhimmel) · Creme `#F6F1E8` (heller Grund) · Weiß `#FFFFFF`
- Text sekundär `#3F3B34`, Meta `#7E796F`, Linien `#E3DCCF`, Glas-Dunkel `#B4500E`, Ghost hell `#FFE3CC`, Ghost dunkel `#3B2B1F`
- Alt-Logo-Referenz (nur für die Transformation): Sky `#9CC8F2`, Navy `#0B2A4A`, Blau `#2F7FD6`
- Kontrast: Orange auf Tinte 7,9 : 1 (Text ab 16 px ok); Orange auf Creme 2,6 : 1 (nur Zeichen/Headlines, kein Fließtext); Text auf Orange immer Tinte.

Typografie (Google Fonts)
- Manrope 400–800: Display, UI, Wortmarke; Headlines letter-spacing −0,03 em
- Instrument Serif italic: editoriale Akzente (Zitate, ein Wort in der Headline)
- JetBrains Mono 400–600: Code, Meta, Labels (Versalien +0,06 em); nie für Fließtext > 3 Zeilen

Radien: Zeichen-Ecken 1 Einheit · Badge rx 14/64 (≈ 22 %) · UI-Karten 12–14 px · Pills 999 px
Schutzraum: 8/28 der Zeichenbreite · Mindestgrößen: Zeichen 16 px, Badge 24 px, Glas 48 px

## Don'ts
Drehen/kippen · verzerren · fremde Farben im Standardzeichen · Schatten/Konturen/Effekte am Standardzeichen · Fuge füllen (Silhouette ist kein Logo) · Bewegtes Zeichen statisch als Logo · `!` färben oder weglassen · Badge auf anderem Grund als Tinte · zwei Varianten nebeneinander.

## Assets
- `assets/loona-zeichen.svg` — Zeichen
- `assets/loona-badge.svg` — Badge
- `assets/loona-bewegt.svg` — Bewegtes Zeichen (Slash als Maske)
- `assets/loona-bewegt-badge.svg` — Bewegtes Zeichen als Badge-Umkehr
- `assets/loona-zeichen-glas.svg` — Glas-Variante (Verlauf + Glanz)
- `assets/loona-lockup.svg` — Lockup Zeichen + Wortmarke (Manrope muss geladen sein)
- `assets/favicon.svg` — Favicon: Zeichen auf transparentem Grund (16–32 px); ab 48 px das Badge verwenden
- Alte Logos (Referenz für die Transformation): `reference/`

Zu exportieren (aus den SVGs, nicht Teil des Pakets): PNG-Icons 16/32/48/180/192/512/1024 — bis 32 px Zeichen, ab 48 px Badge; Maskable-Icon = Badge ohne rx auf Tinte.

## Screenshots
`screenshots/guide-*.jpg` — die Guide-Seiten 02–11 (System, Blueprints, Farbe, Typo, Anwendung, Animation, Glas). Die Live-Animationen (Kit 7a/8a) und die 250 Varianten sind nur in der HTML-Referenz sinnvoll anzusehen — `Loona Brand Kit.dc.html` im Browser öffnen, Anker `#7a`, `#8a`, `#8b`.

## Files
- `Loona Brand Kit.dc.html` — alle Runden (Varianten 001–250, Live-Animationen 5b/5c/7a/8a, adaptive Kacheln 8b, App-Icons 8c). Relevante Anker: `#6a`–`#6f` (finale Formen), `#9a`/`#9b` (Badge-Konstruktion: Negativ = Zeichen), `#7a` (Animationen), `#8a` (Transformation), `#8b` (adaptiv/Glas/Liquid).
- `Loona Brand Guide.dc.html` — 11-seitiger Guide (A4): System, Blueprints mit Maßen, Farbe, Typo, Anwendung, Animation, Glas.
- `doc-page.js`, `support.js` — Laufzeit für die HTML-Referenzen (nur zum Öffnen nötig).

---

## Nachtrag — Umsetzung in ld-evo (26.10.2026)

Paket übernommen ohne die C2PA-Metadaten der SVGs und ohne `screenshots/` (im gelieferten Paket zehn identische
Platzhalterbilder). Absprache mit dem Auftraggeber: Logo **und** Logo-Animationen umsetzen; **alle Einstellungen der
Site bleiben** (auch Varianten, die der Guide als Don't führt, z. B. die Farb-Kachel auf Orange); die Kacheln der
Produktfamilie (LD Flow, Nova, Buddy, Ivy) bekommen das Badge-Format, ihre Zeichen bleiben; Reels werden nicht neu
gerendert; Schriften und Farben der übrigen Site bleiben.

**Badge-Stand 31.10.2026** (Paket „Concepts 3“): neue Badge-Pfade, Lage `translate(9.44 9.92) scale(0.96)`, Mondphase in
der Untergruppe `translate(3 0)` — übernommen in `LOONA_BADGE`, Kacheln, Favicon-/Footer-Kacheln, App-Icons, Einzelbuchstaben
und das Partikel-Logo „Badge-LD“. Die Badge-Umkehr (`loona-bewegt-badge.svg`) ist im Paket unverändert und behält ihre
Lage (`LOONA_BADGE.motion`).

**Wo**
- `src/components/brand/products.ts` — Pfade 1:1 (`LOONA_ZEICHEN`, `LOONA_BADGE`, `LOONA_TONES`, `LOONA_GLASS`).
- `LoonaZeichen` — Zeichen, Badge, Bewegtes Zeichen, Badge-Umkehr; Töne orange/cream/white/ink/glass (+ current/auto der
  Site); Animationen als CSS-Keyframes (`LoonaZeichen.module.css`). `LoonaMark product="ld"` = Zeichen,
  `LoonaTile` = Badge-Format (ld exakt wie `loona-badge.svg`, Produkte wie ihre Favicons im Logo-Handoff),
  `LoonaLockup` (ld) = Wortmarke, `IntroTransform`, `SlashWipe` (`LoonaIntro.tsx`).
- Icons: `npm run brand:icons` (`scripts/export-brand-icons.mjs`) → `public/` (Favicons, App-Icons, Maskable,
  `og-image-1200x630.png`, `site.webmanifest`, `favicon.ico`). `npm run brand:sync` kopiert nur noch die Produktfamilie.
- Tests: `tests/unit/geometry.test.tsx` (Formen 1:1 gegen `assets/`), `tests/visual/mark-pixels.test.tsx` (Pixel).

**Einsatz der Animationen auf der Site** (alle stehen bei „Animationen aus“ und `prefers-reduced-motion`)
- Hover: Zeichen im Menü (Lockup) und in der Icon-Leiste — abschaltbar („Logo-Hover-Animation“, 30.10.2026).
- Mondphase: LD-Kachel der Splashs „LD Logo“ und „Lines“ (App-Start).
- Reveal, Sweep, Transformation Alt → Neu: neue Splash-Varianten „Reveal“, „Sweep“, „Alt → Neu“ (auf Tinte).
- Slash-Wipe: neue Page-Transition „Slash-Wipe“ (`src/site/vt/slashWipe.ts`).
- Blinken: Favicon, solange sich die Seite aufbaut (`body[data-ldbuild]` — Hero „Live-Build“, Splash „Terminal 2“);
  seit 30.10.2026 nur mit Einstellung „Favicon blinkt beim Aufbau“ (Standard aus) und mit den Bildern Zeichen ↔
  Bewegtes Zeichen — die Silhouette ohne Fuge wirkte im Tab wie ein kaputtes Icon.
- Größen im Menü (Zeichen, Schriftzug) und im Footer per Regler (30.10.2026; Standard Menü 24 px / 18 px statt 28 / 26).
- Füllstand: Komponente bereit (`motion="progress"`, `--progress`), auf der Site noch ohne festen Einsatz (im README nur
  als Idee); Vorführung auf `/brand`.

**Abweichungen / Auslegung (im Code kommentiert)**
- Sweep läuft wie im Kit bis `translateX(16)` statt +8 (README) — erst dort verlässt der Slash die Silhouette.
- Wortmarke nach Brand Guide S. 07 (Kontur 69 px ↔ Manrope 64 px, Abstand 26 px + Luft der SVG-Box); `loona-lockup.svg`
  weicht davon leicht ab.
- Zeichen-Ton der Site: Orange auf hellem **und** dunklem Grund („orange (default)“); vorher war hell Ink. „Logo negativ“
  schaltet hell auf Ink, dunkel auf Cream.
- Favicon-Auswahl: Standard ist jetzt das Zeichen (`assets/favicon.svg`); die bisherige Standard-Kachel heißt „Ink-Kachel“.
  Der alte Schlüssel „neg“ (Negativraum Orange) ist identisch mit dem Zeichen und wird darauf abgebildet.
- Maskable-Icon: LD auf 86 % verkleinert — im Badge reicht es bis 45,7 % an die Ecken, Masken garantieren nur 40 %.
  Apple-Touch-Icon ohne rx (iOS rundet selbst).
- Hover-Dauer wie im Kit (Füllung 0,54 s, danach der Slash). Ruhe-Fassung der Loader: Punkt rechts unten am Zeichen
  (Lage im Paket nicht festgelegt).
- `liquid` (Refraktion) nicht umgesetzt — die Site hat keine bewegten/farbigen Gründe dafür.
- Seitenübergang: Kante in Bildschirm-Pixeln mit Steigung 1 : 2; Umschalten bei voller Deckung (Hälfte des Wegs),
  dafür die Easing-Kurve exakt geteilt.
