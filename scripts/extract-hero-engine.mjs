#!/usr/bin/env node
/**
 * Erzeugt src/site/hero/engine/heroEngine.js aus dem Site-Prototyp:
 * Methoden ensureLava … hex01 (Zeilen 1611–3802) sowie resolvePal (3835–3839) und lum (3876–3879) unverändert,
 * davor ein Adapter-Kopf, der die DC-Komponente ersetzt. Aufruf: node scripts/extract-hero-engine.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const src = readFileSync(path.join(root, 'design/design_handoff_loona_site/Loona Site V2.dc.html'), 'utf8').split('\n');
const lines = (a, b) => src.slice(a - 1, b).join('\n');

const body = lines(1611, 3802);
if (!body.startsWith('  ensureLava() {') || src[3801].trim() !== '}')
  throw new Error('Prototyp-Zeilen verschoben: ensureLava/hex01 nicht gefunden');
const extra = `${lines(3835, 3839)}\n\n${lines(3876, 3879)}`;
if (!extra.trimStart().startsWith('resolvePal(cfg)')) throw new Error('Prototyp-Zeilen verschoben: resolvePal nicht gefunden');

// Einzige Korrektur am Prototyp-Code: ensureLava liest `is2d` vor dessen const-Deklaration (TDZ →
// ReferenceError, sobald Animationen aus sind). Die Deklaration wird unverändert vor `active` gezogen.
const IS2D = "    const is2d = ['orbit', 'matrix', 'rain', 'swarm', 'firefly', 'shooting', 'snow'].includes(mode);\n";
const ACTIVE = '    const active = this.state.page';
let fixed = body;
if (!fixed.includes(IS2D) || !fixed.includes(ACTIVE)) throw new Error('ensureLava: is2d/active nicht gefunden');
fixed = fixed.replace(IS2D, '').replace(ACTIVE, IS2D + ACTIVE);

const head = readFileSync(path.join(root, 'scripts/hero-engine-head.js'), 'utf8');
writeFileSync(path.join(root, 'src/site/hero/engine/heroEngine.js'), `${head}${fixed}\n\n${extra}\n}\n`);
console.log('heroEngine.js erzeugt.');
