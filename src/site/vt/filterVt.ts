import { flushSync } from 'react-dom';
import { isSafari } from '../settings/applyBody';

/** Klasse auf <html> während eines Filterwechsels (site.css: Karten gleiten, neue blenden ein, wegfallende aus). */
export const FILTER_VT_CLASS = 'ldvt-filter';
const EASE = 'cubic-bezier(0.22,0.9,0.24,1)';

/**
 * Flüssiger Filterwechsel auf Projekte/Labs (neu, nicht im Prototyp — dort sprang das Raster hart um).
 * Die Zellen (`[data-vtf]` im Container) bekommen NUR für die Dauer des Wechsels einen view-transition-name, sonst
 * würden sie bei Seitenwechseln mitmorphen (vtTarget-Gating, Nachtrag v20). Bleibende Karten gleiten an ihre neue
 * Stelle, neue blenden ein, wegfallende aus; der aktive Filter-Chip (`[data-vtf-chip]`) wandert mit.
 * Ohne View Transitions bzw. in Safari (wie runVt) → FLIP mit Web Animations; „Animationen aus“/reduced motion → sofort.
 */
export function filterVt(container: HTMLElement | null, apply: () => void, anim: boolean) {
  const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!container || !anim || reduce || document.visibilityState === 'hidden') return apply();
  const cells = () => [...container.querySelectorAll<HTMLElement>('[data-vtf]')];
  const chip = () => document.querySelector<HTMLElement>('[data-vtf-chip="on"]');

  if (document.startViewTransition && !isSafari()) {
    const de = document.documentElement;
    // Nur Zellen im (erweiterten) Sichtfeld benennen: unsichtbare müssen nicht animieren und kosten nur Snapshot-Zeit.
    const near = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return r.bottom > -200 && r.top < window.innerHeight + 200;
    };
    const name = () => {
      for (const el of cells()) if (near(el)) el.style.setProperty('view-transition-name', `ldf-${el.dataset.vtf}`);
      chip()?.style.setProperty('view-transition-name', 'ldf-chip');
    };
    const unname = () => {
      for (const el of cells()) el.style.removeProperty('view-transition-name');
      document.querySelectorAll<HTMLElement>('[data-vtf-chip]').forEach((el) => el.style.removeProperty('view-transition-name'));
    };
    const done = () => {
      de.classList.remove(FILTER_VT_CLASS);
      unname();
    };
    name();
    de.classList.add(FILTER_VT_CLASS);
    try {
      const t = document.startViewTransition(() => {
        unname();
        flushSync(apply);
        name();
      });
      t.ready.catch(() => {});
      t.updateCallbackDone.catch(() => {});
      t.finished.then(done, done);
    } catch {
      done();
      apply();
    }
    return;
  }

  // FLIP-Fallback: Positionen vorher messen, umschalten, Differenz animiert zurücklaufen lassen.
  const before = new Map(cells().map((el) => [el.dataset.vtf, el.getBoundingClientRect()]));
  flushSync(apply);
  cells().forEach((el, i) => {
    const r0 = before.get(el.dataset.vtf);
    const r1 = el.getBoundingClientRect();
    try {
      if (r0)
        el.animate([{ transform: `translate(${r0.left - r1.left}px,${r0.top - r1.top}px)` }, { transform: 'none' }], {
          duration: 480,
          easing: EASE,
        });
      else
        el.animate(
          [
            { opacity: 0, transform: 'translateY(10px) scale(0.92)' },
            { opacity: 1, transform: 'none' },
          ],
          { duration: 420, delay: 80 + Math.min(i, 8) * 30, easing: EASE, fill: 'backwards' },
        );
    } catch {
      /* ohne Web Animations: einfach umschalten */
    }
  });
}
