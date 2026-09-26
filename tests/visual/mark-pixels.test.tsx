import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { chromium, type Browser, type Page } from '@playwright/test';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import {
  LOONA_NEUTRALS,
  LOONA_PRODUCT_KEYS,
  LOONA_PRODUCTS,
  LoonaMark,
  LoonaTile,
  type LoonaProductKey,
  type LoonaTone,
} from '@/components/brand';

/**
 * Pixel-Vergleich Komponente ↔ finale Handoff-Assets (Prompt §6: Toleranz 0.1 %), gerendert in Chromium via Playwright.
 * Läuft in Vitest statt im Playwright-Runner, weil dessen JSX-Transform (Component-Testing) React-Elemente umschreibt.
 */
const ASSETS = path.resolve(import.meta.dirname, '../../docs/design_handoff_loona_logo/assets');
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

const dataUri = (file: string, mime: string) =>
  `data:${mime};base64,${readFileSync(path.join(ASSETS, file)).toString('base64')}`;

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
  const name = ext === 'svg' ? `mark${suffix}.svg` : `mark${suffix}-512.png`;
  return key === 'ld' ? `ld-${name}` : `family/${key}/${name}`;
};
// PNG-Breite = aufgerundete Zeichenbreite (z. B. Buddy 24/40·512 = 307.2 → 308).
const widthAt = (key: LoonaProductKey, h: number) => Math.ceil((LOONA_PRODUCTS[key].width * h) / 40);

describe('LoonaMark size=400 vs. Asset-SVG', () => {
  for (const key of LOONA_PRODUCT_KEYS) {
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
  for (const key of LOONA_PRODUCT_KEYS) {
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

describe('LoonaTile vs. assets/family/family-tiles-*.svg — je Kachel', () => {
  // Streifen 278×46, Kacheln bei x = 0/58/116/174/232; 10-fach gerendert, pro Kachel ausgeschnitten.
  const S = 10;
  const T = 46 * S;
  for (const [variant, file] of [
    ['ink', 'family/family-tiles-dark.svg'],
    ['color', 'family/family-tiles-color.svg'],
  ] as const) {
    LOONA_PRODUCT_KEYS.forEach((key, i) => {
      test(`${key}/${variant}`, async () => {
        const ours = renderToStaticMarkup(<LoonaTile product={key} variant={variant} size={T} decorative />);
        const ref = img(dataUri(file, 'image/svg+xml'), `width:${278 * S}px;height:${T}px;margin-left:${-i * 58 * S}px`);
        expect(await diffRatio(ours, ref, T, T, LOONA_NEUTRALS.paper)).toBeLessThanOrEqual(TOLERANCE);
      });
    });
  }
});
