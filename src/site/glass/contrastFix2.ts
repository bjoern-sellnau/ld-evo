/**
 * Auto Contrast Fix 2 (neu, nicht im Prototyp): der Auto-Kontrast (navContrast.ts) misst nur Hintergrundfarben —
 * große SCHRIFT hinter dem Glas (z. B. eine Story-Überschrift, die unter dem Menü durchscrollt) sieht er nicht.
 * Fix 2 misst zusätzlich die Glyphen hinter jeder Glasfläche (Text-Rechtecke per Range) und rechnet für die
 * schwächste Menüschrift den Kontrast nach. Reicht er nicht (< 4.5:1), greift er in sanften Stufen ein:
 *   1. weicher Schein hinter der Menüschrift (text-shadow in Glasfarbe),
 *   2. zusätzlich das Glas etwas dichter tönen,
 *   3. zusätzlich gedämpfte Schrift (--muted/--soft) Richtung Hauptschrift aufhellen bzw. abdunkeln.
 * Obergrenzen halten das Glas sichtbar (Tönung ≤ 84 %) — kein Kippen aufs Gegen-Farbschema, Liquid Glass bleibt
 * erlebbar. Die Stärke („Fix-2-Stärke“) skaliert alle Stufen.
 */
import { parseColor, relLum } from './navContrast';

export interface Fix2Colors {
  /** Luminanz der schwächsten Menüschrift (--muted) und der Hauptschrift (--ink). */
  muted: number;
  ink: number;
  /** Glas-Tönung und deren Anteil (0–1). */
  tint: number;
  pct: number;
  /** Helle Schrift auf dunklem Glas (dunkles Theme)? Bestimmt die Farbe des Scheins. */
  lightText: boolean;
}

export interface Fix2Plan {
  stage: number;
  /** Ratio der schwächsten Schrift nach dem Eingriff. */
  ratio: number;
  halo: number;
  /** zusätzliche Glas-Tönung in Prozentpunkten */
  addPct: number;
  /** Anteil, um den --muted Richtung --ink geschoben wird (0–1) */
  mutedMix: number;
}

const STAGES = [
  { halo: 0, addPct: 0, mutedMix: 0 },
  { halo: 0.32, addPct: 0, mutedMix: 0 },
  { halo: 0.45, addPct: 8, mutedMix: 0 },
  { halo: 0.55, addPct: 16, mutedMix: 0.45 },
  { halo: 0.65, addPct: 24, mutedMix: 0.8 },
];
const MAX_PCT = 0.84;
// Luminanz des dunklen Scheins rgb(2,6,14) — als Zahl, weil navContrast dieses Modul importiert (zirkulär) und
// relLum zur Ladezeit noch nicht bereitstünde.
const L_HALO_DARK = 0.0018;
const L_HALO_LIGHT = 1;

const contrast = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

/**
 * Wählt die kleinste Stufe, mit der die schwächste Schrift an jedem Messpunkt ≥ 4.5:1 erreicht. Zurück auf eine
 * kleinere Stufe erst ab 5:1 (Hysterese, kein Flackern beim Scrollen). Reicht auch die letzte Stufe nicht, bleibt es
 * bei ihr — bewusst gedeckelt, damit das Glas Glas bleibt.
 */
export function planFix2(lums: number[], c: Fix2Colors, strength = 100, prev = 0): Fix2Plan {
  const k = Math.max(0.5, Math.min(1.5, strength / 100));
  const haloL = c.lightText ? L_HALO_DARK : L_HALO_LIGHT;
  const evalStage = (i: number): Fix2Plan => {
    const st = STAGES[i];
    const halo = Math.min(0.85, st.halo * k);
    const addPct = Math.round(st.addPct * k);
    const mutedMix = Math.min(1, st.mutedMix * k);
    const a = Math.max(c.pct, Math.min(MAX_PCT, c.pct + addPct / 100));
    const text = c.muted + (c.ink - c.muted) * mutedMix;
    let worst = Infinity;
    for (const L of lums) {
      const back = a * c.tint + (1 - a) * L;
      worst = Math.min(worst, contrast(text, halo * haloL + (1 - halo) * back));
    }
    return { stage: i, ratio: worst, halo, addPct: Math.round((a - c.pct) * 100), mutedMix };
  };
  if (!lums.length) return evalStage(0);
  for (let i = 0; i < STAGES.length; i++) {
    const p = evalStage(i);
    if (p.ratio >= (i < prev ? 5 : 4.5)) return p;
  }
  return evalStage(STAGES.length - 1);
}

/* ---------------------------------------------------------------- Messen ------------------------------------- */

const CHROME = '.ldnavvt, #ld-tabbar, #ld-backpill, [data-ldcontrast], [data-ldchrome], [data-ldvibrant-sheet]';

function bgLum(el: Element | null | undefined): number | null {
  let n = el;
  while (n && n !== document.documentElement) {
    const cs = getComputedStyle(n);
    const bc = parseColor(cs.backgroundColor);
    if (bc && bc.a >= 0.45) return relLum(bc);
    if (cs.backgroundImage && cs.backgroundImage !== 'none') {
      const cols = (cs.backgroundImage.match(/rgba?\([^)]+\)/g) || []).map((s) => parseColor(s)).filter((v) => !!v && v.a > 0.4);
      if (cols.length) return cols.reduce((s, v) => s + relLum(v!), 0) / cols.length;
    }
    n = n.parentElement;
  }
  return null;
}

/** Schriftfarbe eines Elements; Verlaufsschrift (color: transparent + background-clip) → Mittel der Verlaufsfarben. */
function textLum(el: Element): number | null {
  const cs = getComputedStyle(el);
  const c = parseColor(cs.color);
  if (c && c.a >= 0.35) return relLum(c);
  const cols = (cs.backgroundImage.match(/rgba?\([^)]+\)/g) || []).map((s) => parseColor(s)).filter((v) => !!v && v.a > 0.4);
  return cols.length ? cols.reduce((s, v) => s + relLum(v!), 0) / cols.length : null;
}

/** Liegt (x, y) auf einem Textstück direkt in el? Rechtecke je Messlauf zwischengespeichert. */
function hitsText(el: Element, x: number, y: number, cache: Map<Element, DOMRect[]>): boolean {
  let rects = cache.get(el);
  if (!rects) {
    rects = [];
    const range = document.createRange();
    for (const n of el.childNodes) {
      if (n.nodeType !== Node.TEXT_NODE || !n.textContent?.trim()) continue;
      range.selectNodeContents(n);
      rects.push(...range.getClientRects());
    }
    cache.set(el, rects);
  }
  return rects.some((r) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom);
}

/**
 * Luminanz hinter einer Glasfläche in einem Raster — wo Schrift liegt, zählt die Schriftfarbe (mit Weichzeichnung
 * zur Hälfte mit dem Grund gemischt, ohne Blur voll). Liefert null, wenn hinter der Fläche keine Schrift liegt
 * (dann genügt der Auto-Kontrast).
 */
export function sampleGlyphLums(el: Element, blurred: boolean, cols = 12, rows = 3): number[] | null {
  const r = el.getBoundingClientRect();
  if (!r.width || !r.height) return null;
  const cache = new Map<Element, DOMRect[]>();
  const out: number[] = [];
  let glyphs = false;
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) {
      const x = r.left + r.width * (0.04 + (0.92 * i) / Math.max(1, cols - 1));
      const y = r.top + r.height * (0.2 + (0.6 * j) / Math.max(1, rows - 1));
      const stack = document.elementsFromPoint(x, y).filter((n) => !n.closest(CHROME));
      const bg = bgLum(stack[0]);
      let fg: number | null = null;
      // Die obersten Ebenen genügen: Schrift liegt fast immer im obersten oder direkt darunterliegenden Element.
      for (const n of stack.slice(0, 4)) {
        if (hitsText(n, x, y, cache)) {
          fg = textLum(n);
          break;
        }
      }
      if (fg === null) {
        if (bg !== null) out.push(bg);
        continue;
      }
      glyphs = true;
      out.push(blurred && bg !== null ? (fg + bg) / 2 : fg);
    }
  return glyphs ? out : null;
}

/** Hex/rgb → relative Luminanz (für Farb-Tokens aus Fix-String oder body). */
export function lumOf(col: string): number | null {
  const s = col.trim();
  const h = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(s);
  if (h) {
    const v = h[1].length === 3 ? [...h[1]].map((d) => d + d).join('') : h[1];
    return relLum({ r: parseInt(v.slice(0, 2), 16), g: parseInt(v.slice(2, 4), 16), b: parseInt(v.slice(4, 6), 16), a: 1 });
  }
  const c = parseColor(s);
  return c ? relLum(c) : null;
}

/** Mischt zwei Hex-Farben (t = Anteil von b). */
export function mixHex(a: string, b: string, t: number): string {
  const p = (s: string) => {
    const v = s.replace('#', '');
    const f = v.length === 3 ? [...v].map((d) => d + d).join('') : v;
    return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16));
  };
  const [x, y] = [p(a), p(b)];
  if (x.some(isNaN) || y.some(isNaN)) return a;
  return (
    '#' +
    x
      .map((v, i) =>
        Math.round(v + (y[i] - v) * t)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}

/** Text-Schein in Glasfarbe: eng an der Schrift + weich ausgelaufen. */
export function haloShadow(halo: number, lightText: boolean): string {
  if (halo <= 0) return '';
  const col = lightText ? '2,6,14' : '255,255,255';
  const a1 = Math.min(0.9, halo * 1.1).toFixed(2);
  const a2 = halo.toFixed(2);
  return `0 0 1.5px rgba(${col},${a1}),0 0 ${Math.round(6 + 10 * halo)}px rgba(${col},${a2})`;
}
