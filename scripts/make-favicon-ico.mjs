#!/usr/bin/env node
/**
 * Baut favicon.ico (16 + 32 + 48) aus den finalen PNGs — PNG-komprimierte ICO-Einträge, keine Abhängigkeiten.
 *   node scripts/make-favicon-ico.mjs [dir]   (Default: public/)
 * Erwartet <dir>/favicon-16.png, favicon-32.png, favicon-48.png; schreibt <dir>/favicon.ico.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dir = path.resolve(root, process.argv[2] ?? 'public');
const sizes = [16, 32, 48];
const files = sizes.map((s) => path.join(dir, `favicon-${s}.png`));

const missing = files.filter((f) => !existsSync(f));
if (missing.length) {
  console.error(`make-favicon-ico: fehlende PNGs:\n  ${missing.map((f) => path.relative(root, f)).join('\n  ')}`);
  process.exit(1);
}

const pngs = files.map((f) => readFileSync(f));
pngs.forEach((png, i) => {
  // IHDR: Breite/Höhe an Offset 16/20 — Größe verifizieren statt dem Dateinamen zu vertrauen.
  const w = png.readUInt32BE(16);
  const h = png.readUInt32BE(20);
  if (w !== sizes[i] || h !== sizes[i]) throw new Error(`${files[i]} ist ${w}×${h}, erwartet ${sizes[i]}×${sizes[i]}`);
});

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(pngs.length, 4);

let offset = 6 + 16 * pngs.length;
const entries = pngs.map((png, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(sizes[i] % 256, 0); // width (0 = 256)
  e.writeUInt8(sizes[i] % 256, 1); // height
  e.writeUInt8(0, 2); // palette
  e.writeUInt8(0, 3); // reserved
  e.writeUInt16LE(1, 4); // color planes
  e.writeUInt16LE(32, 6); // bits per pixel
  e.writeUInt32LE(png.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += png.length;
  return e;
});

const out = path.join(dir, 'favicon.ico');
writeFileSync(out, Buffer.concat([header, ...entries, ...pngs]));
console.log(`make-favicon-ico: ${path.relative(root, out)} (${sizes.join('+')})`);
