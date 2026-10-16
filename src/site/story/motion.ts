'use client';

import { useEffect, useLayoutEffect, useState, useSyncExternalStore, type RefObject } from 'react';
import { useSite } from '../settings/SiteProvider';

/**
 * Bewegungs-Grundlagen der Story-Seiten (neu, nicht im Prototyp). Alles hängt an `useMotionOk()`:
 * „Animationen aus“ (Einstellungen) oder `prefers-reduced-motion` → keine Scroll-Effekte, Inhalte stehen sofort da.
 */

const RM = '(prefers-reduced-motion: reduce)';
const subscribeRm = (cb: () => void) => {
  const m = window.matchMedia?.(RM);
  m?.addEventListener('change', cb);
  return () => m?.removeEventListener('change', cb);
};

/** true, wenn Bewegung erlaubt ist (Einstellung „Animationen“ an und kein reduced motion). Auf dem Server: false. */
export function useMotionOk(): boolean {
  const { settings, hydrated } = useSite();
  const reduce = useSyncExternalStore(
    subscribeRm,
    () => !!window.matchMedia?.(RM).matches,
    () => true,
  );
  return hydrated && settings.anim && !reduce;
}

/**
 * Sichtbarkeit per IntersectionObserver. `once`: bleibt true, sobald einmal sichtbar (Einblenden).
 * Ohne IntersectionObserver (alte Browser) gilt das Element als sichtbar.
 */
export function useInView(ref: RefObject<Element | null>, { once = true, margin = '0px 0px -12% 0px', threshold = 0 } = {}) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Fallback ohne Observer: einmalig sichtbar schalten
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          if (once) io.disconnect();
        } else if (!once) setSeen(false);
      },
      { rootMargin: margin, threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, once, margin, threshold]);
  return seen;
}

/**
 * Scroll-Fortschritt eines Elements als CSS-Variable `--p` (0 … 1) direkt am Element — ohne React-Render pro Frame.
 * mode 'through': 0 = Oberkante erreicht den unteren Rand, 1 = Unterkante verlässt den oberen Rand.
 * mode 'pin': 0 = Oberkante am oberen Rand, 1 = Unterkante am unteren Rand (für Sticky-Abschnitte, die höher als der
 * Bildschirm sind). mode 'leave': 0 = Oberkante am oberen Rand, 1 = ganz hinausgescrollt (Hero beim Verlassen).
 * Ohne Bewegung bleibt `--p` fest auf `rest`.
 */
export function useScrollVar(ref: RefObject<HTMLElement | null>, on: boolean, mode: 'through' | 'pin' | 'leave' = 'through', rest = 1) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!on) {
      el.style.setProperty('--p', String(rest));
      return;
    }
    let raf = 0;
    const calc = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const p =
        mode === 'pin'
          ? -r.top / Math.max(1, r.height - vh)
          : mode === 'leave'
            ? -r.top / Math.max(1, r.height)
            : (vh - r.top) / (vh + r.height);
      el.style.setProperty('--p', Math.min(1, Math.max(0, p)).toFixed(4));
    };
    const tick = () => {
      if (!raf) raf = requestAnimationFrame(calc);
    };
    calc();
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', tick);
      window.removeEventListener('resize', tick);
    };
  }, [ref, on, mode, rest]);
}
