# Prompt für Claude Code (Copy & Paste)

Kopiere den folgenden Prompt in Claude Code, nachdem du diesen Handoff-Ordner ins Repo gelegt hast (z. B. unter `design/`):

---

Implementiere die Portfolio-Website „Loona! Designs" (Björn Sellnau) als **Next.js-App** auf Basis des Design-Handoffs in `design/design_handoff_loona_site/`.

**Zuerst lesen:**
1. `README.md` — vollständige Spezifikation: Routen-Mapping, Design-Tokens (Dark/Light), Glas-Material-Rezept inkl. SVG-Refraction, Auto-Kontrast-System, alle 25 Hero-Modi (GLSL/Canvas im Prototyp), View-Modes, localStorage-Schema, Datenmodell, empfohlene Bau-Reihenfolge sowie alle „Nachtrag"-Abschnitte (v1–v23: Splash-Varianten, Galerien + Lightbox, Verwandte-Reihen, Swipe-Gesten, Performance-Optionen, Page-Transitions inkl. Safari-Fallback, Reise-Seite/LD Timeline).
2. `Loona Site V2.dc.html` — die maßgebliche Referenz. Das Markup zwischen `<x-dc>…</x-dc>` enthält alle Layouts/Styles inline; der `<script data-dc-script>`-Block die komplette Logik: Datenmodell (`data()`), Shader (`startLava()` u. a.), Canvas-Modi (`startOrbit()` u. a.), Kontrast-Wächter (`adjustNavContrast()`), Cover-Farb-Logik (`applyCoverColor()`), Displacement-Glas (`makeDispMap()`/`refreshGlassFilters()`), Navigation/Transitions (`navState()`/`runVt()`/`fbVt()`).
3. `LD Timeline.dc.html` — die Reise-Seite (Stationen, Zwischenschritte, Panel/Rail-Layout, Light Mode); wird in der Site eingebettet.
4. `screenshots/` — Soll-Zustand der wichtigsten Screens; `og-image.png` als `opengraph-image.png` übernehmen.
5. `SPEC-v2.md` — ursprüngliche Feature-Spezifikation (Kontext).

**Rahmen:**
- Next.js 15+ (App Router), React 19, TypeScript, keine UI-Library; Styling über CSS Custom Properties (Tokens aus README §Design Tokens), gern Tailwind v4 — Werte müssen exakt stimmen (High-Fidelity)
- Fonts: Instrument Sans + JetBrains Mono via `next/font` selbst hosten
- Inhalte aus dem Prototyp als `content/*.ts` extrahieren (Projekte, Labs, Artikel, Stationen inkl. Zwischenschritte, Zertifikate); die mit „ENTWURF" markierten Artikel als Draft kennzeichnen
- Settings als Context-Provider mit den localStorage-Keys aus dem README (SSR-safe: Default dark, Client-Sync nach Hydration)
- View Transitions für Seitenwechsel und Karten→Detail-Morphs (`view-transition-name` pro Item); Safari/iPad: Web-Animations-Fallback (`fbVt`) statt VT
- Scroll-Locks nie auf `body`, nur auf Route-Wrappern (siehe Nachtrag v23)
- Barrierefreiheit: Fokus-Reihenfolge, echte `<button>`-Elemente, `prefers-reduced-motion` respektiert den Animations-Schalter, Kontraste ≥ 4.5:1 (der Auto-Kontrast-Wächter ist die Referenzlogik)

**Reihenfolge:** Tokens/Theme → `<GlassSurface>`-Komponente → Nav (Desktop → Wide → Mobile klassisch → Modern + Scrollhide) → Seiten mit statischen Daten → Detail-Cover-Logik → Einstellungen → Hero-Modi (Custom Hook `useHeroShader`) → Auto-Kontrast → View Transitions + Fallback → Splash, Lightbox, Galerien, Verwandte-Reihen → Reise-Seite.

**Definition of Done:** Alle Screens entsprechen den Screenshots; jede Option aus README §Einstellungen funktioniert und persistiert; Lighthouse a11y ≥ 95; keine Konsolen-Fehler; `npm run build` läuft sauber durch.

---

Tipp: Öffne parallel `Loona Site V2.dc.html` im Browser (lokaler Webserver im Handoff-Ordner, wegen `support.js`) — das ist die interaktive Referenz für jedes Detail.
