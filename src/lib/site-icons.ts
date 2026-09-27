import { existsSync } from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';

/**
 * Icon-/Manifest-Einträge nach assets/head-snippet.html (Reihenfolge: SVG zuerst, dann PNG-Fallback).
 * Es wird nur verlinkt, was in public/ liegt (befüllt via `npm run brand:sync`) — so entstehen keine 404s,
 * solange einzelne Handoff-Dateien fehlen.
 */
/** Basispfad, wenn die Site unter einem Unterpfad liegt (GitHub Pages: /ld-evo). */
const B = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const has = (file: string) => existsSync(path.join(process.cwd(), 'public', file));

export function siteIcons(): Pick<Metadata, 'icons' | 'manifest'> & { ogImage?: string } {
  type Icon = { url: string; sizes?: string; type?: string };
  const candidates: [string, Icon][] = [
    ['favicon.ico', { url: `${B}/favicon.ico`, sizes: '16x16 32x32 48x48' }],
    ['favicon.svg', { url: `${B}/favicon.svg`, type: 'image/svg+xml' }],
    ['favicon-32.png', { url: `${B}/favicon-32.png`, sizes: '32x32', type: 'image/png' }],
    ['favicon-16.png', { url: `${B}/favicon-16.png`, sizes: '16x16', type: 'image/png' }],
  ];
  const icon = candidates.filter(([file]) => has(file)).map(([, i]) => i);

  return {
    icons: {
      icon,
      apple: has('apple-touch-icon-180.png') ? [{ url: `${B}/apple-touch-icon-180.png`, sizes: '180x180' }] : [],
    },
    manifest: has('site.webmanifest') ? `${B}/site.webmanifest` : undefined,
    ogImage: has('og-image-1200x630.png') ? `${B}/og-image-1200x630.png` : undefined,
  };
}
