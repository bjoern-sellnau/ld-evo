#!/usr/bin/env node
/**
 * Exportiert die Icons der Kernmarke aus dem Brand-Handoff (docs/design_handoff_loona_brand/assets) nach public/.
 * Das Paket enthält nur SVGs; die PNG-Liste steht im README („Zu exportieren“): 16/32/48/180/192/512/1024 —
 * bis 32 px das Zeichen, ab 48 px das Badge; Maskable = Badge ohne rx auf Tinte.
 *   npm run brand:icons
 * Gerendert mit Chromium (Playwright), danach favicon.ico (scripts/make-favicon-ico.mjs).
 *
 * Abweichung (Maskable): Im Badge reicht das LD bis 45,7 % des Radius an die Ecken — Android-Masken garantieren nur
 * einen Kreis mit 40 % Radius (W3C „Safe Zone“). Das LD wird deshalb im Maskable-Icon auf 86 % verkleinert.
 * Das Vorschaubild og-image-1200x630.png: Zeichen + Wortmarke (Manrope, @fontsource) wie Brand Guide S. 07 auf Tinte,
 * Unterzeile wie im bisherigen Bild (Instrument Sans, @fontsource).
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const root = path.resolve(import.meta.dirname, '..');
const assets = path.join(root, 'docs/design_handoff_loona_brand/assets');
const pub = path.join(root, 'public');
const read = (f) => readFileSync(path.join(assets, f), 'utf8').trim();

const zeichen = read('favicon.svg');
const badge = read('loona-badge.svg');
// Badge Stand 31.10.2026 (README „2. Badge“)
const T = 'translate(9.44 9.92) scale(0.96)';
if (!badge.includes(T) || !badge.includes(' rx="14"')) throw new Error('loona-badge.svg: Transform/rx nicht wie im README');
// Maskable: ohne rx, LD um die Mitte des LD (x 0–47, y 3–43 → 23,5/23) auf 86 % verkleinert
const s = +(0.96 * 0.86).toFixed(4);
const maskable = badge
  .replace(' rx="14"', '')
  .replace(T, `translate(${+(32 - 23.5 * s).toFixed(3)} ${+(32 - 23 * s).toFixed(3)}) scale(${s})`);
const appleTouch = badge.replace(' rx="14"', ''); // iOS rundet selbst; transparente Ecken würden schwarz

const font = (pkg, file) =>
  `data:font/woff2;base64,${readFileSync(path.join(root, 'node_modules/@fontsource', pkg, 'files', file)).toString('base64')}`;
const ogHtml = `<!doctype html><html><head><style>
@font-face{font-family:Manrope;font-weight:500;src:url(${font('manrope', 'manrope-latin-500-normal.woff2')})}
@font-face{font-family:Manrope;font-weight:800;src:url(${font('manrope', 'manrope-latin-800-normal.woff2')})}
@font-face{font-family:'Instrument Sans';font-weight:400;src:url(${font('instrument-sans', 'instrument-sans-latin-400-normal.woff2')})}
html,body{margin:0;width:1200px;height:630px;background:#171310}
.wrap{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:34px}
.lock{display:flex;align-items:center;gap:${0.46 * 104}px}
.name{font:800 ${(104 * 64) / 69}px/1 Manrope;letter-spacing:-0.035em;color:#F6F1E8;white-space:nowrap}
.name span{font-weight:500}
.sub{font:400 26px/1 'Instrument Sans';letter-spacing:4px;color:#B3A78F}
</style></head><body><div class="wrap"><div class="lock">
${zeichen.replace('viewBox="6 9 32 28"', `viewBox="8 11 28 24" width="${(104 * 28) / 24}" height="104"`)}
<div class="name">loona! <span>designs</span></div></div><div class="sub">PLATTFORM · BEYOND</div></div></body></html>`;

const jobs = [
  ['favicon-16.png', zeichen, 16],
  ['favicon-32.png', zeichen, 32],
  ['favicon-48.png', badge, 48],
  ['apple-touch-icon-180.png', appleTouch, 180],
  ['android-icon-192.png', badge, 192],
  ['android-icon-512.png', badge, 512],
  ['android-icon-maskable-192.png', maskable, 192],
  ['android-icon-maskable-512.png', maskable, 512],
  ['app-icon-1024.png', badge, 1024],
];

const PREINSTALLED = '/opt/pw-browsers/chromium';
const browser = await chromium.launch(existsSync(PREINSTALLED) ? { executablePath: PREINSTALLED } : {});
const page = await browser.newPage({ deviceScaleFactor: 1 });
try {
  for (const [file, svg, size] of jobs) {
    await page.setViewportSize({ width: size, height: size });
    const src = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
    await page.setContent(
      `<!doctype html><html><body style="margin:0;background:transparent"><img id="i" src="${src}" width="${size}" height="${size}" style="display:block;object-fit:contain"></body></html>`,
    );
    await page.evaluate(() => document.images[0].decode());
    writeFileSync(path.join(pub, file), await page.locator('#i').screenshot({ omitBackground: true }));
    console.log(`brand:icons — public/${file}`);
  }
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(ogHtml);
  await page.evaluate(() => document.fonts.ready);
  writeFileSync(path.join(pub, 'og-image-1200x630.png'), await page.screenshot());
  console.log('brand:icons — public/og-image-1200x630.png');
} finally {
  await browser.close();
}

writeFileSync(path.join(pub, 'favicon.svg'), `${zeichen}\n`);
// Icon-Pfade relativ: sie gelten zur Adresse des Manifests — so stimmen sie auch unter einem Basispfad (GitHub Pages
// /ld-evo/site.webmanifest → /ld-evo/android-icon-192.png); absolute Pfade („/android-…“) zeigten dort ins Leere.
const manifest = {
  name: 'Loona! Designs',
  short_name: 'Loona!',
  start_url: './',
  icons: [
    { src: 'android-icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: 'android-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: 'android-icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
    { src: 'android-icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
  theme_color: '#171310',
  background_color: '#171310',
  display: 'standalone',
};
writeFileSync(path.join(pub, 'site.webmanifest'), `${JSON.stringify(manifest, null, 2)}\n`);
execFileSync(process.execPath, [path.join(root, 'scripts/make-favicon-ico.mjs')], { stdio: 'inherit' });
