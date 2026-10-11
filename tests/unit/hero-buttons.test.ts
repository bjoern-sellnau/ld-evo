import { describe, expect, it } from 'vitest';
import { heroInk } from '@/site/hero/heroInk';
import { DEFAULT_SETTINGS } from '@/site/settings/schema';

const withParts = (parts: Record<string, string>) => heroInk({ ...DEFAULT_SETTINGS, heroParts: parts });

describe('Hero-Buttons: Farbe + Deckkraft', () => {
  it('ohne Angaben wie im Prototyp (Liquid 10 %, Glas 14 %)', () => {
    expect(withParts({ btn1: '#3B82F6', btn1s: 'liquid' }).btn1.bg).toContain('rgba(59,130,246,0.1)');
    expect(withParts({ btn2: '#3B82F6', btn2s: 'glas' }).btn2.bg).toBe('rgba(59,130,246,0.14)');
  });
  it('Deckkraft tönt das Liquid in der gewählten Farbe', () => {
    const b = withParts({ btn1: '#3B82F6', btn1s: 'liquid', btn1a: '60' }).btn1;
    expect(b.bg).toContain('rgba(59,130,246,0.6)');
    expect(b.blur).toContain('blur(');
  });
  it('kräftige Tönung → Schrift wechselt auf lesbares Schwarz/Weiß', () => {
    expect(withParts({ btn1: '#3B82F6', btn1s: 'liquid', btn1a: '60' }).btn1.fg).toBe('#FFFFFF');
    expect(withParts({ btn1: '#FFE066', btn1s: 'liquid', btn1a: '60' }).btn1.fg).toBe('#141210');
    // zarte Tönung: farbige Schrift wie bisher
    expect(withParts({ btn1: '#FFE066', btn1s: 'liquid', btn1a: '10' }).btn1.fg).toBe('#FFE066');
  });
  it('Solid unter 100 % wird zu getöntem Glas', () => {
    const b = withParts({ btn1: '#FF7816', btn1s: 'solid', btn1a: '50' }).btn1;
    expect(b.bg).toContain('rgba(255,120,22,0.5)');
    expect(b.blur).not.toBe('none');
  });
});

describe('Hero-Buttons: Beschriftung', () => {
  it('eigene Schriftfarbe überschreibt die automatische', () => {
    expect(withParts({ btn1: '#3B82F6', btn1s: 'liquid', btn1a: '60', btn1l: '#FFE066' }).btn1.fg).toBe('#FFE066');
    expect(withParts({ btn2l: '#123456' }).btn2.fg).toBe('#123456');
  });
  it('Textschatten: aus bei 0, Stärke und Farbe einstellbar', () => {
    expect(withParts({}).btn1.textShadow).toBe('none');
    const ts = withParts({ btn1ts: '100', btn1tc: '#FF0000' }).btn1.textShadow;
    expect(ts).toContain('rgba(255,0,0,0.90)');
    expect(ts).toContain('18.0px');
    expect(withParts({ btn2ts: '50' }).btn2.textShadow).toContain('rgba(0,0,0,');
  });
});

describe('Job-Leiste/Jobtitel: Hintergrund + Textschatten', () => {
  it('ohne Angaben: Standard (kein eigener Hintergrund, kein Schatten)', () => {
    const i = withParts({});
    expect(i.barDeco).toEqual({ bg: undefined, textShadow: 'none' });
    expect(i.jobDeco.bg).toBeUndefined();
  });
  it('Hintergrundfarbe mit Deckkraft (Standard 60 %) und Textschatten', () => {
    const i = withParts({ jobbg: '#101A2A', jobts: '40', barbg: '#FF7816', barba: '25' });
    expect(i.jobDeco.bg).toBe('rgba(16,26,42,0.6)');
    expect(i.jobDeco.textShadow).not.toBe('none');
    expect(i.barDeco.bg).toBe('rgba(255,120,22,0.25)');
  });
});
