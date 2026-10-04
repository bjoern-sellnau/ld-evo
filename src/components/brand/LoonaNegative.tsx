import type { SVGAttributes } from 'react';

/**
 * Negativ-Logo: nur der Negativraum des LD-Monogramms — das L (Kanal) und das D (Counter) als gefüllte Formen,
 * OHNE Spalt oben und Fuge unten. Pfade 1:1 aus assets/negative-space-demo.svg (Logo-Handoff, README §1
 * „Negativraum“). viewBox auf die beiden Formen zugeschnitten (x 8–36, y 11–35 im 46er-System).
 * color="auto": Füllung aus der CSS-Variable --ld-logo-auto (setzt die Site nach Kontrastmessung, Fallback Orange).
 */
export function LoonaNegative({
  size = 24,
  color = '#FF7816',
  title,
  decorative = false,
  ...rest
}: Omit<SVGAttributes<SVGSVGElement>, 'color'> & { size?: number; color?: string; title?: string; decorative?: boolean }) {
  const a11y = decorative ? { 'aria-hidden': true as const, focusable: 'false' as const } : { role: 'img' as const };
  const auto = color === 'auto';
  if (auto) color = 'var(--ld-logo-auto, #FF7816)';
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="8 11 28 24"
      height={size}
      width={(size * 28) / 24}
      {...a11y}
      {...(auto ? { 'data-ldlogoauto': 'fill' } : {})}
      {...rest}
    >
      {!decorative && <title>{title ?? 'Loona! Designs'}</title>}
      <path d="M8 11H16V27H19L22 35H8Z" fill={color} />
      <path d="M21 11H24A12 12 0 0 1 24 35L21 27Z" fill={color} />
    </svg>
  );
}
