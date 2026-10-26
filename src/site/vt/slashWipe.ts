import { LOONA_TONES } from '@/components/brand/products';

/**
 * Page-Transition „Slash-Wipe“ (neu — Brand-System 2026-10, docs/design_handoff_loona_brand README „Slash-Wipe“):
 * Eine orange Fläche, deren Vorderkante der Slash ist (Steigung 1 : 2), fegt in 0,6 s mit cubic-bezier(.7,0,.3,1)
 * über die Seite; dahinter kommt die neue Seite. Im Handoff ein SVG mit viewBox 0 0 48 30 — hier in Bildschirm-Pixeln
 * mit derselben Steigung (Versatz der Kante = halbe Höhe), damit sie auf jedem Seitenverhältnis gleich aussieht.
 * Genau in der Mitte (Fortschritt 0,5) deckt die Fläche den ganzen Schirm: dort wird umgeschaltet, und die Fläche
 * wartet, bis die neue Seite steht. Die Easing-Kurve ist dafür exakt an u = 0,5 geteilt (de Casteljau):
 * cubic-bezier(.7,0,.3,1) = cubic-bezier(.7,0,.85,.5) + cubic-bezier(.15,.5,.3,1), je 300 ms.
 * Ohne Animation (Einstellung aus, prefers-reduced-motion, verstecktes Tab) wird sofort umgeschaltet.
 */
let busy = false;

export const slashWipeAllowed = () =>
  typeof window !== 'undefined' &&
  document.visibilityState !== 'hidden' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
  typeof document.body.animate === 'function';

export function slashWipe(apply: () => void | Promise<void>) {
  const run = () => Promise.resolve(apply()).catch(() => {});
  if (busy || !slashWipeAllowed()) return void run();
  busy = true;
  const W = window.innerWidth;
  const H = window.innerHeight;
  // Fläche: Breite B bis zur Oberkante der Vorderkante, unten H/2 weiter (Steigung 1 : 2).
  const B = W + H / 2;
  const ov = document.createElement('div');
  ov.setAttribute('aria-hidden', 'true');
  ov.style.cssText =
    `position:fixed;left:0;top:0;width:${B + H / 2}px;height:${H}px;z-index:240;pointer-events:none;` +
    `background:${LOONA_TONES.orange};clip-path:polygon(0 0,${B}px 0,100% 100%,0 100%);will-change:transform`;
  const at = (x: number) => ({ transform: `translateX(${x}px)` });
  // Start: ganz links draußen (Vorderkante unten bei x = 0) · Mitte: deckt alles · Ende: ganz rechts draußen.
  const start = -W - H;
  const mid = -H / 2;
  const end = W;
  ov.style.transform = at(start).transform;
  document.body.appendChild(ov);
  let finished = false;
  const done = () => {
    if (finished) return;
    finished = true;
    clearTimeout(watchdog);
    ov.remove();
    busy = false;
  };
  const watchdog = setTimeout(done, 2500);
  try {
    const a1 = ov.animate([at(start), at(mid)], { duration: 300, easing: 'cubic-bezier(0.7,0,0.85,0.5)', fill: 'forwards' });
    a1.onfinish = async () => {
      await run();
      // zwei Frames: die neue Seite ist gemalt, bevor die Fläche sie freigibt
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const a2 = ov.animate([at(mid), at(end)], { duration: 300, easing: 'cubic-bezier(0.15,0.5,0.3,1)', fill: 'forwards' });
          a2.onfinish = done;
        }),
      );
    };
  } catch {
    done();
    void run();
  }
}
