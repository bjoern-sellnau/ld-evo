'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { isDetailPath, useSite } from '../settings/SiteProvider';
import { useT } from '../i18n/LocaleProvider';
import { canonicalPath } from '../i18n/locale';

/**
 * Zurück-Pille auf Detailseiten (Prototyp: navBack / typeBack / typeBackOut / backGo):
 * Label tippt sich beim Betreten ein (55 ms/Zeichen) und beim Zurück rückwärts wieder aus (36 ms/Zeichen);
 * Ziel ist die tatsächliche Herkunftsseite (Fallback: die Liste des Items), der Karten-Morph läuft rückwärts.
 */
export function useBack() {
  const { from, navigate, settings } = useSite();
  const pathname = canonicalPath(usePathname());
  const FULL = useT()('nav.backPill');
  const show = isDetailPath(pathname);
  const [text, setText] = useState<string>(FULL);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const wasDetail = useRef(show);

  useEffect(() => {
    const entering = show && !wasDetail.current;
    wasDetail.current = show;
    if (!entering) return;
    clearInterval(timer.current);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Schreibmaschinen-Effekt startet beim Betreten einer Detailseite (Animation, kein abgeleiteter Zustand)
    if (!settings.anim) return setText(FULL);
    let i = 1;
    setText(FULL.slice(0, 1));
    timer.current = setInterval(() => {
      i++;
      setText(FULL.slice(0, i));
      if (i >= FULL.length) clearInterval(timer.current);
    }, 55);
  }, [show, settings.anim, FULL]);

  useEffect(() => () => clearInterval(timer.current), []);

  const fallback = pathname.startsWith('/labs/') ? '/labs' : pathname.startsWith('/tech/') ? '/tech' : '/projekte';
  const target = from ?? fallback;

  const go = useCallback(() => {
    clearInterval(timer.current);
    const done = () => navigate(target, { keepVt: true });
    if (!settings.anim) return done();
    let i = FULL.length;
    timer.current = setInterval(() => {
      i--;
      setText(FULL.slice(0, Math.max(i, 1)));
      if (i <= 1) {
        clearInterval(timer.current);
        done();
      }
    }, 36);
  }, [navigate, target, settings.anim, FULL]);

  // Cover-Farbe-Vollmodus: Zurück in Textfarbe statt Akzent.
  const color = settings.coverFull ? 'var(--ink)' : 'var(--accent)';
  return { show, text, go, color };
}
