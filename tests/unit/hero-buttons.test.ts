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
