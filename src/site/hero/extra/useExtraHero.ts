'use client';

import { useEffect } from 'react';
import type { Settings } from '../../settings/schema';
import { heroCfgOf, resolvePal } from '../palettes';
import { EXTRA_MODES } from './meta';

/**
 * Startet die zusätzlichen Hero-Animationen (meta.ts) im Canvas #ld-extra-canvas der Startseite. Die Renderer werden
 * erst bei Bedarf geladen (eigener Chunk). Neu gestartet wird bei Moduswechsel, neuer Palette, geänderten
 * Modus-Einstellungen (z. B. Wetter-Vorschau), „Animationen“ und „30 fps“.
 */
export function useExtraHero(mode: string, s: Settings) {
  const meta = EXTRA_MODES[mode];
  const cfg = heroCfgOf(s.heroCfg, mode);
  const pal = resolvePal(cfg).join(',');
  // übrige Modus-Einstellungen (ohne Palette) als stabiler Schlüssel für den Neustart
  const { pal: _p, cust: _c, ...rest } = cfg;
  const extra = JSON.stringify(rest);
  const { anim, fpsHalf } = s;
  useEffect(() => {
    if (!meta) return;
    let stop = () => {};
    let gone = false;
    void import('./renderers').then(({ runExtra }) => {
      const cv = document.getElementById('ld-extra-canvas') as HTMLCanvasElement | null;
      if (gone || !cv) return;
      stop = runExtra(cv, mode, pal.split(','), { anim, fpsHalf, bg: meta.bg, cfg: JSON.parse(extra) });
    });
    return () => {
      gone = true;
      stop();
    };
  }, [meta, mode, pal, extra, anim, fpsHalf]);
}
