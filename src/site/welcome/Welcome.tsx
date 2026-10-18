'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { isSafeMediaSrc } from '@/cms/safe';
import { useContent } from '../content/ContentProvider';
import { useHref, useT } from '../i18n/LocaleProvider';
import { useSite } from '../settings/SiteProvider';
import { useMotionOk } from '../story/motion';
import { Burn, Cracks, Door } from './effects';
import styles from './welcome.module.css';

/**
 * Landing Page /welcome (neu, nicht im Prototyp): zeigt zuerst die ALTE Website (Screenshot aus LD Flow, Startseite →
 * „Welcome: Screenshot der alten Website“) und verwandelt sie dann per Effekt in die neue Startseite, die darunter
 * schon fertig gerendert liegt (HalloPage). Effekte: Kacheln, Glitch, Pixel, Welle, Risse, Brennen, Countdown-Tür —
 * oder Zufall. Welcher: ?effekt=… > Einstellungen („Welcome-Effekt“) > LD Flow. Ohne Bewegung (prefers-reduced-motion
 * / „Animationen aus“) nur ein kurzes Überblenden. Ohne Screenshot gibt es kein Overlay.
 * Danach steht die Adresse auf der Startseite (replaceState), damit Neu-Laden nicht noch einmal abspielt.
 */
/** Unterpfad (GitHub Pages): eigene Pfade wie /welcome/… bzw. /media/… brauchen ihn — wie BrandSwap. */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
export const WELCOME_EFFECTS = ['kacheln', 'glitch', 'pixel', 'welle', 'risse', 'brand', 'tuer'] as const;
type Effect = (typeof WELCOME_EFFECTS)[number];
const DURATION: Record<Effect, number> = { kacheln: 1500, glitch: 1500, pixel: 1500, welle: 1800, risse: 2700, brand: 2800, tuer: 1500 };
/** Wie lange die alte Seite steht, bevor sie sich von selbst verwandelt (Tür: Countdown 20 s). */
const HOLD_MS = 3200;
const DOOR_S = 20;

const pickEffect = (want: string | null | undefined): Effect =>
  WELCOME_EFFECTS.includes(want as Effect) ? (want as Effect) : WELCOME_EFFECTS[Math.floor(Math.random() * WELCOME_EFFECTS.length)];

export function Welcome() {
  const { home } = useContent();
  const { settings, hydrated } = useSite();
  const t = useT();
  const href = useHref();
  const motion = useMotionOk();
  const raw = home.welcomeOld?.src && isSafeMediaSrc(home.welcomeOld.src) ? home.welcomeOld : null;
  const img = raw ? { ...raw, src: raw.src.startsWith('/') ? BASE + raw.src : raw.src } : null;
  const [phase, setPhase] = useState<'old' | 'run' | 'done'>(img ? 'old' : 'done');
  const [effect, setEffect] = useState<Effect | null>(null);
  const [left, setLeft] = useState(DOOR_S);
  // Natürliche Größe des schon sichtbaren Bildes — Kacheln/Pixel starten damit ohne erneutes Laden (kein Aufblitzen)
  // (per Ref gelesen: das Bild ist oft schon vor der Hydration geladen, onLoad käme dann nie)
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const shotRef = useRef<HTMLImageElement>(null);
  const goRef = useRef<HTMLButtonElement>(null);

  // Effekt erst nach der Hydration wählen (Einstellungen und Adresse sind erst dann bekannt)
  useEffect(() => {
    if (!hydrated || effect) return;
    const url = new URLSearchParams(window.location.search).get('effekt');
    const own = settings.welcomeFx && settings.welcomeFx !== 'flow' ? settings.welcomeFx : null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Wahl hängt an Adresse/localStorage (nur im Browser)
    setEffect(pickEffect(url ?? own ?? home.welcomeEffect));
  }, [hydrated, effect, settings.welcomeFx, home.welcomeEffect]);

  const finish = () => {
    setPhase('done');
    try {
      window.history.replaceState(window.history.state, '', BASE + href('/'));
    } catch {
      // Adresse bleibt /welcome — kein Problem
    }
    // Fokus an den Anfang der neuen Seite (das Overlay mit dem Fokus verschwindet)
    const main = document.getElementById('inhalt');
    if (main) {
      if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
      main.focus({ preventScroll: true });
    }
  };
  const start = () => {
    if (phase !== 'old') return;
    const im = shotRef.current;
    if (im?.naturalWidth) setNat({ w: im.naturalWidth, h: im.naturalHeight });
    setPhase('run');
  };

  useEffect(() => {
    if (phase !== 'old' || !effect) return;
    goRef.current?.focus({ preventScroll: true });
    const door = effect === 'tuer';
    const id = setTimeout(start, door ? DOOR_S * 1000 : HOLD_MS);
    // Countdown der Tür (sekündlich)
    const t0 = Date.now();
    const tick = door ? setInterval(() => setLeft(Math.max(0, DOOR_S - Math.floor((Date.now() - t0) / 1000))), 250) : undefined;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && finish();
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(id);
      clearInterval(tick);
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- nur beim Wechsel von Phase/Effekt neu armieren
  }, [phase, effect]);

  useEffect(() => {
    if (phase !== 'run' || !effect) return;
    const id = setTimeout(finish, motion ? DURATION[effect] : 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Ablauf hängt nur an Phase und Effekt
  }, [phase, effect, motion]);

  if (phase === 'done' || !img) return null;
  const shot = <img className={styles.shot} src={img.src} alt={img.alt || t('welcome.old')} draggable={false} ref={shotRef} />;
  const running = phase === 'run';
  const door = effect === 'tuer' && motion;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('welcome.dialog')}
      className={[styles.overlay, running ? styles.running : ''].join(' ')}
    >
      {door ? (
        <>
          {/* Bild für Screenreader/Größe; sichtbar sind die Türflügel */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0 }}>{shot}</div>
          <Door src={img.src} open={running} total={DOOR_S} left={left} />
        </>
      ) : !running || !motion ? (
        <div className={running ? styles.fade : undefined} style={{ position: 'absolute', inset: 0 }}>
          {shot}
          {effect === 'tuer' && !running && (
            <div className={styles.count} aria-hidden>
              <span>{left}</span>
            </div>
          )}
        </div>
      ) : effect === 'kacheln' && nat ? (
        <Tiles src={img.src} nat={nat} />
      ) : effect === 'glitch' ? (
        <div className={styles.glitch}>
          <svg aria-hidden width="0" height="0" style={{ position: 'absolute' }}>
            <filter id="ld-welcome-red">
              <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
            </filter>
          </svg>
          {shot}
          <img className={styles.shot} src={img.src} alt="" aria-hidden draggable={false} />
        </div>
      ) : effect === 'pixel' ? (
        <Pixels src={img.src} fallback={shot} />
      ) : effect === 'risse' ? (
        <Fallback shot={shot}>
          <Cracks src={img.src} />
        </Fallback>
      ) : effect === 'brand' ? (
        <Fallback shot={shot}>
          <Burn src={img.src} />
        </Fallback>
      ) : (
        <div className={styles.wave}>{shot}</div>
      )}
      <div className={styles.bar}>
        <span className={styles.note}>{home.welcomeNote || t('welcome.old')}</span>
        <button ref={goRef} type="button" className={styles.go} onClick={start}>
          {t('welcome.go')}
        </button>
        <button type="button" className={styles.skip} onClick={finish}>
          {t('welcome.skip')}
        </button>
      </div>
    </div>
  );
}

/** Altes Bild darunter, bis der Canvas-Effekt das erste Bild gezeichnet hat (kein Aufblitzen der neuen Seite). */
function Fallback({ shot, children }: { shot: ReactNode; children: ReactNode }) {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setShow(false)));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <>
      {show && shot}
      {children}
    </>
  );
}

/** Kacheln: das Bild (wie object-fit: cover, oben ausgerichtet) in ein Raster geschnitten; Mitte zuerst. */
function Tiles({ src, nat }: { src: string; nat: { w: number; h: number } }) {
  const size = { ...nat, vw: window.innerWidth, vh: window.innerHeight };
  const cols = size.vw < 700 ? 6 : 12;
  const rows = Math.max(4, Math.round((cols * size.vh) / size.vw));
  const scale = Math.max(size.vw / size.w, size.vh / size.h);
  const bw = size.w * scale;
  const bh = size.h * scale;
  const ox = (size.vw - bw) / 2;
  const tw = size.vw / cols;
  const th = size.vh / rows;
  const cells = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const dx = c + 0.5 - cols / 2;
      const dy = r + 0.5 - rows / 2;
      const dist = Math.hypot(dx / cols, dy / rows);
      cells.push(
        <span
          key={`${r}-${c}`}
          className={styles.tile}
          style={
            {
              backgroundImage: `url("${src}")`,
              backgroundSize: `${bw}px ${bh}px`,
              backgroundPosition: `${ox - c * tw}px ${-r * th}px`,
              '--d': `${Math.round(dist * 900)}ms`,
              '--rx': `${(dy > 0 ? -1 : 1) * 70}deg`,
              '--ry': `${(dx > 0 ? 1 : -1) * 40}deg`,
            } as CSSProperties
          }
        />,
      );
    }
  return (
    <div
      aria-hidden
      className={styles.tiles}
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}
    >
      {cells}
    </div>
  );
}

/** Pixel: die alte Seite wird gröber (Canvas ohne Glättung), dann lösen sich die Blöcke zufällig auf. */
function Pixels({ src, fallback }: { src: string; fallback: ReactNode }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    cv.width = vw;
    cv.height = vh;
    const im = new Image();
    let raf = 0;
    im.onload = () => {
      const scale = Math.max(vw / im.naturalWidth, vh / im.naturalHeight);
      const bw = im.naturalWidth * scale;
      const ox = (vw - bw) / 2;
      const small = document.createElement('canvas');
      const sctx = small.getContext('2d');
      const t0 = performance.now();
      let order: number[] | null = null;
      let drawn0 = false;
      const frame = (now: number) => {
        const p = Math.min(1, (now - t0) / 1500);
        // 0–0,55: gröber werden (Blockgröße 1 → 48 px), danach Blöcke zufällig entfernen
        const block = Math.max(1, Math.round(1 + Math.min(1, p / 0.55) * 47));
        const cw = Math.ceil(vw / block);
        const ch = Math.ceil(vh / block);
        small.width = cw;
        small.height = ch;
        if (sctx) sctx.drawImage(im, ox / block, 0, bw / block, (im.naturalHeight * scale) / block);
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, vw, vh);
        ctx.drawImage(small, 0, 0, cw, ch, 0, 0, cw * block, ch * block);
        if (!drawn0) {
          drawn0 = true;
          setDrawn(true);
        }
        if (p > 0.55) {
          order ??= Array.from({ length: cw * ch }, (_, i) => i).sort(() => Math.random() - 0.5);
          const gone = Math.floor(((p - 0.55) / 0.45) * order.length);
          for (let i = 0; i < gone; i++) {
            const k = order[i];
            ctx.clearRect((k % cw) * block, Math.floor(k / cw) * block, block, block);
          }
        }
        if (p < 1) raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    };
    im.src = src;
    return () => cancelAnimationFrame(raf);
  }, [src]);
  return (
    <>
      {!drawn && fallback}
      <canvas ref={ref} aria-hidden className={styles.pixel} />
    </>
  );
}
