import type { SVGAttributes } from 'react';
import { LOONA_BADGE, LOONA_PRODUCTS } from './products';

interface LetterProps extends Omit<SVGAttributes<SVGSVGElement>, 'children'> {
  /** Höhe in px. */
  size?: number;
  color?: string;
}

/** Einzelbuchstabe L des Badge-Monogramms (Brand-System, Stand 31.10.2026, assets/loona-badge.svg; viewBox 0 0 25 40). */
export function LoonaLetterL({ size = 40, color = LOONA_PRODUCTS.ld.color, ...rest }: LetterProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 25 40"
      width={(size * 25) / 40}
      height={size}
      aria-hidden
      focusable="false"
      {...rest}
    >
      <g transform="translate(0 -3)">
        <path d={LOONA_BADGE.l} fill={color} />
      </g>
    </svg>
  );
}

/** Einzelbuchstabe D des Badge-Monogramms (Ring mit Negativ-Mond; viewBox 0 0 35 40, Kontur x 12–47). */
export function LoonaLetterD({ size = 40, color = LOONA_PRODUCTS.ld.color, ...rest }: LetterProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 35 40"
      width={(size * 35) / 40}
      height={size}
      aria-hidden
      focusable="false"
      {...rest}
    >
      <g transform="translate(-12 -3)">
        <path d={LOONA_BADGE.d} fill={color} fillRule="evenodd" />
      </g>
    </svg>
  );
}
