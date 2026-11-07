'use client';

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { MediaRef } from '@/cms/schema';
import { mediaSrcSet } from '@/cms/media';
import { isSafeMediaSrc } from '@/cms/safe';
import { EText } from '../cms/editing';
import { mono } from '../cards/ProjectCard';
import { useT } from '../i18n/LocaleProvider';
import styles from './blocks.module.css';

/**
 * Medien-Widgets der Detailseiten (neu, Wunsch 07.11.2026): Vorher/Nachher, Bild mit Hotspots, Geräte-Mockup,
 * Split-Screen (Bild steht, Text scrollt). Bilder nur über isSafeMediaSrc; eigene Uploads mit srcset.
 */

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
/** Sichere Bildquelle (eigene Pfade mit Basispfad), sonst null. */
export function mediaUrl(m?: MediaRef | null): string | null {
  if (!m?.src || !isSafeMediaSrc(m.src)) return null;
  return m.src.startsWith('/') ? BASE + m.src : m.src;
}

function Img({ m, sizes, eager, style, on }: { m?: MediaRef | null; sizes: string; eager?: boolean; style?: CSSProperties; on?: boolean }) {
  const src = mediaUrl(m);
  if (!src || !m) return <span className={styles.placeholder}>—</span>;
  return (
    <img
      src={src}
      srcSet={mediaSrcSet(m.src)}
      sizes={sizes}
      alt={m.alt ?? ''}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      style={style}
      data-on={on === undefined ? undefined : String(on)}
    />
  );
}

export function Caption({ path, value }: { path: string; value?: string }) {
  if (!value) return null;
  return (
    <figcaption className={styles.caption}>
      <EText path={path} value={value} />
    </figcaption>
  );
}

const RATIO: Record<string, string> = { '16-9': '16 / 9', '4-3': '4 / 3', '1-1': '1 / 1', '21-9': '21 / 9' };

// ---------------------------------------------------------------------------------------------------------------
// Vorher/Nachher
// ---------------------------------------------------------------------------------------------------------------

/** Zwei Bilder übereinander, ein Regler (echtes input[type=range]: Maus, Finger, Pfeiltasten) zeigt mehr vom einen oder anderen. */
export function Compare({
  before,
  after,
  beforeLabel,
  afterLabel,
  caption,
  ratio,
  path,
}: {
  before?: MediaRef;
  after?: MediaRef;
  beforeLabel?: string;
  afterLabel?: string;
  caption?: string;
  ratio: string;
  path: string;
}) {
  const t = useT();
  const [pos, setPos] = useState(50);
  return (
    <figure className={styles.box} style={{ margin: 0 }}>
      <div className={styles.compare} style={{ aspectRatio: RATIO[ratio] ?? '16 / 9', '--pos': `${pos}%` } as CSSProperties}>
        <Img m={after} sizes="(min-width: 2400px) 1900px, (min-width: 900px) 1200px, 100vw" />
        <div className={styles.compareBefore} style={{ position: 'absolute', inset: 0 }}>
          <Img m={before} sizes="(min-width: 2400px) 1900px, (min-width: 900px) 1200px, 100vw" />
        </div>
        <span className={styles.compareTag} style={{ left: 12 }}>
          {beforeLabel || t('w.before')}
        </span>
        <span className={styles.compareTag} style={{ right: 12 }}>
          {afterLabel || t('w.after')}
        </span>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          className={styles.compareRange}
          aria-label={t('w.compareSlider')}
          aria-valuetext={`${beforeLabel || t('w.before')} ${pos} %`}
        />
        <span aria-hidden className={styles.compareLine}>
          <span className={styles.compareKnob}>⇆</span>
        </span>
      </div>
      <Caption path={`${path}.caption`} value={caption} />
    </figure>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Bild mit Hotspots
// ---------------------------------------------------------------------------------------------------------------

export interface Hotspot {
  x?: number;
  y?: number;
  title?: string;
  text?: string;
}

/** Nummerierte Markierungen im Bild; Klick/Enter öffnet die Erklärung. Darunter dieselben Punkte als Liste. */
export function Hotspots({ image, items, caption, path }: { image?: MediaRef; items: Hotspot[]; caption?: string; path: string }) {
  const t = useT();
  const uid = useId().replace(/[^\w-]/g, '');
  const [open, setOpen] = useState<number | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null);
    const onDown = (e: PointerEvent) => !wrap.current?.contains(e.target as Node) && setOpen(null);
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [open]);
  const clamp = (v?: number) => Math.min(100, Math.max(0, Number(v ?? 50)));
  return (
    <figure className={styles.box} style={{ margin: 0 }} ref={wrap}>
      <div className={styles.hotWrap}>
        <Img m={image} sizes="(min-width: 2400px) 1900px, (min-width: 900px) 1200px, 100vw" />
        {items.map((h, i) => {
          const x = clamp(h.x);
          const y = clamp(h.y);
          return (
            <span key={i}>
              <button
                type="button"
                className={styles.hotDot}
                style={{ left: `${x}%`, top: `${y}%` }}
                aria-expanded={open === i}
                aria-controls={`${uid}-${i}`}
                aria-label={`${t('w.hotspot', { n: i + 1 })}: ${h.title ?? ''}`}
                onClick={() => setOpen(open === i ? null : i)}
              >
                {i + 1}
              </button>
              {open === i && (
                <span
                  id={`${uid}-${i}`}
                  role="note"
                  className={styles.hotPop}
                  style={{
                    left: `clamp(8px, calc(${x}% - 150px), calc(100% - min(300px, 80%) - 8px))`,
                    ...(y > 55 ? { bottom: `calc(${100 - y}% + 26px)` } : { top: `calc(${y}% + 26px)` }),
                  }}
                >
                  <strong style={{ display: 'block', fontSize: 15 }}>{h.title}</strong>
                  {h.text && <span style={{ display: 'block', marginTop: 4, color: 'var(--muted)' }}>{h.text}</span>}
                </span>
              )}
            </span>
          );
        })}
      </div>
      {items.length > 0 && (
        <ol className={styles.hotList} aria-label={t('w.hotspots')}>
          {items.map((h, i) => (
            <li key={i}>
              <button type="button" className={styles.hotItem} aria-pressed={open === i} onClick={() => setOpen(open === i ? null : i)}>
                <span aria-hidden className={styles.hotNum}>
                  {i + 1}
                </span>
                <span style={{ minWidth: 0 }}>
                  <strong style={{ display: 'block', fontSize: 14 }}>
                    <EText path={`${path}.items.${i}.title`} value={h.title} />
                  </strong>
                  {h.text && (
                    <span style={{ display: 'block', fontSize: 13, lineHeight: 1.5, color: 'var(--muted)', marginTop: 2 }}>
                      <EText path={`${path}.items.${i}.text`} value={h.text} multiline />
                    </span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ol>
      )}
      <Caption path={`${path}.caption`} value={caption} />
    </figure>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Geräte-Mockup
// ---------------------------------------------------------------------------------------------------------------

const dots = (
  <span aria-hidden style={{ display: 'flex', gap: 6, flex: 'none' }}>
    {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
      <span key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
    ))}
  </span>
);

/** Eigenes Bild (Screenshot) in Browser, Laptop, Tablet oder Telefon; optional leicht geneigt (bei Hover gerade). */
export function Mockup({
  image,
  url,
  caption,
  frame,
  tilt,
  path,
}: {
  image?: MediaRef;
  url?: string;
  caption?: string;
  frame: string;
  tilt: boolean;
  path: string;
}) {
  const screen = (ratio: string, sizes: string) => (
    <div className={styles.mockScreen} style={{ aspectRatio: ratio }}>
      <Img m={image} sizes={sizes} />
    </div>
  );
  let body: ReactNode;
  if (frame === 'phone') body = <div className={styles.mockPhone}>{screen('9 / 19.5', '320px')}</div>;
  else if (frame === 'tablet') body = <div className={styles.mockTablet}>{screen('4 / 3', '(min-width: 900px) 720px, 100vw')}</div>;
  else if (frame === 'laptop')
    body = (
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className={styles.mockLaptop}>{screen('16 / 10', '(min-width: 1200px) 1100px, 100vw')}</div>
        <div aria-hidden className={styles.mockBase} />
      </div>
    );
  else
    body = (
      <div className={styles.mockBrowser}>
        <div className={styles.mockBar}>
          {dots}
          <span className={styles.mockUrl} style={{ fontFamily: mono }}>
            {url ? <EText path={`${path}.url`} value={url} /> : ' '}
          </span>
          <span aria-hidden style={{ width: 46 }} />
        </div>
        {screen('16 / 10', '(min-width: 2400px) 1900px, (min-width: 900px) 1200px, 100vw')}
      </div>
    );
  return (
    <figure className={`${styles.box} ${styles.mock}`} style={{ margin: 0 }}>
      <div className={tilt ? styles.mockTilt : undefined}>{body}</div>
      <Caption path={`${path}.caption`} value={caption} />
    </figure>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Split-Screen
// ---------------------------------------------------------------------------------------------------------------

export interface SplitStep {
  kicker?: string;
  title?: string;
  text?: string;
  image?: MediaRef;
}

/**
 * Breit: links (oder rechts) steht das Bild des aktiven Schritts, daneben scrollen die Schritte; der Schritt in der
 * Bildschirmmitte ist aktiv. Schmal: jeder Schritt mit eigenem Bild untereinander.
 */
export function Split({ items, side, path, accent }: { items: SplitStep[]; side: string; path: string; accent: string }) {
  const t = useT();
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i));
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [items.length]);
  return (
    <div className={styles.box}>
      <div className={styles.split} data-side={side} style={{ '--split-accent': accent } as CSSProperties}>
        <div className={styles.splitMedia} aria-hidden>
          <div className={styles.splitFrame}>
            {items.map((s, i) => (
              <Img key={i} m={s.image} sizes="(min-width: 2400px) 1000px, 700px" on={i === active} />
            ))}
          </div>
        </div>
        <div>
          {items.map((s, i) => (
            <div
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              data-i={i}
              data-on={String(i === active)}
              className={styles.splitStep}
            >
              <div className={styles.splitStepMedia}>
                <Img m={s.image} sizes="100vw" />
              </div>
              <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.16em', color: accent, textTransform: 'uppercase' }}>
                {s.kicker ? <EText path={`${path}.items.${i}.kicker`} value={s.kicker} /> : t('w.step', { n: i + 1, total: items.length })}
              </div>
              <h3
                style={{
                  margin: '8px 0 0',
                  fontSize: 'clamp(22px, 2.4cqi, 34px)',
                  fontWeight: 800,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.15,
                }}
              >
                <EText path={`${path}.items.${i}.title`} value={s.title} />
              </h3>
              <p
                style={{
                  margin: '12px 0 0',
                  fontSize: 'clamp(15.5px, 1.3cqi, 19px)',
                  lineHeight: 1.7,
                  color: 'var(--muted)',
                  whiteSpace: 'pre-line',
                }}
              >
                <EText path={`${path}.items.${i}.text`} value={s.text} multiline />
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
