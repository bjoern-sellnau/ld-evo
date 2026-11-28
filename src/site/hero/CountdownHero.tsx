'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useT } from '../i18n/LocaleProvider';
import { useSite } from '../settings/SiteProvider';
import {
  COUNTDOWN_ANCHOR,
  COUNTDOWN_MODES,
  DIGIT,
  SEGMENTS,
  SEGMENT_POINTS,
  clockLayout,
  clockWidth,
  countdownCfg,
  countdownParts,
  type CountdownMode,
} from './countdown';
import styles from './countdown.module.css';
import { heroCfgOf } from './palettes';

/** Neigung der Anzeige wie im Trailer (kDigit: 0,07 je Höhe). */
const SKEW = 0.07;
const UNITS = ['cd.days', 'cd.hours', 'cd.minutes', 'cd.seconds'] as const;

/** Aktuelle Zeit, auf ganze Sekunden getaktet — erst im Browser (Server-HTML ohne Uhrzeit → keine Hydration-Abweichung). */
function useNow(): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    let to: ReturnType<typeof setTimeout>;
    const run = () => {
      setNow(Date.now());
      to = setTimeout(run, 1000 - (Date.now() % 1000) + 5);
    };
    to = setTimeout(run, 0);
    return () => clearTimeout(to);
  }, []);
  return now;
}

/** Ob das Element gerade im Bild ist — außerhalb tickt nichts. */
function useInView<T extends Element>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(true);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return [ref, inView] as const;
}

/**
 * Ein „Tick“ bzw. „Tack“ (hi): kurzer gefilterter Rauschstoß mit etwas Körper — dieselbe Machart wie das Ticken in
 * der Musik der Teaser (Branch `reel`, quelle-trailer/kino-musik.js → tick), hier live im Browser erzeugt.
 */
function playTick(ctx: AudioContext, hi: boolean) {
  const t = ctx.currentTime + 0.01;
  const out = ctx.createGain();
  out.gain.value = 0.5;
  out.connect(ctx.destination);
  const noise = (dur: number, f0: number, f1: number, gain: number, q: number) => {
    const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = q;
    f.frequency.setValueAtTime(f0, t);
    f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(out);
    src.start(t);
  };
  const tone = (dur: number, freq: number, type: OscillatorType, gain: number) => {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(out);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  };
  noise(0.035, hi ? 4200 : 2900, hi ? 3400 : 2300, 0.67, 4);
  noise(0.012, 7000, 5000, 0.21, 1);
  tone(0.06, hi ? 1900 : 1350, 'sine', 0.21);
  tone(0.08, hi ? 520 : 390, 'triangle', 0.17);
}

/**
 * Ticken im Sekundentakt. Browser geben Ton erst nach einer Eingabe frei: Der Klang beginnt mit dem ersten Klick oder
 * Tastendruck auf der Seite (bzw. sofort, wenn die Einstellung gerade per Klick eingeschaltet wurde).
 */
function useTicking(on: boolean, sec: number | null) {
  const ctxRef = useRef<AudioContext | null>(null);
  useEffect(() => {
    if (!on) return;
    const unlock = () => {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      ctxRef.current ??= new AC();
      void ctxRef.current.resume();
    };
    if (navigator.userActivation?.isActive) unlock();
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      void ctxRef.current?.close();
      ctxRef.current = null;
    };
  }, [on]);
  useEffect(() => {
    const ctx = ctxRef.current;
    if (!on || sec === null || !ctx || ctx.state !== 'running' || document.hidden) return;
    playTick(ctx, sec % 2 === 0);
  }, [on, sec]);
}

/**
 * Die Countdown-Uhr als Hero: Titelzeile, Sieben-Segment-Anzeige (Tage : Stunden : Minuten : Sekunden), Einheiten.
 * layout „solo“ = groß und mittig (wie im Trailer), „side“ = neben bzw. über dem Hero-Text. Der gezeichnete Grund
 * (Schein, Lichtstreifen, Staub) liegt im Hero-Canvas dahinter (extra/countdown.ts).
 * Die Uhr zählt auch bei „Animationen aus“ weiter (Information), nur Puls, Einschlag und Blinken entfallen.
 */
export function CountdownHero({ mode, layout, style }: { mode: CountdownMode; layout: 'solo' | 'side'; style?: CSSProperties }) {
  const { settings: s } = useSite();
  const t = useT();
  const cfg = countdownCfg(mode, heroCfgOf(s.heroCfg, mode));
  const kind = COUNTDOWN_MODES[mode].kind;
  const now = useNow();
  const [muted, setMuted] = useState(false);
  const [ref, inView] = useInView<HTMLDivElement>();

  const left = now === null ? null : cfg.target - now;
  const sec = now === null ? null : Math.floor(now / 1000);
  const done = left !== null && left <= 0;
  // vor dem ersten Takt: alle Segmente dunkel („-“ kennt die Segmenttabelle nicht)
  const groups = left === null ? ['---', '--', '--', '--'] : countdownParts(left);
  useTicking(cfg.tick && !muted && inView && !done, sec);

  const total = clockWidth(groups);
  // Lage der Gruppen und Doppelpunkte in Trailer-Pixeln
  const layoutX = clockLayout(groups);
  const pad = Math.ceil((SKEW * DIGIT.h) / 2) + 4;
  const [d, h, m] = groups;

  return (
    <div
      ref={ref}
      className={`${styles.root} ${layout === 'solo' ? styles.solo : styles.side} ${kind === 'beyond' ? styles.beyond : ''}`}
      style={{ '--cd': cfg.color, ...style } as CSSProperties}
      data-beat={sec === null ? undefined : sec % 2}
      data-on={now === null ? undefined : ''}
    >
      <p className={styles.title}>{t(`cd.${kind}.title`)}</p>
      <p className={styles.sub}>{t(`cd.${kind}.sub`)}</p>
      {/* für Screenreader: die Restzeit als Satz (role=timer meldet Änderungen nicht von selbst — kein Sekundengeplapper) */}
      <p role="timer" className={styles.hidden}>
        {left === null ? '' : done ? t('cd.done') : t('cd.timer', { d: Number(d), h: Number(h), m: Number(m) })}
      </p>
      <div className={styles.clock} id={COUNTDOWN_ANCHOR} aria-hidden>
        {/* data-live: läuft sekündlich weiter — die Seiten-Pixeltests maskieren solche Stellen */}
        <svg className={styles.svg} viewBox={`${-pad} 0 ${total + pad * 2} ${DIGIT.h}`} data-live>
          <g transform={`matrix(1 0 ${-SKEW} 1 ${(SKEW * DIGIT.h) / 2} 0)`}>
            {groups.map((g, gi) => (
              <g key={gi}>
                {[...g].map((ch, q) => (
                  <g key={q} transform={`translate(${layoutX[gi].x0 + q * (DIGIT.w + DIGIT.gap)} 0)`}>
                    {Object.entries(SEGMENT_POINTS).map(([k, pts]) => (
                      <polygon key={k} points={pts} className={(SEGMENTS[ch] ?? '').includes(k) ? styles.segOn : styles.seg} />
                    ))}
                  </g>
                ))}
                {gi < groups.length - 1 &&
                  [0.32, 0.68].map((f) => (
                    <circle
                      key={f}
                      className={styles.colon}
                      cx={layoutX[gi].x0 + layoutX[gi].w + DIGIT.colon / 2}
                      cy={DIGIT.h * f}
                      r={9.5}
                    />
                  ))}
              </g>
            ))}
          </g>
        </svg>
        <div className={styles.units}>
          {UNITS.map((key, i) => (
            <span
              key={key}
              className={styles.unit}
              style={{ left: `${((pad + layoutX[i].x0 + layoutX[i].w / 2) / (total + pad * 2)) * 100}%` }}
            >
              {t(key)}
            </span>
          ))}
        </div>
      </div>
      {cfg.tick && (
        <button
          type="button"
          className={styles.sound}
          aria-pressed={!muted}
          onClick={() => setMuted((v) => !v)}
          title={t(muted ? 'cd.unmute' : 'cd.mute')}
        >
          <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            aria-hidden
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" fill="currentColor" stroke="none" />
            {muted ? <path d="M16 9.5l5 5M21 9.5l-5 5" /> : <path d="M15.5 9a4.2 4.2 0 0 1 0 6M18.2 6.5a8 8 0 0 1 0 11" />}
          </svg>
          <span>{t('cd.sound')}</span>
        </button>
      )}
    </div>
  );
}
