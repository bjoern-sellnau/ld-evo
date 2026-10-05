'use client';

import { useEffect } from 'react';
import type { Settings } from '../settings/schema';
import { applyThemeColor } from '../settings/applyBody';
import { inkOn, over, readableAlpha } from './color';

const VARS = ['--bg', '--ink', '--muted', '--soft', '--hair', '--card', '--border'] as const;

/**
 * Cover-Farbe-Vollmodus (Prototyp: applyCoverColor): Die ganze Seite übernimmt die Cover-Farbe als --bg,
 * alle Ableitungen werden als rgba von Weiß bzw. Warm-Schwarz gesetzt. Beim Verlassen wird aufgeräumt.
 * Browser-Farbe „Site“ folgt der Cover-Farbe.
 * Body-Klasse ldcover: Overlay-Panels ([data-ldown]) holen sich damit ihre Theme-Farben zurück (site.css).
 */
export function useCoverColor(color: string, enabled: boolean, themeColor: Settings['themeColor']) {
  useEffect(() => {
    const bs = document.body.style;
    if (!enabled) return;
    const ink = inkOn(color);
    const w = ink === '#FFFFFF';
    const A = (a: number) => (w ? `rgba(255,255,255,${a})` : `rgba(16,13,10,${a})`);
    document.body.classList.add('ldcover');
    bs.setProperty('--bg', color);
    bs.setProperty('--ink', ink);
    // Nebentexte: Prototyp-Deckkraft 0.78/0.58, bei Bedarf angehoben auf ≥ 4,5:1 (readableAlpha) — gerechnet gegen
    // den ungünstigeren Untergrund, die Karte (--card = Cover + 8 % Tönung), auf der z. B. Platzhalter stehen.
    const blend = w ? '#FFFFFF' : '#100d0a';
    const card = over(color, blend, 0.08);
    bs.setProperty('--muted', A(Math.max(readableAlpha(color, blend, 0.78), readableAlpha(card, blend, 0.78))));
    bs.setProperty('--soft', A(Math.max(readableAlpha(color, blend, 0.58), readableAlpha(card, blend, 0.58))));
    bs.setProperty('--hair', A(0.16));
    bs.setProperty('--card', A(0.08));
    bs.setProperty('--border', A(0.15));
    applyThemeColor(themeColor);
    return () => {
      VARS.forEach((v) => bs.removeProperty(v));
      document.body.classList.remove('ldcover');
      applyThemeColor(themeColor);
    };
  }, [color, enabled, themeColor]);
}
