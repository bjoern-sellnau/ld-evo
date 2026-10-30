import { describe, expect, it } from 'vitest';
import { swarmEvery, swarmLoop, swarmOrder } from '@/site/hero/extra/meta';
import { EXTRA_MODES } from '@/site/hero/extra/meta';
import { MORE_KEYS } from '@/site/hero/extra/renderers2';
import { BUILD_KEYS } from '@/site/hero/extra/build';
import { HORIZON_SHADERS } from '@/site/hero/extra/horizons';
import { THEME_BOOT_SCRIPT } from '@/site/settings/applyBody';

describe('Zusätzliche Hero-Animationen', () => {
  it('jeder Modus der zweiten Welle hat Metadaten (Auswahl in den Einstellungen) und einen Renderer', () => {
    expect(MORE_KEYS.length).toBe(15);
    for (const k of MORE_KEYS) {
      expect(EXTRA_MODES[k], k).toBeDefined();
      expect(EXTRA_MODES[k].label.length, k).toBeGreaterThan(2);
      expect(EXTRA_MODES[k].renderer, k).toBe(['lens', 'inkwater'].includes(k) ? 'webgl' : 'canvas2d');
    }
  });
  it('Hintergrund und Helligkeit passen zusammen (dunkle Flächen für helle Hero-Schrift)', () => {
    for (const m of Object.values(EXTRA_MODES)) {
      expect(m.bg).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(m.lum).toBeLessThan(0.3);
    }
  });
  it('Live-Build: sechs Varianten (Code/Dev-Server/Agents × normal/Timeshift), das Boot-Script erkennt sie', () => {
    expect(BUILD_KEYS).toEqual(['buildcode', 'buildcodets', 'buildserver', 'buildserverts', 'buildagents', 'buildagentsts']);
    for (const k of BUILD_KEYS) expect(EXTRA_MODES[k]?.renderer, k).toBe('canvas2d');
    // gültiges JavaScript (Regex-Escapes im Template-String!)
    expect(() => new Function(THEME_BOOT_SCRIPT)).not.toThrow();
    expect(THEME_BOOT_SCRIPT).toContain('data-ldbuild');
  });
  it('Zwei Horizonte: Wechsel + je eine Szene, alle als WebGL-Modus wählbar', () => {
    expect(Object.keys(HORIZON_SHADERS)).toEqual(['horizons', 'aurum', 'viola']);
    for (const k of Object.keys(HORIZON_SHADERS)) {
      expect(EXTRA_MODES[k]?.renderer, k).toBe('webgl');
      expect(HORIZON_SHADERS[k]).toContain('void main()');
    }
  });
});

describe('LD-Partikel: Loop', () => {
  it('Reihenfolge aus cfg.order, unbekannte raus, fehlende hinten an', () => {
    expect(swarmOrder({ order: ['lockup', 'gibtsnicht', 'zeichen', 'lockup'] })).toEqual(['lockup', 'zeichen', 'badge', 'bewegt', 'wort']);
    expect(swarmOrder({})).toEqual(['zeichen', 'badge', 'bewegt', 'wort', 'lockup']);
  });
  it('abgeschaltete Logos fehlen, mindestens eins bleibt', () => {
    expect(swarmLoop({ order: ['wort', 'zeichen'], off: ['badge', 'bewegt'] })).toEqual(['wort', 'zeichen', 'lockup']);
    expect(swarmLoop({ off: ['zeichen', 'badge', 'bewegt', 'wort', 'lockup'] })).toEqual(['zeichen']);
  });
  it('Wechselzeit begrenzt auf 4–30 s, Standard 9 s', () => {
    expect(swarmEvery({})).toBe(9);
    expect(swarmEvery({ every: 2 })).toBe(4);
    expect(swarmEvery({ every: 99 })).toBe(30);
    expect(swarmEvery({ every: 12 })).toBe(12);
  });
});
