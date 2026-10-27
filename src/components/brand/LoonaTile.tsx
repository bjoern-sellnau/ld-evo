import { useId, type SVGAttributes } from 'react';
import { LoonaGlyph } from './glyphs';
import { LOONA_BADGE, LOONA_NEUTRALS, LOONA_PRODUCTS, LOONA_ZEICHEN, badgeTransform, type LoonaProductKey } from './products';
import styles from './LoonaZeichen.module.css';

export interface LoonaTileProps extends Omit<SVGAttributes<SVGSVGElement>, 'children'> {
  product?: LoonaProductKey;
  /** 'ink' = Ink-Kachel mit Farbzeichen (= Badge), 'color' = Farb-Kachel mit Ink-Zeichen. */
  variant?: 'ink' | 'color';
  /** Kantenlänge in px. */
  size?: number;
  title?: string;
  decorative?: boolean;
  /** Nur ld: „Mondphase“ (Badge wird aktiv, 0,9 s) — der kleine Mond füllt sich in der Zeichenfarbe. */
  motion?: 'none' | 'moonphase';
  /** Vorführschleife wie im Brand Kit. */
  loop?: boolean;
}

const fmt = (n: number, digits: number) => n.toFixed(digits);

/**
 * Kachel im Badge-Format (Brand-README „2. Badge“: Quadrat 64, rx 14) für die ganze Familie — Wunsch 26.10.2026
 * „Kachelform angleichen“; vorher Squircle. ld/ink = das Badge (assets/loona-badge.svg). Die Farb-Kachel
 * (Orange-Grund) nennt der Brand-Guide ein Don't („Badge auf anderem Grund als Tinte“) — bleibt als Einstellung
 * („Logo negativ“, Favicon-/Footer-Auswahl) bewusst erhalten (Wunsch: alle Einstellungen behalten).
 */
export function LoonaTile({
  product = 'ld',
  variant = 'ink',
  size = 46,
  title,
  decorative = false,
  motion = 'none',
  loop = false,
  className,
  ...rest
}: LoonaTileProps) {
  const clip = `lt-${useId().replace(/[^\w-]/g, '')}`;
  const moon = product === 'ld' && motion === 'moonphase';
  const { color } = LOONA_PRODUCTS[product];
  const bg = variant === 'ink' ? LOONA_NEUTRALS.ink : color;
  const fg = variant === 'ink' ? color : LOONA_NEUTRALS.ink;
  const t = badgeTransform(product);
  const a11y = decorative ? { 'aria-hidden': true as const, focusable: 'false' as const } : { role: 'img' as const };
  // ld wörtlich wie im Asset („translate(9.6 8.6) scale(1.018)“), Produkte wie ihre Favicons (2 bzw. 4 Stellen).
  const transform =
    product === 'ld' ? `translate(${t.x} ${t.y}) scale(${t.scale})` : `translate(${fmt(t.x, 2)} ${fmt(t.y, 2)}) scale(${fmt(t.scale, 4)})`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${LOONA_BADGE.size} ${LOONA_BADGE.size}`}
      width={size}
      height={size}
      {...a11y}
      className={[loop && styles.loop, className].filter(Boolean).join(' ') || undefined}
      {...rest}
    >
      {!decorative && <title>{title ?? LOONA_PRODUCTS[product].name}</title>}
      <rect width={LOONA_BADGE.size} height={LOONA_BADGE.size} rx={LOONA_BADGE.rx} fill={bg} />
      {moon && (
        <defs>
          <clipPath id={clip}>
            <path d={LOONA_ZEICHEN.moon} />
          </clipPath>
        </defs>
      )}
      <g transform={transform}>
        <LoonaGlyph product={product} color={fg} />
        {moon && (
          // Brand-README „Mondphase“: im Clip auf den kleinen Mond eine Scheibe in Grundfarbe (cx 24, cy 23, r 12),
          // translateX 0 → −26. Auf der Farb-Kachel ist der Grund Orange, der Mond füllt sich dann in Tinte.
          <g clipPath={`url(#${clip})`}>
            <path d={LOONA_ZEICHEN.moon} fill={fg} />
            <circle cx="24" cy="23" r="12" fill={bg} className={styles.moon} />
          </g>
        )}
      </g>
    </svg>
  );
}
