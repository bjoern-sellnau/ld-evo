'use client';

import { useEffect } from 'react';

/** localStorage-Schlüssel: in diesem Browser nicht zählen (z. B. eigene Aufrufe; setzbar in LD Flow → Statistik). */
export const NO_STATS_KEY = 'ld-nostats';

let firstView = true;

/**
 * Cookiefreier Seitenaufruf-Zähler (src/cms/stats.ts): schickt nur Pfad und — beim ersten Aufruf — die Herkunfts-URL.
 * Zählt nicht bei Do-Not-Track/Global Privacy Control, in der LD-Flow-Vorschau, im statischen Export und wenn der
 * Browser ausgenommen ist.
 */
export function useHitCounter(pathname: string) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_STATIC_EXPORT === '1' || pathname.startsWith('/flow')) return;
    const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
    if (nav.doNotTrack === '1' || nav.globalPrivacyControl) return;
    try {
      if (localStorage.getItem(NO_STATS_KEY) === '1') return;
    } catch {
      // kein Zugriff auf localStorage → trotzdem zählen (enthält ohnehin nichts Persönliches)
    }
    const ref = firstView ? document.referrer : '';
    firstView = false;
    const body = JSON.stringify({ path: pathname, ref });
    const url = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/api/hit`;
    if (!nav.sendBeacon?.(url, body)) void fetch(url, { method: 'POST', body, keepalive: true }).catch(() => {});
  }, [pathname]);
}
