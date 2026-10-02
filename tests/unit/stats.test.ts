import { describe, expect, it } from 'vitest';
import { niceMax } from '@/cms/ui/Stats';

describe('Statistik-Achse', () => {
  it('rundet auf glatte Werte mit glatter Hälfte', () => {
    expect(niceMax(3)).toBe(4);
    expect(niceMax(255)).toBe(300);
    expect(niceMax(1032)).toBe(1200);
    expect(niceMax(100)).toBe(100);
    for (const v of [7, 42, 255, 999, 5000]) expect(niceMax(v) / 2).toBe(Math.round(niceMax(v) / 2));
  });
});
