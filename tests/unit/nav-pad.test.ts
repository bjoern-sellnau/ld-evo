import { describe, expect, it } from 'vitest';
import { NAV_PAD_DEFAULT, NAV_PAD_MAX, navPadFor } from '@/site/nav/pages';

describe('Menü-Abstand je Seite (ld-navpad)', () => {
  it('ohne Eintrag gilt der Standard', () => {
    expect(navPadFor({}, '/projekte')).toBe(NAV_PAD_DEFAULT);
    expect(navPadFor(undefined, '/')).toBe(NAV_PAD_DEFAULT);
  });
  it('Wert der Hauptseite, Detailseiten erben ihn', () => {
    const pad = { projekte: 12, hallo: 3 };
    expect(navPadFor(pad, '/projekte')).toBe(12);
    expect(navPadFor(pad, '/projekte/irgendwas')).toBe(12);
    expect(navPadFor(pad, '/')).toBe(3);
    expect(navPadFor(pad, '/labs')).toBe(NAV_PAD_DEFAULT);
  });
  it('unbekannte Seiten und ungültige Werte → Standard bzw. begrenzt', () => {
    expect(navPadFor({ projekte: 12 }, '/gibts-nicht')).toBe(NAV_PAD_DEFAULT);
    expect(navPadFor({ labs: Number.NaN }, '/labs')).toBe(NAV_PAD_DEFAULT);
    expect(navPadFor({ labs: '9' as unknown as number }, '/labs')).toBe(NAV_PAD_DEFAULT);
    expect(navPadFor({ labs: 999 }, '/labs')).toBe(NAV_PAD_MAX);
    expect(navPadFor({ labs: -4 }, '/labs')).toBe(0);
  });
});
