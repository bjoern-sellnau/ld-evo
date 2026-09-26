/**
 * Loona! Designs — Logo-System (Handoff v1.0, 2026-09-20).
 * Quelle: docs/design_handoff_loona_logo/README.md §1–3, §9 und assets/manifest.json.
 * Werte 1:1 übernommen; src/styles/tokens.css spiegelt sie als --loona-* (Test: tests/unit/tokens.test.ts).
 */

export const LOONA_NEUTRALS = {
  ink: '#171310',
  cream: '#F7F2EA',
  paper: '#FAF7F2',
  mutedDark: '#B3A78F',
  mutedLight: '#6E6455',
  sand: '#E8DCC4',
} as const;

export type LoonaProductKey = 'ld' | 'flow' | 'nova' | 'buddy' | 'ivy';

export interface LoonaProduct {
  key: LoonaProductKey;
  /** Produktname laut manifest.json (Default für <title>). */
  name: string;
  /** Zeichenbreite W im 40er-Raster (viewBox "0 0 W 40"). */
  width: number;
  /** Produktfarbe (Zeichen, Punkt/„!“ auf dunkel). */
  color: string;
  /** Deep-Variante für Punkt/„!“ auf hellem Grund. */
  deep: string;
  /** Unterzeile des Lockups. */
  tagline: string;
}

export const LOONA_PRODUCTS: Record<LoonaProductKey, LoonaProduct> = {
  ld: { key: 'ld', name: 'Loona! Designs', width: 44, color: '#FF7816', deep: '#C2410C', tagline: 'plattform · beyond' },
  flow: { key: 'flow', name: 'LD Flow.', width: 49, color: '#A78BFA', deep: '#6D28D9', tagline: 'cms · loona! designs' },
  nova: { key: 'nova', name: 'LD Nova.', width: 40, color: '#38BDF8', deep: '#0369A1', tagline: 'design system · loona! designs' },
  buddy: { key: 'buddy', name: 'LD Buddy.', width: 24, color: '#F472B6', deep: '#BE185D', tagline: 'app · loona! designs' },
  ivy: { key: 'ivy', name: 'LD Ivy.', width: 40, color: '#3DDC84', deep: '#15803D', tagline: 'evergreen · loona! designs' },
};

export const LOONA_PRODUCT_KEYS = Object.keys(LOONA_PRODUCTS) as LoonaProductKey[];

/** Rasterhöhe aller Zeichen. */
export const LOONA_GRID_HEIGHT = 40;
/** Mindesthöhe eines Zeichens in px (README §1). */
export const LOONA_MIN_SIZE = 16;
/** Schutzraum rundum als Anteil der Zeichenhöhe. */
export const LOONA_CLEARSPACE = 0.25;

/** Squircle-Kachel, viewBox 0 0 46 46 (README §3). */
export const LOONA_SQUIRCLE = 'M23 0C40 0 46 6 46 23S40 46 23 46 0 40 0 23 6 0 23 0Z';

/** Zeichen in der Kachel: scale = min(0.62, 27/W), zentriert (README §9). */
export function tileTransform(product: LoonaProductKey): { x: number; y: number; scale: number } {
  const w = LOONA_PRODUCTS[product].width;
  const scale = Math.min(0.62, 27 / w);
  // Pfade liegen im 46er-System (sichtbar y 3–43) → −3·scale ausgleichen.
  return {
    x: (46 - w * scale) / 2,
    y: (46 - LOONA_GRID_HEIGHT * scale) / 2 - 3 * scale,
    scale,
  };
}
