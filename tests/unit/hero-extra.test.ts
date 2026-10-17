import { describe, expect, it } from 'vitest';
import { EXTRA_MODES } from '@/site/hero/extra/meta';
import { MORE_KEYS } from '@/site/hero/extra/renderers2';

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
});
