import { describe, expect, it } from 'vitest';
import { pickCtaColor, pickLogoFill, pickTileTone } from '@/site/glass/logoContrast';
import { relLum } from '@/site/glass/navContrast';

const lum = (hex: string) =>
  relLum({ r: parseInt(hex.slice(1, 3), 16), g: parseInt(hex.slice(3, 5), 16), b: parseInt(hex.slice(5, 7), 16), a: 1 });

describe('Logo-Farbe „Auto“', () => {
  it('Negativ-Logo: Orange auf dunklem Grund, Ink auf hellem und auf Orange', () => {
    expect(pickLogoFill([lum('#0B0F17')])).toBe('orange');
    expect(pickLogoFill([lum('#FAF7F2')])).toBe('ink');
    expect(pickLogoFill([lum('#FF7816')])).toBe('ink');
  });
  it('Negativ-Logo: der schlechteste Messpunkt zählt', () => {
    expect(pickLogoFill([lum('#0B0F17'), lum('#FAF7F2')])).not.toBe('orange');
  });
  it('Negativ-Logo: Hysterese — Orange bleibt knapp unter 4.5:1, kommt erst ab 5:1 zurück', () => {
    // Grau mit ca. 4.2:1 zu Orange
    const g = (lum('#FF7816') + 0.05) / 4.2 - 0.05;
    expect(pickLogoFill([g])).not.toBe('orange');
    expect(pickLogoFill([g], 'orange')).toBe('orange');
  });
  it('Kachel: gewünschte Variante, solange sie ≥ 3:1 hat, sonst die andere', () => {
    expect(pickTileTone([lum('#0B0F17')], 'color')).toBe('color');
    expect(pickTileTone([lum('#0B0F17')], 'ink')).toBe('color');
    expect(pickTileTone([lum('#FF7816')], 'color')).toBe('ink');
    expect(pickTileTone([lum('#FAF7F2')], 'ink')).toBe('ink');
  });
  it('ohne Messwerte: bisherige bzw. gewünschte Wahl', () => {
    expect(pickLogoFill([])).toBe('orange');
    expect(pickTileTone([], 'ink')).toBe('ink');
  });
  it('Kontakt-Button: Akzent, solange er sich abhebt — auf Orange-Cover neutral', () => {
    const acc = lum('#FFB224');
    expect(pickCtaColor([lum('#0B0F17')], acc)).toBe('accent');
    // dunkle Glas-Tönung über Orange: Akzent hebt sich kaum ab → Cream
    const brown = 0.7 * lum('#070B14') + 0.3 * lum('#FF7816');
    expect(pickCtaColor([brown], acc)).toBe('cream');
    expect(pickCtaColor([lum('#FAF7F2')], lum('#C2410C'))).toBe('accent');
    expect(pickCtaColor([], acc)).toBe('accent');
  });
});
