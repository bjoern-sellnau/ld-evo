'use client';

import { useEffect } from 'react';
import { inkOn } from './color';

const VARS = ['--bg', '--ink', '--muted', '--soft', '--hair', '--card', '--border'] as const;

/**
 * Cover-Farbe-Vollmodus (Prototyp: applyCoverColor): Die ganze Seite übernimmt die Cover-Farbe als --bg,
 * alle Ableitungen werden als rgba von Weiß bzw. Warm-Schwarz gesetzt. Beim Verlassen wird aufgeräumt.
 */
export function useCoverColor(color: string, enabled: boolean) {
  useEffect(() => {
    const bs = document.body.style;
    if (!enabled) return;
    const ink = inkOn(color);
    const w = ink === '#FFFFFF';
    const A = (a: number) => (w ? `rgba(255,255,255,${a})` : `rgba(16,13,10,${a})`);
    bs.setProperty('--bg', color);
    bs.setProperty('--ink', ink);
    bs.setProperty('--muted', A(0.78));
    bs.setProperty('--soft', A(0.58));
    bs.setProperty('--hair', A(0.16));
    bs.setProperty('--card', A(0.08));
    bs.setProperty('--border', A(0.15));
    return () => VARS.forEach((v) => bs.removeProperty(v));
  }, [color, enabled]);
}
