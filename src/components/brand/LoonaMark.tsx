import type { CSSProperties, SVGAttributes } from 'react';
import { LoonaGlyph } from './glyphs';
import { LOONA_GRID_HEIGHT, LOONA_MIN_SIZE, LOONA_NEUTRALS, LOONA_PRODUCTS, type LoonaProductKey } from './products';

/** 'auto': Farbe aus --ld-logo-auto (setzt die Site nach Kontrastmessung, Fallback Produktfarbe). */
export type LoonaTone = 'color' | 'ink' | 'cream' | 'current' | 'auto';

export interface LoonaMarkProps extends Omit<SVGAttributes<SVGSVGElement>, 'children' | 'color'> {
  product?: LoonaProductKey;
  /** Höhe in px (number) oder CSS-Länge; Breite = Höhe · W / 40. */
  size?: number | string;
  tone?: LoonaTone;
  /** Zugänglicher Name; Default = Produktname. */
  title?: string;
  /** Rein dekorativ → aria-hidden, kein <title>. */
  decorative?: boolean;
}

export function toneColor(product: LoonaProductKey, tone: LoonaTone): string {
  switch (tone) {
    case 'color':
      return LOONA_PRODUCTS[product].color;
    case 'ink':
      return LOONA_NEUTRALS.ink;
    case 'cream':
      return LOONA_NEUTRALS.cream;
    case 'current':
      return 'currentColor';
    case 'auto':
      return `var(--ld-logo-auto, ${LOONA_PRODUCTS[product].color})`;
  }
}

export function LoonaMark({ product = 'ld', size = 40, tone = 'color', title, decorative = false, style, ...rest }: LoonaMarkProps) {
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
