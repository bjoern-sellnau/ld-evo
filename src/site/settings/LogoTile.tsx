'use client';

import type { CSSProperties } from 'react';
import { LoonaNegative, LoonaTile } from '@/components/brand';
import { useSite } from './SiteProvider';
import { useLogo } from './useLogo';

/**
 * LD-Kachel der Site mit den Logo-Einstellungen:
 *  - „Logo negativ“ (ld-logoneg): Farb- ↔ Ink-Kachel bzw. Zeichen in der Gegenfarbe (useLogo)
 *  - „Logo only negative“ (ld-logobare): nur der Negativraum des Monogramms (L + D, ohne Spalt und Fuge) in der
 *    gewählten Farbe (ld-lognegcolor, auch „auto“), mittig in derselben Fläche — das Layout verschiebt sich nicht.
 *  - „Logo-Farbe: Auto“ (ld-logoauto): beide Kacheln liegen im DOM, die Kontrastmessung (src/site/glass/logoContrast.ts)
 *    blendet per data-tone die sichtbarere ein; bis zur ersten Messung gilt die gewünschte Variante (data-want).
 */
export function LogoTile({ variant, size, style }: { variant: 'ink' | 'color'; size: number; style?: CSSProperties }) {
  const { settings } = useSite();
  const logo = useLogo();
  if (!settings.logoBare && settings.logoAuto)
    return (
      <span
        aria-hidden
        className="ld-autotile"
        data-ldlogoauto="tile"
        data-want={logo.tile(variant)}
        style={{ width: size, height: size, ...style }}
      >
        <LoonaTile product="ld" variant="color" size={size} decorative data-v="color" />
        <LoonaTile product="ld" variant="ink" size={size} decorative data-v="ink" />
      </span>
    );
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
