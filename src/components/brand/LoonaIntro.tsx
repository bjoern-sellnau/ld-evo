import { useId, type AnimationEventHandler, type SVGAttributes } from 'react';
import { LOONA_TONES, LOONA_ZEICHEN } from './products';
import styles from './LoonaIntro.module.css';

/** Farben des Alt-Logos — nur für die Transformation (Brand-README „Design Tokens“). */
const SKY = '#9CC8F2';
const NAVY = '#0B2A4A';
const O = LOONA_TONES.orange;
const INK = LOONA_TONES.ink;
const WHITE = LOONA_TONES.white;

interface IntroProps extends Omit<SVGAttributes<SVGSVGElement>, 'children' | 'onAnimationEnd'> {
  /** Kantenlänge in px. */
  size?: number;
  /** Vorführschleife (Kit 8a). */
  loop?: boolean;
  /** Ende der Transformation (letzte Ebene: L). Nur in Client-Komponenten übergeben. */
  onDone?: () => void;
}

/**
 * Transformation Alt → Neu (Brand-README, Kit 8a), viewBox 0 0 48 48 auf Tinte: Glaskugel mit Sichel (Alt-Logo,
 * reference/alt-logo-*.svg) → Linienring + Scheibe in Orange → Sichel wendet sich zum Halbmond → Mond des Zeichens
 * → L kommt von links. Endbild: Zeichen. Im Kit liegt das Zeichen um (2, 1) versetzt (mittig im 48er-Feld).
 */
export function IntroTransform({ size = 168, loop = false, onDone, title, ...rest }: IntroProps & { title?: string }) {
  const done: AnimationEventHandler<SVGPathElement> | undefined = onDone ? () => onDone() : undefined;
  const ring = `loona-intro-${useId().replace(/[^\w-]/g, '')}`;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width={size} height={size} role="img" {...rest}>
      <title>{title ?? 'Loona! Designs'}</title>
      <defs>
        <radialGradient id={ring} cx="0.5" cy="0.42" r="0.6">
          <stop offset="0" stopColor={SKY} />
          <stop offset="1" stopColor={NAVY} />
        </radialGradient>
      </defs>
      <g className={styles.intro} data-loop={loop || undefined}>
        <circle cx="24" cy="24" r="21" fill={`url(#${ring})`} className={styles.ringBlue} />
        <circle cx="24" cy="24" r="21" fill="none" stroke={O} strokeWidth={1.2} className={styles.ringO} />
        <circle cx="26" cy="24" r="12" fill={WHITE} className={styles.discW} />
        <circle cx="26" cy="24" r="12" fill={O} className={styles.discO} />
        <circle cx="26" cy="24" r="10.5" fill={INK} className={styles.cover} />
        <ellipse cx="28" cy="19.5" rx="5.5" ry="2.4" fill={WHITE} className={styles.gloss} />
        <path d={LOONA_ZEICHEN.moon} transform="translate(2 1)" fill={O} className={styles.moon} />
        <path d={LOONA_ZEICHEN.l} transform="translate(2 1)" fill={O} className={styles.l} onAnimationEnd={done} />
      </g>
    </svg>
  );
}

/**
 * Slash-Wipe (Brand-README, viewBox 0 0 48 30): Orange Fläche `M-60 0H-10L5 30H-60Z` wandert über den Inhalt.
 * Als Bild/Vorführung; der echte Seitenwechsel läuft über src/site/vt/slashWipe.ts (wartet auf die neue Seite).
 */
export function SlashWipe({
  active = false,
  loop = false,
  children,
  ...rest
}: SVGAttributes<SVGSVGElement> & { active?: boolean; loop?: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 30" aria-hidden focusable="false" {...rest}>
      {children}
      <path d="M-60 0H-10L5 30H-60Z" fill={O} className={styles.wipe} data-active={String(active)} data-loop={loop || undefined} />
    </svg>
  );
}
