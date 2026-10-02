import type { SVGAttributes } from 'react';
import { LoonaGlyph } from './glyphs';
import { LOONA_NEUTRALS, LOONA_PRODUCTS, LOONA_SQUIRCLE, tileTransform, type LoonaProductKey } from './products';

export interface LoonaTileProps extends Omit<SVGAttributes<SVGSVGElement>, 'children'> {
  product?: LoonaProductKey;
  /** 'ink' = Ink-Kachel mit Farbzeichen, 'color' = Farb-Kachel mit Ink-Zeichen. */
  variant?: 'ink' | 'color';
  /** Kantenlänge in px. */
  size?: number;
  title?: string;
  decorative?: boolean;
}

const fmt = (n: number, digits: number) => n.toFixed(digits);

/** Squircle-Kachel im App-Icon-Stil (README §3, §9). */
export function LoonaTile({ product = 'ld', variant = 'ink', size = 46, title, decorative = false, ...rest }: LoonaTileProps) {
  const { color } = LOONA_PRODUCTS[product];
  const bg = variant === 'ink' ? LOONA_NEUTRALS.ink : color;
  const fg = variant === 'ink' ? color : LOONA_NEUTRALS.ink;
  const t = tileTransform(product);
  const a11y = decorative ? { 'aria-hidden': true as const, focusable: 'false' as const } : { role: 'img' as const };

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 46" width={size} height={size} {...a11y} {...rest}>
      {!decorative && <title>{title ?? LOONA_PRODUCTS[product].name}</title>}
      <path d={LOONA_SQUIRCLE} fill={bg} />
      <g transform={`translate(${fmt(t.x, 2)} ${fmt(t.y, 2)}) scale(${fmt(t.scale, 4)})`}>
        <LoonaGlyph product={product} color={fg} />
      </g>
    </svg>
  );
}
