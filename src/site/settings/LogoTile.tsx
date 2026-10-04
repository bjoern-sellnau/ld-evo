'use client';

import type { CSSProperties } from 'react';
import { LoonaNegative, LoonaTile } from '@/components/brand';
import { useSite } from './SiteProvider';
import { useLogo } from './useLogo';

/**
 * LD-Kachel der Site mit den Logo-Einstellungen:
 *  - „Logo negativ“ (ld-logoneg): Farb- ↔ Ink-Kachel bzw. Zeichen in der Gegenfarbe (useLogo)
 *  - „Logo only negative“ (ld-logobare): nur der Negativraum des Monogramms (L + D, ohne Spalt und Fuge) in der
 *    gewählten Farbe (ld-lognegcolor), mittig in derselben Fläche — das Layout verschiebt sich nicht.
 */
export function LogoTile({ variant, size, style }: { variant: 'ink' | 'color'; size: number; style?: CSSProperties }) {
  const { settings } = useSite();
  const logo = useLogo();
  if (!settings.logoBare) return <LoonaTile product="ld" variant={logo.tile(variant)} size={size} decorative style={style} />;
  return (
    <span
      aria-hidden
      style={{ ...style, width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}
    >
      <LoonaNegative size={Math.round(size * 0.6)} color={settings.logoNegColor} decorative />
    </span>
  );
}
