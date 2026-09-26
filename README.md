# ld-evo — Loona! Designs

Next.js (App Router) · React 19 · TypeScript. Styling über CSS Custom Properties (`src/styles/tokens.css`).

## Struktur

| Pfad | Inhalt |
|---|---|
| `src/components/brand/` | Logo-Bibliothek: `LoonaMark`, `LoonaLockup`, `LoonaTile`, `LoonaLetterL/D`, Produktdaten |
| `src/app/brand/` | Demo-Seite `/brand` (alle 5 Marken, Lockups, Kacheln, Kontrasttabelle) |
| `src/styles/tokens.css` | Design-Tokens `--loona-*` |
| `scripts/` | `sync-brand-assets.mjs` (Handoff → `public/`), `make-favicon-ico.mjs` (16+32+48 → `favicon.ico`) |
| `docs/design_handoff_loona_logo/` | Handoff Logo-System (Quelle der Wahrheit) |
| `design/design_handoff_loona_site/` | Handoff Portfolio-Site |
| `design/design_handoff_shader_wallpapers/` | Handoff ORBIT OS Shader-Wallpapers |

## Befehle

```bash
npm run dev            # Dev-Server
npm run build          # Produktions-Build (inkl. Typecheck)
npm test               # Unit-Tests: Geometrie 1:1 gegen Assets, Tokens, Kontrast
npm run test:visual    # Pixel-Vergleich (Chromium + pixelmatch, Toleranz 0.1 %)
npm run brand:sync     # finale Assets aus dem Handoff nach public/ kopieren
npm run brand:ico      # public/favicon.ico aus favicon-16/32/48.png erzeugen
```

## Verwendung

```tsx
import { LoonaLockup, LoonaMark, LoonaTile } from '@/components/brand';

<LoonaMark product="ld" size={40} tone="color" />      // tone: color | ink | cream | current
<LoonaLockup product="flow" theme="light" markSize={28} />
<LoonaTile product="nova" variant="ink" size={96} />
```
