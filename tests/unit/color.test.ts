import { describe, expect, it } from 'vitest';
import { PROJECTS } from '@content/projects';
import { ARTICLES } from '@content/articles';
import { contrast, inkOn, over, readableAlpha } from '@/site/lib/color';

describe('Kontrast (WCAG 2.x)', () => {
  it('bekannte Referenzwerte', () => {
    expect(contrast('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrast('#767676', '#FFFFFF')).toBeCloseTo(4.54, 2); // klassisches „kleinstes Grau mit 4,5:1“
  });

  it('Schrift auf allen Cover-Farben der Startinhalte erreicht ≥ 4,5:1', () => {
    for (const c of [...PROJECTS.map((p) => p.color), ...ARTICLES.map((a) => a.color)]) {
      expect(contrast(inkOn(c), c), c).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('Nebentext-Deckkraft: Prototyp-Wert, wenn er reicht — sonst gerade so viel mehr wie nötig', () => {
    expect(readableAlpha('#0A1220', '#FFFFFF', 0.85)).toBe(0.85); // reicht auf dunklem Grund
    const a = readableAlpha('#C2410C', '#FFFFFF', 0.58);
    expect(a).toBeGreaterThan(0.58);
    expect(contrast(over('#C2410C', '#FFFFFF', a), '#C2410C')).toBeGreaterThanOrEqual(4.5);
    expect(contrast(over('#C2410C', '#FFFFFF', a - 0.02), '#C2410C')).toBeLessThan(4.5);
  });
});
