import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, SETTINGS_CODECS, readSettings, writeSetting, type Settings } from '@/site/settings/schema';

const memory = (init: Record<string, string> = {}) => {
  const m = new Map(Object.entries(init));
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
    dump: () => Object.fromEntries(m),
  };
};

describe('Settings ↔ localStorage (Keys/Kodierung wie im Prototyp)', () => {
  it('leerer Storage → SSR-Defaults (dark, Animationen an)', () => {
    expect(readSettings(memory())).toEqual(DEFAULT_SETTINGS);
  });

  it('Schlüssel sind eindeutig und tragen das ld-Präfix', () => {
    const keys = Object.values(SETTINGS_CODECS).map((c) => c.key);
    expect(new Set(keys).size).toBe(keys.length);
    keys.forEach((k) => expect(k).toMatch(/^ld-/));
  });

  it('Kodierung entspricht dem Prototyp', () => {
    const s = memory();
    writeSetting(s, 'theme', 'light');
    writeSetting(s, 'anim', false);
    writeSetting(s, 'shadowOn', false);
    writeSetting(s, 'hc', true);
    writeSetting(s, 'glassLvl', 5);
    writeSetting(s, 'heroCfg', { lava: { pal: 'ocean' } });
    expect(s.dump()).toEqual({
      'ld-theme': 'light',
      'ld-anim': 'off',
      'ld-shadow': 'off',
      'ld-hc': 'on',
      'ld-glasslvl': '5',
      'ld-herocfg': '{"lava":{"pal":"ocean"}}',
    });
  });

  it('Roundtrip aller Einstellungen', () => {
    const changed: Settings = {
      ...DEFAULT_SETTINGS,
      theme: 'light',
      anim: false,
      flat: true,
      blurOn: false,
      styleMode: 'fluent',
      glassLvl: 1,
      accentSel: '#3B82F6',
      heroAnim: 'matrix2',
      viewMode: 'wide',
      frame: 'notch',
      frameCfg: { notchW: 200 },
      splashOn: false,
      pageVt: 'iris',
      mxT1: 'Hallo',
      mxSize: 150,
    };
    const s = memory();
    for (const k of Object.keys(changed) as (keyof Settings)[]) writeSetting(s, k, changed[k] as never);
    expect(readSettings(s)).toEqual(changed);
  });

  it('Alt-Stände: heroAnim mesh/portal → ribbon/flow (Nachtrag v6)', () => {
    expect(readSettings(memory({ 'ld-heroanim': 'mesh' })).heroAnim).toBe('ribbon');
    expect(readSettings(memory({ 'ld-heroanim': 'portal' })).heroAnim).toBe('flow');
  });
});
