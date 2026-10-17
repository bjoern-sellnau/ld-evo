/**
 * Auto Contrast Fix 2 (neu, nicht im Prototyp): der Auto-Kontrast (navContrast.ts) misst nur Hintergrundfarben —
 * große SCHRIFT hinter dem Glas (z. B. eine Story-Überschrift, die unter dem Menü durchscrollt) sieht er nicht.
 * Fix 2 misst zusätzlich die Glyphen hinter jeder Glasfläche (Text-Rechtecke per Range) und rechnet für die
 * schwächste Menüschrift den Kontrast nach. Reicht er nicht (< 4.5:1), greift er in sanften Stufen ein:
 *   1. weicher Schein hinter der Menüschrift (text-shadow in Glasfarbe),
 *   2. zusätzlich das Glas etwas dichter tönen,
 *   3. zusätzlich gedämpfte Schrift (--muted/--soft) Richtung Hauptschrift aufhellen bzw. abdunkeln,
 *   4. zusätzlich das Glas leicht milchig machen (Weichzeichnung NUR dieser Fläche, nur solange Schrift dahinter liegt)
 *      — wirkt gerade bei klarem Glas (Blur aus, reine Refraktion), wo scharfe Buchstaben durchscheinen.
 * Obergrenzen halten das Glas sichtbar (Tönung ≤ 84 %, Milchglas ≤ 14 px) — kein Kippen aufs Gegen-Farbschema,
 * Liquid Glass (Refraktion, Kanten) bleibt erlebbar. Die Stärke („Fix-2-Stärke“) skaliert alle Stufen.
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
  /** Mindest-Weichzeichnung der Fläche in px (0 = unverändert) */
  frost: number;
}

/** Messpunkt hinter der Fläche: Grund-Luminanz und — falls dort Schrift liegt — deren Luminanz. */
export interface Fix2Point {
  bg: number;
  fg: number | null;
}

const STAGES = [
  { halo: 0, addPct: 0, mutedMix: 0, frost: 0 },
  { halo: 0.32, addPct: 0, mutedMix: 0, frost: 0 },
  { halo: 0.45, addPct: 8, mutedMix: 0, frost: 4 },
  { halo: 0.55, addPct: 14, mutedMix: 0.45, frost: 7 },
  { halo: 0.62, addPct: 20, mutedMix: 0.8, frost: 10 },
  { halo: 0.7, addPct: 26, mutedMix: 1, frost: 14 },
];
const MAX_PCT = 0.84;
const MAX_FROST = 14;

/**
 * Wie stark scharfe Schrift hinter dem Glas noch durchschlägt (1 = voll, klares Glas) — je weicher das Glas, desto
 * mehr mischen sich Buchstaben mit dem Grund. Grobe Näherung: ab ~12 px Weichzeichnung bleibt rund ein Drittel.
 */
export function glyphWeight(blurPx: number): number {
  return 1 - 0.65 * Math.max(0, Math.min(1, blurPx / 12));
}
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
export function planFix2(points: Fix2Point[], c: Fix2Colors, strength = 100, prev = 0, blurPx = 0): Fix2Plan {
  const k = Math.max(0.5, Math.min(1.5, strength / 100));
  const haloL = c.lightText ? L_HALO_DARK : L_HALO_LIGHT;
  const evalStage = (i: number): Fix2Plan => {
    const st = STAGES[i];
    const halo = Math.min(0.85, st.halo * k);
    const addPct = Math.round(st.addPct * k);
    const mutedMix = Math.min(1, st.mutedMix * k);
    // Milchglas nur, wo es mehr ist als die vorhandene Weichzeichnung
    const frost = st.frost ? Math.min(MAX_FROST, Math.round(st.frost * k)) : 0;
    const w = glyphWeight(Math.max(blurPx, frost));
    const a = Math.max(c.pct, Math.min(MAX_PCT, c.pct + addPct / 100));
    const text = c.muted + (c.ink - c.muted) * mutedMix;
    let worst = Infinity;
    for (const p of points) {
      const L = p.fg === null ? p.bg : w * p.fg + (1 - w) * p.bg;
      const back = a * c.tint + (1 - a) * L;
      worst = Math.min(worst, contrast(text, halo * haloL + (1 - halo) * back));
    }
    return { stage: i, ratio: worst, halo, addPct: Math.round((a - c.pct) * 100), mutedMix, frost: frost > blurPx ? frost : 0 };
  };
  if (!points.length) return evalStage(0);
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
  const c = parseColor(cs.color) ?? parseSrgb(cs.color);
  if (c && c.a >= 0.35) return relLum(c);
  const cols = (cs.backgroundImage.match(/rgba?\([^)]+\)/g) || []).map((s) => parseColor(s)).filter((v) => !!v && v.a > 0.4);
  return cols.length ? cols.reduce((s, v) => s + relLum(v!), 0) / cols.length : null;
}

/**
 * color-mix() & Co. liefern berechnete Farben als „color(srgb r g b / a)“ (Kanäle 0–1) statt rgb() — z. B. die
 * Wort-für-Wort-Einfärbung von „Story: Worte“. parseColor kennt nur rgb(a).
 */
export function parseSrgb(str: string): { r: number; g: number; b: number; a: number } | null {
  const m = /color\(srgb\s+([\d.e-]+)\s+([\d.e-]+)\s+([\d.e-]+)(?:\s*\/\s*([\d.e-]+))?\)/.exec(str || '');
  if (!m) return null;
  const ch = (v: string) => Math.max(0, Math.min(255, parseFloat(v) * 255));
  return { r: ch(m[1]), g: ch(m[2]), b: ch(m[3]), a: m[4] === undefined ? 1 : parseFloat(m[4]) };
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
 * Messpunkte hinter einer Glasfläche in einem Raster: Grund-Luminanz und, wo Schrift liegt, deren Luminanz.
 * Liefert null, wenn hinter der Fläche keine Schrift liegt (dann genügt der Auto-Kontrast).
 */
export function sampleGlyphPoints(el: Element, cols = 12, rows = 3): Fix2Point[] | null {
  const r = el.getBoundingClientRect();
  if (!r.width || !r.height) return null;
  const cache = new Map<Element, DOMRect[]>();
  const out: Fix2Point[] = [];
  let glyphs = false;
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) {
      const x = r.left + r.width * (0.04 + (0.92 * i) / Math.max(1, cols - 1));
      const y = r.top + r.height * (0.2 + (0.6 * j) / Math.max(1, rows - 1));
      const stack = document.elementsFromPoint(x, y).filter((n) => !n.closest(CHROME));
      const bg = bgLum(stack[0]) ?? bodyLum();
      let fg: number | null = null;
      // Die obersten Ebenen genügen: Schrift liegt fast immer im obersten oder direkt darunterliegenden Element.
      for (const n of stack.slice(0, 4)) {
        if (hitsText(n, x, y, cache)) {
          fg = textLum(n);
          break;
        }
      }
      if (fg !== null) glyphs = true;
      out.push({ bg, fg });
    }
  return glyphs ? out : null;
}

function bodyLum(): number {
  const b = parseColor(getComputedStyle(document.body).backgroundColor);
  return b ? relLum(b) : 0.05;
}

/**
 * Milchglas-Stufe auf die Fläche anwenden. Echte Refraktion (Chrome, SVG-Filter je Fläche aus refraction.ts): die
 * stdDeviation ihres feGaussianBlur anheben. Sonst --bfMain direkt am [data-ldfrost] setzen (inline, damit auch
 * „Blur aus“ — body.noblur setzt --bfMain dort auf none — übersteuert wird). 0 stellt den Ausgangswert wieder her.
 */
export function applyFrost(pill: HTMLElement, px: number): void {
  const frost = pill.querySelector<HTMLElement>('[data-ldfrost]');
  if (!frost) return;
  const fid = frost.getAttribute('data-ldfid');
  const blur = fid ? document.querySelector<SVGFEGaussianBlurElement>(`#${CSS.escape(fid)} feGaussianBlur`) : null;
  if (blur && frost.style.getPropertyValue('--bfMain').startsWith('url(')) {
    const base = blur.dataset.sig0 ?? blur.getAttribute('stdDeviation') ?? '0';
    blur.dataset.sig0 = base;
    const want = px > 0 ? Math.max(parseFloat(base), px * 0.6).toFixed(2) : base;
    if (blur.getAttribute('stdDeviation') !== want) blur.setAttribute('stdDeviation', want);
    return;
  }
  if (px > 0) {
    frost.dataset.fix2 = '1';
    const bf = `blur(${px}px) saturate(1.9) brightness(1.06)`;
    if (frost.style.getPropertyValue('--bfMain') !== bf) frost.style.setProperty('--bfMain', bf);
  } else if (frost.dataset.fix2) {
    delete frost.dataset.fix2;
    frost.style.removeProperty('--bfMain');
  }
}

/** Wirksame Weichzeichnung des Glases in px (für das Modell): Blur aus → 0, sonst --blurAmt bzw. Refraktions-Sigma. */
export function currentBlurPx(pill: HTMLElement, blurOn: boolean): number {
  if (!blurOn) return 0;
  const frost = pill.querySelector<HTMLElement>('[data-ldfrost]');
  const fid = frost?.getAttribute('data-ldfid');
  const blur = fid ? document.querySelector<SVGFEGaussianBlurElement>(`#${CSS.escape(fid)} feGaussianBlur`) : null;
  if (blur) return parseFloat(blur.dataset.sig0 ?? blur.getAttribute('stdDeviation') ?? '0') / 0.6;
  return parseFloat(getComputedStyle(document.body).getPropertyValue('--blurAmt')) || 30;
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
