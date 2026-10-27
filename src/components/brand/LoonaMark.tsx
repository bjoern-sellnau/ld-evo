import type { CSSProperties, SVGAttributes } from 'react';
import { LoonaGlyph } from './glyphs';
import { LOONA_GRID_HEIGHT, LOONA_MIN_SIZE, LOONA_NEUTRALS, LOONA_PRODUCTS, LOONA_TONES, type LoonaProductKey } from './products';
import { LoonaZeichen, type LoonaMotion, type LoonaVariant, type LoonaZeichenTone } from './LoonaZeichen';

/**
 * 'auto': Farbe aus --ld-logo-auto (setzt die Site nach Kontrastmessung, Fallback Produktfarbe).
 * orange/white/glass: Töne der Kernmarke (Brand-README „Adaptives Prinzip“); für Produkte = Farbe bzw. Weiß.
 */
export type LoonaTone = 'color' | 'orange' | 'ink' | 'cream' | 'white' | 'glass' | 'current' | 'auto';

export interface LoonaMarkProps extends Omit<SVGAttributes<SVGSVGElement>, 'children' | 'color'> {
  product?: LoonaProductKey;
  /** Höhe in px (number) oder CSS-Länge; Breite = Höhe · W / 40. */
  size?: number | string;
  tone?: LoonaTone;
  /** Zugänglicher Name; Default = Produktname. */
  title?: string;
  /** Rein dekorativ → aria-hidden, kein <title>. */
  decorative?: boolean;
  /** Nur ld: Form (Zeichen, Badge, Bewegtes Zeichen, Badge-Umkehr) und Animation (LoonaZeichen). */
  variant?: LoonaVariant;
  motion?: LoonaMotion;
  /** Nur ld, motion="progress": Füllstand 0–1. */
  value?: number;
  /** Nur ld: Vorführschleife wie im Brand Kit. */
  loop?: boolean;
}

export function toneColor(product: LoonaProductKey, tone: LoonaTone): string {
  switch (tone) {
    case 'color':
    case 'glass':
      return LOONA_PRODUCTS[product].color;
    case 'orange':
      return LOONA_TONES.orange;
    case 'white':
      return LOONA_TONES.white;
    case 'ink':
      return LOONA_NEUTRALS.ink;
    case 'cream':
      return product === 'ld' ? LOONA_TONES.cream : LOONA_NEUTRALS.cream;
    case 'current':
      return 'currentColor';
    case 'auto':
      return `var(--ld-logo-auto, ${LOONA_PRODUCTS[product].color})`;
  }
}

/** ld-Töne der Site auf die Töne der Kernmarke abbilden ('color' = Orange). */
const zeichenTone = (tone: LoonaTone): LoonaZeichenTone => (tone === 'color' ? 'orange' : tone);

/**
 * Zeichen einer Marke. ld = das Zeichen des Brand-Systems 2026-10 (kleines LD, Radius 1; viewBox knapp 8 11 28 24,
 * Breite = Höhe · 28/24) — vorher das große Monogramm, das jetzt im Badge steckt. Produkte: 40er-Raster wie bisher.
 */
export function LoonaMark({
  product = 'ld',
  size = 40,
  tone = 'color',
  title,
  decorative = false,
  style,
  variant,
  motion,
  value,
  loop,
  ...rest
}: LoonaMarkProps) {
  if (product === 'ld')
    return (
      <LoonaZeichen
        size={size}
        tone={zeichenTone(tone)}
        title={title}
        decorative={decorative}
        style={style}
        variant={variant}
        motion={motion}
        value={value}
        loop={loop}
        {...rest}
      />
    );
  const w = LOONA_PRODUCTS[product].width;

  if (process.env.NODE_ENV !== 'production' && typeof size === 'number' && size < LOONA_MIN_SIZE) {
    console.warn(`LoonaMark: size ${size}px unterschreitet die Mindestgröße von ${LOONA_MIN_SIZE}px.`);
  }

  const dims: { width?: number; height?: number | string; style?: CSSProperties } =
    typeof size === 'number'
      ? { width: (size * w) / LOONA_GRID_HEIGHT, height: size, style }
      : { height: size, style: { width: 'auto', aspectRatio: `${w} / ${LOONA_GRID_HEIGHT}`, ...style } };

  const a11y = decorative ? { 'aria-hidden': true as const, focusable: 'false' as const } : { role: 'img' as const };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${w} ${LOONA_GRID_HEIGHT}`}
      {...dims}
      {...a11y}
      {...(tone === 'auto' ? { 'data-ldlogoauto': 'fill' } : {})}
      {...rest}
    >
      {!decorative && <title>{title ?? LOONA_PRODUCTS[product].name}</title>}
      <g transform="translate(0 -3)">
        <LoonaGlyph product={product} color={toneColor(product, tone)} />
      </g>
    </svg>
  );
}
