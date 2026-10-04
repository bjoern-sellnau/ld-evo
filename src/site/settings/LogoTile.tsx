'use client';

import type { CSSProperties } from 'react';
import { LoonaMark, LoonaTile } from '@/components/brand';
import { useSite } from './SiteProvider';
import { useLogo } from './useLogo';

/**
 * LD-Kachel der Site mit den Logo-Einstellungen:
 *  - „Logo negativ“ (ld-logoneg): Farb- ↔ Ink-Kachel bzw. Zeichen in der Gegenfarbe (useLogo)
 *  - „Logo only negative“ (ld-logobare): nur das LD — die Füllung ohne Kachel, mittig in derselben Fläche
 *    (Zeichen ≈ 78 % der Kachelhöhe, gleiche Proportion wie in tile-*.svg), damit sich das Layout nicht verschiebt.
 */
export function LogoTile({ variant, size, style }: { variant: 'ink' | 'color'; size: number; style?: CSSProperties }) {
  const { settings } = useSite();
  const logo = useLogo();
  if (!settings.logoBare) return <LoonaTile product="ld" variant={logo.tile(variant)} size={size} decorative style={style} />;
  const tone = logo.markTone(settings.theme) ?? (settings.theme === 'dark' ? 'color' : 'ink');
  return (
    <span
      aria-hidden
      style={{ ...style, width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}
    >
      <LoonaMark product="ld" size={Math.round(size * 0.78)} tone={tone} decorative />
    </span>
  );
}
