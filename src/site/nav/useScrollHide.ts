'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Leisten beim Scrollen ausblenden bzw. einklappen (Einstellungen „Leiste beim Scrollen ausblenden“ / „Menü beim
 * Scrollen einklappen“; ausgebaut aus dem Scrollhide des Prototyps: runter > 150 px aus, hoch > 28 px an).
 * Wie in aktuellen Apps (iOS-Safari, Instagram …):
 *  - Runterscrollen (> 60 px am Stück, jenseits der ersten 120 px) blendet aus.
 *  - Zurück kommt die Leiste nur bei zügigem Hochscrollen (≥ 0,5 px/ms über ≥ 24 px) oder nach längerem
 *    Hochscrollen (> 220 px) — so kann man kurz zurückscrollen, um etwas nachzulesen, ohne dass die Leiste stört.
 *  - Am Seitenanfang (< 70 px) ist sie sichtbar, außer `hiddenAtTop` (Startseite: die Bühne gehört dem Hero).
 * `resetKey` (z. B. der Pfad) setzt den Zustand bei Seitenwechsel zurück.
 */
export function useScrollHide(enabled: boolean, opts: { hiddenAtTop?: boolean; resetKey?: string } = {}) {
  const { hiddenAtTop = false, resetKey } = opts;
  const [hidden, setHidden] = useState(false);
  const acc = useRef({ last: 0, t: 0, down: 0, up: 0 });

  useEffect(() => {
    if (!enabled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Abschalten soll die Leiste sofort wieder zeigen
      setHidden(false);
      return;
    }
    const a = acc.current;
    a.last = window.scrollY;
    a.t = performance.now();
    a.down = 0;
    a.up = 0;
    setHidden(window.scrollY < 70 ? hiddenAtTop : false);
    const onScroll = () => {
      const y = window.scrollY;
      const now = performance.now();
      const dy = y - a.last;
      const dt = Math.max(1, now - a.t);
      a.last = y;
      a.t = now;
      if (y < 70) {
        a.down = a.up = 0;
        // Startseite: oben bleibt die Leiste, wie sie ist (anfangs aus; nach zügigem Hochscrollen an).
        if (!hiddenAtTop) setHidden(false);
        return;
      }
      if (dy > 0) {
        a.down += dy;
        a.up = 0;
        if (a.down > 60 && y > 120) setHidden(true);
      } else if (dy < 0) {
        a.up -= dy;
        a.down = 0;
        const fast = -dy / dt >= 0.5;
        if ((fast && a.up >= 24) || a.up > 220) setHidden(false);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [enabled, hiddenAtTop, resetKey]);

  return [hidden, setHidden] as const;
}
