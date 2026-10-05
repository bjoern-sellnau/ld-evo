/**
 * Logo-Farbe „Auto“ (neu, nicht im Prototyp — Wunsch vom 04.10.2026): Negativ-Logo und LD-Kachel wählen ihre Farbe
 * nach dem gemessenen Hintergrund, damit das Logo überall gut sichtbar bleibt (auch auf Cover-Farben, Bildern, Glas).
 *  - Negativ-Logo und Zeichen im Lockup (data-ldlogoauto="fill"): Orange (Markenfarbe), solange es ≥ 4.5:1 schafft, sonst Cream oder Ink —
 *    je nachdem, was am schlechtesten Messpunkt mehr Kontrast hat. Ergebnis als CSS-Variable --ld-logo-auto.
 *  - Kachel (data-ldlogoauto="tile"): die gewünschte Variante (data-want), solange ihre Fläche ≥ 3:1 zum Grund hat
 *    (WCAG 1.4.11, Grafik), sonst die andere (Farb- ↔ Ink-Kachel). Ergebnis als data-tone.
 * Hysterese wie bei der Vibrancy: Eine einmal gewählte Farbe bleibt bis knapp unter der Schwelle, damit nichts flackert.
 * Gemessen wird wie bei Nav/Tab-Leiste (sampleLums); liegt das Logo in einer Glasfläche, wird deren Tönung
 * (Hintergrund der Vorfahren bzw. .ld-liquid-tint) über den gemessenen Seitengrund gelegt.
 */
import { LOONA_NEUTRALS, LOONA_PRODUCTS } from '@/components/brand/products';
import { parseColor, relLum, sampleLums } from './navContrast';

const hexLum = (hex: string) =>
  relLum({ r: parseInt(hex.slice(1, 3), 16), g: parseInt(hex.slice(3, 5), 16), b: parseInt(hex.slice(5, 7), 16), a: 1 });
const ratio = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

export const LOGO_AUTO_COLORS = {
  orange: LOONA_PRODUCTS.ld.color,
  cream: LOONA_NEUTRALS.cream,
  ink: LOONA_NEUTRALS.ink,
} as const;
export type LogoAutoColor = keyof typeof LOGO_AUTO_COLORS;

// Lazy: navContrast importiert dieses Modul (zirkulär) — zur Ladezeit hier nichts aus navContrast aufrufen.
let lumCache: Record<LogoAutoColor, number> | undefined;
const lumOf = (c: LogoAutoColor) =>
  (lumCache ??= { orange: hexLum(LOGO_AUTO_COLORS.orange), cream: hexLum(LOGO_AUTO_COLORS.cream), ink: hexLum(LOGO_AUTO_COLORS.ink) })[c];
const worst = (lums: number[], c: LogoAutoColor) => Math.min(...lums.map((b) => ratio(lumOf(c), b)));

/** Farbe des Negativ-Logos: Orange bevorzugt (≥ 4.5:1; Hysterese 4 bzw. 5), sonst Cream oder Ink. */
export function pickLogoFill(lums: number[], prev?: LogoAutoColor): LogoAutoColor {
  if (!lums.length) return prev ?? 'orange';
  // Zurück zu Orange erst ab 5:1, damit es an der Schwelle nicht hin und her springt.
  const o = worst(lums, 'orange');
  if (o >= (prev === 'orange' ? 4 : prev ? 5 : 4.5)) return 'orange';
  const c = worst(lums, 'cream');
  const k = worst(lums, 'ink');
  if (prev === 'cream' && c >= 4) return 'cream';
  if (prev === 'ink' && k >= 4) return 'ink';
  return c >= k ? 'cream' : 'ink';
}

export type CtaColor = 'accent' | 'cream' | 'ink';

/**
 * Kontakt-Button (data-ldcta, Wunsch 05.10.2026): färbt sich wie das Logo — Akzentfarbe, solange sie sich mit ≥ 4.5:1
 * vom Untergrund abhebt (Hysterese 4 bzw. 5), sonst Cream oder Ink. Auf Cover-Seiten (Akzent auf brauner/orangener
 * Tönung) wird er so neutral statt Orange auf Orange.
 */
export function pickCtaColor(lums: number[], accentLum: number, prev?: CtaColor): CtaColor {
  if (!lums.length) return prev ?? 'accent';
  const a = Math.min(...lums.map((b) => ratio(accentLum, b)));
  if (a >= (prev === 'accent' ? 4 : prev ? 5 : 4.5)) return 'accent';
  const c = worst(lums, 'cream');
  const k = worst(lums, 'ink');
  if (prev === 'cream' && c >= 4) return 'cream';
  if (prev === 'ink' && k >= 4) return 'ink';
  return c >= k ? 'cream' : 'ink';
}

/** Kachel-Variante: gewünschte Variante, solange ihre Fläche ≥ 3:1 schafft (Hysterese 2.7 bzw. 3.3), sonst die kontrastreichere. */
export function pickTileTone(lums: number[], want: 'ink' | 'color', prev?: 'ink' | 'color'): 'ink' | 'color' {
  if (!lums.length) return prev ?? want;
  const score = (v: 'ink' | 'color') => worst(lums, v === 'ink' ? 'ink' : 'orange');
  if (score(want) >= (prev === want ? 2.7 : prev ? 3.3 : 3)) return want;
  const other = want === 'ink' ? 'color' : 'ink';
  return score(other) > score(want) ? other : want;
}

/** Wie parseColor, versteht zusätzlich color(srgb r g b / a) — so liefert der Browser color-mix() aus (Glas-Tönung). */
function parseAny(str: string) {
  const c = parseColor(str);
  if (c) return c;
  const m = /color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)/.exec(str);
  return m ? { r: +m[1] * 255, g: +m[2] * 255, b: +m[3] * 255, a: m[4] === undefined ? 1 : +m[4] } : null;
}

const CHROME = '[data-ldvibrant-sheet],[data-ldchrome],.ldnavvt,#ld-tabbar,#ld-backpill,[data-ldcontrast]';

/** Glas-Tönungen der Vorfahren (außen → innen) über die gemessenen Seitenwerte legen. */
function overGlass(el: Element, lums: number[]): number[] {
  const root = el.closest(CHROME);
  if (!root) return lums;
  const chain: Element[] = [];
  for (let n = el.parentElement; n; n = n.parentElement) {
    chain.unshift(n);
    if (n === root) break;
  }
  let out = lums;
  for (const n of chain) {
    const layers = [n, ...[...n.children].filter((ch) => ch.classList.contains('ld-liquid-tint'))];
    for (const ly of layers) {
      const c = parseAny(getComputedStyle(ly).backgroundColor);
      if (!c || c.a <= 0.02) continue;
      const lc = relLum(c);
      out = out.map((b) => c.a * lc + (1 - c.a) * b);
    }
  }
  return out;
}

export interface LogoMemo {
  fill: WeakMap<Element, LogoAutoColor>;
  tone: WeakMap<Element, 'ink' | 'color'>;
  cta: WeakMap<Element, CtaColor>;
}
export const createLogoMemo = (): LogoMemo => ({ fill: new WeakMap(), tone: new WeakMap(), cta: new WeakMap() });

/** Hex (#rgb/#rrggbb) oder rgb() → Luminanz; unbekannt → null. */
function colorLum(str: string): number | null {
  const s = str.trim();
  const h = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(s);
  if (h) {
    const x = h[1].length === 3 ? [...h[1]].map((c) => c + c).join('') : h[1];
    return hexLum('#' + x);
  }
  const c = parseAny(s);
  return c ? relLum(c) : null;
}

/** Misst alle Logos mit data-ldlogoauto und setzt Farbe bzw. Kachel-Variante (läuft mit dem Auto-Kontrast). */
export function adjustLogoColors(theme: string, memo: LogoMemo): void {
  document.querySelectorAll<HTMLElement | SVGElement>('[data-ldlogoauto]').forEach((el) => {
    const lums = overGlass(el, sampleLums(el, theme, 3, 3));
    if (!lums.length) return;
    if (el.dataset.ldlogoauto === 'fill') {
      const f = pickLogoFill(lums, memo.fill.get(el));
      memo.fill.set(el, f);
      el.style.setProperty('--ld-logo-auto', LOGO_AUTO_COLORS[f]);
    } else {
      const want = el.dataset.want === 'ink' ? 'ink' : 'color';
      const t = pickTileTone(lums, want, memo.tone.get(el));
      memo.tone.set(el, t);
      if (el.dataset.tone !== t) el.dataset.tone = t;
    }
  });
  document.querySelectorAll<HTMLElement>('[data-ldcta]').forEach((el) => {
    const accL = colorLum(getComputedStyle(el).getPropertyValue('--accent'));
    const lums = overGlass(el, sampleLums(el, theme, 3, 3));
    if (accL === null || !lums.length) return;
    const c = pickCtaColor(lums, accL, memo.cta.get(el));
    memo.cta.set(el, c);
    if (el.dataset.cta === c) return;
    el.dataset.cta = c;
    if (c === 'accent') {
      el.style.removeProperty('--ld-cta-bg');
      el.style.removeProperty('--ld-cta-ink');
    } else {
      el.style.setProperty('--ld-cta-bg', LOGO_AUTO_COLORS[c]);
      el.style.setProperty('--ld-cta-ink', c === 'cream' ? LOGO_AUTO_COLORS.ink : LOGO_AUTO_COLORS.cream);
    }
  });
}
