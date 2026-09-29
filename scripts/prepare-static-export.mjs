#!/usr/bin/env node
/**
 * Bereitet einen statischen Export der Website vor (GitHub Pages). NUR in einer Wegwerf-Kopie/CI ausführen:
 * entfernt alle Teile, die einen Server brauchen — LD Flow (Admin, Vorschau, Medien-Route) und den Proxy.
 * Danach: STATIC_EXPORT=1 NEXT_PUBLIC_BASE_PATH=/ld-evo npm run build  →  Ergebnis in out/
 */
import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';

if (process.env.CI !== 'true' && process.env.FORCE_STATIC_PREP !== '1') {
  console.error('Abbruch: löscht Server-Teile aus dem Arbeitsverzeichnis. Nur in CI oder mit FORCE_STATIC_PREP=1 in einer Kopie.');
  process.exit(1);
}
const root = path.resolve(import.meta.dirname, '..');
// Frei angelegte CMS-Seiten (/[slug]) entfallen: der Export baut mit frischer DB (nur Prototyp-Inhalte).
const remove = [
  'src/app/(flow)',
  'src/app/media',
  'src/app/health',
  'src/app/(main)/(site)/flow-preview',
  'src/app/(en)/en/flow-preview',
  'src/app/(main)/(site)/[slug]',
  'src/app/(en)/en/[slug]',
  'src/proxy.ts',
  'src/instrumentation.ts',
];
for (const r of remove) {
  const p = path.join(root, r);
  if (existsSync(p)) {
    rmSync(p, { recursive: true, force: true });
    console.log('entfernt:', r);
  }
}
