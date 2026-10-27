#!/usr/bin/env node
/**
 * Kopiert die finalen Logo-Assets der Produktfamilie 1:1 aus dem Logo-Handoff nach public/brand/<key>/
 * (keine Neugenerierung; Liste aus docs/design_handoff_loona_logo/assets/manifest.json).
 * Die Icons der Kernsite (favicon*, App-Icons, og-image, site.webmanifest) kommen seit dem Brand-System 2026-10
 * aus docs/design_handoff_loona_brand — `npm run brand:icons` (scripts/export-brand-icons.mjs).
 * Fehlende Dateien werden gemeldet; mit --strict endet das Script dann mit Exit-Code 1.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const handoff = path.join(root, 'docs/design_handoff_loona_logo');
const manifest = JSON.parse(readFileSync(path.join(handoff, 'assets/manifest.json'), 'utf8'));
const strict = process.argv.includes('--strict');

const missing = [];
let copied = 0;

function copy(src, dest) {
  if (!existsSync(src)) {
    missing.push(path.relative(root, src));
    return false;
  }
  mkdirSync(path.dirname(dest), { recursive: true });
  copyFileSync(src, dest);
  copied++;
  return true;
}

for (const product of manifest.products) {
  if (product.key === 'ld') continue;
  const srcDir = path.join(handoff, product.path);
  for (const file of product.files) copy(path.join(srcDir, file), path.join(root, 'public/brand', product.key, file));
}

console.log(`brand:sync — ${copied} Datei(en) kopiert.`);
if (missing.length) {
  console.warn(`Fehlend (${missing.length}):\n  ${missing.join('\n  ')}`);
  if (strict) process.exit(1);
}
