/**
 * Loona! Designs — Logo-System.
 * Kernmarke (ld): Brand-System 2026-10 — docs/design_handoff_loona_brand/README.md (Zeichen, Badge, Bewegtes Zeichen,
 * Töne). Produktfamilie (flow, nova, buddy, ivy), Farben und Neutrale: Handoff v1.0 (2026-09-20) —
 * docs/design_handoff_loona_logo/README.md §1–3, §9 und assets/manifest.json.
 * Werte 1:1 übernommen; src/styles/tokens.css spiegelt die Farben als --loona-* (Test: tests/unit/tokens.test.ts).
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
  // width 44 = großes LD im Badge (46er-System); das Zeichen selbst ist 28 × 24 (LOONA_ZEICHEN).
  ld: { key: 'ld', name: 'Loona! Designs', width: 44, color: '#FF7816', deep: '#C2410C', tagline: 'designs' },
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

/**
 * Zeichen (Primärlogo, Brand-README „1. Zeichen“): L + Mond, Radius 1 an vier Außenecken, Fuge und Unterkante scharf.
 * Dazu die Formen des Bewegten Zeichens („3.“) und die Fuge für den Hover („Animationen“). Pfade final, nicht runden.
 */
export const LOONA_ZEICHEN = {
  /** viewBox der Assets inkl. 2 Einheiten Luft rundum (assets/loona-zeichen.svg). */
  viewBox: '6 9 32 28',
  /** Kontur ohne Luft: x 8–36, y 11–35. */
  box: { x: 8, y: 11, w: 28, h: 24 },
  l: 'M8 12A1 1 0 0 1 9 11L15 11A1 1 0 0 1 16 12L16 27L19 27L22 35L9 35A1 1 0 0 1 8 34Z',
  moon: 'M21 12A1 1 0 0 1 22 11H24A12 12 0 0 1 24 35L21 27Z',
  /** Silhouette = Zeichen ohne Fuge (nie statisch als Logo). */
  silhouette: 'M8 12A1 1 0 0 1 9 11H24A12 12 0 0 1 24 35H9A1 1 0 0 1 8 34Z',
  /** Slash, immer als Ausschnitt (transparent). */
  slash: 'M13 11H16.5L28.5 35H25Z',
  /** Fuge zwischen L und Mond (Hover: füllt sich von oben). */
  gap: 'M16 11H21V27L24 35H22L19 27H16Z',
} as const;

/**
 * Badge (Brand-README „2. Badge“): großes LD auf Tinte, der Negativraum ist das Zeichen. viewBox 0 0 64 64, rx 14.
 * Dazu die Ebenen der Badge-Umkehr („4.“). Pfade im 46er-System (sichtbar y 3–43) wie die Familien-Glyphen.
 */
export const LOONA_BADGE = {
  size: 64,
  rx: 14,
  /** Zentriert das LD im Quadrat. */
  transform: { x: 9.6, y: 8.6, scale: 1.018 },
  l: 'M0 4A1 1 0 0 1 1 3L7 3A1 1 0 0 1 8 4L8 34A1 1 0 0 0 9 35L19 35L22 43L1 43A1 1 0 0 1 0 42Z',
  /** fill-rule evenodd (Mond mit Negativraum). */
  d: 'M11 4A1 1 0 0 1 12 3H24A20 20 0 0 1 24 43H25L19 27H16V12A1 1 0 0 0 15 11H11ZM21 12A1 1 0 0 1 22 11H24A12 12 0 0 1 24 35L21 27Z',
  silhouette: 'M0 4A1 1 0 0 1 1 3H24A20 20 0 0 1 24 43H1A1 1 0 0 1 0 42Z',
  slash: 'M9 3H12.5L32.5 43H29Z',
} as const;

/** Töne der Kernmarke (Brand-README „Adaptives Prinzip“). Creme der Marke weicht minimal vom Site-Creme ab. */
export const LOONA_TONES = {
  orange: '#FF7816',
  cream: '#F6F1E8',
  white: '#FFFFFF',
  ink: '#171310',
} as const;

/** Glas-Ton (assets/loona-zeichen-glas.svg): vertikaler Verlauf + weiße Glanz-Ellipse 32 %, ab 48 px, nur digital. */
export const LOONA_GLASS = {
  stops: [
    [0, '#FFB366'],
    [0.55, '#FF7816'],
    [1, '#FF4D1C'],
  ] as const,
  gloss: 'M4 11A20 7 0 1 0 44 11A20 7 0 1 0 4 11Z',
  glossOpacity: 0.32,
} as const;

/**
 * Glyph in der Badge-Kachel (viewBox 0 0 64 64):
 *  - ld: exakt LOONA_BADGE.transform.
 *  - Produkte: wie deren Favicons im Logo-Handoff (assets/family/<key>/favicon.svg): scale = min(1.056, 51.2/W),
 *    zentriert; Pfade liegen im 46er-System (sichtbar y 3–43) → −3·scale ausgleichen.
 */
export function badgeTransform(product: LoonaProductKey): { x: number; y: number; scale: number } {
  if (product === 'ld') return LOONA_BADGE.transform;
  const w = LOONA_PRODUCTS[product].width;
  const scale = Math.min(1.056, 51.2 / w);
  return { x: (64 - w * scale) / 2, y: (64 - LOONA_GRID_HEIGHT * scale) / 2 - 3 * scale, scale };
}
