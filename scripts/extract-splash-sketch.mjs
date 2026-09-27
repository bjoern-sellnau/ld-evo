#!/usr/bin/env node
/**
 * Erzeugt src/site/splash/sketchMarkup.ts aus dem Site-Prototyp: das Wireframe-Markup der Splash-Variante
 * „Sketch“ (Zeilen 203–274) unverändert als String; {{ sk… }}-Platzhalter werden zur Laufzeit ersetzt.
 * Einzige Anpassung: 'JetBrains Mono' → var(--ld-font-mono) (next/font). Aufruf: node scripts/extract-splash-sketch.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const src = readFileSync(path.join(root, 'design/design_handoff_loona_site/Loona Site V2.dc.html'), 'utf8').split('\n');
if (!src[201].includes('{{ splashSketchDisp }}') || src[274].trim() !== '</div>')
  throw new Error('Prototyp-Zeilen verschoben: Sketch-Splash nicht gefunden');
const html = src
  .slice(202, 274)
  .map((l) => l.trim())
  .join('')
  .replaceAll("'JetBrains Mono',monospace", 'var(--ld-font-mono),monospace');
const out = `// Generiert von scripts/extract-splash-sketch.mjs — nicht von Hand editieren.
export const SKETCH_HTML = ${JSON.stringify(html)};
`;
writeFileSync(path.join(root, 'src/site/splash/sketchMarkup.ts'), out);
console.log('sketchMarkup.ts erzeugt.');
