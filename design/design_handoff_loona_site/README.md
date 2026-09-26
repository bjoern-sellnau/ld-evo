# Handoff: Loona! Designs — Portfolio-Website (Björn Sellnau)

## Overview
Persönliche Portfolio-/Personal-Site für Björn Sellnau (Senior Full-Stack / Software Engineer, Berlin) unter der Marke **Loona! Designs** („/// the web. my passion", seit 2001). Die Site umfasst: Startseite (Hero + Featured + Blog-News), Projekte & Labs (Katalog + Case-Study-Detailseiten), .Tech-Blog (Magazin-Grid + Artikel), Über-mich (Storytelling-Split-Layout), Impressum/Datenschutz — plus ein ungewöhnlich tiefes **Einstellungs-System** (Liquid-Glass-Material, Themes, Hero-Shader-Animationen, View-Modes inkl. Telefon-Simulation).

## About the Design Files
Die Dateien in diesem Bundle sind **Design-Referenzen in HTML** (ein „Design Component"-Prototyp: `Loona Site V2.dc.html` + Runtime `support.js`). Sie zeigen Look & Verhalten, sind aber **kein Produktionscode**. Aufgabe ist es, diese Designs **in Next.js (App Router) neu zu implementieren** — mit den Patterns des Ziel-Repos. Existiert noch kein Repo: Next.js 15+, React 19, TypeScript, CSS Modules oder Tailwind v4 (Token als CSS Custom Properties), keine UI-Library nötig.

## Fidelity
**High-fidelity.** Farben, Typografie, Abstände, Radii, Animationskurven und Copy sind final und sollen pixelgenau übernommen werden. Alle Werte stehen im Prototyp als Inline-Styles; dieses README listet die Kernwerte.

---

## Routing (Next.js-Vorschlag)

| Route | Prototyp-„Page" (`state.page`) | Inhalt |
|---|---|---|
| `/` | `hallo` | Hero, Live-Sekunden-Zähler, Featured (3 Karten), News (3 gepinnte Artikel) |
| `/projekte` | `projekte` | Hero-Slider (featured) + Filter-Grid |
| `/labs` | `labs` | identisches Layout, Datenquelle `kind: 'labs'` |
| `/projekte/[slug]`, `/labs/[slug]` | `detail` | Case Study (Kapitel 01–05) |
| `/tech` | `tech` | Magazin-Grid (Karte 1 doppelt breit) |
| `/tech/[slug]` | `artikel` | Artikel-Detail |
| `/ueber-mich` | `ueber` | Split-Layout mit Scroll-Spy |
| `/impressum` | `impressum` | Impressum + Datenschutz mit Bereichs-Rail |

Zurück-Logik: Detailseiten merken sich die Herkunft (`from: 'projekte' | 'labs' | 'hallo' | 'tech'`) — „‹ Zurück" führt zur tatsächlichen Ursprungsseite (Next: `router.back()` mit Fallback auf Listen-Route).

**Seitenwechsel nutzen die View-Transition-API** (`document.startViewTransition`): Karten-Cover ↔ Detail-Hero morphen über `view-transition-name` (pro Item eindeutig, z. B. `vt-corefall`); Filterwechsel im Grid ebenfalls via View Transition. Next 15: `unstable_viewTransition` bzw. CSS `@view-transition`.

---

## Design Tokens

### Farben (CSS Custom Properties auf `body`)
| Token | Dark | Light |
|---|---|---|
| `--bg` | `#0A1220` | `#FFFFFF` |
| `--bg2` | `#0D1728` | `#F6F9FC` |
| `--card` | `rgba(255,255,255,0.045)` | `#F6F9FC` |
| `--cardsolid` | `#111E33` | `#FFFFFF` |
| `--border` | `rgba(255,255,255,0.09)` | `#E9EDF2` |
| `--ink` | `#F2F5FA` | `#0F2137` |
| `--muted` | `#AEBCD0` | `#56637A` |
| `--soft` | `#7E90A9` | `#8A94A4` |
| `--accent` | `#FFB224` | `#D97706` |
| `--on-accent` | `#241400` | `#FFFFFF` |
| `--btn` / `--btn-ink` | `#FFFFFF` / `#0A1220` | `#0F2137` / `#FFFFFF` |
| `--hair` | `rgba(255,255,255,0.08)` | `#E9EDF2` |

Akzent-Auswahl (Einstellungen): Orange / Gelb / Blau — **pro Theme gemappt** (Light bekommt dunklere Töne, z. B. Orange `#FFB224`→dark, `#D97706`→light), damit Kontrast ≥ 4.5:1 bleibt. High-Contrast-Schalter dunkelt `--bg` im Dark Mode weiter ab.

### Glas-Tokens
`--glassTint` + `--glassPct` → `--glass: color-mix(in srgb, var(--glassTint) var(--glassPct), transparent)`; dazu `--glassg1/--glassg2` (vertikaler Gradient-Film), `--glasshi` (Kanten-Highlight), `--glassbrd` (Border), `--blurAmt` (12–48px je Transparenz-Stufe 1–5), `--radL` (22px Panels), `--pill`, `--shadow`. Tab-Bar & Back-Pill erzwingen Mindestdeckung: `max(var(--glassPct), 62%)`.

### Typografie
- **Instrument Sans** (400–700, italic) — UI & Fließtext
- **JetBrains Mono** (400–700) — Kicker/Labels (10–11px, letter-spacing 0.14–0.2em), Zähler, Meta
- Hero H1 62px/1.03, -0.035em (mobil 40px); Seitentitel 42px; Detail-Hero 56px (mobil 34px); Artikel-Hero 46px (mobil 29px); Sektionstitel 30px; Karten 16.5–17.5px; Body 15–16px/1.65–1.75

### Sonstiges
Radii: Karten 18px, Panels 22px, Hero-Squircle 96px, Pills 999px. Card-Hover: `translateY(-4px)` + Accent-Border (0.25s). Feder-Kurve für Ein-/Ausblenden: `cubic-bezier(0.32,1.2,0.35,1)` (0.55s); Menü-Page: `cubic-bezier(0.22,1,0.32,1)`.

---

## Screens (Kurzreferenz)

### Hallo (`/`)
- Badge „#TeamMaterna — Public Sector | E-Government | Zoll" (Glas-Pill, grüner Puls-Dot)
- H1 „Das Web.<br>Meine Leidenschaft." — Text in `#FFF` mit `mix-blend-mode:difference` über der Hero-Animation (Stripe-Effekt: Text färbt sich über der Grafik um)
- Rotierende Rollen (min-height 2 Zeilen mobil, Fade+Slide 0.3s, 3.4s-Takt): Senior Full-Stack / Senior Software Engineer : Frontend · Senior React Engineer · React Native Engineer · Senior Full-Stack : Frontend · Senior Nextjs Engineer · Senior Node Engineer · IT-Ausbilder (AEVO): Fachinformatiker – Anwendungsentwicklung
- Stats-Leiste: live tickender Sekunden-Zähler seit `2007-09-01T09:00` (de-DE formatiert) · „18+ Jahre · 10 Zertifikate · Berlin & Remote"
- Featured: Corefall, Covert Operations, OpenBooking; News: 3 gepinnte .Tech-Artikel

### Projekte / Labs
Kicker + kurzer Titel, Auto-Slider der Featured-Items (5.6s, endlos, Progress-Circle oben rechts, Pfeile, Dots), Filter-Chips (Kategorien je Datenquelle), 3-spaltiges Karten-Grid (mobil 1-spaltig). Karten: Cover-Fläche (Flächenfarbe + Mono-Kürzel + Diagonal-Streifen-Overlay), Status („● spielbar im Browser" / „in Arbeit").

### Case Study / Artikel (Detail)
Voll-Hero in Cover-Farbe (Text schwarz/weiß per Luminanz `L = 0.2126R+0.7152G+0.0722B`, Schwelle 0.55; Rundung unten 44px — entfällt bei Cover-Farbe-Vollmodus). Kapitel: 01 DIE AUSGANGSLAGE (18.5px) · 02 DER ANSATZ · Zitat (22px italic, zentriert) · 03 DIE WERKZEUGE (Chip-Reihe) · 04 DAS ERGEBNIS (21px bold) · 05 GELERNT. Artikel tragen sichtbar „ENTWURF"-Badge (Platzhaltertexte!).
**Cover-Farbe-Option (an by default):** ganze Seite übernimmt die Cover-Farbe als `--bg`, alle Ableitungen (`--ink/--muted/--soft/--hair/--card/--border`) werden als rgba von Schwarz/Weiß gesetzt (siehe `applyCoverColor()`); Zurück-Buttons nutzen dann `var(--ink)` statt Akzent.

### .Tech
Magazin-Grid: erste Karte `grid-column: 1/2` (26px Titel), Rest 18px; Karten in Artikel-Farbe mit Ink-Ableitung. 23 Artikel im Datensatz (3 gepinnt, 20 Entwürfe).

### Über mich
Split: links sticky Bild (4 Slots, wechselt per Scroll-Bereich mit Crossfade 0.6s; Prototyp nutzt `image-slot.js` Drag&Drop), rechts Content (Intro „Vom Flash-Kid zum Senior Engineer — ohne die Neugier zu verlieren.", Vita, Werkzeuge, Skills-Bento, 10 Zertifikate, Stationen mit Projekten je Firma + Stack-Chips, unten Loona!-Block mit 4 Plattform-Projekten). Rechts eine Punkt-Rail (Scroll-Spy, 26 Ziele inkl. Projekte): Labels nur bei Hover/aktiv (Fade+Slide 0.3s), Punktgrößen 9/7/5px nach Hierarchie. Mobil: Bild oben (46vh), Rail entfällt.

### Impressum
Loona! Designs — Björn Sellnau, Gardeschützenweg 59, 12203 Berlin, `info@loona-designs.de`; Datenschutz-Abschnitte; eigene Bereichs-Rail rechts.

---

## Navigation & Chrome

### Liquid-Glass-Nav (Desktop)
Zentrierte Pill (top 16px): Logo „L!" (24px, Gradient `#FFB224→#FF7A2F`, Radius 8px) + „Loona!" · Divider · Hallo, Projekte, Über mich, Labs, .Tech, Impressum · Divider · Icon-Buttons Theme ☀/☾, Suche ⌕ (Tooltip ⌘K), Animation ⏸/▶, Einstellungen ⚙ (+ ab 1600px: Seitenmenü-Toggle) · Kontakt-Button (Accent). Auf Detailseiten erscheint links eine Zurück-Pille (Typewriter-Einblendung des Labels, verschwindet rückwärts).

### Glas-Material (Schichten, in dieser Reihenfolge)
1. Basis: `linear-gradient(var(--glassg1),var(--glassg2))` über `var(--glass)` + `--glassbrd`-Border + Inset-Highlights
2. **Frost** `[data-ldfrost]`: absolute Fläche mit `backdrop-filter: blur(var(--blurAmt)) saturate(1.8)` — bei aktiver **Refraction** stattdessen `--bfMain: url(#ldfN)` (s. u.)
3. **Edge** `[data-ldedge]`: schmaler maskierter Ring, `backdrop-filter: brightness(1.3) saturate(1.7) contrast(1.16) blur(0.4px)` (Licht-Brechkante)
4. **Rim** `[data-ldrim]`: 1px Innenring-Glanz
5. Sheen: träge laufender Glanz-Gradient (12s alternate)
6. Noise-Layer (SVG-Turbulence, sehr subtil)

**Refraction (Chromium):** Pro Glas-Element wird eine Displacement-Map als Canvas gerendert (Signed-Distance zur abgerundeten Kante, Verschiebungsvektoren in R/G) und als SVG-Filter angewandt: 3× `feDisplacementMap` mit leicht unterschiedlicher `scale` (±6%) auf R/G/B getrennt + `screen`-Blend = chromatische Aberration, dann Blur+Saturate. Siehe `makeDispMap()` / `refreshGlassFilters()`. Firefox/Safari: Fallback auf normalen Frost-Blur.

**Material-Modi:** Liquid (voll) · Fluent (Acryl: mehr Deckung, feines Noise, gerade Kanten-Highlights) · Flat (keine Gradients/Glanz/Refraction). Schalter: Blur, Schatten, Refraction, Flat, Transparenz 1–5.

### Auto-Kontrast (iOS-Scroll-Edge-Logik)
`adjustNavContrast()` misst an 7 Punkten hinter jeder Glas-Leiste (Nav, Tab-Bar, Back-Pill) die Hintergrund-Luminanz: erst via `[data-ldsample]`-Attributen (Hero-Animationen/Cover tragen `"dunkelLum,hellLum"` pro Theme), sonst `elementsFromPoint` + `backgroundColor`-Parsing. Ergebnis mit Hysterese:
- moderate Abweichung → Tint-Verdichtung (`--glassTint`/`--glassPct` weich animiert via `@property`-Transition 0.5s) + angepasste `--muted/--soft`
- starke Abweichung → kompletter **Flip** auf Gegen-Material (helles Glas + dunkle Schrift bzw. umgekehrt) — nur wenn „Opposite Color" an
- Alternativ „Kontrast-Schatten": statt Tint bekommen Texte `text-shadow` (Kontakt-Button ausgenommen)
- „Scroll-BG": progressiver Blur-Saum (118px, maskiert ausfadend) hinter der Nav ab `scrollY > 24`

### View-Modes (Einstellungen ▸ Ansicht: Desktop / Mobile / Wide)
- **Wide**: Nav als vertikale Glas-Sidebar links (224px, iPadOS-artig), Content-Offset `max(266px, calc((100vw − 1304px)/2))`
- **Mobile** (auch automatisch < 860px): 430px-Layout; am Desktop simuliert mit Telefon-Bezel (434px, Radius 32px, Desk-Hintergrund) + **Gerät-Optionen**: Clear / Dynamic Island (Breite 84–190px, Kamera-Punkt) / Camera Hole (Position 8–92%) / Notch (Breite 120–250px, Lautsprecher) — bei aktiver Hardware rückt die Top-Nav auf 58px
- **Mobile klassisch**: Logo-Pill oben (+ Zurück auf Detail), Tab-Bar unten
- **Modern Mobile-Nav** (Schalter): keine Top-Leiste; Tab-Bar = Projekte · Über mich · **L!-Home-Button** (34px Gradient-Kachel, mittig) · Labs · Menü; Detailseiten bekommen eine schwebende Glas-**Zurück-Pille über der Tab-Bar** (bottom 92px); Top-Abstände kompakter (Hero 78px, Listen 84px, Detail 72px)
- **Scrollhide** (Schalter): Runterscrollen >150px blendet Tab-Bar aus (`translateY(130px)`, Feder 0.55s), Hochscrollen >28px zeigt sie; oben (<70px) immer sichtbar; Zurück-Pille bleibt und sinkt auf bottom 18px
- Tab-Bar: bottom 18px, `calc(100% − 44px)` max 386px, Radius 28px (iOS-26-Floating-Insel)
- **Mobile-Menü = Vollbild-Glas-Page** (slide-up 0.45s, gestaffelte Items): L!-Header, große Einträge .Tech / Impressum (27px), 2×2-Kacheln Theme/Suche/Animation/Optionen, Kontakt-Button, Footer-Zeile; Tab-Bar bleibt sichtbar, Menü-Tab wird ✕

### Overlays
- **Suche** (⌘K/Strg+K toggle, Esc): Glas-Panel, fuzzy über Seiten/Projekte/Artikel, Badges SEITE/PROJEKT/LAB/ARTIKEL
- **Kontakt**: Name/E-Mail/Nachricht → `mailto:info@loona-designs.de` (vorbefüllt), GitHub- + LinkedIn-Buttons (`github.com/bjoern-sellnau`, `linkedin.com/in/bjoern-sellnau`)
- **Einstellungen**: 300px-Panel, Header fix, Inhalt scrollbar (max-height mobil `100dvh−150px`, sonst `min(76vh,660px)`)
- **Cookie-Banner** (Glas, Keks-Illustration, „Keine Krümel, versprochen."), Strg+C zeigt ihn zum Testen erneut

---

## Hero-Animationen (Einstellungen ▸ Hero-Animation)
Alle full-bleed hinter dem Hero (außer Flow = Squircle), pausieren via IntersectionObserver außerhalb des Viewports und beim Animations-Toggle; DPR-Cap 2; WebGL-Fallback = dunkler Verlauf. Konfiguration pro Modus in `ld-herocfg` (JSON: `{s,x,y,a,t,pal,cust}`), „Default wiederherstellen" löscht den Modus-Eintrag.

| Modus | Technik | Konfig |
|---|---|---|
| **Flow** (Default) | CSS: rotierendes Squircle (110vw×470px, Radius 96px, −8°, Schwebe-Animation) mit wanderndem Farbband + Echo + Satelliten | Größe 40–400%, X/Y, Palette |
| **Lava** | WebGL-Metaballs (7 Blobs, Feld-Schwelle, warm-Gradient) | Palette/Custom |
| **Aurora** | WebGL fbm-Vorhänge + Sterne | Preset „Current"/„Aurora Borealis", Palette |
| **Ribbon** | WebGL: 1 Seidenband mittig, verdreht sich (Faltbreite `0.055+0.15·|cos|`), Vorder-/Rückseite, Glanz, Ghost-Echo | Größe/X/Y, **Winkel**, **transparenter BG**, Palette |
| **Orbit** | Canvas 2D: glühendes Zentrum, 3 geneigte Ringe, Satelliten mit Trails, Netzwerk-Punkte | Größe/X/Y |
| **Blackhole** | WebGL: Akkretionsscheibe (Swirl+fbm), Photonenring, Doppler | Größe/X/Y, Palette |
| **Supernova** | WebGL: Kern, 2 Schockwellen, Strahlenkranz, Nebel | Größe/X/Y, Palette |

Paletten (je 5 Hex): amber `#FFD36E #FFB224 #FF7A2F #FF5E8A #7A4ADB` · ocean · candy · forest · mono · **Custom** (5 Color-Picker, seeded aus aktueller Palette). Shader-Uniforms: `u_res, u_time, u_cx, u_cy, u_scale, u_ang, u_bgT, u_p0..u_p4, u_var`. Quelle: `startLava()` (alle GLSL-Strings) + `startOrbit()` in der Logic-Klasse — 1:1 nach Next portierbar (Custom Hook `useHeroShader(canvasRef, mode, cfg)`).

## State / Persistenz (localStorage-Keys)
`ld-theme, ld-anim, ld-hc, ld-shadow, ld-flat, ld-blur, ld-refr, ld-style, ld-glasslvl, ld-accent, ld-autoc, ld-oppc, ld-ctshadow, ld-scrollbg, ld-coverfull, ld-heroanim, ld-aurorapre, ld-herocfg (JSON), ld-viewmode, ld-mobnav, ld-scrollhide, ld-frame, ld-framecfg (JSON), ld-navside, ld-cookie`. In Next: ein `SettingsProvider` (Context) mit identischen Keys, SSR-safe (Hydration: Defaults dark/an, dann Client-Sync).

## Daten
Projekte (`kind: 'projekte' | 'labs'`, je mit Cover-Farbe, Mono-Kürzel, Tag, Datum, Stack, Kapiteltexten, optional Link): Corefall (spielbar, `bjoern-sellnau.github.io/core-fall`), Covert Operations (spielbar), OpenBooking, E-Government & Zoll (NDA), Arena, Death Grid 3D, LD WorkBench, LD Buddy, LD Website Design Ideas. Artikel: 3 finale Pins + 20 ENTWÜRFE (Texte ersetzen!). Stationen/Zertifikate: vollständig im Prototyp (`data()`-Methode). → In Next als `content/*.ts` oder MDX.

## Assets
- Fonts via Google Fonts (Instrument Sans, JetBrains Mono) — self-hosten via `next/font`
- Favicon: Inline-SVG „L!" auf Amber-Gradient (im `<head>` des Prototyps)
- Über-mich-Fotos: aktuell Drag&Drop-Slots (`image-slot.js`) — im echten Build durch eigene Bilder ersetzen (kein Stock ausliefern)
- Projekt-Cover: reine Flächenfarben + Typo, keine Bilddateien nötig

## Files
- `CLAUDE-CODE-PROMPT.md` — fertiger Copy-Paste-Prompt für die Umsetzung mit Claude Code
- `Loona Site V2.dc.html` — **die komplette Referenz** (Template = Markup/Styles, `<script data-dc-script>` = Logik: Daten, Shader, Kontrast-System)
- `support.js` — DC-Runtime (nur damit der Prototyp lokal läuft; nicht portieren)
- `image-slot.js` — Drag&Drop-Bildslot des Prototyps (nicht portieren)
- `SPEC-v2.md` — ursprüngliche Feature-Spezifikation

**Empfohlene Reihenfolge:** Tokens/Theme → Glas-Komponente (`<GlassSurface>`) → Nav (Desktop→Wide→Mobile→Modern) → Seiten mit statischen Daten → Detail-Cover-Logik → Einstellungen → Hero-Shader → Auto-Kontrast → View Transitions.

## OG-Preview
`og-image.png` (1200×630) liegt im Paket — Site-Look mit Wave-Band, L!-Logo, Claim und Kicker. Im Next-Build als `opengraph-image.png` in `app/` legen (oder via `metadata.openGraph.images` mit absoluter URL); `twitter:card = summary_large_image`.

## Screenshots
Im Ordner `screenshots/` (aus dem laufenden Prototyp; Hinweis: die WebGL-Hero-Animation wird bei der Aufnahme teils leer/dunkel abgebildet — Referenz für die Shader ist der Code, nicht das Bild):
- `01-home-desktop-dark.png` — Startseite, Dark, Flow-Hero
- `02-projekte-slider-grid.png` — Projekte: Featured-Slider + Filter-Grid
- `03-case-study-corefall.png` — Case Study mit Cover-Farbe (ganze Seite getönt)
- `04-tech-magazin.png` — .Tech Magazin-Grid
- `05-ueber-mich-split.png` — Über mich: Split-Layout + Punkt-Rail
- `06-home-light.png` — Startseite im Light Mode
- `07-mobile-modern-nav.png` — Mobile-Simulation, Modern Nav (L!-Home mittig, Tab-Bar-Insel)
- `08-mobile-menue-page.png` — Mobile-Menü als Vollbild-Glas-Page
- `09-wide-sidebar.png` — Wide-Modus mit Glas-Sidebar links
- `10-home-desktop-2.png` — Startseite Desktop (Zweitaufnahme)

## Nachtrag — Features seit Paketstand v1

### Splash-Screen
Beim Laden ~2,5 s Brand-Splash (immer dunkel, wie nativer App-Start): Radial-Glow auf #0A1220, L!-Kachel poppt federnd ein (cubic-bezier(0.2,0.9,0.3,1)) und "atmet" (Amber-Glow-Puls 2,2 s), "Loona! Designs" + Tagline staffeln nach, indeterminierter Amber-Ladebalken (148×3 px, Runner 58 px, 1,1 s). Fade-out 0,5 s, danach aus dem DOM (keine Klick-Blockade). **Schalter "Splash-Screen"** in den Einstellungen (localStorage `ld-splash`). Wichtig: Splash läuft auch bei "Animationen aus" (Ausnahme von der globalen Pause-Regel), sonst 2,5 s Schwarzbild.

### Detailseiten (Cases + Artikel)
- **Kapitel 06 EINDRÜCKE** (Cases) bzw. Galerie nach dem Fließtext (Artikel): 1 breiter Slot (320/300 px) + 2 kleine (200/180 px, mobil gestapelt), Drag&Drop-Slots mit Persistenz **pro Item** (IDs `gal-<projektId>-1..3` / `agal-<artikelId>-1..3`).
- **Lightbox**: ⤢-Button oben rechts auf gefüllten Slots öffnet Vollbild-Overlay (rgba(4,8,16,0.82) + blur(14px), Bild max 92vw/84vh contain, Pop-Animation). **Durchblättern** über alle gefüllten Slots der Galerie (leere übersprungen, Wrap-around): ‹/›-Buttons, Pfeiltasten, Klick aufs Bild = weiter, Zähler "2 / 3" unten. **Slide-Animation** beim Wechsel (Bild gleitet 34 px in Richtung raus/rein, 0,16 s out / 0,22 s in). **Swipe**: horizontal >48 px (Richtungs-Check ×1,4 gegen Scroll) blättert, vertikal >90 px schließt. Esc/✕/Backdrop schließen. Hinweis: Bild als background-image-Fläche rendern, nicht als <img> mit Template-Hole (sonst 404-Fetch des unaufgelösten Platzhalters beim Streaming).
- **Verwandte-Reihen** statt Einzel-Teaser: "VERWANDTE PROJEKTE/EXPERIMENTE/ARTIKEL", 3 Karten in Cover-Farbe (Name/Titel, Mono-Kürzel, Tag · Datum, Streifen-Textur, Hover-Lift −4 px). Sortierung: gleiche Kategorie zuerst, dann Listen-Nähe; Navigation mit View Transition, Zurück-Herkunft bleibt.

### Slider
Projekte/Labs-Hero-Slider: **Swipe-Gesten** (gleiche Schwellen wie Lightbox), zusätzlich zu Auto-Play, Pfeilen, Dots, Progress-Circle.

### OG/Meta
`og-image.png` (1200×630, im Paket) + og:title/description/locale/image, twitter:card summary_large_image, theme-color, SVG-Favicon "L!" — alles im <head> des Prototyps.

### Einstellungen (finaler Stand der Schalter)
Ansicht (Desktop/Mobile/Wide) · Gerät (Clear/Island/Hole/Notch + Slider, nur Mobile-Sim) · Dark/Light · Akzent (3) · Transparenz (5 Stufen) · Material (Liquid/Fluent/Flat) · Hero-Animation (7 Modi + Paletten/Custom-Farben + Größe/Position/Winkel/Transparent-BG + Aurora-Preset) · High Contrast · Schatten · Blur · Refraction · Auto-Kontrast · Opposite Color · Kontrast-Schatten · Scroll-BG · Cover-Farbe · Flat · Animationen · **Splash-Screen** · Modern Mobile-Nav (mobil) · Scrollhide (mobil). Neue localStorage-Keys seit v1: `ld-splash`.

### Offene Inhalte
Echte Fotos (Über-mich- + Galerie-Slots) und echte Blog-Texte (20 ENTWURF-Artikel) werden vom Site-Inhaber nachgeliefert — Struktur steht.

## Nachtrag v3 — Performance & PDF

### Performance-Optionen (Einstellungen)
- **Performance-Modus** (`ld-perfmode`): Hero-Canvas rendert mit max. DPR 1,35 statt 2 (`heroDpr()`) — halbiert die Fragmentlast von WebGL-Shadern und Orbit-Canvas; UI bleibt bei voller Auflösung.
- **30 fps Hero** (`ld-fpshalf`): Render-Loops überspringen jedes zweite rAF — für die trägen Modi (Aurora/Ribbon) visuell verlustfrei.
- Automatisch, ohne Schalter: WebGL-Context mit `powerPreference: 'low-power'` (keine dGPU-Aktivierung) und `document.hidden`-Guard in beiden Loops (Hintergrund-Tab rendert nichts). Bestehende Safeguards: IntersectionObserver pausiert Hero außerhalb des Viewports, DPR-Cap, Resize nur bei echter Größenänderung.
- Kostenprofil der Modi (für Budget-Entscheidungen): Flow = reines CSS (Compositor); Lava günstig (7 Metaballs); Blackhole/Supernova mittel (2–4 fbm); Aurora/Ribbon am teuersten (mehrschichtiges fbm) — Kandidaten für die 30-fps-Drossel auf iGPUs.

### Druck/PDF
`Loona Site V2-print.dc.html` (im Projekt, nicht im Paket nötig) zeigt das Muster für einen Site-PDF-Export: alle Hauptseiten-Flags auf true (gestapelt), Splash aus, viewMode 'auto' erzwungen, heroAnim 'flow' (WebGL druckt nicht), fixe Chrome-Elemente via `[style*="position:fixed"]` ausgeblendet, sticky → static, `@page size:letter`, Animation-Freeze-Rezept, Auto-Print nach Font-/Bild-Load. In Next.js entspricht das einer `/print`-Route mit denselben Regeln.

Neue localStorage-Keys seit v2: `ld-perfmode`, `ld-fpshalf`.

## Nachtrag v4 — neue Hero-Modi & Standalone

### Hero-Modi Matrix & Regen (jetzt 9 gesamt)
Beide Canvas-2D (teilen sich `ld-orbit-canvas`; Routing in `ensureLava()`: orbit → startOrbit, matrix → startMatrix, rain → startRain, sonst WebGL startLava).
- **Matrix** (`startMatrix()`): fallende Glyphen-Kolonnen (Katakana/Ziffern/"LOONA!"-Zeichen, JetBrains Mono 17px·dpr, Spaltenraster 0,72·fs) auf #040705. Trail-Technik: pro Frame rgba(4,7,5,0.085)-Fade-Rect statt Clear; heller Kopf = Palette[0], Trail = Palette[1], ~22 % der Spalten in Palette[4] (Tiefen-Parallaxe). Sample-Lum 0.05.
- **Regen** (`startRain()`): Fensterscheibe bei Nacht — vertikaler Verlauf aus Palette[3]/[4] (×0,10–0,30 abgedunkelt), 7 wandernde Bokeh-Lichter (radial, Palette[0]/[2]), 26 ablaufende Streifen (Linear-Gradient-Strokes), ~110 Tropfen skaliert mit Viewportbreite: Refraktions-Kern (dunkel) + heller Rand + Glanzpunkt oben links; ~30 % "slide"-Tropfen mit Beschleunigung + Sinus-Wobble, Lebensdauer/Respawn. Sample-Lum 0.08, BG linear-gradient(#0B1220,#05070E).
- Beide: Paletten/Custom-Farben (`resolvePal`), Reset, Performance-Modus (heroDpr 1,35), 30-fps-Skip, document.hidden- und IntersectionObserver-Guards. Segmente "Matrix"/"Regen" in Einstellungen ▸ Hero-Animation; keine Größe/Position-Slider (Vollfeld-Effekte).

### Standalone-Export-Muster
`Loona Designs Website.html` (Projekt-Root) = Ein-Datei-Offline-Bundle via Inliner. Vorbereitung im Quell-Duplikat: (1) `from="./image-slot.js"` aus allen x-imports entfernt und stattdessen `<script src="./image-slot.js">` im helmet (JS-Fetches sieht der Bundler nicht, Script-Tags schon); (2) `<template id="__bundler_thumbnail">` mit L!-Glyph auf #0A1220 als Unpack-Splash. Warnungen "%23n" (SVG-Filter-Fragment) und "{{ lightboxUrl }}" (Laufzeit-Hole) sind Fehlalarme.

## Nachtrag v5 — sechs weitere Hero-Modi (jetzt 17 gesamt)

Alle folgen dem etablierten Muster: Segment in Einstellungen ▸ Hero-Animation, Paletten/Custom-Farben über `resolvePal()`, "Default wiederherstellen", Auto-Kontrast-Sample pro Modus, Performance-Modus (heroDpr 1,35), 30-fps-Skip, document.hidden- + IntersectionObserver-Guards. Keine Größe/Position-Slider (Vollfeld-Effekte).

### Canvas-2D (teilen sich ld-orbit-canvas; Routing in ensureLava())
- **Schwarm** (`startSwarm()`): ~300 Boids, 3 Attraktoren auf Lissajous-Bahnen, Separation/Alignment über Spatial-Grid (Zelle 46px·dpr, max. 9 Nachbarn), Tangential-Drall für Murmuration, Trail-Fade rgba(5,7,13,0.16), Geschwindigkeit → Größe/Alpha. Farben: Palette[0]/[1]/[2]/[4] nach Zufallsklasse. Sample 0.06, BG #05070D.
- **Glühwürmchen** (`startFirefly()`): ~70 Leuchtkäfer auf Wander-Bahnen (Sinus-Kombis), Blink = sin³ der Phase, Kuramoto-artige Synchronisation (mittlere Phase zieht mit Faktor 0.0035), additiver Halo (Palette[0] nah / [1] fern) + weißer Kern; Nachthimmel, Mondschein (Palette[2]) oben rechts, 2 schwankende Gras-Silhouetten-Ebenen. Sample 0.05.
- **Sternschnuppen** (`startShooting()`): ~210 funkelnde Fixsterne (18 % in Palette[0]), Meteore alle 1,4–4 s (18 % Schauer mit 2–3 versetzt), flache Bahn 18–38°, Linear-Gradient-Schweif + radialer Kopf-Glow, additiv; Milchstraßen-Schimmer diagonal. Farben weiß/Palette[0]/[2]. Sample 0.04.
- **Schnee** (`startSnow()`): ~260 Flocken, 3 Tiefenebenen (Größe/Tempo/Farbe koppeln an depth), Taumeln + globale Böen (2 überlagerte Sinus-Drifts), Glanzpunkt auf nahen Flocken, Schneedecke (Sinus-Hügel), Laternenschein (Palette[0]) unten links, Himmel aus abgedunkelten Palette[3]/[4]. Sample 0.10.

### WebGL (fsClouds/fsStorm/fsInk/fsGrid in startLava()-Routing)
- **Wolken** (`fsClouds`): 2 fbm-Schichten mit verschiedenen Scroll-Tempi (Zeitraffer), nahe Schicht mit Licht/Schatten-Seite (shade-fbm) + Kanten-Glow zur Sonne (exp-Falloff um Sonnenposition 0.78/0.24), Himmel Palette[2]→[4], Sonnenglut Palette[0]. HELLER Modus: Sample 0.55/0.62.
- **Nordlicht-Sturm** (`fsStorm`): 3 peitschende Vorhänge — Band-Kurve aus Sinus + fbm-Warp, Ripple-fbm moduliert, Flacker-Term sin(t·2.3+…); Faser-Strahlen (fbm^2 vertikal maskiert), Sterne, Boden-Silhouette. Bänder Palette[1]→[2], Glut [0], Schimmer [4]. Sample 0.07.
- **Tintenfluss** (`fsInk`): double domain-warp (q→r→f), 3 Schlieren-Masken (smoothstep-Bänder) in Palette[2]/[1]/[4·0.55], dunkler Kern in dichtesten Wirbeln, Randsaum Palette[0]·0.18, Elfenbein-Grund mit Papier-fbm. HELLER Modus: Sample 0.72/0.78.
- **Neon-Grid** (`fsGrid`): Synthwave — Horizont 0.58, perspektivisches Grid (1/depth-Projektion, gz scrollt +t·2.4), Linien Palette[2]→[4] (fbm-gemischt), Puls-Wellen Palette[0] laufen durchs Grid, Scanline-Sonne (Streifen unter Horizont ausblendend, Palette[1]→[0]) + Glow, Sterne. Sample 0.06.

Segment-Reihenfolge: Flow, Lava, Aurora, Ribbon, Orbit, Blackhole, Supernova, Matrix, Regen, Schwarm, Glühwürmchen, Sternschnuppen, Schnee, Wolken, Nordlicht-Sturm, Tintenfluss, Neon-Grid.

## Nachtrag v6 — Bugfixes Hero-Modi (wichtig für den Port)

1. **heroGlDisp** (Sichtbarkeit der WebGL-Canvas `ld-lava-canvas`) muss ALLE WebGL-Modi enthalten: lava, aurora, ribbon, blackhole, nova, clouds, storm, ink, grid. Die vier v5-Modi fehlten — sie rendersten in eine display:none-Canvas (sichtbar war nur der statische heroFxBg-Verlauf). Lehre für Next.js: Sichtbarkeit nicht pro Modus enumerieren, sondern aus dem Renderer-Typ ableiten (webgl ↔ canvas2d), z. B. eine einzige Map mode→renderer als Quelle für Routing UND Canvas-Wahl.
2. **Fehlerbehandlung pro Modus statt global**: Ein Shader-Linkfehler setzte das globale `_glFail`-Flag, das danach ALLE Nicht-Orbit-Modi blockierte — auch die Canvas-2D-Modi (Matrix wirkte deshalb defekt). Jetzt: `_glFail` nur noch für "WebGL-Context nicht verfügbar" (blockiert nur WebGL-Modi; `is2d`-Liste ist ausgenommen), Linkfehler landen in `_fxFail[mode]` (nur dieser Modus fällt auf den statischen Hintergrund zurück) und werden mit `console.error('LD hero shader "<mode>" link failed:', programInfoLog, fragmentLog, vertexLog)` geloggt.
3. Storage-Hinweis: `ld-heroanim` kann durch Alt-Stände 'mesh'/'portal' enthalten — Mapping auf 'ribbon'/'flow' beim Laden beibehalten.

Der beiliegende Prototyp-Stand enthält beide Fixes.

## Nachtrag v7 — Matrix-Filmstart

**Matrix Slow-Start** (`startMatrix()`): Der Rain beginnt wie im Film — bei jedem Start fällt zuerst eine einzelne, langsame Kolonne (zufällige Spalte im mittleren Drittel, Tempo-Faktor 0,42 statt 0,55–1,5), die übrigen Spalten setzen gestaffelt ein: pro Spalte `wait = 100 + random·760` Frames (bei 60 fps → volles Bild nach ~13 s; wait dekrementiert pro Frame, Spalte rendert erst bei wait ≤ 0). Alle Spalten starten bei y = −fs statt zufällig verteilt. Respawnte Spalten haben kein wait mehr.

**Geplant, noch nicht im Prototyp** (Spec siehe Projekt-Todos 43/44):
1. Hero-Text-Farbe als Option — Auto (weiß/schwarz per lum()-Kontrast-Logik gegen das Modus-Sample) oder Custom-Farbe; Hero-Texte auf ein zentrales Farb-Binding umstellen, mix-blend-mode:difference nur noch im Auto-Modus bei Flow.
2. Matrix Cinematic Mode — Toggle (`ld-mxcine`) + zwei einstellbare Texte (`ld-mxt1` Default "Bjoern Sellnau", `ld-mxt2` "Das Web. Meine Leidenschaft."): Nach dem Slow-Start Text 1 zentriert einblenden mit Fly-to-Camera (Scale 1→1,8 + Alpha-Kurve, JetBrains Mono, Canvas-gezeichnet), ausfaden, danach Text 2 ebenso; einmal pro Start.

## Nachtrag v8 — Kontrast-Schatten-Algorithmus, Hero-Text-Farbe, Matrix Cinematic

### Kontrast-Schatten (Menü) — jetzt algorithmisch
In adjustNavContrast(), ctShadow-Pfad (Schatten STATT Tint-Verdichtung; Flip/Tint bleiben deaktiviert):
- Stärke = Kontrast-Defizit: `s01 = clamp01(lightText ? (backL−0.10)/0.55 : (0.85−backL)/0.55)` (backL = gemessene Hintergrund-Luminanz hinter der Leiste; lightText = theme !== 'light').
- Farbe = Gegenpol der Textfarbe: heller Text → dunkler Schatten rgb(2,6,14), dunkler Text → heller Schein rgb(255,255,255).
- Zwei Layer: `0 1px 1.5px rgba(col, 0.22+0.5·s01)` + `0 2px (6+10·s01)px rgba(col, 0.12+0.42·s01)`; unter s01 ≤ 0.02 kein Schatten. Stufenlos, kein binäres Umschalten mehr. Kontakt-Button behält text-shadow:none.

### Hero-Text-Farbe (Einstellungen ▸ "Hero-Text")
- Werte (`ld-heroink`): 'auto' | 'white' | 'black' | '#rrggbb' (Color-Picker). Segmente Auto/Weiß/Schwarz + Picker.
- Auto-Logik: Flow → Weiß + mix-blend-mode:difference (wie bisher). Andere Modi → Weiß/Schwarz (#10151D) per Modus-Luminanz-Map (fxLumMap: lava 0.14, aurora 0.10, orbit 0.06, blackhole 0.05, nova 0.09, matrix 0.05, rain 0.08, swarm 0.06, firefly 0.05, shooting 0.04, snow 0.10, clouds 0.58, storm 0.07, ink 0.75, grid 0.06; Schwelle 0.5). Ribbon: lum(Palette[1]) — bei transparentem Band-BG (cfg.t) stattdessen Theme (dark→0.05, light→0.95).
- Nicht-Auto: gewählte Farbe, blend normal. Template-Bindings: Titel/Rollen-Zeile = heroInkCol + heroBlend; Name/Subtext = heroInkName/heroInkSub (bei Auto+Flow Original-Grautöne #8A94A4/#C7CFDC, sonst rgba(ink, 0.8)).

### Matrix Cinematic Mode
- Toggle "Cinematic (Matrix)" (`ld-mxcine`, Default an, nur bei Matrix gelistet) + zwei Textfelder (`ld-mxt1` Default "Bjoern Sellnau", `ld-mxt2` Default "Das Web. Meine Leidenschaft.").
- Timeline im startMatrix-Loop (t0 = Modus-Start): Text 1 bei 3,2–7,4 s, Text 2 bei 8,4–13,2 s. Alpha = min(ramp-in pr/0.22, ramp-out (1−pr)/0.28); Scale = 1 + 0.8·pr (Fly-to-Camera); Canvas-zentriert (W/2, H·0.44), JetBrains Mono 600, Größe min(W/(len·0.62), H·0.14); Glow via shadowColor = Palette-Kopffarbe (α 0.85·alpha), shadowBlur 26·dpr; Füllfarbe rgba(246,255,249, 0.92·alpha). Läuft einmal pro Start (Reload/Moduswechsel).

Neue Storage-Keys seit v7: ld-heroink, ld-mxcine, ld-mxt1, ld-mxt2. Prototyp-Stand enthält alle drei Features inkl. Ribbon-Transparent-Fix.

## Nachtrag v9 — Kontrast-Schatten mit echter Pixel-Messung + Stärke-Slider

### Dynamische Pixel-Messung (adjustNavContrast)
Pro Kontrast-Ziel (Nav-Pille, Tab-Bar, Back-Pille) werden jetzt ECHTE Pixel hinter dem Ziel gemessen, nicht nur statische data-ldsample-Werte: Die sichtbare Hero-Canvas (WebGL `ld-lava-canvas` — funktioniert dank preserveDrawingBuffer:true — oder 2D `ld-orbit-canvas`) wird bei Überlappung mit dem Ziel-Rect per drawImage in ein gecachtes 9×3-Sampling-Canvas gezogen (Context mit willReadFrequently); aus getImageData entstehen max/min/avg-Luminanz (Rec.-709-Gewichte). Re-Messung läuft über den bestehenden 1s-Tick + Scroll/Update-Pfade. Fällt die Canvas-Messung aus (kein Overlap, Fehler), greift der bisherige backL-Fallback.

### Kontrast-Schatten-Algorithmus v2 (ctShadow-Pfad)
- Gefahrenwert dz = hellster Pixel (heller Text) bzw. dunkelster Pixel (dunkler Text) — damit reagiert der Schatten auf Blackhole-Glut/Disk & Co., auch wenn der Modus im Mittel dunkel ist.
- Stärke: s01 = clamp01(lightText ? (dz−0.08)/0.5 : (0.82−dz)/0.5), multipliziert mit Slider-Faktor k = ld-ctstrength/100 (0.2–2.0); unter s01·k ≤ 0.03 kein Schatten.
- Tonwahl Schwarz/Weiß/GRAU: avg-Luminanz 0.35–0.65 → Grauton (rgb(22,28,38) bei hellem Text / rgb(238,241,246) bei dunklem), sonst rgb(2,6,14) / rgb(255,255,255).
- Layer: `0 1px 1.5px rgba(col, min(0.95,(0.22+0.5·s01)·k))` + `0 2px (6+10·s01)px rgba(col, min(0.9,(0.12+0.42·s01)·k))`.

### UI
Neuer Slider "Schatten-Stärke" (20–200 %, Default 100, Step 10) in den Einstellungen, nur sichtbar wenn Kontrast-Schatten aktiv. Storage-Key: `ld-ctstrength`.

Prototyp-Stand beiliegend mit allen v9-Änderungen.

## Nachtrag v10 — Cinematic v2 (Matrix)

### Hero-Text-Ausblendung + "Hero-Text danach"
- Ist Cinematic aktiv (Modus matrix + ld-mxcine an), sind Titel, Namen/Rollen-Zeile und Subtext im Hero ausgeblendet (opacity 0 + visibility hidden, transition opacity 0.7s) — Bindings heroTxtOp/heroTxtVis auf allen drei Elementen.
- Neuer Toggle "Hero-Text danach" (`ld-mxlater`, Default aus, nur bei Matrix gelistet): Nach Ende der Text-2-Animation (el > 13,4 s) setzt der Matrix-Loop einmalig state.cineDone=true (Instanz-Flag _cineFlagged verhindert Mehrfach-setState; Reset bei jedem Modus-Start via setTimeout-0) → Hero-Text faded ein. Ohne Toggle bleibt er dauerhaft aus.

### Buchstaben-Animation + Fly-to-Camera
Pro Text zwei Phasen (elT = el − a): Phase 1 (0–1,9 s): Buchstabe für Buchstabe einfaden — Monospace-Vermessung (chW = measureText('M'), Zeichen i bei x0 + i·chW, x0 = −(len−1)·chW/2), Stagger = 1,2/len s, je Zeichen Alpha-Ramp 0,35 s. Phase 2 (ab flyStart 1,9 s bis b): Scale = 1 + 0,8·pr2, globales Alpha-out (1−pr2)/0.28; Glow (shadowColor Palette-Kopffarbe, Blur 26·dpr) skaliert mit.

### Text-Größe
Slider "Text-Größe" (50–200 %, Default 100, `ld-mxsize`) im Cinematic-Block der Einstellungen; Faktor sizeF = clamp(0.4–2.2) multipliziert die Basisgröße min(W/(len·0.62), H·0.14).

Neue Storage-Keys: ld-mxlater, ld-mxsize. Prototyp-Stand beiliegend.

## Nachtrag v12 — Matrix v2: Cyberpunk-Titelsequenz (Hero-Modus 18)

Neuer Modus 'matrix2' ("Matrix v2"), Canvas-2D auf ld-orbit-canvas (`startMatrix2()`). Nahtloser ~16s-Loop nach dem Early-2000s-Cyberpunk-Brief:

**Timeline** (el = (now−t0)/1000 mod 16, ease = smoothstep):
- 0–2,5s Drift: alle Partikel wobbeln frei (Sinus-Offsets), Emerald-Ton = Palette[1], ~12 % als Katakana/Code-Glyphen (9px·dpr JetBrains Mono), Rest 1–2px-Punkte.
- 2,5–5,7s Titel-Assembly: pAsm = ease((el−2,5)/3,2). Zielpunkte aus Offscreen-Textmaske (mxT1 zentriert, 700 JetBrains Mono, f1 = min(W/(len·0.68), H·0.16)·sizeF; getImageData, Raster 2,6px·dpr, alpha>128, Cap 4200 Punkte via Skip-Filter). Einflug als Spiral-Rotation um den Zielpunkt: Winkel (1−k2)·2,6 (Richtung per Partikel-Zufall), Position = Ziel + rotierter Startoffset·(1−k2).
- Fertige Punkte (k2≥0.97) rendern als Chrom: Grauwert 132+86·sin(ty/H·7+1,3)±17, leicht grünstichig (r·0,9, b·0,94); bis el<6,4 "krabbeln" zufällige Emerald-Glyphen (Palette[0]) über fertige Letter (p.d>0,93, 25 %/Frame).
- 5,6–7,8s Subtitle: pSub = ease((el−5,6)/2,2) — mxT2 aus derselben Maske (600er Font, f2 = min(W/(len·0.68), H·0.07)·sizeF, Baseline H·0,42+f1·0,78+f2; sub-Flag via ySplit).
- 6–7,3s Emerald-Scan: additiver vertikaler Gradient-Balken (Breite 0,22·W, Palette[0] α0,34) wandert l→r über die Titel-BBox (yTop/yBot aus Maske).
- 7,5s+ Ruhephase: wandernder weißer Spekular-Reflex (α0,07, Periode 5,5s) über die BBox; Holo-Kreis dauerhaft: 5 Arc-Segmente (r = 0,34·min(W,H), α0,05, lineWidth 1,2·dpr) rotieren mit 0,08 rad/s um die Titel-Mitte.
- 14–15,9s Dissolve: pDis = ease((el−14)/1,9) multipliziert k2 → Partikel spiralen zurück zu ihren Startpositionen → nahtloser Loop.

**Dauerhaft:** Trail-Fade rgba(2,4,3,0.3); CRT-Scanlines (jede 2. Zeile, Höhe 1,5·dpr·0,55, schwarz α0,16); 36 Emerald-Noise-Pixel/Frame (α0,05); 1-Frame-Glitches (1,8 %/Frame, ab el>2): horizontale Slice-Selbstkopie (Höhe ≤7·dpr, Offset ±9·dpr) via drawImage(cv,…).

**Integration:** Segment "Matrix v2"; Palette/Custom + Reset (resolvePal auf heroCfg.matrix2 — Forest ≈ klassisches Emerald, Default Amber = monochrom warm); Texte + Größe teilen sich mxT1/mxT2/ld-mxsize (Cinematic-Block erscheint auch bei matrix2); Rebuild der Maske bei Text-/Größen-/Resize-Änderung über Cache-Key. Hero-Text ist bei matrix2 immer ausgeblendet (heroTxtOp/heroTxtVis-Bedingung erweitert); "Hero-Text danach" (ld-mxlater) blendet ihn nach el>9,5s ein (cineDone-Flag, einmalig pro Start). Guards wie üblich: heroDpr (Performance-Modus), fpsHalf, document.hidden, IntersectionObserver. Sample '0.04,0.04', FxBg #020403.

(v11 übersprungen — Nummer war für Live-Check-Korrekturen reserviert; auf User-Wunsch direkt v12.) Prototyp-Stand beiliegend.

## Nachtrag v13 — Hero-Text Auto = Stripe-Verhalten (Fix)

Der Auto-Modus der Hero-Text-Farbe (ld-heroink = 'auto') nutzt jetzt in ALLEN 18 Hero-Modi das Stripe-/Flow-Verhalten statt statischem Weiß/Schwarz:
- heroInkCol = #FFFFFF + mix-blend-mode: difference auf Titel, Rollen-Zeile und Subtext — der Text invertiert sich pixelweise live gegen die Animation dahinter (Canvas/WebGL-Layer sind Geschwister im selben Stacking-Context des Hero-Containers, daher greift der Blend direkt).
- Die frühere fxLumMap-basierte Schwarz/Weiß-Entscheidung (inkl. Ribbon-Transparent-Sonderfall) ist ersatzlos entfernt — sie lieferte statische Farben statt des gewünschten dynamischen Verhaltens.
- Sekundärfarben im Auto-Modus: Name #8A94A4, Subtext #C7CFDC (jeweils mit difference), in allen Modi einheitlich.
- Manuelle Werte (white/black/#hex via Picker) bleiben statisch mit blend normal.

Next.js-Hinweis: mix-blend-mode:difference erfordert, dass zwischen Text und Hero-Canvas kein isolierender Kontext liegt (kein isolation:isolate, kein opacity<1-Wrapper, kein transform auf Zwischen-Containern des Textes).

Prototyp-Stand beiliegend (enthält außerdem den v12-Nachgang: Matrix-v2-Chrom/Glow-Feinschliff sowie die aktualisierte Runtime im Standalone-Build-Prozess).

## Nachtrag v14 — Hero-Modi 19+20: DNA-Helix & Kometenschweif

Beide Canvas-2D auf ld-orbit-canvas, Integration nach Standard-Muster (isFx/Canvas-Routing, heroFxDisp/heroOrbitDisp, Palette via resolvePal + Custom/Reset, Sample dunkel, Guards: heroDpr, fpsHalf, document.hidden, IntersectionObserver).

### DNA-Helix ('helix', startHelix)
- Liegende Doppelhelix über volle Breite: 2 Stränge als Sinuswellen (Amplitude 0,20·H um cy=0,46·H, ~4,6 Wellen, Phasenversatz π, Rotation ω=0,7 rad/s); z = cos(Phase) für Tiefe.
- Tiefensortierung: Stränge in 2 Durchgängen (z<0 hinten: α0,28/1,6px; z≥0 vorn: α0,85/2,6px), Segmentpfade brechen bei Vorzeichenwechsel ab.
- Basenpaar-Sprossen alle 9 Segmente: LinearGradient Palette[0]→[2], Breite/α nach |z|; Nukleotid-Knoten an beiden Enden (Radius/α nach Tiefe).
- Transkriptions-Lichtpuls (Palette[1], RadialGradient r=30·dpr) wandert mit 0,09/s den vorderen Strang entlang (nur bei z≥0 sichtbar).
- Ambiente: ~60 aufsteigende Staub-Motes (α-Puls), Labor-Nacht-Verlauf aus stark abgedunkelter Palette[4]. Sample '0.05', FxBg linear-gradient(#04060C,#020308).

### Kometenschweif ('comet', startComet)
- Bahn: Lissajous cx=W·(0,5+0,42·sin(0,16t)), cy=H·(0,42+0,26·sin(0,272t+1,3)) — wiederholt sich nie exakt; Schweifrichtung = −Geschwindigkeitsvektor.
- Trail-Fade rgba(3,5,9,0.10) statt Vollclear → Bewegungsspur.
- Staubschweif: 5 Partikel/Frame emittiert (Startjitter 6·dpr, v entlang Schweif 0,6–1,7·dpr + Querstreuung, Dämpfung 0,995, life-decay 0,006–0,018, Cap 900); Farbe lerpt Palette[0]→[1] über die Lebenszeit, additiv (lighter).
- Ionenschweif: 26 Liniensegmente, Länge 0,55·min(W,H), Wellen-Wobble sin(3t+0,7i) quer zur Richtung, Palette[2], α/Breite fallen zum Ende ab.
- Koma/Kern: RadialGradient weiß→Palette[0] (r 26·dpr); ~150 Sterne (gedämpftes Funkeln unterm Trail-Fade); Nebelschleier Palette[4] α0,05 unten. Sample '0.04', FxBg #030509.

Segment-Reihenfolge jetzt: … Neon-Grid, Matrix v2, DNA-Helix, Kometenschweif (20 Modi gesamt). Prototyp-Stand beiliegend.

## Nachtrag v15 — Hero-Modi 21+22: Galaxie & Ozeanwellen

Beide Canvas-2D auf ld-orbit-canvas, Integration nach Standard-Muster (isFx/Canvas-Routing, heroFxDisp/heroOrbitDisp, Palette via resolvePal + Custom/Reset, Guards: heroDpr, fpsHalf, document.hidden, IntersectionObserver).

### Galaxie ('galaxy', startGalaxy)
- ~1300 Sterne (Cap 1500, skaliert mit Breite), radiale Exponentialverteilung r = random^1.7 · Rmax (Rmax 0,52·min(W,H)); zwei logarithmische Spiralarme: a0 = arm(0|π) + ln(r/(0,06·Rmax)+1)·2,4 + Streuung (Dreiecksverteilung, wächst mit r).
- Differentielle Rotation: ω = 0,055/(0,25 + r/Rmax) — innen schneller, Arme scheren lebendig; Scheiben-Neigung TILT 0,42 (y-Stauchung), Zentrum bei (0,62·W, 0,44·H).
- Farblogik: Kernnähe (r < 0,12·min) Palette[0], Arme Palette[2], 16 % heiße Riesen Palette[1] (größer/heller); 8 % Staub-Partikel als dunkle weiche Flecken (source-over, α0,16) für Staubbänder; Funkeln via sin-Twinkle.
- Kern-Bulge (RadialGradient weiß→Palette[0], r 22·dpr) + großer Halo (Palette[0]→[4], r 0,3·min) additiv; 90 Hintergrund-Fixsterne; Trail-Fade rgba(2,4,10,0.28). Sample '0.05', FxBg #02040A.

### Ozeanwellen ('ocean', startOcean)
- 5 Wellen-Ebenen von Horizont (0,52·H) bis vorn (Basis + 0,46·H·f^1,25): je Ebene y(x) = Basis + sin(x·k1 + t·sp1)·amp + sin(x·k2 − t·sp2)·0,45·amp (amp 5–31·dpr, k2 = 2,7·k1, Tempi wachsen nach vorn).
- Fläche als LinearGradient: Palette[2]→[4]-Mix (nach vorn dunkler), abfallend auf 35 % Helligkeit; Schaumkrone als Stroke Palette[1] (α/Breite wachsen nach vorn).
- Mond (0,72·W, 0,2·H): Scheibe + Glow Palette[0]; Glitzerpfad auf den 2 hinteren Ebenen (additive Zufalls-Streifen ±60·dpr um mx, 35 %/Spalte).
- Gischt: bis 120 Partikel, Emission 30 %/Frame auf vorderster Kamm-Linie, v_y −0,6…−1,7·dpr, Schwerkraft +0,04·dpr, life-decay 0,02, Farbe Palette[1]. Vollclear pro Frame (kein Trail-Fade). Sample '0.08', FxBg linear-gradient(#050810,#0A1626).

Segment-Reihenfolge jetzt: … Matrix v2, DNA-Helix, Kometenschweif, Galaxie, Ozeanwellen (22 Modi gesamt). Prototyp-Stand beiliegend.

## Nachtrag v16 — Hero-Modus 23: Blitzgewitter

Canvas-2D auf ld-orbit-canvas ('storm2', startThunder), Integration nach Standard-Muster (isFx/Canvas-Routing, heroFxDisp/heroOrbitDisp, Palette via resolvePal + Custom/Reset, Guards: heroDpr, fpsHalf, document.hidden, IntersectionObserver).

### Renderer
- **Blitze** (mkBolt): rekursiver Zickzack-Walk von y≈0,06–0,16·H bis 0,72–0,92·H — Segmente 14–40·dpr lang, Winkel-Random ±0,45 mit Dämpfung ·0,82 pro Schritt; 16 % Verzweigungschance pro Segment (±0,8 rad, Gewicht ·0,45, max. Tiefe 3). Zeichnung in 2 Pässen additiv (lighter): Glow (Breite 7·w·dpr, Palette[0], α0,16) + weißer Kern (2,4·w·dpr, α0,85); life-decay 0,07 mit Zufalls-Flackern; 35 % Chance auf Doppelschlag. Einschlags-Glow (RadialGradient Palette[0]) am Boden unter der Startspalte.
- **Flash-System**: flash=1 beim Schlag, decay 0,055, Wirkung quadratisch (fl=flash²) — hellt Himmel-Gradient, Wolken-Kerne und Regen auf.
- **Wolkendecke**: 7 driftende RadialGradient-Ballen (r 70–190·dpr, y 0,04–0,2·H, Tempo ±0,06–0,16·dpr, Wrap-around), Grundton Palette[4], von Blitzen von innen erhellt.
- **Regen**: ~220 Tropfen, 2 Tiefen (α0,10/0,20 + 0,25·fl, Breite 0,8/1,2·dpr), Windschräge 0,18 (x −= sp·wind), Farbe Palette[2], Linien entlang Fallvektor.
- **Boden**: Silhouette rgba(2,3,6,0.92) ab 0,93·H. Blitz-Takt: nextBolt = t + 1600 + random·3800 ms.
- Sample '0.06', FxBg linear-gradient(#0A0C14,#04050A). Vollclear pro Frame (Himmel-Gradient überschreibt).

Segment-Reihenfolge jetzt: … Galaxie, Ozeanwellen, Blitzgewitter (23 Modi gesamt). Prototyp-Stand beiliegend.

## Nachtrag v17 — Full-Hero, Scroll-Indicator, Stats-Toggle, Splash-Varianten

### Full-Hero (`ld-fullhero`, Toggle "Full-Hero")
- Desktop/Wide: #ld-hero bekommt min-height:100vh, flex-column mit justify-content:center; FX-Fläche wächst auf calc(100vh + 140px) (Layer beginnt bei top:-140px); Hero-Padding 140px/120px.
- **Mobile-Sonderfall (wichtig, aus Verifier-Iteration):** Auf Mobile (<1020px) NUR Animationsfläche/Höhe voll — Inhalt bleibt justify-content:flex-start mit normalem Mobile-Padding (124px/64px bzw. Modern 78px/56px). Zentrierung + großes Bottom-Padding kollidieren auf kurzen Viewports mit der fixen Tab-Bar (Inhalt > 100vh → bottom-Padding positioniert relativ zur überlaufenden Hero-Unterkante, nicht zum Viewport). Flow-Layout scrollt stattdessen natürlich unter das Glas (iOS-Muster).

### Stats-Leiste im Full-Hero (`ld-herostats`, Toggle "Full-Hero: Stats-Leiste")
- heroMinH = calc(100vh − 86px) Desktop / calc(100vh − 132px) Mobile (Leiste wrappt); FX-Höhe entsprechend calc(100vh + 54px) / calc(100vh + 8px). Sekunden-Counter + Kennzahlen landen damit im ersten Viewport, Scroll-Indicator rückt automatisch darüber.

### Scroll-Indicator
- Nur Desktop/Wide + Startseite + Full-Hero (`scrollIndDisp`), position:fixed bottom:26px zentriert (fixed statt absolute: Hero kann höher als 100vh werden — absolute Anker rutschen aus dem Viewport). Maus-Pille (22×36, 2px Rand) mit ldScrollBob-Punkt (1,6s) + "SCROLL" (Mono, 9px, 0.22em); mix-blend-mode:difference → auf allen Modi lesbar; blendet bei scrollY>24 via Opacity 0,5s aus. Auf Mobile bewusst ausgeblendet (kollidiert auf kurzen Viewports mit Text/Tab-Bar).

### Parallax
- Scroll-Handler verschiebt [data-ldpara]-Layer (FX-Container) per style.translate um scrollY·0,35 (gekappt bei innerHeight) — nur Full-Hero + Startseite + Animationen an; räumt sich beim Deaktivieren auf (_paraWas-Flag).

### Splash-Varianten (`ld-splashanim`, Segment "Splash-Animation": LD Logo | Lines)
- Template: zwei Geschwister-Container im Splash-Overlay, per splashLogoDisp/splashLinesDisp geschaltet (display-Toggle restartet die CSS-Animationen).
- **Lines**: 6 Haarlinien zeichnen sich gestaffelt (ldSpLineH/V, scaleX/Y 0→1, cubic-bezier(0.75,0,0.2,1), Delays 0,05–0,48s): Akzent-Kreuz durch die Mitte (Gradient rgba(255,178,36,0.7)) + 4 dezente Nebenlinien (±76px, rgba(255,255,255,0.08), wechselnde Origins). An der Kreuzung poppt die L!-Box (76px, ldSpBox: scale 0,55/−5° → 1,07/+1° → 1, Delay 0,85s), darunter Wortmarke (Mono, letter-spacing 0.3em, Delay 1,2s) und 2px-Ladebalken (ldSplashBar, Delay 1,55s).
- Segment-Klick spielt den gewählten Splash sofort einmal zur Vorschau ab (splash/splashOp reset + Timeouts 2500/3100ms neu armiert).

Neue Storage-Keys: ld-fullhero, ld-herostats, ld-splashanim. Prototyp-Stand beiliegend.

## Nachtrag v18 — Hero-Modi 24 & 25: Sanduhr + Feuerwerk

### Sanduhr / Partikel-Uhr (Modus 'hourglass', startHourglass)
Canvas-2D auf ld-orbit-canvas, Standard-Integration (isFx/Canvas-Routing, FxBg linear-gradient(#070A12,#03040A), Sample '0.05', Palette via resolvePal + Custom/Reset, Guards: heroDpr, fpsHalf, document.hidden, IntersectionObserver).
- **Zyklus**: CYCLE=20s; pSand = smoothstep(p/0,9) steuert den Sandfluss, letzte 10 % = Flip (rotate 0→π um Zentrum, ease).
- **Geometrie**: Größe S=min(W,H)·0,6, Halbhöhe hh=S/2, Trichterbreite hw=S·0,3, Hals neck=3·dpr, Spalt gap=5·dpr. Zwei Bezier-Trichterpfade (topPath/botPath) als Clip-Regionen.
- **Sand oben**: Level sinkt linear von cy−hh·0,82 auf cy−gap; dunkle Ellipsen-Mulde (α0,25) schrumpft mit (·(1−pSand·0,5)).
- **Sand unten**: Haufen wächst von cy+hh·0,92 auf cy+gap·2, Kuppe via quadraticCurveTo (Scheitel botTop−hh·0,10).
- **Strahl + Körner**: 2·dpr-Linie Hals→Haufen; bis 70 Einzelkörner (Spawn-Chance 0,85/Frame, vy 1,6–3·dpr, Gravity 0,05·dpr, Jitter ±1,2·dpr), Farbe Palette[1]; bei Flip sofort geleert.
- **Deko**: Glas-Kontur Palette[2] α0,45 (1,6·dpr), Rahmenbalken oben/unten (4·dpr, ±1,14·hw), weißes Glanzlicht-Bezier (α0,10), Puls-Glow am Hals (RadialGradient Palette[1], α0,10+0,05·sin(5t)), 26 aufsteigende Motes (Palette[4], α~0,05–0,09).
- **Partikel-Uhr**: aktuelle Uhrzeit HH:MM (JetBrains Mono, 13·dpr, Palette[2] α0,55) zentriert unter dem Glas.

### Feuerwerk (Modus 'fireworks', startFireworks)
Canvas-2D auf ld-orbit-canvas, Sample '0.04', FxBg linear-gradient(#06060F,#030308).
- **Trail-Fade** statt Vollclear: rgba(4,4,12,0.16)-Overlay pro Frame → Nachleuchtspuren; Zeichnung additiv (globalCompositeOperation='lighter').
- **Raketen**: max. 3 parallel, Launch-Takt 700+random·1500 ms, Start x∈0,15–0,85·W, vy −(5,2–7,6)·dpr mit Gravity 0,045·dpr, Ziel y∈0,16–0,46·H (oder vy>−0,6·dpr); Schweif = Linie (1,6·dpr, α0,8) + 50 % Chance auf Abrieb-Funken (warmweiß, life 0,5, dec 0,06). Farbe pro Rakete zufällig aus 5er-Palette.
- **Explosion**: 64 Funken (big: 110, Chance 25 %), Winkel gleichverteilt + Jitter 0,12; 35 % Ring-Typ (Speed 2,6–3,1 statt 0,6–3,8); 22 % der Funken in Fremdfarbe aus Palette; RadialGradient-Blitz (80/120·dpr, α0,35).
- **Funken-Physik**: Drag ·0,985, Gravity 0,028·dpr, life-decay 0,008–0,02, 30 % Twinkle (α·(0,5+0,5·sin(t/60+x))), Größe 0,7+life·0,6 ·sz·dpr, Cap 900 (FIFO-Trim).
- **Ambiente**: 60 Funkel-Sterne (α0,05–0,10), Stadt-Silhouette rgba(2,3,8,0.9) ab 0,96·H.

Segment-Reihenfolge jetzt: … Ozeanwellen, Blitzgewitter, Sanduhr, Feuerwerk (25 Modi gesamt). Neue heroCfg-Keys: hourglass, fireworks (pal/cust, Größe/Position via Standard-Regler). Prototyp-Stand beiliegend.

## Nachtrag v19 — Page-Transitions (5 Modi, View-Transition-API)

Neue Segment-Zeile "Page-Transition" in den Einstellungen (nach Splash-Animation): **Fade | Slide | Zoom | Blur | Wipe**. Storage-Key `ld-pagevt` (Default 'fade').

### Mechanik
goTo() setzt vor document.startViewTransition() zusätzlich zur bestehenden Klasse `ldvt` die Modus-Klasse `ldvt-<modus>` auf <html> und entfernt beide in t.finished (cleanup). Die ::view-transition-Pseudo-Elemente werden per html.ldvt-<modus>-Scope gestylt; die unscoped Regeln (ldVtOut/ldVtIn) bleiben als Fade-Default & Fallback. Kein View-Transition-Support oder Animationen aus → sofortiger Wechsel wie bisher. Nav/Tab-Bar behalten ihren eigenen view-transition-name (ld-nav) und morphen unabhängig.

### Die 5 Modi
- **Fade** (Default): old fade + translateY(−14px)/scale 0,992 (0,3s), new von +18px/0,996 (0,45s) — unverändert.
- **Slide**: old → translateX(−7vw) + fade (0,32s, cubic-bezier(0.4,0,0.7,0.3)), new von +8vw (0,46s, (0.22,0.9,0.24,1)) — horizontaler App-Push.
- **Zoom**: old skaliert auf 1,045 + fade (0,3s), new von 0,95 (0,5s) — Durchstoß-Effekt.
- **Blur**: old → blur(16px) + scale 1,01 + fade (0,32s ease), new von blur(16px) (0,5s) — Frosted-Morph, passt zum Liquid Glass.
- **Wipe**: old bleibt voll sichtbar (ldVtStay, opacity 1), new wischt via clip-path inset(100% 0 0 0)→inset(0) + translateY(2,5 %) von unten darüber (0,55s, cubic-bezier(0.7,0,0.2,1)) — Sheet-Reveal; funktioniert, weil ::view-transition-new standardmäßig über old gestapelt wird.

### Next.js-Hinweis
1:1 übertragbar: Klassen-Toggle auf documentElement vor router-Transition (bzw. in Next 15 via unstable_ViewTransition / startViewTransition-Wrapper um router.push), CSS identisch. Blur-Modus: filter auf ::view-transition-Snapshots ist GPU-günstig (Snapshots sind Bilder), aber auf Low-End-Mobile ggf. per prefers-reduced-motion aussparen — der bestehende Animationen-Toggle deckt das im Prototyp ab.

Prototyp-Stand beiliegend.

## Nachtrag v20 — Page-Transitions: Streuner-Fix (keine Elemente mehr "vor" der Transition)

### Problem
Zwei Ursachen dafür, dass Elemente sichtbar waren, bevor die Root-Transition fertig war:
1. **Unpaarige Namen**: Alle Karten trugen permanent view-transition-name (c-/cf-/art-/artn-). Bei jedem Seitenwechsel bekam jede Karte, die nur auf EINER Seite existiert, eine eigene Solo-Snapshot-Gruppe mit Default-Crossfade (0,45s) — die ÜBER der Root-Animation liegt und sofort einblendet (z. B. während Wipe/Push noch läuft).
2. **Named Groups bei Reveal-Transitions**: Auch echte Morph-Paare (Nav, Karte→Hero) liegen als eigene Gruppen über dem Root-Snapshot — bei Clip-Reveals (Wipe, Kreis, Vorhang …) erscheint der gemorphte Hero dadurch, bevor die Wischkante ihn erreicht.

### Lösung
- **vtTarget-Gating**: Neuer State `vtTarget`. view-transition-name wird nur noch der GEKLICKTEN Karte (setState(vtTarget) im Klick-Callback, Transition erst danach) und dem zugehörigen Detail-/Artikel-Hero verliehen; alle anderen Karten stehen auf 'none'. goTo(page, keepVt) löscht vtTarget bei normaler Navigation, behält es bei backGo (Rück-Morph Hero→Karte). Suche-Navigation setzt kein vtTarget → sauberer Fade ohne Morph. Damit existiert pro Transition maximal EIN Namenspaar — keine Solo-Gruppen mehr.
- **Reveal-Modi ohne Morphs**: Bei clip-basierten Modi (wipe, circle, iris, curtain, blinds, split, diagonal, stack, push, flip, glitch) wird zusätzlich `ldvt-nomorph` auf <html> gesetzt: Karten-/Hero-Morphs entfallen (morphOk-Check in renderVals) und die Nav verliert ihren view-transition-name (CSS: html.ldvt.ldvt-nomorph .ldnavvt{view-transition-name:none}) — die komplette Seite inkl. Nav wandert geschlossen durch den Reveal. Morph-freundliche Modi (fade, slide, zoom, blur, spring, cinema, spin, swap, skew) behalten Nav- und Karten-Morph.

### Außerdem (v19.1)
Featured-Karten (Hallo) und News-Karten tragen eigene Präfixe (cf-/artn-) statt derselben Namen wie Grid/Magazin — Hallo↔Projekte/.Tech morpht nicht mehr fälschlich Karte→Karte; der Detail-Hero wählt sein Präfix nach Herkunftsseite (s.from).

Next.js: identisches Muster — Namen nur on-demand vergeben (State/Attribut vor router.push), Reveal-Modi über eine Root-Klasse von Element-Morphs ausnehmen.

Prototyp-Stand beiliegend.

## Nachtrag v21 — Iris-Finish + Theme-Toggle mit Iris-Reveal

### Iris-Fix ("stoppt kurz vor Ende")
Ursache: fester End-Radius (112vmax) reichte je nach Klickpunkt nicht bis in die entfernteste Ecke — die flache Easing-Endphase kroch, dann sprang der Rest beim Cleanup. Lösung: Der pointerdown-Handler berechnet jetzt zusätzlich zum Klickpunkt (--vt-x/--vt-y) den **exakten End-Radius** `--vt-r` = Distanz zur weitesten Viewport-Ecke ·1,02 (Math.hypot(max(x, W−x), max(y, H−y))). Keyframe endet bei circle(var(--vt-r,125vmax)) → Vollabdeckung fällt exakt mit dem Animationsende zusammen; Easing beidseitig cubic-bezier(0.4,0,0.2,1), 0,65s.

### Theme-Toggle mit Iris (Dark ↔ Light)
Der ☀/☾-Toggle wechselt das Theme jetzt per View Transition als Kreis-Reveal vom Klickpunkt (bekanntes "theme toggle ripple"-Muster): eigene Klasse `ldvt-theme` (bewusst OHNE `ldvt` → keine Nav-/Karten-Morph-Gruppen), old bleibt voll stehen (ldVtStay), new wischt als ldVtThemeIris-Kreis von 0px auf var(--vt-r) darüber (0,6s, (0.4,0.2,1)-Material-Kurve). --vt-x/y/r kommen aus demselben pointerdown-Listener. Fallbacks: kein startViewTransition-Support oder Animationen aus → sofortiger Wechsel wie bisher. Funktioniert von Nav-Icon, Tab-Bar-Menü und Einstellungen (alle rufen toggleTheme).

Next.js: identisch portierbar — ein globaler pointerdown-Listener für --vt-x/y/r, Theme-Setter in startViewTransition wrappen, Klasse auf documentElement.

Prototyp-Stand beiliegend.

## Nachtrag v21.1 — VT-Serialisierer (Fix: "Transition was aborted because of invalid state")

Der Theme-Iris-Toggle warf pro Klick eine Unhandled Rejection (t.ready wurde nirgends abgefangen; Abort z. B. durch parallel laufende/supersedende Transition oder Capture-Invalidierung). Lösung: zentrale Methode `runVt(classes, apply, hold)` — EINZIGER startViewTransition-Aufrufpunkt für Seiten- UND Theme-Transitions:
- `_vtBusy`-Flag serialisiert alle View Transitions; läuft bereits eine, wird der Wechsel ohne VT sofort angewandt (kein Supersede-Abort).
- Klassen werden vor dem Start gesetzt und in einem gemeinsamen Cleanup (finished, erfüllt wie abgelehnt) entfernt.
- `t.ready`, `t.updateCallbackDone` und `t.finished` werden sämtlich gecatcht → Konsole bleibt sauber, Endzustand stimmt auch bei Abort.
- try/catch um startViewTransition selbst (ältere Implementierungen).
navState und toggleTheme delegieren nur noch an runVt. Next.js: gleiches Muster — ein zentraler VT-Wrapper statt verstreuter startViewTransition-Aufrufe.

Prototyp-Stand beiliegend.

## Nachtrag v22 — Reise-Seite (LD Timeline), Iris-Finish, VT-Watchdog

### Reise-Seite
Neue Seite 'reise' in Site V2: Menüpunkt zwischen Labs und .Tech (Desktop-Nav, Suche, mobiles Vollbild-Menü als "Reise — 18 Jahre im Web"). Einbettung als full-bleed Wrapper (left:50%; translateX(-50%); width:100vw; height:100vh; overflow:hidden), Footer dort ausgeblendet (footDisp). Die Timeline selbst liegt als eigenes Paket vor (design_handoff_ld_timeline/ mit eigener README); Site-V2-Animations-Toggle wird als reduceMotion-Prop durchgereicht. Wichtig aus Verifier-Läufen: Stage-Mindesthöhe viewportfähig — min-height:min(640px,100dvh) — sonst sind auf kurzen Viewports die unteren Buttons unerreichbar (Wheel wird von der Stage gefangen).

### Iris-Transition (Page + Theme) — finale Fassung
Symptom "stoppt kurz vor Ende" war die Animationskurve: Kreisfläche wächst quadratisch mit dem Radius → Ease-out kriecht exakt dort, wo am meisten Fläche fehlt (Ecken). Fix: **Ease-in** cubic-bezier(0.45,0.05,0.85,0.5), 0,6s (Theme 0,55s); alte Seite bleibt statisch stehen (ldVtStay statt Dim/Scale); Start circle(0px), Ende circle(var(--vt-r)) — --vt-x/y/r setzt ein globaler pointerdown-Listener (Radius = Distanz Klickpunkt → fernste Viewport-Ecke ×1,02).

### runVt-Watchdog
Serialisierer ergänzt: setTimeout-Watchdog (1,8s) räumt Klassen + _vtBusy zwangsweise auf (cl idempotent, clearTimeout im regulären Cleanup); zusätzlich Guard document.visibilityState==='hidden' → sofortiger Wechsel ohne VT (versteckte Tabs brechen jede View Transition mit InvalidStateError ab — so entsteht weder Fehler-Rauschen noch ein hängender Busy-Zustand).

Prototyp-Stand beiliegend.


## Nachtrag — Änderungen 2026-07-20
- **Hero-Sketch-Splash**: Textbereich-Wireframe an echten Hero angeglichen (Name- + Rollenzeile ergänzt, Fließtext/Button/Link auf korrekte Höhen verschoben).
- **Page-Transition**: neuer Toggle "Detailseiten immer schlicht (Fade)" (localStorage ld-detailplain). navState() erzwingt vtm='fade' bei detail/artikel-Navigation, wenn aktiv.
- **Menü**: "Reise" → "Meine Reise" (nav-Label + Menü-Sheet).
- **LD Timeline / Meine Reise**: Ton komplett entfernt (Lautsprecher-Button, initAudio, playTravel, WebAudio-Bus). Timeline läuft stumm; Tech-Stack-Bento pro Station bleibt.

## Nachtrag v19 — Feuer-Feinsteuerung + Mobile-Feinschliff

### Feuer-Hero (fsFire) — vollständige Kontrolle
Neue Uniforms + Settings (nur bei Hero-Animation "Feuer"), alle live ohne Neustart, pro Modus in ld-herocfg.fire gespeichert, "Default" setzt zurück:
- **Funken-Dichte** (u_spark, cc.sp 0-100 → 0.02..0.22): Ember-Anzahl. step(1.0-u_spark, r0) pro Layer.
- **Funken-Farbe** (u_spcol, cc.spc, Default = Palette[0]): Ember-Farbe.
- **Rauch-Dichte** (u_smoke, cc.sm 0-100 → 0..1.1): Deckkraft der Rauchschwaden.
- **Rauch-Farbe** (u_smcol, cc.smc, Default #151318): Rauchton.

Embers neu als **2 Tiefen-Layer** (statt starrem Gitter): steigen auf (uv.y*sc + t*(2.3+fl*1.4)), driften seitlich (sin-Wobble wächst mit Höhe), **kühlen aus** (cool=1-uv.y*0.6 → kleiner + dunkler), weiches Ausbrennen oben, Flacker-Twinkle, Glüh-Halo. Rauch = fbm-Schwaden im oberen Bereich (smoothstep 0.34..0.8 uv.y, nach oben aufsteigend über -t*0.9).

### Mobile-Feinschliff
Hallo-Stat-Leiste stapelt mobil vertikal (statRowExtra: flex-direction:column;align-items:flex-start), Sekunden-Counter statSecFs 22px (Desktop 26px), Stats-gap statGap 22px. Reine mob-Laufzeit-Holes — Desktop unverändert.

## Nachtrag v20 — Einstellungen als Vollbild-Screen (Mobile)

Das Einstellungs-Panel spiegelt auf Mobile jetzt die Vollbild-Page-Behandlung des Mobile-Menüs statt Bottom-Sheet:
- **settingsPos**: sideActive → top:88px;left:260px | mob+framed (!isMobile) → top:10px;bottom:10px;left:calc(50% - 215px);--radL:32px | mob+echt-mobil (isMobile) → top:0;bottom:0;left:0;right:0;--radL:0px | Desktop → top:78px;left:50%;translateX(-50%)
- **settingsW**: mob framed 430px / echtes Mobil auto (füllt via left:0;right:0) / Desktop 300px
- **settingsMaxH**: mob 'none' (Höhe kommt aus top/bottom) / Desktop min(76vh,660px)
- **--radL** wird in settingsPos injiziert und kaskadiert auf frost/edge/rim/glow-Layer (border-radius:var(--radL,22px)).
- Header bekam einen ✕-Schließen-Button (settingsCloseDisp: mob inline-flex, sonst none), da der Backdrop im Vollbild verdeckt ist.
- Interner Scroll-Container bleibt (overflow-y:auto), Panel-Höhe = Telefonhöhe.

### Vorher (v19): Bugfix body.still
body.still fror Einblend-Animationen (ldMenuItem/ldPop/ldPageIn/ldBackIn/ldScrollBob) bei opacity:0 ein → Mobile-Menü & Panels unsichtbar bei Animation-aus. Regel: `body.still [style*="ldMenuItem"],…{animation:none !important}` lässt sie sichtbar ruhen.

## Nachtrag v21 — Bugfix: Shader-Hero-Modi fielen global aus ("Feuer geht nicht mehr")

**Symptom:** Nach vielem Wechseln zwischen den 23 Hero-Modi liefen plötzlich ALLE WebGL-Shader-Modi (Feuer, Lava, Aurora, Plasma, Blackhole, Nova, Ribbon, Clouds, Storm, Ink, Grid) nicht mehr — nur die 2D-Canvas-Modi (Matrix, Rain, Orbit, Snow, …) funktionierten weiter.

**Ursache:** `this._glFail` war ein **global + dauerhaft klebendes** Flag. Erzeugt `cv.getContext('webgl')` einmal null (typisch: Browser-WebGL-Kontext-Limit ~16 nach vielen Moduswechseln, weil alte Kontexte nie freigegeben wurden), latchte `_glFail=true` für immer und der ensureLava-Gate `(this._glFail && !is2d)` deaktivierte danach jeden Shader-Modus dauerhaft.

**Fix (3 Teile):**
1. `stopLava()` gibt den WebGL-Kontext jetzt frei: `gl.getExtension('WEBGL_lose_context').loseContext()` — verhindert das Auflaufen ans Kontext-Limit beim Moduswechsel (Wurzelursache).
2. Globales `_glFail` vollständig entfernt (aus Gate + startLava). Kontext-Fehlschlag markiert nur noch `_fxFail[mode]` (per-Modus), nicht mehr alle.
3. Damit erholen sich Shader-Modi automatisch, sobald Kontexte wieder frei sind.

Handoff-Empfehlung für die Next.js-Umsetzung: pro Hero genau EINEN persistenten WebGL-Kontext halten und beim Moduswechsel das Fragment-Programm tauschen, statt Canvas/Kontext neu zu erzeugen — umgeht das Limit ganz.

## Nachtrag v23 — Reise (LD Timeline) Überarbeitung + Site-Fixes

### Scroll-Sperre nach Seitenwechsel (Site-Bug, behoben)
Ursache: Die eingebettete Timeline brachte per Helmet eine globale Regel `body{overflow:hidden;background:#0A1220}` mit, die nach einem Reise-Besuch im Dokument blieb → Seite nicht mehr scrollbar. Jetzt: Timeline-Styles auf `#ldt-stage` gescoped; Body-Lock/Hintergrund nur **standalone** (Erkennung: kein Vorfahre `[data-screen-label="Reise"]`) als Inline-Style, das `componentWillUnmount` wieder entfernt. Für den Next-Port: Route-Layout der Timeline nutzt `h-screen overflow-hidden` auf dem Wrapper — niemals auf `body`.

### Layout der Reise-Seite (neu)
- **Info-Panel links dauerhaft sichtbar**, eigener Scrollcontainer (`#ldt-panel`: left 30, top 92, bottom 210, width min(32vw,430px), border-box, z 55, overflow-y auto, overscroll-behavior contain). Inhalt: Jahr/Rolle-Zeile → optionale Zwischenschritt-Callout → Metrik + Story → Tech-Stack-Bento (4×3, Kern-Stack-Kachel Amber) → „Einblicke“ (2 Bild/Video-Slots 96px).
- **Kopfzeile entfernt** (L!-Logo, „2004 — 2026“-Chip), ebenso „Mehr erfahren“.
- **Jahres-Rail rechts** (`[data-ldt-rail]`): fest verankert (right 32, top 92, bottom 36 / mobil 110), width 210px, z 60, scrollt intern (scrollbar-width none). Reihenfolge: Pfeilzeile **↓ ↑** (44px-Buttons, feste Position → kein Hüpfen) → „Heute“ → Jahre (2026…2004) → „Start“. Unter dem aktiven Jahr klappen die **Zwischenschritte** auf.
- **Karten-Bühne**: `rightBound = vw − 32 − 210 − 16`; Karten werden im verfügbaren Bereich zwischen Panel und Rail zentriert und bei Platzmangel skaliert (`stageScale`, transform-origin auf der Kartenmitte) — Karten-Headline wird nie von der Rail überlappt.
- **Titelblock unten links**: Headline hat `min-height:66px` + flex-end → zwei Zeilen sind immer reserviert, kein Layout-Sprung.

### Zwischenschritte (steps pro Station)
Datenfeld `steps: [{ t, d }]` je Station (z. B. 2026: Ende Code-b 01.2026 · KI-Experimente ab 03.2026 · Materna SE ab 05.2026). Rail rendert sie als `<button aria-pressed>`: Titel 11px bis **2 Zeilen** (`-webkit-line-clamp:2`), Datum 8.5px Mono darunter, Punkt rechts (5px grau / 8px Amber mit Glow bei Auswahl). Auswahl `state.stepIdx` (Toggle; Stationswechsel setzt null): Panel zeigt Callout „● Datum Titel“, und die Einblicke-Slots wechseln auf Schritt-IDs `ld-mini-<jahr>-s<idx>-1|2` (eigene Bilder pro Schritt).

### Interaktion
- **Touch (pointer: coarse)**: kein Blättern per Geste/Wheel — nur ↓/↑, Jahre, Pfeiltasten. Wheel über Panel oder Rail scrollt nur diese (`closest('#ldt-panel,[data-ldt-rail]')`).
- Alle klickbaren Elemente der Timeline sind echte `<button>` (iOS-Zuverlässigkeit), Reset im Helmet: `#ldt-stage button{font:inherit;color:inherit;border:0;background:transparent;appearance:none;touch-action:manipulation;-webkit-tap-highlight-color:transparent}`.
- **Stationswechsel-Fade** (`goStation`): Panel + Titelblock `ldtSwapOut 0.2s` (opacity→0, −8px), dann State-Wechsel, dann `ldtSwapIn 0.5s cubic-bezier(0.2,0.7,0.2,1)` (+10px→0); Karten fahren parallel. Bei reduceMotion direkt.
- Tastatur-Hinweis unten: ausgeblendet auf Touch und im eingebetteten Schmal-Layout (< 1020px, mobile Tabbar).

### Light Mode der Timeline
Komplett auf Theme-Variablen (`--tbg --tink --tmut --tsoft --tcard --tpanelbg --thair --tbtn --tbtnbrd --tbtnhov --tshot --tscrimtop/bot --tstars --tfx1/2 --tdim --tintro1/2 --tcta --tctatx --tshadow`) auf `#ldt-stage`, Light-Werte via `body.light #ldt-stage` (Bühne #EEF2F7, Karten #FFFFFF, Ink #101B2C, Sterne aus, CTA dunkel). In der Site folgt sie dem Theme-Toggle; standalone Prop `theme: dark|light`.

### Sonstige Site-Änderungen seit v22
- Nav-Logo „Loona!“ mit `color:var(--ink)` → folgt der Auto-Kontrast-Logik (Light Mode über dunklem Hero).
- Über-mich-Daten: Gadmin 4.0 (CMS des Schweizer Tourismus), The Pioneer 2020–2021 & 2025–2026, BMW Neuwagensuche (Team Lead ~0,5 J., Tech Lead ~1 J.), Mys Mobile 2017 (Projektübernahme 11/2016, Best of Swiss Web Gold „Mobile Web“ 04/2017).
- Stations-Bilder Materna/Code-b/PIXELTEX (Unsplash, mit Credits) in den Über-mich-Slots.

Prototyp-Stand (`Loona Site V2.dc.html`, `LD Timeline.dc.html`) beiliegend.
