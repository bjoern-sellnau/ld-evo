'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { isSafeMediaSrc } from '@/cms/safe';
import { useContent } from '../content/ContentProvider';
import { useHref, useT } from '../i18n/LocaleProvider';
import { useMotionOk } from '../story/motion';
import styles from './welcome.module.css';

/**
 * Landing Page /welcome (neu, nicht im Prototyp): zeigt zuerst die ALTE Website (Screenshot aus LD Flow, Startseite →
 * „Welcome: Screenshot der alten Website“) und verwandelt sie dann per Effekt in die neue Startseite, die darunter
 * schon fertig gerendert liegt (HalloPage). Effekte: Kacheln, Glitch, Pixel, Welle — oder Zufall. Ohne Bewegung
 * (prefers-reduced-motion / „Animationen aus“) nur ein kurzes Überblenden. Ohne Screenshot gibt es kein Overlay.
 * Danach steht die Adresse auf der Startseite (replaceState), damit Neu-Laden nicht noch einmal abspielt.
 * Zum Ausprobieren: /welcome?effekt=kacheln|glitch|pixel|welle.
 */
const EFFECTS = ['kacheln', 'glitch', 'pixel', 'welle'] as const;
type Effect = (typeof EFFECTS)[number];
const DURATION: Record<Effect, number> = { kacheln: 1500, glitch: 1500, pixel: 1500, welle: 1800 };
/** Wie lange die alte Seite steht, bevor sie sich von selbst verwandelt. */
const HOLD_MS = 3200;

export function Welcome() {
  const { home } = useContent();
  const t = useT();
  const href = useHref();
  const motion = useMotionOk();
  const img = home.welcomeOld?.src && isSafeMediaSrc(home.welcomeOld.src) ? home.welcomeOld : null;
  const [phase, setPhase] = useState<'old' | 'run' | 'done'>(img ? 'old' : 'done');
  const [effect, setEffect] = useState<Effect>('kacheln');
  const goRef = useRef<HTMLButtonElement>(null);

  const finish = () => {
    setPhase('done');
    try {
      window.history.replaceState(window.history.state, '', href('/'));
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
    // ?effekt=pixel probiert einen Effekt direkt aus (sonst Einstellung aus LD Flow)
    const pick = new URLSearchParams(window.location.search).get('effekt') ?? home.welcomeEffect;
    setEffect(EFFECTS.includes(pick as Effect) ? (pick as Effect) : EFFECTS[Math.floor(Math.random() * EFFECTS.length)]);
    setPhase('run');
  };

  useEffect(() => {
    if (phase !== 'old') return;
    goRef.current?.focus({ preventScroll: true });
    const id = setTimeout(start, HOLD_MS);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && finish();
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(id);
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- nur beim Wechsel der Phase neu armieren
  }, [phase]);

  useEffect(() => {
    if (phase !== 'run') return;
    const id = setTimeout(finish, motion ? DURATION[effect] : 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Ablauf hängt nur an Phase und Effekt
  }, [phase, effect, motion]);

  if (phase === 'done' || !img) return null;
  const shot = <img className={styles.shot} src={img.src} alt={img.alt || t('welcome.old')} draggable={false} />;
  const running = phase === 'run';
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('welcome.dialog')}
      className={[styles.overlay, running ? styles.running : ''].join(' ')}
    >
      {!running || !motion ? (
        <div className={running ? styles.fade : undefined} style={{ position: 'absolute', inset: 0 }}>
          {shot}
        </div>
      ) : effect === 'kacheln' ? (
        <Tiles src={img.src} />
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
        <Pixels src={img.src} />
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

/** Kacheln: das Bild (wie object-fit: cover, oben ausgerichtet) in ein Raster geschnitten; Mitte zuerst. */
function Tiles({ src }: { src: string }) {
  const [size, setSize] = useState<{ w: number; h: number; vw: number; vh: number } | null>(null);
  useEffect(() => {
    const im = new Image();
    im.onload = () => setSize({ w: im.naturalWidth, h: im.naturalHeight, vw: window.innerWidth, vh: window.innerHeight });
    im.src = src;
  }, [src]);
  if (!size) return null;
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
function Pixels({ src }: { src: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
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
  return <canvas ref={ref} aria-hidden className={styles.pixel} />;
}
