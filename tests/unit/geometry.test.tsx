import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LOONA_PRODUCT_KEYS, LoonaLetterD, LoonaLetterL, LoonaMark, LoonaTile } from '@/components/brand';
import { familyTileSegments, readAsset, shapes } from './helpers';

const withoutTitle = (svg: string) => svg.replace(/<title>[\s\S]*?<\/title>/, '');
const viewBox = (svg: string) => svg.match(/viewBox="([^"]+)"/)?.[1];

describe('LoonaMark — Geometrie 1:1 wie Handoff-Assets', () => {
  it('ld entspricht assets/ld-mark.svg (+ ink/cream)', () => {
    for (const [tone, file] of [
      ['color', 'ld-mark.svg'],
      ['ink', 'ld-mark-ink.svg'],
      ['cream', 'ld-mark-cream.svg'],
    ] as const) {
      const asset = readAsset(file);
      const ours = withoutTitle(renderToStaticMarkup(<LoonaMark product="ld" tone={tone} />));
      expect(viewBox(ours)).toBe(viewBox(asset));
      expect(shapes(ours)).toEqual(shapes(asset));
    }
  });

  it('ivy entspricht assets/family/ivy/mark*.svg', () => {
    for (const [tone, file] of [
      ['color', 'family/ivy/mark.svg'],
      ['ink', 'family/ivy/mark-ink.svg'],
      ['cream', 'family/ivy/mark-cream.svg'],
    ] as const) {
      const asset = readAsset(file);
      const ours = withoutTitle(renderToStaticMarkup(<LoonaMark product="ivy" tone={tone} />));
      expect(viewBox(ours)).toBe(viewBox(asset));
      expect(shapes(ours)).toEqual(shapes(asset));
    }
  });

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

  it('ivy-Kacheln entsprechen assets/family/ivy/tile-*.svg', () => {
    for (const [variant, file] of [
      ['ink', 'family/ivy/tile-ink.svg'],
      ['color', 'family/ivy/tile-color.svg'],
    ] as const) {
      const ours = withoutTitle(renderToStaticMarkup(<LoonaTile product="ivy" variant={variant} />));
      expect(shapes(ours)).toEqual(shapes(readAsset(file)));
    }
  });
});
