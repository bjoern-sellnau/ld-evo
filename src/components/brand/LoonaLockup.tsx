import type { CSSProperties, HTMLAttributes } from 'react';
import { LoonaMark, type LoonaTone } from './LoonaMark';
import { LoonaZeichen } from './LoonaZeichen';
import { LOONA_PRODUCTS, type LoonaProductKey } from './products';
import styles from './LoonaLockup.module.css';

/** Unterzeile der Wortmarke laut Brand-README („Wortmarke“). */
export const LOONA_TAGLINE = 'Bjoern Sellnau · Senior Fullstack & Software Engineer · React, Mobile, TypeScript';

export interface LoonaLockupProps extends HTMLAttributes<HTMLSpanElement> {
  product?: LoonaProductKey;
  /** 'dark' = für dunklen Grund (Cream-Text); 'light' = für hellen Grund (Ink-Text). */
  theme?: 'dark' | 'light';
  /** Zeichenhöhe in px; Typo und Abstand skalieren proportional. */
  markSize?: number;
  /** 'mark' = nur das Zeichen (z. B. Navbar mobil). */
  variant?: 'full' | 'mark';
  /** Ton des Zeichens überschreiben (z. B. Negativ-Variante der Site); Default aus `theme`. */
  tone?: LoonaTone;
  /** Einstellung „Logo only negative“: Zeichen in dieser Farbe (auch 'auto'). */
  negativeColor?: string;
  /** Nur ld: Unterzeile (JetBrains Mono); true = Text aus dem Brand-README. */
  tagline?: boolean | string;
  /** Nur ld: Animation des Zeichens — 'hover' (Zeichen → Bewegtes Zeichen bei Hover/Fokus des Links) oder 'reveal'. */
  motion?: 'none' | 'hover' | 'reveal';
}

/**
 * Zeichen + Wortmarke.
 * - ld (Brand-System 2026-10, Brand Guide S. 07): Zeichen links, „loona! designs“ einzeilig in Manrope 800/500,
 *   −0,035 em, einfarbig in Textfarbe (das „!“ ist Teil des Namens, nie gefärbt). Maße aus S. 07: Zeichen-Kontur
 *   69 px hoch zu 64 px Schrift, Abstand 26 px + 2 Einheiten Luft der SVG-Box — als Anteil der Zeichenhöhe m.
 *   Das Zeichen ist Orange auf hellem wie dunklem Grund (Ton „orange (default)“).
 * - Produkte (Logo-Handoff, assets/family/<key>/lockup-*.svg): „LD Flow.“ / „cms · loona! designs“ — 0.4·m,
 *   0.55·m, 0.25·m in Space Grotesk, unverändert.
 */
export function LoonaLockup({
  product = 'ld',
  theme = 'dark',
  markSize = 40,
  variant = 'full',
  tone,
  negativeColor,
  tagline,
  motion = 'none',
  className,
  style,
  ...rest
}: LoonaLockupProps) {
  const p = LOONA_PRODUCTS[product];
  const accent = theme === 'dark' ? p.color : p.deep;
  const name = p.name.replace(/\.$/, '');
  const core = product === 'ld';
  const markTone = tone ?? (core || theme === 'dark' ? 'color' : 'ink');

  if (core) {
    const mark = (decorative: boolean) =>
      negativeColor ? (
        <LoonaZeichen size={markSize} color={negativeColor} motion={motion} decorative={decorative} style={{ flexShrink: 0 }} />
      ) : (
        <LoonaMark size={markSize} tone={markTone} motion={motion} decorative={decorative} style={{ flexShrink: 0 }} />
      );
    if (variant === 'mark') return mark(false);
    const tag = tagline === true ? LOONA_TAGLINE : tagline || undefined;
    return (
      <span
        {...rest}
        className={[styles.word, className].filter(Boolean).join(' ')}
        data-theme={theme}
        style={{ '--loona-m': `${markSize}px`, ...style } as CSSProperties}
      >
        {mark(true)}
        <span className={styles.wordText}>
          <span className={styles.wordName}>
            loona! <span className={styles.wordLight}>designs</span>
          </span>
          {tag && <span className={styles.wordTag}>{tag}</span>}
        </span>
      </span>
    );
  }

  if (variant === 'mark') return <LoonaMark product={product} size={markSize} tone={markTone} />;

  return (
    <span
      {...rest}
      className={[styles.lockup, className].filter(Boolean).join(' ')}
      data-theme={theme}
      style={{ '--loona-m': `${markSize}px`, '--loona-accent': accent, ...style } as CSSProperties}
    >
      {/* overflow visible wie in lockup-*.svg: das gedrehte Ivy-Blatt ragt über seine 40er-Box hinaus. */}
      <LoonaMark product={product} size={markSize} tone={markTone} decorative overflow="visible" style={{ flexShrink: 0 }} />
      <span className={styles.text}>
        <span className={styles.wordmark}>
          {name}
          <span className={styles.accent}>.</span>
        </span>
        <span className={styles.tagline}>{p.tagline}</span>
      </span>
    </span>
  );
}
