import type { SVGAttributes } from 'react';
import { LoonaZeichen } from './LoonaZeichen';

/**
 * „Negativ-Logo“ der Site-Einstellung „Logo only negative (nur LD)“: der Negativraum des Badges — seit dem
 * Brand-System 2026-10 das Primärzeichen selbst (docs/design_handoff_loona_brand, assets/loona-zeichen.svg,
 * Radius 1 an vier Außenecken). viewBox knapp auf die Kontur (x 8–36, y 11–35), Höhe = size.
 * color="auto": Füllung aus der CSS-Variable --ld-logo-auto (setzt die Site nach Kontrastmessung, Fallback Orange).
 */
export function LoonaNegative({
  size = 24,
  color = '#FF7816',
  title,
  decorative = false,
  ...rest
}: Omit<SVGAttributes<SVGSVGElement>, 'color'> & { size?: number; color?: string; title?: string; decorative?: boolean }) {
  return <LoonaZeichen size={size} color={color} title={title} decorative={decorative} {...rest} />;
}
