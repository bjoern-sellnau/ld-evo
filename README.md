# ld-evo — Loona! Designs

Next.js (App Router) · React 19 · TypeScript. Styling über CSS Custom Properties (`src/styles/tokens.css`).

**Einstieg:** der interaktive Guide in LD Flow unter **`/flow/guide`** (Architektur, Widgets bauen, Erweitern,
Sicherheit, Hosting, AI-Prompts). Kurzfassung für AI-Assistenten: [`CLAUDE.md`](CLAUDE.md). Betrieb/Sicherheit:
[`docs/LD-FLOW.md`](docs/LD-FLOW.md).

## Struktur

| Pfad | Inhalt |
|---|---|
| `src/app/(main)` · `src/site/` | Website (Portfolio) — 1:1 nach `design/design_handoff_loona_site/` |
| `src/app/(flow)` · `src/cms/` | CMS **LD Flow.** — WYSIWYG, Entwürfe, Planen, Versionen, Medien (mit Bildvarianten), Navigation, Nachrichten, Nutzer, Guide |
| `src/widgets/` | Baukasten-Widgets (`defineWidget`), Registry wird generiert |
| `src/app/(orbit)` · `src/orbit/` | ORBIT OS Shader-Wallpapers (`/orbit`) |
| `src/components/brand/` | Logo-Bibliothek: `LoonaMark`, `LoonaLockup`, `LoonaTile`, … (Demo `/brand`) |
| `content/` | Startinhalte (Seed), 1:1 aus den Prototypen |
| `scripts/` | Generatoren (Prototyp → Code), Marken-Assets, Widget-Registry, statischer Export |
| `design/`, `docs/` | Handoffs (Quelle der Wahrheit) |

## Befehle

```bash
npm run dev            # Dev-Server
npm run build && npm start   # Produktion (Node ≥ 22.13, Datenordner data/ bzw. LDFLOW_DB)
npm run typecheck      # TypeScript
npm run lint           # ESLint (Next, Hooks, jsx-a11y + Projektregeln aus CLAUDE.md)
npm run format:check   # Prettier prüfen (npm run format korrigiert)
npm test               # Unit-Tests (Logo-Geometrie, Tokens/Kontrast, Schema, Auth, Widgets …)
npm run test:visual    # Pixel-Vergleich der Logos (Chromium + pixelmatch, Toleranz 0.1 %)
npm run test:e2e       # LD Flow im Browser (Anleitung im Dateikopf von tests/e2e/flow.e2e.mjs)
npm run test:a11y      # Barrierefreiheit aller Seiten (axe-core, hell/dunkel)
npm run test:pages     # Pixelvergleich der Hauptseiten mit Referenzbildern (Desktop + Mobil)
npm run test:perf      # Ladezeit mobil (LCP, CLS, TBT, Datenmenge) gegen Budgets
npm run backup         # Datenbank sichern, prüfen, alte Stände aufräumen (docs/LD-FLOW.md → Sicherung)
npm run widgets        # Widget-Registry neu erzeugen (läuft vor dev/build/test automatisch)
npm run brand:sync     # finale Logo-Assets aus dem Handoff nach public/ kopieren
```

## Automatische Prüfung (CI)

`.github/workflows/ci.yml` läuft bei jedem Push und Pull Request: Prettier, ESLint, TypeScript, Unit- und
Logo-Pixeltests; danach je ein Job mit frischem Build und frischer DB für E2E, Barrierefreiheit, Seiten-Pixel und
Ladezeit. Bei Fehlern hängen Differenzbilder/Screenshots als Artefakt am Lauf. Die Seiten-Pixeltests haben je
Umgebung eigene Referenzbilder (`tests/visual-pages/baseline/local|ci`); die der CI erneuert man nach gewollten
Design-Änderungen über **Actions → CI → Run workflow → „Referenzbilder erneuern“** (committet auf den Branch).

## GitHub Pages (Website-Vorschau)

`.github/workflows/pages.yml` exportiert die Website statisch nach GitHub Pages (ohne LD Flow — das CMS braucht
einen Node-Server). Einmalig: *Settings → Pages → Source: GitHub Actions*. Läuft bei Push auf `master` oder manuell.

## Verwendung

```tsx
import { LoonaLockup, LoonaMark, LoonaTile } from '@/components/brand';

<LoonaMark product="ld" size={40} tone="color" />      // tone: color | ink | cream | current
<LoonaLockup product="flow" theme="light" markSize={28} />
<LoonaTile product="nova" variant="ink" size={96} />
```
