import type { LoonaTone } from '@/components/brand/LoonaMark';
import { useSite } from './SiteProvider';

/**
 * Einstellung „Logo negativ“ (neu, nicht im Prototyp; ld-logoneg) — gilt auf Desktop und mobil.
 * Das Logo-Handoff kennt keine eigene Negativ-Fassung; „negativ“ heißt hier die jeweils andere Freigabe-Variante:
 *  - Kacheln: Farb-Kachel ↔ Ink-Kachel (Badge)
 *  - Zeichen: Standard Orange (Brand-System 2026-10: „orange (default)“ auf hellem wie dunklem Grund);
 *    negativ dunkel → Cream (Ton „cream“), hell → Ink (Ton „ink“). Vorher war hell Ink der Standard.
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
    // „Logo-Farbe: Auto“ (ld-logoauto) hat Vorrang: Farbe nach gemessenem Hintergrund (src/site/glass/logoContrast.ts).
    markTone: (theme: 'dark' | 'light'): LoonaTone | undefined =>
      settings.logoAuto ? 'auto' : neg ? (theme === 'dark' ? 'cream' : 'ink') : undefined,
  };
}
