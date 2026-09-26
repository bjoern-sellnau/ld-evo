import { isSafari } from '../settings/applyBody';

/**
 * Zentraler View-Transition-Einstieg (Prototyp: runVt, Nachträge v21.1/v22) — einziger Aufrufer von
 * document.startViewTransition für Seiten- UND Theme-Wechsel:
 * - serialisiert (läuft schon eine VT → Wechsel sofort ohne VT, kein Supersede-Abort)
 * - Klassen auf <html> vor dem Start, gemeinsames Cleanup + 1,8-s-Watchdog
 * - ready/updateCallbackDone/finished werden gefangen → keine Unhandled Rejections
 * - versteckter Tab → ohne VT; Safari → Web-Animations-Fallback (fbVt)
 */
let busy = false;
let watchdog: ReturnType<typeof setTimeout> | undefined;

type Apply = () => void | Promise<void>;

export function runVt(classes: string[], apply: Apply, { anim, hold = 90 }: { anim: boolean; hold?: number }) {
  const run = () => void Promise.resolve(apply()).catch(() => {});
  if (typeof document === 'undefined') return run();
  if (isSafari() && anim && document.visibilityState !== 'hidden') return fbVt(apply);
  if (!document.startViewTransition || isSafari() || !anim || busy || document.visibilityState === 'hidden') return run();

  busy = true;
  const de = document.documentElement;
  classes.forEach((c) => de.classList.add(c));
  const cleanup = () => {
    clearTimeout(watchdog);
    busy = false;
    classes.forEach((c) => de.classList.remove(c));
  };
  watchdog = setTimeout(cleanup, 1800);

  let t: ViewTransition;
  try {
    t = document.startViewTransition(async () => {
      await apply();
      await new Promise((r) => setTimeout(r, hold));
    });
  } catch {
    cleanup();
    return run();
  }
  t.ready.catch(() => {});
  t.updateCallbackDone.catch(() => {});
  t.finished.then(cleanup, cleanup);
}

let fbBusy = false;

/**
 * Fallback ohne View Transitions (Safari/iPad): Blende in Hintergrundfarbe fegt durch, danach steigen die
 * Inhalte des sichtbaren Screens gestaffelt ein. Werte 1:1 aus fbVt() des Prototyps.
 */
export function fbVt(apply: Apply) {
  if (fbBusy) return void Promise.resolve(apply());
  fbBusy = true;
  const bg = getComputedStyle(document.body).backgroundColor || '#0A1220';
  const ov = document.createElement('div');
  ov.style.cssText = `position:fixed;top:-4%;left:0;right:0;bottom:-4%;z-index:220;pointer-events:none;background:color-mix(in srgb,${bg} 90%,white);border-radius:26px 26px 0 0;transform:translateY(104%)`;
  document.body.appendChild(ov);
  const ease = 'cubic-bezier(0.65,0,0.35,1)';
  const done = () => {
    ov.remove();
    fbBusy = false;
  };
  // FLIP: aktive Menü-Pille gleitet vom alten zum neuen Item (VT-Morph-Ersatz)
  const getActive = () => document.querySelector<HTMLElement>('[data-navactive="true"]');
  const oldA = getActive();
  const r1 = oldA?.getBoundingClientRect() ?? null;
  const navFlip = () => {
    const newA = getActive();
    if (!r1 || !newA || newA === oldA) return;
    const r2 = newA.getBoundingClientRect();
    if (!r2.width) return;
    const ind = document.createElement('div');
    ind.style.cssText = `position:fixed;z-index:230;pointer-events:none;border-radius:999px;transform-origin:top left;background:${getComputedStyle(newA).backgroundColor};left:${r1.left}px;top:${r1.top}px;width:${r1.width}px;height:${r1.height}px`;
    document.body.appendChild(ind);
    const prevBg = newA.style.background;
    newA.style.background = 'transparent';
    const restore = () => {
      newA.style.background = prevBg;
      ind.remove();
    };
    try {
      const an = ind.animate(
        [
          { transform: 'translate(0,0) scale(1,1)' },
          { transform: `translate(${r2.left - r1.left}px,${r2.top - r1.top}px) scale(${r2.width / r1.width},${r2.height / r1.height})` },
        ],
        { duration: 340, easing: 'cubic-bezier(0.3,0.8,0.3,1)', fill: 'forwards' },
      );
      an.onfinish = restore;
    } catch {
      restore();
      return;
    }
    setTimeout(restore, 900);
  };
  const reveal = () => {
    const scr = [...document.querySelectorAll<HTMLElement>('[data-screen-label]')].find((e) => e.offsetParent !== null);
    if (!scr) return;
    [...scr.children].slice(0, 8).forEach((k, i) => {
      try {
        k.animate([{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'translateY(0)' }], {
          duration: 520,
          delay: 140 + i * 70,
          easing: 'cubic-bezier(0.2,0.7,0.3,1)',
          fill: 'backwards',
        });
      } catch {
        /* ignorieren */
      }
    });
  };
  try {
    const a1 = ov.animate([{ transform: 'translateY(104%)' }, { transform: 'translateY(0)' }], { duration: 320, easing: ease, fill: 'forwards' });
    a1.onfinish = async () => {
      await apply();
      ov.style.borderRadius = '0 0 26px 26px';
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          navFlip();
          reveal();
          const a2 = ov.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-104%)' }], { duration: 380, easing: ease, fill: 'forwards' });
          a2.onfinish = done;
        }),
      );
    };
  } catch {
    void Promise.resolve(apply());
    done();
    return;
  }
  setTimeout(done, 2000); // Watchdog
}

/** Globaler pointerdown-Listener: Klickpunkt + exakter Iris-End-Radius (Nachtrag v21/v22). */
export function trackVtOrigin(e: PointerEvent) {
  const de = document.documentElement.style;
  de.setProperty('--vt-x', `${e.clientX}px`);
  de.setProperty('--vt-y', `${e.clientY}px`);
  const dx = Math.max(e.clientX, window.innerWidth - e.clientX);
  const dy = Math.max(e.clientY, window.innerHeight - e.clientY);
  de.setProperty('--vt-r', `${Math.ceil(Math.hypot(dx, dy) * 1.02)}px`);
}

/** Clip-basierte Modi ohne Element-Morphs (Nachtrag v20). */
export const REVEAL_MODES = ['wipe', 'circle', 'iris', 'curtain', 'blinds', 'split', 'diagonal', 'stack', 'push', 'flip', 'glitch'];

export function pageVtClasses(mode: string): string[] {
  return REVEAL_MODES.includes(mode) ? ['ldvt', `ldvt-${mode}`, 'ldvt-nomorph'] : ['ldvt', `ldvt-${mode}`];
}
