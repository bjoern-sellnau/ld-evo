'use client';

import { useEffect } from 'react';
import type { Settings } from '../../settings/schema';
import { heroCfgOf, resolvePal } from '../palettes';
import { EXTRA_MODES } from './meta';

/**
 * Startet die zusätzlichen Hero-Animationen (meta.ts) im Canvas #ld-extra-canvas der Startseite. Die Renderer werden
 * erst bei Bedarf geladen (eigener Chunk). Neu gestartet wird bei Moduswechsel, neuer Palette, „Animationen“ und „30 fps“.
 */
export function useExtraHero(mode: string, s: Settings) {
  const meta = EXTRA_MODES[mode];
  const pal = resolvePal(heroCfgOf(s.heroCfg, mode)).join(',');
  const { anim, fpsHalf } = s;
  useEffect(() => {
    if (!meta) return;
    let stop = () => {};
    let gone = false;
    void import('./renderers').then(({ runExtra }) => {
      const cv = document.getElementById('ld-extra-canvas') as HTMLCanvasElement | null;
      if (gone || !cv) return;
      stop = runExtra(cv, mode, pal.split(','), { anim, fpsHalf, bg: meta.bg });
    });
    return () => {
      gone = true;
      stop();
    };
  }, [meta, mode, pal, anim, fpsHalf]);
}
