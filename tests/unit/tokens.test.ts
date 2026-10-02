import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { LOONA_NEUTRALS, LOONA_PRODUCTS } from '@/components/brand';
import { brandTextPairs } from '@/lib/brand-contrast';
import { HANDOFF } from './helpers';

const css = readFileSync(path.resolve(import.meta.dirname, '../../src/styles/tokens.css'), 'utf8');
const token = (name: string) => css.match(new RegExp(`--loona-${name}:\\s*(#[0-9A-Fa-f]{6})`))?.[1]?.toUpperCase();
const manifest = JSON.parse(readFileSync(path.join(HANDOFF, 'assets/manifest.json'), 'utf8'));

describe('Tokens', () => {
  it('Farben aus manifest.json stimmen mit tokens.css überein', () => {
    for (const [name, value] of Object.entries(manifest.colors as Record<string, string>)) {
      const cssName = name === 'muted' ? 'muted-dark' : name;
      expect(token(cssName), name).toBe(value.toUpperCase());
    }
  });

  it('Produktfarben in products.ts = manifest.json', () => {
    for (const p of manifest.products as { key: keyof typeof LOONA_PRODUCTS; name: string; color: string }[]) {
      expect(LOONA_PRODUCTS[p.key].color).toBe(p.color);
      expect(LOONA_PRODUCTS[p.key].name).toBe(p.name);
    }
  });

  it('Neutrale in products.ts = tokens.css', () => {
    expect(token('ink')).toBe(LOONA_NEUTRALS.ink);
    expect(token('cream')).toBe(LOONA_NEUTRALS.cream);
    expect(token('paper')).toBe(LOONA_NEUTRALS.paper);
    expect(token('muted-dark')).toBe(LOONA_NEUTRALS.mutedDark);
    expect(token('muted-light')).toBe(LOONA_NEUTRALS.mutedLight);
    expect(token('sand')).toBe(LOONA_NEUTRALS.sand);
  });
});

describe('Kontrast', () => {
  it.each(brandTextPairs().map((p) => [p.label, p] as const))('%s ≥ 4.5:1', (_label, pair) => {
    expect(pair.ratio).toBeGreaterThanOrEqual(4.5);
  });
});
