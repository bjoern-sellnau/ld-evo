import type { ReactElement } from 'react';
import type { LoonaProductKey } from './products';

/**
 * Zeichen-Geometrie im 46er-Koordinatensystem (sichtbar y 3–43), exakt aus
 * README §1 / §9 bzw. assets/ld-mark.svg und assets/family/*. Nicht runden.
 */
export function LoonaGlyph({ product, color }: { product: LoonaProductKey; color: string }): ReactElement {
  switch (product) {
    case 'ld':
      return (
        <>
          <path d="M0 3H8V35H19L22 43H0Z" fill={color} />
          <path d="M11 3H24A20 20 0 0 1 24 43H25L19 27H16V11H11ZM21 11H24A12 12 0 0 1 24 35L21 27Z" fill={color} fillRule="evenodd" />
        </>
      );
    case 'flow':
      return (
        <>
          <g transform="translate(14.125 0) skewX(-20.556)">
            <path d="M30 7H26A8 8 0 0 0 18 15V31A8 8 0 0 1 10 39H6" fill="none" stroke={color} strokeWidth={8} />
            <path d="M8 23H18" fill="none" stroke={color} strokeWidth={8} />
          </g>
          {/* Punkt bewusst nicht geschert */}
          <circle cx="35.5" cy="23" r="4" fill={color} />
        </>
      );
    case 'nova':
      return <path d="M20 3L24 19L40 23L24 27L20 43L16 27L0 23L16 19Z" fill={color} />;
    case 'buddy':
      return <path d="M0 3H8V11A16 16 0 0 1 8 43H0ZM8 19A8 8 0 0 1 8 35Z" fill={color} fillRule="evenodd" />;
    case 'ivy':
      return (
        <path
          d="M20 3C29 14 40 20 40 27A20 20 0 0 1 0 27C0 20 11 14 20 3Z"
          fill={color}
          transform="translate(1.5 -2.5) rotate(-38 20 23)"
        />
      );
  }
}
