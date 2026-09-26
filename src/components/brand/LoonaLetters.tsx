import type { SVGAttributes } from 'react';
import { LOONA_PRODUCTS } from './products';

interface LetterProps extends Omit<SVGAttributes<SVGSVGElement>, 'children'> {
  /** Höhe in px. */
  size?: number;
  color?: string;
}

/** Einzelbuchstabe L des Monogramms (assets/l.svg, viewBox 0 0 22 40). */
export function LoonaLetterL({ size = 40, color = LOONA_PRODUCTS.ld.color, ...rest }: LetterProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 40" width={(size * 22) / 40} height={size} aria-hidden focusable="false" {...rest}>
      <g transform="translate(0 -3)">
        <path d="M0 3H8V35H19L22 43H0Z" fill={color} />
      </g>
    </svg>
  );
}

/** Einzelbuchstabe D des Monogramms (assets/d.svg, viewBox 0 0 33 40). */
export function LoonaLetterD({ size = 40, color = LOONA_PRODUCTS.ld.color, ...rest }: LetterProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33 40" width={(size * 33) / 40} height={size} aria-hidden focusable="false" {...rest}>
      <g transform="translate(-11 -3)">
        <path
          d="M11 3H24A20 20 0 0 1 24 43H25L19 27H16V11H11ZM21 11H24A12 12 0 0 1 24 35L21 27Z"
          fill={color}
          fillRule="evenodd"
        />
      </g>
    </svg>
  );
}
