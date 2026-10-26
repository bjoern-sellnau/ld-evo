import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  LOONA_BADGE,
  LOONA_PRODUCT_KEYS,
  LoonaLetterD,
  LoonaLetterL,
  LoonaMark,
  LoonaTile,
  LoonaZeichen,
  type LoonaProductKey,
} from '@/components/brand';
import { readAsset, readBrandAsset, shapes } from './helpers';

const withoutTitle = (svg: string) => svg.replace(/<title>[\s\S]*?<\/title>/, '');
const viewBox = (svg: string) => svg.match(/viewBox="([^"]+)"/)?.[1];
const FAMILY = LOONA_PRODUCT_KEYS.filter((k): k is Exclude<LoonaProductKey, 'ld'> => k !== 'ld');

const TONES = ['color', 'ink', 'cream'] as const;
/** Asset-Datei eines Produktzeichens je Ton (Logo-Handoff README §6). */
const markFile = (key: LoonaProductKey, tone: (typeof TONES)[number]) => `family/${key}/mark${tone === 'color' ? '' : `-${tone}`}.svg`;

describe('Kernmarke — Geometrie 1:1 wie docs/design_handoff_loona_brand/assets', () => {
  const cases: [string, string][] = [
    ['loona-zeichen.svg', renderToStaticMarkup(<LoonaZeichen pad />)],
    ['favicon.svg', renderToStaticMarkup(<LoonaZeichen pad />)],
    ['loona-badge.svg', renderToStaticMarkup(<LoonaZeichen variant="badge" />)],
    ['loona-bewegt.svg', renderToStaticMarkup(<LoonaZeichen variant="motion" pad />)],
    ['loona-bewegt-badge.svg', renderToStaticMarkup(<LoonaZeichen variant="motionBadge" />)],
    ['loona-zeichen-glas.svg', renderToStaticMarkup(<LoonaZeichen tone="glass" pad />)],
  ];
  it.each(cases)('%s', (file, ours) => {
    const asset = readBrandAsset(file);
    expect(viewBox(ours)).toBe(viewBox(asset));
    expect(shapes(withoutTitle(ours))).toEqual(shapes(asset));
  });

  it('LoonaMark ld = Zeichen (knapp: viewBox 8 11 28 24, Breite = Höhe · 28/24)', () => {
    const html = renderToStaticMarkup(<LoonaMark size={48} />);
    expect(viewBox(html)).toBe('8 11 28 24');
    expect(html).toContain('width="56"');
    expect(shapes(withoutTitle(html))).toEqual(shapes(readBrandAsset('loona-zeichen.svg')));
  });

  it('LoonaTile ld/ink = Badge', () => {
    const ours = withoutTitle(renderToStaticMarkup(<LoonaTile />));
    expect(viewBox(ours)).toBe('0 0 64 64');
    expect(shapes(ours)).toEqual(shapes(readBrandAsset('loona-badge.svg')));
  });

  it('Einzelbuchstaben = L und D des Badges', () => {
    expect(renderToStaticMarkup(<LoonaLetterL />)).toContain(`d="${LOONA_BADGE.l}"`);
    expect(renderToStaticMarkup(<LoonaLetterD />)).toContain(`d="${LOONA_BADGE.d}"`);
  });
});

describe('Produktzeichen — Geometrie 1:1 wie Logo-Handoff-Assets', () => {
  for (const key of FAMILY) {
    for (const tone of TONES) {
      it(`${key}/${tone} entspricht assets/${markFile(key, tone)}`, () => {
        const asset = readAsset(markFile(key, tone));
        const ours = withoutTitle(renderToStaticMarkup(<LoonaMark product={key} tone={tone} />));
        expect(viewBox(ours)).toBe(viewBox(asset));
        expect(shapes(ours)).toEqual(shapes(asset));
      });
    }
  }
});

describe('Produktkacheln im Badge-Format (Wunsch „Kachelform angleichen“)', () => {
  // Maß und Lage wie die Produkt-Favicons des Logo-Handoffs (assets/family/<key>/favicon.svg: 64er-Quadrat, rx 14).
  for (const key of FAMILY) {
    it(`${key}/ink entspricht assets/family/${key}/favicon.svg`, () => {
      const ours = withoutTitle(renderToStaticMarkup(<LoonaTile product={key} variant="ink" />));
      expect(viewBox(ours)).toBe('0 0 64 64');
      expect(shapes(ours)).toEqual(shapes(readAsset(`family/${key}/favicon.svg`)));
    });
    it(`${key}/color: gleiche Geometrie, Grund Produktfarbe, Zeichen Ink`, () => {
      const ink = shapes(withoutTitle(renderToStaticMarkup(<LoonaTile product={key} variant="ink" />)));
      const color = shapes(withoutTitle(renderToStaticMarkup(<LoonaTile product={key} variant="color" />)));
      const geo = (s: typeof ink) => s.map(({ tag, attrs: { fill: _f, stroke: _s, ...a } }) => ({ tag, attrs: a }));
      expect(geo(color)).toEqual(geo(ink));
      expect(color[0].attrs.fill).not.toBe('#171310');
      expect(color.slice(1).every((s) => [undefined, 'NONE', '#171310'].includes(s.attrs.fill))).toBe(true);
    });
  }
});
