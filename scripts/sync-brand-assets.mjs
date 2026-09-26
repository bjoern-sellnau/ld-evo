#!/usr/bin/env node
/**
 * Kopiert die finalen Logo-Assets 1:1 aus dem Handoff nach public/ (keine Neugenerierung).
 *   Kernsite (ld)       → public/
 *   Produkte (flow …)   → public/brand/<key>/
 * Liste der Dateien aus docs/design_handoff_loona_logo/assets/manifest.json.
 * Fehlende Dateien werden gemeldet; mit --strict endet das Script dann mit Exit-Code 1.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const handoff = path.join(root, 'docs/design_handoff_loona_logo');
const manifest = JSON.parse(readFileSync(path.join(handoff, 'assets/manifest.json'), 'utf8'));
const strict = process.argv.includes('--strict');

// Für die Kernsite nur, was im <head>/Manifest gebraucht wird (Prompt §4).
const CORE_FILES = [
  'favicon.svg',
  'favicon-16.png',
  'favicon-32.png',
  'favicon-48.png',
  'apple-touch-icon-180.png',
  'android-icon-192.png',
  'android-icon-512.png',
  'og-image-1200x630.png',
];

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
  const srcDir = path.join(handoff, product.path);
  const isCore = product.key === 'ld';
  const destDir = isCore ? path.join(root, 'public') : path.join(root, 'public/brand', product.key);
  const files = isCore ? CORE_FILES : product.files;
  for (const file of files) copy(path.join(srcDir, file), path.join(destDir, file));
}

// Web-Manifest nur übernehmen, wenn die darin referenzierten Icons vorhanden sind.
const webmanifestSrc = path.join(handoff, 'assets/site.webmanifest');
const webmanifest = JSON.parse(readFileSync(webmanifestSrc, 'utf8'));
const iconsPresent = webmanifest.icons.every((i) => existsSync(path.join(root, 'public', i.src)));
if (iconsPresent) copy(webmanifestSrc, path.join(root, 'public/site.webmanifest'));
else missing.push('public/site.webmanifest (übersprungen: Manifest-Icons fehlen)');

console.log(`brand:sync — ${copied} Datei(en) kopiert.`);
if (missing.length) {
  console.warn(`Fehlend (${missing.length}):\n  ${missing.join('\n  ')}`);
  if (strict) process.exit(1);
}
