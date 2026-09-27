# Projekt-Regeln für AI-Assistenten (loona! designs · ld-evo)

Diese Datei lesen Claude Code & Co. automatisch. Sie beschreibt, wie in diesem Repo gearbeitet wird.
Ausführlich und interaktiv: **LD Flow → Guide** (`/flow/guide`).

## Grundsätze

- **Quellen prüfen, nichts erfinden.** Formen, Farben, Maße, Texte kommen aus den Handoffs in `design/` und `docs/`
  (Prototypen `*.dc.html`, READMEs mit Nachträgen). Bei Widerspruch gilt der Prototyp; Abweichungen im Code kommentieren.
- Kommunikation und Kommentare auf **Deutsch**.
- Kleine, überprüfbare Schritte; nach jeder Änderung `npm run typecheck && npm test`.

## Architektur in einem Satz je Teil

- `src/app/(main)` Site (Next 16 App Router), `src/app/(flow)` CMS „LD Flow.“, `src/app/(orbit)` Shader-Wallpapers —
  drei getrennte Root-Layouts.
- `src/site/*` Client-Komponenten der Site (Einstellungen per localStorage, View Transitions, Glas, Hero-Engine).
- `src/cms/*` Schema, SQLite (`node:sqlite`), Auth, Datenzugriff (`repo.ts`), Server Actions (`actions.ts`).
- `src/widgets/*` Baukasten-Widgets (`defineWidget`), Registry wird generiert (`npm run widgets`).
- `content/*.ts` Startinhalte (1:1 aus den Prototypen), danach lebt der Inhalt in der Datenbank.

## Harte Regeln

1. **Generierte Dateien nie von Hand ändern**, sondern den Generator: `src/site/hero/engine/heroEngine.js`
   (`scripts/extract-hero-engine.mjs`), `src/orbit/*` (`scripts/extract-orbit.mjs`), `src/site/splash/sketchMarkup.ts`,
   `content/journey.ts`, `src/widgets/index.ts` (`scripts/gen-widgets.mjs`).
2. **Widgets** (`src/widgets/*.tsx`): kein `'use client'`, kein `createContext`/`useState` direkt — Hooks nur aus
   Client-Modulen (`useSite`, `useContent`). Texte mit `<EText path={`${path}.feld`} …/>` für WYSIWYG.
3. **Sicherheit:** SQL nur mit Prepared Statements (`?`), nie String-Verkettung. Jede Funktion in `src/cms/repo.ts`
   prüft `requireUser()` selbst. Kein `dangerouslySetInnerHTML` mit Nutzerinhalten; Rich Text bleibt JSON.
   Links über `isSafeHref`, Medien über `isSafeMediaSrc`.
4. **Keine Scroll-Locks auf `body`**, echte `<button>`s, `prefers-reduced-motion`/„Animationen aus“ respektieren,
   Kontrast ≥ 4.5:1.
5. Neue Inhaltsfelder: Schema (`src/cms/schema.ts`) → Typ (`content/*.ts` bzw. `src/cms/types.ts`) → Darstellung;
   der Test „Startinhalte bestehen das Schema“ muss grün bleiben.

## Befehle

| Befehl | Zweck |
| --- | --- |
| `npm run dev` | Entwicklung (generiert vorher die Widget-Registry) |
| `npm run build && npm start` | Produktion (Node ≥ 22.13, Datenordner `data/` bzw. `LDFLOW_DB`) |
| `npm run typecheck` · `npm test` | TypeScript · Unit-Tests (Vitest) |
| `npm run test:visual` | Pixeltests der Logo-Komponenten |
| `npm run test:e2e` | LD-Flow-Durchlauf gegen laufenden Server mit frischer DB (Anleitung im Dateikopf) |
| `npm run format` | Prettier |
