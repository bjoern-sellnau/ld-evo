import type { CSSProperties, HTMLAttributes } from 'react';
import { LoonaMark } from './LoonaMark';
import { LOONA_PRODUCTS, type LoonaProductKey } from './products';
import styles from './LoonaLockup.module.css';

export interface LoonaLockupProps extends HTMLAttributes<HTMLSpanElement> {
  product?: LoonaProductKey;
  /** 'dark' = für dunklen Grund (Farbzeichen, Cream-Text); 'light' = für hellen Grund (Ink-Zeichen, Ink-Text). */
  theme?: 'dark' | 'light';
  /** Zeichenhöhe in px; Typo und Abstand skalieren proportional. */
  markSize?: number;
  /** 'mark' = nur das Zeichen (z. B. Navbar mobil). */
  variant?: 'full' | 'mark';
}

/**
 * Zeichen + Wortmarke. Proportionen aus assets/family/<key>/lockup-*.svg (Mark 40 → 22 px / 10 px, Abstand 16 px):
 * gap 0.4·m, Zeile 1 0.55·m, Zeile 2 0.25·m.
 */
export function LoonaLockup({
  product = 'ld',
  theme = 'dark',
  markSize = 40,
  variant = 'full',
  className,
  style,
  ...rest
}: LoonaLockupProps) {
  const p = LOONA_PRODUCTS[product];
  const accent = theme === 'dark' ? p.color : p.deep;
  const name = p.name.replace(/\.$/, '');

  if (variant === 'mark') {
    return <LoonaMark product={product} size={markSize} tone={theme === 'dark' ? 'color' : 'ink'} />;
  }

  return (
    <span
      {...rest}
      className={[styles.lockup, className].filter(Boolean).join(' ')}
      data-theme={theme}
      style={{ '--loona-m': `${markSize}px`, '--loona-accent': accent, ...style } as CSSProperties}
    >
      {/* overflow visible wie in lockup-*.svg: das gedrehte Ivy-Blatt ragt über seine 40er-Box hinaus. */}
      <LoonaMark
        product={product}
        size={markSize}
        tone={theme === 'dark' ? 'color' : 'ink'}
        decorative
        overflow="visible"
        style={{ flexShrink: 0 }}
      />
      <span className={styles.text}>
        <span className={styles.wordmark}>
          {product === 'ld' ? (
            <>
              loona<span className={styles.accent}>!</span> designs
            </>
          ) : (
            <>
              {name}
              <span className={styles.accent}>.</span>
            </>
          )}
        </span>
        <span className={styles.tagline}>{p.tagline}</span>
      </span>
    </span>
  );
}
