import { describe, expect, it } from 'vitest';
import { haloShadow, lumOf, mixHex, planFix2 } from '@/site/glass/contrastFix2';

// Dunkles Theme: Schrift --muted #AEBCD0 / --ink #F2F5FA auf Glas #101A2A zu 42 %
const dark = { muted: lumOf('#aebcd0')!, ink: lumOf('#f2f5fa')!, tint: lumOf('#101a2a')!, pct: 0.42, lightText: true };

describe('Auto Contrast Fix 2', () => {
  it('greift auf dunklem Grund nicht ein', () => {
    expect(planFix2([0.01, 0.02, 0.015], dark).stage).toBe(0);
  });
  it('hilft bei heller Schrift hinter dem Glas sanft — gedeckelt, kein Kippen', () => {
    const p = planFix2([0.01, 0.9, 0.85, 0.02], dark);
    expect(p.stage).toBeGreaterThan(0);
    // Glas bleibt durchscheinend: Tönung höchstens 84 %
    expect(0.42 + p.addPct / 100).toBeLessThanOrEqual(0.84);
  });
  it('nimmt die kleinste ausreichende Stufe und hält sie mit Hysterese', () => {
    const lums = [0.3, 0.35];
    const p = planFix2(lums, dark);
    expect(p.ratio).toBeGreaterThanOrEqual(4.5);
    if (p.stage > 0) expect(planFix2(lums, dark, 100, p.stage - 1).ratio).toBeGreaterThanOrEqual(4.5);
    // höhere Vorstufe bleibt, solange die kleinere nicht 5:1 schafft
    const held = planFix2(lums, dark, 100, 4);
    expect(held.stage).toBeGreaterThanOrEqual(p.stage);
  });
  it('Stärke skaliert die Eingriffe', () => {
    const lums = [0.9];
    expect(planFix2(lums, dark, 50).halo).toBeLessThan(planFix2(lums, dark, 150).halo);
  });
  it('Hilfsfunktionen', () => {
    expect(mixHex('#000000', '#ffffff', 0.5)).toBe('#808080');
    expect(lumOf('rgb(255, 255, 255)')).toBeCloseTo(1);
    expect(haloShadow(0, true)).toBe('');
    expect(haloShadow(0.5, true)).toMatch(/rgba\(2,6,14/);
  });
});
