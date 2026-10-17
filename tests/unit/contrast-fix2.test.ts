import { describe, expect, it } from 'vitest';
import { glyphWeight, haloShadow, lumOf, mixHex, parseSrgb, planFix2 } from '@/site/glass/contrastFix2';

// Dunkles Theme: Schrift --muted #AEBCD0 / --ink #F2F5FA auf Glas #101A2A zu 42 %
const dark = { muted: lumOf('#aebcd0')!, ink: lumOf('#f2f5fa')!, tint: lumOf('#101a2a')!, pct: 0.42, lightText: true };
const night = 0.006;
/** Weiße Schrift hinter dem Glas auf dunklem Grund (Story-Überschrift unter dem Menü). */
const whiteText = [0.9, null, 0.9, null, 0.9].map((fg) => ({ bg: night, fg }));

describe('Auto Contrast Fix 2', () => {
  it('greift ohne Schrift dahinter nicht ein', () => {
    expect(planFix2([{ bg: night, fg: null }], dark).stage).toBe(0);
  });
  it('hilft bei heller Schrift hinter dem Glas — gedeckelt, kein Kippen', () => {
    const p = planFix2(whiteText, dark, 100, 0, 30);
    expect(p.stage).toBeGreaterThan(0);
    expect(0.42 + p.addPct / 100).toBeLessThanOrEqual(0.84);
  });
  it('macht klares Glas bei scharfer Schrift dahinter leicht milchig (≤ 14 px)', () => {
    const p = planFix2(whiteText, dark, 100, 0, 0);
    expect(p.frost).toBeGreaterThan(0);
    expect(p.frost).toBeLessThanOrEqual(14);
    // mit vorhandenem starkem Blur kein zusätzliches Milchglas
    expect(planFix2(whiteText, dark, 100, 0, 30).frost).toBe(0);
  });
  it('nimmt die kleinste ausreichende Stufe und hält sie mit Hysterese', () => {
    const pts = [{ bg: 0.3, fg: null }];
    const p = planFix2(pts, dark);
    expect(p.ratio).toBeGreaterThanOrEqual(4.5);
    expect(planFix2(pts, dark, 100, 5).stage).toBeGreaterThanOrEqual(p.stage);
  });
  it('Stärke skaliert die Eingriffe', () => {
    expect(planFix2(whiteText, dark, 50).halo).toBeLessThan(planFix2(whiteText, dark, 150).halo);
  });
  it('Hilfsfunktionen', () => {
    expect(parseSrgb('color(srgb 1 0.5 0 / 0.4)')).toEqual({ r: 255, g: 127.5, b: 0, a: 0.4 });
    expect(parseSrgb('rgb(1, 2, 3)')).toBeNull();
    expect(glyphWeight(0)).toBe(1);
    expect(glyphWeight(30)).toBeCloseTo(0.35);
    expect(mixHex('#000000', '#ffffff', 0.5)).toBe('#808080');
    expect(lumOf('rgb(255, 255, 255)')).toBeCloseTo(1);
    expect(haloShadow(0, true)).toBe('');
    expect(haloShadow(0.5, true)).toMatch(/rgba\(2,6,14/);
  });
});
