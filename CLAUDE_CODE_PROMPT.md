# Master-Prompt für Claude Code — Loona! Designs Logo-System

Diesen Block komplett in Claude Code einfügen. Vorher den Ordner `design_handoff_loona_logo/` ins Repo legen (z. B. `docs/design_handoff_loona_logo/`). Für einzelne Schritte gibt es die Detail-Prompts 1–8 in `PROMPTS.md`.

---

```
Du implementierst das Logo-System von "Loona! Designs" (Portfolio von Bjoern Sellnau) in diesem Repo.
Quelle der Wahrheit: docs/design_handoff_loona_logo/README.md und docs/design_handoff_loona_logo/assets/.
Lies zuerst README.md komplett und schau dir assets/manifest.json an. Erfinde keine Formen, Farben oder Größen — alles steht dort.

## 1. Was du baust
Eine Logo-Bibliothek (React + TypeScript, inline SVG, keine <img>) für eine Kernmarke und vier Produkte:

| key   | Name             | Zeichen        | Breite W | Farbe    | Deep (auf hell) |
|-------|------------------|----------------|----------|----------|-----------------|
| ld    | Loona! Designs   | LD-Monogramm   | 44       | #FF7816  | #C2410C         |
| flow  | LD Flow.  (CMS)  | kursives ƒ     | 49       | #A78BFA  | #6D28D9         |
| nova  | LD Nova.  (Design-System) | Funke | 40       | #38BDF8  | #0369A1         |
| buddy | LD Buddy. (App)  | „b“            | 24       | #F472B6  | #BE185D         |
| ivy   | LD Ivy.   (Evergreen) | Blatt     | 40       | #3DDC84  | #15803D         |

Neutrale Farben: Ink #171310, Cream #F7F2EA, Paper #FAF7F2, Muted dark #B3A78F, Muted light #6E6455.
Schrift: Space Grotesk 500/700.

## 2. Geometrie (exakt übernehmen, keine Koordinaten runden oder "verbessern")
Alle Zeichen: viewBox "0 0 W 40", Inhalt in <g transform="translate(0 -3)">. Strich 8, Schräge 3/8 (20.556°).
- ld:    <path d="M0 3H8V35H19L22 43H0Z"/>
         <path fill-rule="evenodd" d="M11 3H24A20 20 0 0 1 24 43H25L19 27H16V11H11ZM21 11H24A12 12 0 0 1 24 35L21 27Z"/>
- flow:  <g transform="translate(14.125 0) skewX(-20.556)">
           <path fill="none" stroke-width="8" d="M30 7H26A8 8 0 0 0 18 15V31A8 8 0 0 1 10 39H6"/>
           <path fill="none" stroke-width="8" d="M8 23H18"/>
         </g>
         <circle cx="35.5" cy="23" r="4"/>   ← Punkt NICHT geschert
- nova:  <path d="M20 3L24 19L40 23L24 27L20 43L16 27L0 23L16 19Z"/>
- buddy: <path fill-rule="evenodd" d="M0 3H8V11A16 16 0 0 1 8 43H0ZM8 19A8 8 0 0 1 8 35Z"/>
- ivy:   <path transform="translate(1.5 -2.5) rotate(-38 20 23)" d="M20 3C29 14 40 20 40 27A20 20 0 0 1 0 27C0 20 11 14 20 3Z"/>
Vergleiche jedes Zeichen mit assets/(family/<key>/)mark.svg bzw. assets/ld-mark.svg.

## 3. Komponenten
- <LoonaMark product="ld" size={40} tone="color|ink|cream|current" title decorative />
  size = Höhe in px, Breite = size * W / 40. tone "color" = Produktfarbe, "current" = currentColor.
  a11y: role="img" + <title> (Default = Produktname), decorative → aria-hidden.
- <LoonaLockup product="ld" theme="dark|light" markSize={40} variant="full|mark" />
  Layout flex, center, gap = 0.4 × markSize.
  Zeile 1: Space Grotesk 700, 0.55 × markSize, letter-spacing -0.03em.
    ld  → "loona" + "!" (Farbe) + " designs"
    sonst → Name ohne Punkt + "." (Produktfarbe; auf hell Deep-Variante)
  Zeile 2: Space Grotesk 500, 0.25 × markSize, letter-spacing 0.32em, Muted dark/light.
    ld → "plattform · beyond"; sonst "<rolle> · loona! designs" (cms / design system / app / evergreen).
- Tokens als CSS Custom Properties (Prefix --loona-) im bestehenden Token-File; keine neuen Werte.
- Space Grotesk über die vorhandene Font-Lösung (next/font o. ä.), font-display: swap, system-ui-Fallback.

## 4. Assets einbauen (nicht neu generieren)
- Kernsite: Dateien aus assets/ nach public/ kopieren (favicon.svg, favicon-16/32/48.png,
  apple-touch-icon-180.png, android-icon-192/512.png, og-image-1200x630.png) und
  assets/head-snippet.html + assets/site.webmanifest übernehmen (Next.js: Metadata-API / app-Icons).
- Produkt-Sites/-Apps: gleiche Dateien aus assets/family/<key>/ (inkl. app-icon-1024.png für iOS/Android-Stores,
  lockup-dark/light.svg, mark-512.png transparent).
- theme-color überall Ink #171310. favicon.ico (16+32+48) per Script in scripts/ aus den PNGs erzeugen.

## 5. Regeln
- Produktfarbe nur im Zeichen und im Punkt der Wortmarke. Text: Cream auf Ink, Ink auf Paper.
- Kein Verlauf, keine Zweitfarbe im Zeichen, keine Schatten, keine Outlines.
- Mindestgröße Zeichen 16 px Höhe; Schutzraum rundum = 0.25 × Höhe.
- Kachel (App-Icon-Stil): Squircle "M23 0C40 0 46 6 46 23S40 46 23 46 0 40 0 23 6 0 23 0Z" (viewBox 0 0 46 46),
  Zeichen skaliert mit min(0.62, 27/W), zentriert. Ink-Kachel mit Farbzeichen oder Farb-Kachel mit Ink-Zeichen.

## 6. Demo & Checks
- Seite /brand (oder Storybook): alle 5 Marken als Mark (16/32/48/120 px), Lockup dark + light, Ink- und Farb-Kachel.
- Pixel-Vergleich: <LoonaMark size={400}> vs. assets-SVG per Playwright + pixelmatch, Toleranz 0.1 %.
- Kontrast aller Text-Kombinationen ≥ 4.5:1; Favicon 16 px im Tab (hell/dunkel) prüfen — beim LD muss der Kanal zwischen L und D sichtbar bleiben.
- Lighthouse: Icons/Manifest gefunden, keine Layout-Shifts durch Font-Loading.

Halte dich an die Konventionen des Repos (Ordnerstruktur, Exporte, Tests). Liste am Ende alle geänderten Dateien und offene Punkte.
```

---

**Optional danach:** Intro-Animation (`PROMPTS.md` → Prompt 4 „Kinetic Lock“) und Video-Export des langen WebGL-Reveals (Prompt 5).
