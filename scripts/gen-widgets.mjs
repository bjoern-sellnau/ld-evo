#!/usr/bin/env node
/**
 * Erzeugt src/widgets/index.ts: jede Datei src/widgets/*.tsx (außer define/index) ist ein Widget
 * (default export von defineWidget). Läuft automatisch vor dev/build/test (npm-Hooks). Aufruf: npm run widgets
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dir = path.join(root, 'src/widgets');
const files = readdirSync(dir)
  .filter((f) => f.endsWith('.tsx') && !f.startsWith('_'))
  .sort();
const bad = files.filter((f) => /^\s*['"]use client['"]/.test(readFileSync(path.join(dir, f), 'utf8')));
if (bad.length) throw new Error(`Widgets dürfen kein 'use client' haben (Server validiert mit der Definition): ${bad.join(', ')}`);
const ident = (f) => 'w_' + f.replace(/\.tsx$/, '').replace(/[^a-zA-Z0-9]/g, '_');
const out = `// Generiert von scripts/gen-widgets.mjs — nicht von Hand editieren. Neues Widget = neue Datei in src/widgets/.
import type { RegisteredWidget } from './define';
${files.map((f) => `import ${ident(f)} from './${f.replace(/\.tsx$/, '')}';`).join('\n')}

const list: RegisteredWidget[] = [${files.map(ident).join(', ')}];

export const WIDGETS: Record<string, RegisteredWidget> = {};
for (const w of list) {
  if (WIDGETS[w.id]) throw new Error(\`Widget-ID doppelt: \${w.id}\`);
  WIDGETS[w.id] = w;
}
`;
const target = path.join(dir, 'index.ts');
let prev = '';
try {
  prev = readFileSync(target, 'utf8');
} catch {}
if (prev !== out) writeFileSync(target, out);
console.log(`Widgets: ${files.length} registriert.`);
