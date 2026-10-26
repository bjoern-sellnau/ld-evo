import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { chromium, type Browser, type Page } from '@playwright/test';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import {
  LOONA_NEUTRALS,
  LOONA_PRODUCT_KEYS,
  LOONA_PRODUCTS,
  LoonaMark,
  LoonaTile,
  LoonaZeichen,
  type LoonaProductKey,
  type LoonaTone,
} from '@/components/brand';

/**
 * Pixel-Vergleich Komponente ↔ finale Handoff-Assets (Prompt §6: Toleranz 0.1 %), gerendert in Chromium via Playwright.
 * Läuft in Vitest statt im Playwright-Runner, weil dessen JSX-Transform (Component-Testing) React-Elemente umschreibt.
 * Kernmarke: Brand-System 2026-10 (docs/design_handoff_loona_brand); Produktfamilie: Logo-Handoff v1.0.
 */
const ASSETS = path.resolve(import.meta.dirname, '../../docs/design_handoff_loona_logo/assets');
const BRAND = path.resolve(import.meta.dirname, '../../docs/design_handoff_loona_brand/assets');
const FAMILY = LOONA_PRODUCT_KEYS.filter((k) => k !== 'ld');
const TOLERANCE = 0.001;
// Ink-Zeichen wären auf Ink unsichtbar → Hintergrund je nach Ton.
const bgFor = (tone: LoonaTone) => (tone === 'ink' ? LOONA_NEUTRALS.paper : LOONA_NEUTRALS.ink);

// Cloud-Container: vorinstalliertes Chromium; lokal das von Playwright verwaltete.
const PREINSTALLED = '/opt/pw-browsers/chromium';
let browser: Browser;
let page: Page;
beforeAll(async () => {
  browser = await chromium.launch(existsSync(PREINSTALLED) ? { executablePath: PREINSTALLED } : {});
  page = await browser.newPage({ deviceScaleFactor: 1 });
});
afterAll(() => browser?.close());

const dataUri = (file: string, mime: string, dir = ASSETS) =>
  `data:${mime};base64,${readFileSync(path.join(dir, file)).toString('base64')}`;

async function shoot(inner: string, width: number, height: number, bg: string): Promise<PNG> {
  await page.setViewportSize({ width, height });
  await page.setContent(
    `<!doctype html><html><body style="margin:0;background:${bg}">` +
      `<div id="s" style="position:relative;overflow:hidden;width:${width}px;height:${height}px;line-height:0">${inner}</div>` +
      `</body></html>`,
  );
  await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode())));
  return PNG.sync.read(await page.locator('#s').screenshot());
}

/** Anteil abweichender Pixel an der Gesamtfläche. */
async function diffRatio(ours: string, reference: string, width: number, height: number, bg: string) {
  const a = await shoot(ours, width, height, bg);
  const b = await shoot(reference, width, height, bg);
  return pixelmatch(a.data, b.data, undefined, width, height, { threshold: 0.1 }) / (width * height);
}

const img = (src: string, style = '') => `<img src="${src}" alt="" style="display:block;${style}">`;

const TONES = ['color', 'ink', 'cream'] as const;
const markFile = (key: LoonaProductKey, tone: LoonaTone, ext: 'svg' | '512.png') => {
  const suffix = tone === 'color' ? '' : `-${tone}`;
  return `family/${key}/${ext === 'svg' ? `mark${suffix}.svg` : `mark${suffix}-512.png`}`;
};

describe('Kernmarke size=400 vs. Brand-Assets (SVG)', () => {
  // [Datei, Komponente, Breite, Höhe] — Zeichen-Assets mit viewBox 6 9 32 28, Badge 64 × 64
  const cases: [string, ReactElement, number, number][] = [
    ['loona-zeichen.svg', <LoonaZeichen key="z" pad size={350} decorative />, 400, 350],
    ['loona-zeichen-glas.svg', <LoonaZeichen key="g" pad tone="glass" size={350} decorative />, 400, 350],
    ['loona-bewegt.svg', <LoonaZeichen key="b" pad variant="motion" size={350} decorative />, 400, 350],
    ['loona-badge.svg', <LoonaZeichen key="bd" variant="badge" size={400} decorative />, 400, 400],
    ['loona-badge.svg', <LoonaTile key="t" size={400} decorative />, 400, 400],
    ['loona-bewegt-badge.svg', <LoonaZeichen key="bb" variant="motionBadge" size={400} decorative />, 400, 400],
  ];
  for (const [file, el, w, h] of cases) {
    test(`${file} ↔ ${el.type === LoonaTile ? 'LoonaTile' : 'LoonaZeichen'}`, async () => {
      const ours = renderToStaticMarkup(el);
      const ref = img(dataUri(file, 'image/svg+xml', BRAND), `width:${w}px;height:${h}px`);
      expect(await diffRatio(ours, ref, w, h, LOONA_NEUTRALS.paper)).toBeLessThanOrEqual(TOLERANCE);
    });
  }
});
// PNG-Breite = aufgerundete Zeichenbreite (z. B. Buddy 24/40·512 = 307.2 → 308).
const widthAt = (key: LoonaProductKey, h: number) => Math.ceil((LOONA_PRODUCTS[key].width * h) / 40);

describe('LoonaMark size=400 vs. Asset-SVG', () => {
  for (const key of FAMILY) {
    for (const tone of TONES) {
      const file = markFile(key, tone, 'svg');
      test(`${key}/${tone} ↔ ${file}`, async () => {
        const w = widthAt(key, 400);
        const ours = renderToStaticMarkup(<LoonaMark product={key} tone={tone} size={400} decorative />);
        const ref = img(dataUri(file, 'image/svg+xml'), `width:${(LOONA_PRODUCTS[key].width * 400) / 40}px;height:400px`);
        expect(await diffRatio(ours, ref, w, 400, bgFor(tone))).toBeLessThanOrEqual(TOLERANCE);
      });
    }
  }
});

describe('LoonaMark size=512 vs. Asset-PNG (transparent, 512 px hoch)', () => {
  for (const key of FAMILY) {
    for (const tone of TONES) {
      const file = markFile(key, tone, '512.png');
      test(`${key}/${tone} ↔ ${file}`, async () => {
        const ours = renderToStaticMarkup(<LoonaMark product={key} tone={tone} size={512} decorative />);
        const ref = img(dataUri(file, 'image/png'));
        expect(await diffRatio(ours, ref, widthAt(key, 512), 512, bgFor(tone))).toBeLessThanOrEqual(TOLERANCE);
      });
    }
  }
});

describe('Produktkacheln (Badge-Format) vs. assets/family/<key>/favicon.svg', () => {
  for (const key of FAMILY) {
    test(`${key}/ink`, async () => {
      const ours = renderToStaticMarkup(<LoonaTile product={key} variant="ink" size={400} decorative />);
      const ref = img(dataUri(`family/${key}/favicon.svg`, 'image/svg+xml'), 'width:400px;height:400px');
      expect(await diffRatio(ours, ref, 400, 400, LOONA_NEUTRALS.paper)).toBeLessThanOrEqual(TOLERANCE);
    });
  }
});
