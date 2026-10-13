import { describe, expect, it } from 'vitest';
import { NAV_PAD_DEFAULT, NAV_PAD_MAX, navPadCss, navPadFor } from '@/site/nav/pages';

describe('Menü-Abstand je Seite (ld-navpad)', () => {
  it('ohne Eintrag gilt der Standard (Prototyp: 7px 8px)', () => {
    expect(navPadFor({}, '/projekte')).toEqual(NAV_PAD_DEFAULT);
    expect(navPadFor(undefined, '/')).toEqual({ t: 7, r: 8, b: 7, l: 8 });
    expect(navPadCss(NAV_PAD_DEFAULT, false)).toBe('7px 8px 7px 8px');
    expect(navPadCss(NAV_PAD_DEFAULT, true)).toBe('14px 12px 14px 12px');
  });
  it('oben/rechts/unten/links getrennt, Detailseiten erben', () => {
    const pad = { projekte: { t: 2, r: 20, b: 12, l: 0 } };
    expect(navPadFor(pad, '/projekte')).toEqual({ t: 2, r: 20, b: 12, l: 0 });
    expect(navPadFor(pad, '/projekte/irgendwas')).toEqual({ t: 2, r: 20, b: 12, l: 0 });
    expect(navPadFor(pad, '/labs')).toEqual(NAV_PAD_DEFAULT);
  });
  it('fehlende Seiten der Leiste → Standard', () => {
    expect(navPadFor({ labs: { t: 15 } }, '/labs')).toEqual({ t: 15, r: 8, b: 7, l: 8 });
  });
  it('älteres Format (eine Zahl) bleibt gültig', () => {
    expect(navPadFor({ hallo: 3 }, '/')).toEqual({ t: 3, r: 4, b: 3, l: 4 });
  });
  it('ungültige Werte → Standard bzw. begrenzt', () => {
    expect(navPadFor({ projekte: { t: 12 } }, '/gibts-nicht')).toEqual(NAV_PAD_DEFAULT);
    expect(navPadFor({ labs: { t: Number.NaN, r: '9' as unknown as number } }, '/labs')).toEqual(NAV_PAD_DEFAULT);
    expect(navPadFor({ labs: { t: 999, b: -4 } }, '/labs')).toEqual({ t: NAV_PAD_MAX, r: 8, b: 0, l: 8 });
    expect(navPadFor({ labs: 'x' as unknown as number }, '/labs')).toEqual(NAV_PAD_DEFAULT);
  });
});
