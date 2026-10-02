/**
 * Pixel-Regression der Hauptseiten (erster Bildschirm: Desktop 1280×800, Mobil 390×844) in dunkel und hell — gegen
 * Referenzbilder in
 * tests/visual-pages/baseline/<umgebung>/ (siehe PIXEL_ENV). Gleiches Verfahren wie die Logo-Tests (pixelmatch, Schwelle 0.1).
 *   npm run build && npx next start -p 3123   (frische DB — Inhalte = Startinhalte)
 *   npm run test:pages            vergleichen (Differenzbilder bei Abweichung: tests/visual-pages/diff/)
 *   UPDATE=1 npm run test:pages   Referenzbilder bewusst neu erzeugen (nach gewollten Design-Änderungen)
 * Stabil gemacht: „Animationen aus“, reduzierte Bewegung, Splash aus, Shader-Leinwände und Live-Werte ([data-live])
 * maskiert, Schriften geladen. Wichtig: frischer Build — next start schreibt revalidierte Seiten in .next zurück.
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { launchOptions } from '../browser.mjs';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const U = process.env.BASE_URL ?? 'http://localhost:3123';
const DIR = import.meta.dirname;
/**
 * Referenzbilder je Umgebung: Browser-Version und Systemschriften verändern Kantenglättung und Laufweiten, ein
 * Vergleich ist nur innerhalb derselben Umgebung aussagekräftig. `local` = Entwicklungs-Container
 * (/opt/pw-browsers/chromium), `ci` = GitHub Actions (Chromium von Playwright auf ubuntu-latest; erneuern über
 * Actions → CI → „Run workflow“ mit „Referenzbilder erneuern“).
 */
const PIXEL_ENV = process.env.PIXEL_ENV ?? 'local';
const BASE = path.join(DIR, 'baseline', PIXEL_ENV);
const DIFF = path.join(DIR, 'diff');
const UPDATE = process.env.UPDATE === '1';
/** Höchstens 0,5 % abweichende Pixel (Kantenglättung/Schrift-Hinting schwanken minimal). */
const TOLERANCE = 0.005;
const PAGES = ['/', '/projekte', '/labs', '/tech', '/reise', '/ueber-mich', '/impressum', '/projekte/neuewebsite', '/tech/a1', '/en', '/en/about'];

rmSync(DIFF, { recursive: true, force: true });
mkdirSync(BASE, { recursive: true });
const b = await chromium.launch(launchOptions());
let failed = 0;
const DEVICES = [
  { prefix: '', opts: { viewport: { width: 1280, height: 800 } } },
  // Mobil mit Touch (Tab-Leiste, mobile Navigation); deviceScaleFactor 1 hält die Referenzbilder klein.
  { prefix: 'mobil_', opts: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
];
for (const { prefix, opts } of DEVICES)
  for (const theme of ['dark', 'light']) {
    const ctx = await b.newContext({ ...opts, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    await ctx.addInitScript((t) => {
      localStorage.setItem('ld-cookie', 'ok');
      localStorage.setItem('ld-splash', 'off');
      localStorage.setItem('ld-anim', 'off');
      if (t === 'light') localStorage.setItem('ld-theme', 'light');
    }, theme);
    const p = await ctx.newPage();
    for (const route of PAGES) {
      await p.goto(U + route, { waitUntil: 'networkidle' });
      await p.evaluate(() => document.fonts.ready);
      await p.waitForTimeout(800);
      const shot = PNG.sync.read(
        await p.screenshot({ mask: [p.locator('canvas'), p.locator('[data-live]')], maskColor: '#ff00ff', animations: 'disabled' }),
      );
      const name = `${prefix}${theme}${route === '/' ? '_home' : route.replace(/\//g, '_')}.png`;
      const file = path.join(BASE, name);
      if (!UPDATE && !existsSync(file) && process.env.CI === 'true') {
        failed++;
        console.log(`✗ ${name} — keine Referenz für „${PIXEL_ENV}“ (Workflow CI mit „Referenzbilder erneuern“ starten)`);
        continue;
      }
      if (UPDATE || !existsSync(file)) {
        writeFileSync(file, PNG.sync.write(shot));
        console.log(`↻ ${name} (Referenz ${UPDATE ? 'erneuert' : 'angelegt'})`);
        continue;
      }
      const ref = PNG.sync.read(readFileSync(file));
      if (ref.width !== shot.width || ref.height !== shot.height) {
        failed++;
        console.log(`✗ ${name} — Größe ${shot.width}×${shot.height} statt ${ref.width}×${ref.height}`);
        continue;
      }
      const diff = new PNG({ width: ref.width, height: ref.height });
      const n = pixelmatch(ref.data, shot.data, diff.data, ref.width, ref.height, { threshold: 0.1 });
      const ratio = n / (ref.width * ref.height);
      if (ratio > TOLERANCE) {
        failed++;
        mkdirSync(DIFF, { recursive: true });
        writeFileSync(path.join(DIFF, name), PNG.sync.write(diff));
        writeFileSync(path.join(DIFF, name.replace('.png', '.actual.png')), PNG.sync.write(shot));
      }
      console.log(`${ratio > TOLERANCE ? '✗' : '✓'} ${name} — ${(ratio * 100).toFixed(2)} % abweichend`);
    }
    await ctx.close();
  }
await b.close();
if (failed)
  console.log(`\n${failed} Seite(n) weichen ab — Differenzbilder in tests/visual-pages/diff/. Gewollt? → UPDATE=1 npm run test:pages`);
process.exit(failed ? 1 : 0);
