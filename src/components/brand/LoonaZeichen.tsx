import { useId, type CSSProperties, type ReactNode, type SVGAttributes } from 'react';
import { LOONA_BADGE, LOONA_GLASS, LOONA_MIN_SIZE, LOONA_PRODUCTS, LOONA_TONES, LOONA_ZEICHEN } from './products';
import styles from './LoonaZeichen.module.css';

/**
 * Töne der Kernmarke (Brand-README „Adaptives Prinzip“): Geometrie bleibt, nur Farbe/Material passt sich an.
 * 'current' = Textfarbe, 'auto' = --ld-logo-auto (Kontrastmessung der Site, src/site/glass/logoContrast.ts).
 * 'liquid' (Refraktion) ist nicht umgesetzt — nur für bewegte/farbige Gründe gedacht, die die Site nicht hat.
 */
export type LoonaZeichenTone = 'orange' | 'cream' | 'white' | 'ink' | 'glass' | 'current' | 'auto';
/** mark = Zeichen · badge = Badge · motion = Bewegtes Zeichen · motionBadge = Bewegtes Zeichen als Badge-Umkehr. */
export type LoonaVariant = 'mark' | 'badge' | 'motion' | 'motionBadge';
export type LoonaMotion = 'none' | 'sweep' | 'progress' | 'blink' | 'moonphase' | 'reveal' | 'hover';

export interface LoonaZeichenProps extends Omit<SVGAttributes<SVGSVGElement>, 'children' | 'color'> {
  variant?: LoonaVariant;
  tone?: LoonaZeichenTone;
  /** Freie Füllfarbe statt `tone` (z. B. Einstellung „Logo only negative“ mit eigener Farbe; 'auto' wie tone). */
  color?: string;
  motion?: LoonaMotion;
  /** Füllstand 0–1 (motion="progress"). */
  value?: number;
  /** Loader fertig → Crossfade (150 ms) ins Zeichen (motion sweep/blink). */
  done?: boolean;
  /** Vorführschleife wie im Brand Kit (mit Haltephasen). */
  loop?: boolean;
  /** Grund für den Ghost-Ton beim Füllstand: hell #FFE3CC, dunkel #3B2B1F. */
  ground?: 'light' | 'dark';
  /** Zeichen mit 2 Einheiten Luft wie in den Assets (viewBox 6 9 32 28) statt knapp (8 11 28 24). */
  pad?: boolean;
  /** Höhe in px (number) oder CSS-Länge. Zeichen: Höhe der Kontur; Badge: Kantenlänge. */
  size?: number | string;
  title?: string;
  decorative?: boolean;
}

const INK = LOONA_TONES.ink;
const Z = LOONA_ZEICHEN;
const B = LOONA_BADGE;
const BADGE_T = `translate(${B.transform.x} ${B.transform.y}) scale(${B.transform.scale})`;
/** Kleiner Punkt für die Ruhe-Fassung der Loader; Lage im Handoff nicht festgelegt — rechts unten wie ein Schlusspunkt. */
const DOT = { cx: 36.6, cy: 34, r: 1.4 };

function fillOf(tone: LoonaZeichenTone, color: string | undefined, glassId: string): string {
  if (color === 'auto' || (!color && tone === 'auto')) return 'var(--ld-logo-auto, #FF7816)';
  if (color) return color;
  switch (tone) {
    case 'glass':
      return `url(#${glassId})`;
    case 'current':
      return 'currentColor';
    case 'auto':
    case 'orange':
      return LOONA_TONES.orange;
    default:
      return LOONA_TONES[tone];
  }
}

/** Zeichen, Badge und Bewegtes Zeichen (Brand-README „Die vier Logo-Formen“) mit Tönen und Animationen. */
export function LoonaZeichen({
  variant = 'mark',
  tone = 'orange',
  color,
  motion = 'none',
  value = 0,
  done,
  loop = false,
  ground = 'light',
  pad = false,
  size = 24,
  title,
  decorative = false,
  className,
  style,
  ...rest
}: LoonaZeichenProps) {
  const uid = useId().replace(/[^\w-]/g, '');
  const id = (k: string) => `lz-${uid}-${k}`;
  const badge = variant === 'badge' || variant === 'motionBadge';
  const fill = fillOf(tone, color, id('glass'));
  const auto = color === 'auto' || (!color && tone === 'auto');

  if (process.env.NODE_ENV !== 'production' && typeof size === 'number' && size < (badge ? 24 : LOONA_MIN_SIZE)) {
    console.warn(`LoonaZeichen: ${size}px unterschreitet die Mindestgröße (Zeichen 16 px, Badge 24 px).`);
  }

  const [vbW, vbH] = badge ? [B.size, B.size] : pad ? [32, 28] : [Z.box.w, Z.box.h];
  const viewBox = badge ? `0 0 ${B.size} ${B.size}` : pad ? Z.viewBox : `${Z.box.x} ${Z.box.y} ${Z.box.w} ${Z.box.h}`;
  const dims: { width?: number; height?: number | string; style?: CSSProperties } =
    typeof size === 'number'
      ? { width: (size * vbW) / vbH, height: size }
      : { height: size, style: { width: 'auto', aspectRatio: `${vbW} / ${vbH}` } };
  const a11y = decorative ? { 'aria-hidden': true as const, focusable: 'false' as const } : { role: 'img' as const };
  const loader = variant === 'motion' && (motion === 'sweep' || motion === 'blink');

  const defs: ReactNode[] = [];
  if (tone === 'glass' && !color) {
    defs.push(
      <linearGradient key="g" id={id('glass')} x1="0" y1="0" x2="0" y2="1">
        {LOONA_GLASS.stops.map(([o, c]) => (
          <stop key={o} offset={o} stopColor={c} />
        ))}
      </linearGradient>,
    );
  }

  /** Zeichen: L + Mond (+ Glanz beim Glas-Ton, + Fuge/Slash beim Hover). */
  const zeichen = (key: string, extra?: ReactNode) => {
    const glass = tone === 'glass' && !color;
    if (glass)
      defs.push(
        <clipPath key={`c${key}`} id={id(`gc${key}`)}>
          <path d={Z.l} />
          <path d={Z.moon} />
        </clipPath>,
      );
    return (
      <g key={key}>
        <path d={Z.l} fill={fill} className={motion === 'reveal' ? styles.revealL : undefined} />
        <path d={Z.moon} fill={fill} className={motion === 'reveal' ? styles.revealD : undefined} />
        {glass && (
          <g clipPath={`url(#${id(`gc${key}`)})`}>
            <path d={LOONA_GLASS.gloss} fill="#FFFFFF" opacity={LOONA_GLASS.glossOpacity} transform="translate(0 4)" />
          </g>
        )}
        {extra}
      </g>
    );
  };

  let body: ReactNode;
  if (variant === 'mark' && motion === 'hover') {
    // Fuge füllt sich (Silhouette), dann schneidet der Slash als Maske hinein — nie mit Grundfarbe gefüllt.
    defs.push(
      <mask key="hm" id={id('hm')} maskUnits="userSpaceOnUse" x="0" y="0" width="48" height="48">
        <rect width="48" height="48" fill="#fff" />
        <path d={Z.slash} fill="#000" className={styles.hoverSlash} />
      </mask>,
    );
    body = (
      <g mask={`url(#${id('hm')})`}>
        {zeichen('z')}
        <path d={Z.gap} fill={fill} className={styles.gap} />
      </g>
    );
  } else if (variant === 'mark') {
    body = zeichen('z');
  } else if (variant === 'motion' && motion === 'progress') {
    const ghost = ground === 'dark' ? '#3B2B1F' : '#FFE3CC';
    defs.push(
      <clipPath key="pc" id={id('pc')}>
        <path d={Z.silhouette} />
      </clipPath>,
      <mask key="pm" id={id('pm')} maskUnits="userSpaceOnUse" x="0" y="0" width="48" height="48">
        <rect width="48" height="48" fill="#fff" />
        <path d={Z.slash} fill="#000" className={styles.progress} />
      </mask>,
    );
    body = (
      <g clipPath={`url(#${id('pc')})`}>
        <g mask={`url(#${id('pm')})`}>
          <path d={Z.silhouette} fill={ghost} />
          <path d="M-40 11H13L25 35H-40Z" fill={fill} className={styles.progress} />
        </g>
      </g>
    );
  } else if (variant === 'motion') {
    const cls = motion === 'sweep' ? styles.sweep : motion === 'blink' ? styles.blink : undefined;
    defs.push(
      <mask key="sm" id={id('sm')} maskUnits="userSpaceOnUse" x="0" y="0" width="48" height="48">
        <rect width="48" height="48" fill="#fff" />
        <path d={Z.slash} fill="#000" className={cls} />
      </mask>,
    );
    const moving = <path d={Z.silhouette} fill={fill} mask={`url(#${id('sm')})`} />;
    body = loader ? (
      <>
        <g className={`${styles.layer} ${styles.moving}`}>{moving}</g>
        {done !== undefined && <g className={`${styles.layer} ${styles.final}`}>{zeichen('f')}</g>}
        <g className={styles.still}>
          {zeichen('s')}
          <circle {...DOT} fill={fill} className={styles.dot} />
        </g>
      </>
    ) : (
      moving
    );
  } else if (variant === 'badge') {
    if (motion === 'moonphase')
      defs.push(
        <clipPath key="mc" id={id('mc')}>
          <path d={Z.moon} />
        </clipPath>,
      );
    body = (
      <>
        <rect width={B.size} height={B.size} rx={B.rx} fill={INK} />
        <g transform={BADGE_T}>
          <path d={B.l} fill={fill} />
          <path d={B.d} fill={fill} fillRule="evenodd" />
          {motion === 'moonphase' && (
            <g clipPath={`url(#${id('mc')})`}>
              <path d={Z.moon} fill={fill} />
              <circle cx="24" cy="23" r="12" fill={INK} className={styles.moon} />
            </g>
          )}
        </g>
      </>
    );
  } else {
    // Badge-Umkehr (assets/loona-bewegt-badge.svg): Ebenen in dieser Reihenfolge.
    defs.push(
      <clipPath key="hc" id={id('hc')}>
        <path d={Z.silhouette} />
      </clipPath>,
    );
    body = (
      <>
        <rect width={B.size} height={B.size} rx={B.rx} fill={INK} />
        <g transform={BADGE_T}>
          <path d={B.silhouette} fill={fill} />
          <path d={Z.silhouette} fill={INK} />
          <path d={B.slash} fill={INK} />
          <path d={B.slash} fill={fill} clipPath={`url(#${id('hc')})`} />
        </g>
      </>
    );
  }

  const cls = [loop && styles.loop, variant === 'mark' && motion === 'hover' && styles.hover, className].filter(Boolean).join(' ');
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      {...dims}
      {...a11y}
      {...(auto ? { 'data-ldlogoauto': 'fill' } : {})}
      {...(loader && done !== undefined ? { 'data-done': String(done) } : {})}
      className={cls || undefined}
      style={{
        ...dims.style,
        ...(motion === 'progress' ? ({ '--progress': Math.max(0, Math.min(1, value)) } as CSSProperties) : null),
        ...style,
      }}
      {...rest}
    >
      {!decorative && <title>{title ?? LOONA_PRODUCTS.ld.name}</title>}
      {defs.length > 0 && <defs>{defs}</defs>}
      {body}
    </svg>
  );
}
