/** Relative Luminanz nach Prototyp (lum/ink: Rec.-709-Gewichte auf sRGB-Werten, ohne Linearisierung). */
export function lum(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Relative Luminanz nach WCAG 2.x (linearisiertes sRGB) — Grundlage für Kontrastverhältnisse. */
function wcagLum(hex: string): number {
  const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const [r, g, b] = [1, 3, 5].map((i) => lin(parseInt(hex.slice(i, i + 2), 16) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Kontrastverhältnis nach WCAG (1–21). */
export function contrast(a: string, b: string): number {
  const [x, y] = [wcagLum(a), wcagLum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/**
 * Text auf einer Cover-Farbe: schwarz oder weiß — je nachdem, was mehr Kontrast hat.
 * Abweichung vom Prototyp (Loona Site V2.dc.html Z. 4274: `L > 0.55` auf nicht linearisierten Werten): der ergab
 * z. B. für #D97706 Weiß mit 3,2:1; README Z. 51 verlangt ≥ 4,5:1. Betrifft von den Startinhalten nur dieses Cover.
 */
export function inkOn(hex: string): string {
  return contrast(hex, '#FFFFFF') >= contrast(hex, '#141210') ? '#FFFFFF' : '#141210';
}

/** Farbe `ink` mit Deckkraft `a` über `bg` gemischt (als Hex). */
export function over(bg: string, ink: string, a: number): string {
  const c = (h: string, i: number) => parseInt(h.slice(i, i + 2), 16);
  return `#${[1, 3, 5]
    .map((i) =>
      Math.round(c(ink, i) * a + c(bg, i) * (1 - a))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

/**
 * Deckkraft für Nebentexte auf einer Fläche: der Wunschwert aus dem Prototyp, aber mindestens so hoch, dass der
 * Kontrast ≥ `min` erreicht (Standard 4,5:1). Genügt der Wunschwert, bleibt alles wie im Prototyp.
 */
export function readableAlpha(bg: string, ink: string, wanted: number, min = 4.5): number {
  for (let a = wanted; a < 1; a = Math.round((a + 0.02) * 100) / 100) if (contrast(over(bg, ink, a), bg) >= min) return a;
  return 1;
}

export function rgbList(hex: string): string {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(',');
}
