import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LOONA_PRODUCT_KEYS, LoonaLetterD, LoonaLetterL, LoonaMark, LoonaTile, type LoonaProductKey } from '@/components/brand';
import { familyTileSegments, readAsset, shapes } from './helpers';

const withoutTitle = (svg: string) => svg.replace(/<title>[\s\S]*?<\/title>/, '');
const viewBox = (svg: string) => svg.match(/viewBox="([^"]+)"/)?.[1];

const TONES = ['color', 'ink', 'cream'] as const;
/** Asset-Datei eines Zeichens je Produkt und Ton (README §6). */
const markFile = (key: LoonaProductKey, tone: (typeof TONES)[number]) => {
  const suffix = tone === 'color' ? '' : `-${tone}`;
  return key === 'ld' ? `ld-mark${suffix}.svg` : `family/${key}/mark${suffix}.svg`;
};

describe('LoonaMark — Geometrie 1:1 wie Handoff-Assets', () => {
  for (const key of LOONA_PRODUCT_KEYS) {
    for (const tone of TONES) {
      it(`${key}/${tone} entspricht assets/${markFile(key, tone)}`, () => {
        const asset = readAsset(markFile(key, tone));
        const ours = withoutTitle(renderToStaticMarkup(<LoonaMark product={key} tone={tone} />));
        expect(viewBox(ours)).toBe(viewBox(asset));
        expect(shapes(ours)).toEqual(shapes(asset));
      });
    }
  }

  it('Einzelbuchstaben entsprechen assets/l.svg und assets/d.svg (Geometrie)', () => {
    const strip = (s: Shape[]) => s.map(({ tag, attrs: { fill: _f, ...a } }) => ({ tag, attrs: a }));
    type Shape = ReturnType<typeof shapes>[number];
    expect(strip(shapes(renderToStaticMarkup(<LoonaLetterL />)))).toEqual(strip(shapes(readAsset('l.svg'))));
    expect(strip(shapes(renderToStaticMarkup(<LoonaLetterD />)))).toEqual(strip(shapes(readAsset('d.svg'))));
  });
});

describe('LoonaTile — alle fünf Produkte wie assets/family/family-tiles-*.svg', () => {
  for (const [variant, file] of [
    ['ink', 'family/family-tiles-dark.svg'],
    ['color', 'family/family-tiles-color.svg'],
  ] as const) {
    it(`${variant}-Kachel`, () => {
      const segments = familyTileSegments(readAsset(file));
      expect(segments).toHaveLength(LOONA_PRODUCT_KEYS.length);
      LOONA_PRODUCT_KEYS.forEach((key, i) => {
        const ours = withoutTitle(renderToStaticMarkup(<LoonaTile product={key} variant={variant} />));
        expect(shapes(ours), key).toEqual(shapes(segments[i]));
      });
    });
  }

  for (const key of LOONA_PRODUCT_KEYS) {
    it(`${key}-Kacheln entsprechen assets/family/${key}/tile-*.svg`, () => {
      for (const variant of ['ink', 'color'] as const) {
        const ours = withoutTitle(renderToStaticMarkup(<LoonaTile product={key} variant={variant} />));
        expect(shapes(ours), variant).toEqual(shapes(readAsset(`family/${key}/tile-${variant}.svg`)));
      }
    });
  }
});
