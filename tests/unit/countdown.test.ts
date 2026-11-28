import { describe, expect, it } from 'vitest';
import {
  COUNTDOWN_MODES,
  DIGIT,
  SEGMENTS,
  SEGMENT_POINTS,
  berlinInstant,
  clockLayout,
  clockWidth,
  countdownCfg,
  countdownParts,
  isCountdownMode,
} from '@/site/hero/countdown';
import { COUNTDOWN_2D } from '@/site/hero/extra/countdown';
import { EXTRA_MODES } from '@/site/hero/extra/meta';
import { UI } from '@/site/i18n/dict';

describe('Countdown-Hero', () => {
  it('beide Fassungen sind als Hero-Modus wählbar und haben einen Grund-Renderer', () => {
    expect(Object.keys(COUNTDOWN_MODES)).toEqual(['countdownbeyond', 'countdownjahre']);
    for (const k of Object.keys(COUNTDOWN_MODES)) {
      expect(isCountdownMode(k), k).toBe(true);
      expect(EXTRA_MODES[k]?.renderer, k).toBe('canvas2d');
      expect(EXTRA_MODES[k]?.bg, k).toBe('#000000');
      expect(typeof COUNTDOWN_2D[k], k).toBe('function');
    }
    expect(isCountdownMode('weather')).toBe(false);
    expect(isCountdownMode('toString')).toBe(false);
  });

  it('Zieldatum gilt in deutscher Zeit (Sommer- und Winterzeit)', () => {
    // Zieltage der Teaser: 06.09.2027 und 03.09.2027, 0 Uhr in Berlin = 22 Uhr UTC am Vortag (Sommerzeit)
    expect(berlinInstant('2027-09-06T00:00')).toBe(Date.UTC(2027, 8, 5, 22, 0));
    expect(berlinInstant('2027-09-03T00:00')).toBe(Date.UTC(2027, 8, 2, 22, 0));
    // Winterzeit: eine Stunde Abstand
    expect(berlinInstant('2027-01-01T00:00')).toBe(Date.UTC(2026, 11, 31, 23, 0));
    expect(berlinInstant('2027-12-24T18:30')).toBe(Date.UTC(2027, 11, 24, 17, 30));
    // nur Datum = 0 Uhr
    expect(berlinInstant('2027-09-06')).toBe(Date.UTC(2027, 8, 5, 22, 0));
  });

  it('ungültige Angaben werden abgelehnt', () => {
    for (const bad of ['', 'morgen', '2027-13-01T00:00', '2027-02-31T00:00', '2027-09-06T24:00', '06.09.2027'])
      expect(berlinInstant(bad), bad).toBeNull();
  });

  it('Vorgaben je Fassung: Zieltag und Farbe wie in den Teasern, ohne Ton, Uhr allein', () => {
    expect(countdownCfg('countdownbeyond', {})).toEqual({
      local: '2027-09-06T00:00',
      target: Date.UTC(2027, 8, 5, 22, 0),
      color: '#19A7FF',
      tick: false,
      solo: true,
    });
    const j = countdownCfg('countdownjahre', {});
    expect(j.target).toBe(Date.UTC(2027, 8, 2, 22, 0));
    expect(j.color).toBe('#FF7816');
  });

  it('Datum, Farbe, Ticken und Darstellung sind frei wählbar; Unsinn fällt auf die Vorgabe zurück', () => {
    const c = countdownCfg('countdownbeyond', { date: '2028-01-01T12:00', color: '#3ddc84', tick: true, solo: false });
    expect(c).toEqual({ local: '2028-01-01T12:00', target: Date.UTC(2028, 0, 1, 11, 0), color: '#3ddc84', tick: true, solo: false });
    const bad = countdownCfg('countdownjahre', { date: 'bald', color: 'rot', tick: 'ja', solo: 0 });
    expect(bad.local).toBe('2027-09-03T00:00');
    expect(bad.color).toBe('#FF7816');
    expect(bad.tick).toBe(false);
    expect(bad.solo).toBe(true);
  });

  it('Restzeit in Tagen, Stunden, Minuten, Sekunden — abgelaufen bleibt bei null', () => {
    const DAY = 86400000;
    expect(countdownParts(281 * DAY + 22 * 3600000 + 59 * 60000 + 59 * 1000 + 999)).toEqual(['281', '22', '59', '59']);
    expect(countdownParts(5 * DAY + 61000)).toEqual(['005', '00', '01', '01']);
    expect(countdownParts(1234 * DAY)).toEqual(['1234', '00', '00', '00']);
    expect(countdownParts(999)).toEqual(['000', '00', '00', '00']);
    expect(countdownParts(-5000)).toEqual(['000', '00', '00', '00']);
  });

  it('Sieben-Segment-Ziffern: zehn Ziffern, sieben Segmente mit je sechs Ecken im Ziffernfeld', () => {
    expect(Object.keys(SEGMENTS)).toHaveLength(10);
    expect(Object.keys(SEGMENT_POINTS).sort().join('')).toBe('abcdefg');
    expect(SEGMENTS[8]).toBe('abcdefg');
    for (const [k, pts] of Object.entries(SEGMENT_POINTS)) {
      const xy = pts.split(' ').map((p) => p.split(',').map(Number));
      expect(xy, k).toHaveLength(6);
      for (const [x, y] of xy) {
        expect(x, k).toBeGreaterThanOrEqual(0);
        expect(x, k).toBeLessThanOrEqual(DIGIT.w);
        expect(y, k).toBeGreaterThanOrEqual(0);
        expect(y, k).toBeLessThanOrEqual(DIGIT.h);
      }
    }
    // Breite der Anzeige wie im Trailer: 9 Ziffern, 5 Zwischenräume, 3 Doppelpunkte
    expect(clockWidth(['281', '22', '59', '59'])).toBe(9 * 112 + 5 * 22 + 3 * 80);
    const lay = clockLayout(['281', '22', '59', '59']);
    expect(lay[0]).toEqual({ x0: 0, w: 3 * 112 + 2 * 22 });
    expect(lay[3].x0 + lay[3].w).toBe(clockWidth(['281', '22', '59', '59']));
  });

  it('Texte der Uhr gibt es in beiden Sprachen', () => {
    for (const k of ['cd.beyond.title', 'cd.beyond.sub', 'cd.jahre.title', 'cd.jahre.sub', 'cd.days', 'cd.seconds', 'cd.timer'] as const) {
      expect(UI.de[k].length, k).toBeGreaterThan(2);
      expect(UI.en[k].length, k).toBeGreaterThan(2);
    }
    expect(UI.de['cd.timer']).toContain('{d}');
    expect(UI.en['cd.timer']).toContain('{d}');
  });
});
