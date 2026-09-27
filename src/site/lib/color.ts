/** Relative Luminanz nach Prototyp (lum/ink: Rec.-709-Gewichte auf sRGB-Werten, ohne Linearisierung). */
export function lum(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Text auf einer Cover-Farbe: schwarz/weiß, Schwelle 0.55 (Prototyp: ink()). */
export function inkOn(hex: string): string {
  return lum(hex) > 0.55 ? '#141210' : '#FFFFFF';
}

export function rgbList(hex: string): string {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(',');
}
