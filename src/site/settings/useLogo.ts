import type { LoonaTone } from '@/components/brand/LoonaMark';
import { useSite } from './SiteProvider';

/**
 * Einstellung „Logo negativ“ (neu, nicht im Prototyp; ld-logoneg) — gilt auf Desktop und mobil.
 * Das Logo-Handoff kennt keine eigene Negativ-Fassung; „negativ“ heißt hier die jeweils andere Freigabe-Variante:
 *  - Kacheln: Farb-Kachel ↔ Ink-Kachel (tile-color.svg / tile-ink.svg)
 *  - Zeichen: dunkel Orange → Cream (mark-cream), hell Ink → Orange
 */
export function useLogo() {
  const { settings } = useSite();
  const neg = settings.logoNeg;
  return {
    neg,
    /** Negativ-Logo aktiv → dessen Farbe, sonst undefined (Lockup zeigt dann das normale Zeichen). */
    negativeColor: settings.logoBare ? settings.logoNegColor : undefined,
    tile: (v: 'ink' | 'color'): 'ink' | 'color' => (neg ? (v === 'ink' ? 'color' : 'ink') : v),
    /** Ton des Zeichens im Lockup (undefined = Standard aus dem Theme). */
    markTone: (theme: 'dark' | 'light'): LoonaTone | undefined => (neg ? (theme === 'dark' ? 'cream' : 'color') : undefined),
  };
}
