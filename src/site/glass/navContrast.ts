/**
 * Auto-Kontrast für Nav-Pill, Tab-Bar und Mobile-Zurück-Pill: misst an 7 Punkten die Luminanz dahinter
 * (data-ldsample → Hintergrundfarben → Body) sowie echte Canvas-Pixel der Hero-FX und tönt das Glas bzw.
 * kippt auf die Gegenfarbe (Hysterese) oder setzt einen dynamischen Kontrast-Schatten.
 * 1:1 aus dem Prototyp (parseColor / relLum / applyNavFix / adjustNavContrast, Zeile 3907–4079).
 */
import type { Settings } from '../settings/schema';

interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

type FixEl = HTMLElement & { __ldFix?: string };

export interface ContrastMemo {
  flip: Record<string, boolean>;
  /** Gewähltes Material je Fläche (Vibrancy, App v2) — für die Hysterese. */
  scheme?: Record<string, 'dark' | 'light'>;
  raf: number;
  to?: ReturnType<typeof setTimeout>;
  sampCv?: HTMLCanvasElement;
  sampCtx?: CanvasRenderingContext2D | null;
}

export function createContrastMemo(): ContrastMemo {
  return { flip: {}, raf: 0 };
}

export function parseColor(str: string | null | undefined): Rgba | null {
  const m = /rgba?\(([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)(?:[,/ ]+([\d.]+))?\)/.exec(str || '');
  if (!m) return null;
  return { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] };
}

export function relLum(c: Rgba): number {
  const f = (v: number) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
}

const FIX_KEYS = ['--glassTint', '--glassPct', '--ink', '--muted', '--soft', '--pill', '--hair', '--glassbrd', '--glasshi'];

export function applyNavFix(pill: FixEl, fix: string): void {
  if (pill.__ldFix === fix) return;
  pill.__ldFix = fix;
  for (const k of FIX_KEYS) pill.style.removeProperty(k);
  if (fix) {
    for (const pair of fix.split(';')) {
      const i2 = pair.indexOf(':');
      if (i2 > 0) pill.style.setProperty(pair.slice(0, i2).trim(), pair.slice(i2 + 1).trim());
    }
  }
}

export type ContrastSettings = Pick<Settings, 'theme' | 'autoC' | 'oppC' | 'ctShadow' | 'ctStrength' | 'blurOn'>;

/** Plant eine Messung (rAF + 200-ms-Nachlauf wie im Prototyp). overlayOpen: Such-/Kontakt-/Einstellungs-/Mobil-Menü offen. */
export function adjustNavContrast(get: () => { s: ContrastSettings; overlayOpen: boolean }, memo: ContrastMemo): void {
  if (memo.raf) cancelAnimationFrame(memo.raf);
  clearTimeout(memo.to);
  const run = () => {
    if (memo.raf) cancelAnimationFrame(memo.raf);
    clearTimeout(memo.to);
    memo.raf = 0;
    const { s, overlayOpen } = get();
    const theme = s.theme || 'dark';
    memo.scheme ??= {};
    // Große Glasflächen (App-v2-Menü, mobile Suche) messen auch bei offenem Overlay — sie SIND das Overlay.
    document.querySelectorAll<HTMLElement>('[data-ldvibrant-sheet]').forEach((el, i) => {
      if (s.autoC === false) return;
      const key = `_sheet${i}`;
      const sc = pickScheme(
        sampleLums(el, theme, 5, 6),
        theme,
        (el.dataset.scheme as 'dark' | 'light' | undefined) ?? memo.scheme![key],
        0.56,
      );
      memo.scheme![key] = sc;
      if (el.dataset.scheme !== sc) el.dataset.scheme = sc;
    });
    if (overlayOpen) return;
    const wrap = document.querySelector('.ldnavvt');
    const barEl = document.getElementById('ld-tabbar');
    const targets: [FixEl, string][] = [];
    if (wrap && wrap.firstElementChild) targets.push([wrap.firstElementChild as FixEl, '_navFlip']);
    if (barEl) targets.push([barEl, '_tabFlip']);
    const backEl = document.getElementById('ld-backpill');
    if (backEl) targets.push([backEl, '_backFlip']);
    // Weitere Glasknöpfe (Mobil-Design App v2): jede Fläche mit data-ldcontrast misst für sich.
    document.querySelectorAll<FixEl>('[data-ldcontrast]').forEach((el, i) => targets.push([el, `_c${i}`]));
    for (const [pill, flipKey] of targets) {
      const r = pill.getBoundingClientRect();
      if (!r.width) continue;
      if (s.autoC === false) {
        memo.flip[flipKey] = false;
        pill.style.textShadow = '';
        applyNavFix(pill, '');
        continue;
      }
      const sampleEls = [...document.querySelectorAll('[data-ldsample]')];
      const horiz = r.width >= r.height;
      const lums: number[] = [];
      for (let i = 0; i < 7; i++) {
        const t = 0.06 + (0.88 * i) / 6;
        const x = horiz ? r.left + r.width * t : r.left + r.width / 2;
        const y = horiz ? r.top + r.height / 2 : r.top + r.height * t;
        let lum: number | null = null;
        for (const se of sampleEls) {
          const rr = se.getBoundingClientRect();
          if (x >= rr.left && x <= rr.right && y >= rr.top && y <= rr.bottom) {
            const parts = String(se.getAttribute('data-ldsample')).split(',');
            lum = parseFloat(theme === 'light' && parts[1] !== undefined ? parts[1] : parts[0]);
          }
        }
        if (lum === null || isNaN(lum)) {
          const stack = document.elementsFromPoint(x, y) || [];
          let el: Element | null | undefined = stack.find(
            (n) =>
              n instanceof Element &&
              !n.closest('.ldnavvt') &&
              !n.closest('#ld-tabbar') &&
              !n.closest('#ld-backpill') &&
              !n.closest('[data-ldcontrast]') &&
              !n.closest('[data-ldchrome]'),
          );
          while (el && el !== document.documentElement) {
            const c = getComputedStyle(el);
            const bc = parseColor(c.backgroundColor);
            if (bc && bc.a >= 0.45) {
              lum = relLum(bc);
              break;
            }
            if (c.backgroundImage && c.backgroundImage !== 'none') {
              const cols = (c.backgroundImage.match(/rgba?\([^)]+\)/g) || [])
                .map((s2) => parseColor(s2))
                .filter((v): v is Rgba => !!v && v.a > 0.4);
              if (cols.length) {
                lum = cols.map((v) => relLum(v)).reduce((a, b) => a + b, 0) / cols.length;
                break;
              }
            }
            el = el.parentElement;
          }
          if (lum === null || isNaN(lum)) {
            const bb = parseColor(getComputedStyle(document.body).backgroundColor);
            lum = bb ? relLum(bb) : 0.05;
          }
        }
        lums.push(lum);
      }
      // App v2 (data-ldvibrant): wie Apples Materialien — Schwarz oder Weiß, je nachdem, was über dem gemessenen
      // Hintergrund (inkl. Glas-Tönung) den besseren schlechtesten Kontrast ergibt; Theme-Variante bevorzugt.
      if (pill.hasAttribute('data-ldvibrant')) {
        const sc = pickScheme(lums, theme, memo.scheme![flipKey], VIBRANT_PCT / 100);
        memo.scheme![flipKey] = sc;
        pill.style.textShadow = '';
        applyNavFix(pill, sc === 'dark' ? VIBRANT_DARK : VIBRANT_LIGHT);
        continue;
      }
      const backL = theme === 'light' ? Math.min(...lums) : Math.max(...lums);
      // Dynamische Pixel-Messung: echte Canvas-Pixel (WebGL via preserveDrawingBuffer / 2D) hinter dem Ziel
      let cvL: { max: number; min: number; avg: number } | null = null;
      try {
        const r2 = pill.getBoundingClientRect();
        const cvs = [document.getElementById('ld-lava-canvas'), document.getElementById('ld-orbit-canvas')] as (HTMLCanvasElement | null)[];
        for (const c2 of cvs) {
          if (!c2 || !c2.width || getComputedStyle(c2).display === 'none') continue;
          const cr = c2.getBoundingClientRect();
          if (!cr.width || r2.bottom < cr.top || r2.top > cr.bottom || r2.right < cr.left || r2.left > cr.right) continue;
          if (!memo.sampCv) {
            memo.sampCv = document.createElement('canvas');
            memo.sampCv.width = 9;
            memo.sampCv.height = 3;
            memo.sampCtx = memo.sampCv.getContext('2d', { willReadFrequently: true });
          }
          const sx = Math.max(0, ((r2.left - cr.left) / cr.width) * c2.width);
          const sy = Math.max(0, ((r2.top - cr.top) / cr.height) * c2.height);
          const sw = Math.min(c2.width - sx, Math.max(1, (r2.width / cr.width) * c2.width));
          const sh3 = Math.min(c2.height - sy, Math.max(1, (r2.height / cr.height) * c2.height));
          if (sw <= 0 || sh3 <= 0) continue;
          memo.sampCtx!.drawImage(c2, sx, sy, sw, sh3, 0, 0, 9, 3);
          const px = memo.sampCtx!.getImageData(0, 0, 9, 3).data;
          let mx = 0,
            mn2 = 1,
            sum = 0,
            cnt = 0;
          for (let k2 = 0; k2 < px.length; k2 += 4) {
            const L2 = (0.2126 * px[k2] + 0.7152 * px[k2 + 1] + 0.0722 * px[k2 + 2]) / 255;
            if (L2 > mx) mx = L2;
            if (L2 < mn2) mn2 = L2;
            sum += L2;
            cnt++;
          }
          if (cnt) cvL = { max: mx, min: mn2, avg: sum / cnt };
          break;
        }
      } catch {
        // Canvas nicht lesbar (z. B. Kontext verloren) → nur DOM-Messung
      }
      const basePct = parseFloat(getComputedStyle(document.body).getPropertyValue('--glassPct')) || 42;
      let fix = '';
      if (s.ctShadow === true) {
        // Dynamischer Kontrast-Schatten: Gefahrenwert = hellster (bzw. dunkelster) ECHTER Pixel hinter dem Ziel,
        // Stärke = Defizit × Slider, Ton = Schwarz/Weiß/Grau passend zur gemessenen Mittel-Luminanz
        const lightText = theme !== 'light';
        const dz = cvL ? (lightText ? cvL.max : cvL.min) : backL;
        const s01 = Math.max(0, Math.min(1, lightText ? (dz - 0.08) / 0.5 : (0.82 - dz) / 0.5));
        const k = Math.max(0.2, Math.min(2, (s.ctStrength ?? 100) / 100));
        if (s01 * k <= 0.03) {
          pill.style.textShadow = '';
        } else {
          const mid = cvL ? cvL.avg : backL;
          const grayZone = mid > 0.35 && mid < 0.65;
          const col = lightText ? (grayZone ? '22,28,38' : '2,6,14') : grayZone ? '238,241,246' : '255,255,255';
          const a1 = Math.min(0.95, (0.22 + 0.5 * s01) * k).toFixed(2);
          const a2 = Math.min(0.9, (0.12 + 0.42 * s01) * k).toFixed(2);
          const bl2 = Math.round(6 + 10 * s01);
          pill.style.textShadow = '0 1px 1.5px rgba(' + col + ',' + a1 + '),0 2px ' + bl2 + 'px rgba(' + col + ',' + a2 + ')';
        }
        memo.flip[flipKey] = false;
        applyNavFix(pill, '');
        continue;
      }
      pill.style.textShadow = '';
      const clearGlass = s.blurOn === false;
      const wasFlip = !!memo.flip[flipKey];
      const flip =
        s.oppC !== false &&
        (theme !== 'light'
          ? backL > (wasFlip ? (clearGlass ? 0.42 : 0.5) : clearGlass ? 0.5 : 0.58)
          : backL < (wasFlip ? (clearGlass ? 0.38 : 0.3) : clearGlass ? 0.32 : 0.24));
      memo.flip[flipKey] = flip;
      if (flip && theme !== 'light') {
        fix =
          '--glassTint:#F4F7FB;--glassPct:' +
          (clearGlass ? '93%' : '80%') +
          ';--ink:#0F2137;--muted:#33415A;--soft:#55647A;--pill:rgba(15,33,55,0.1);--hair:rgba(15,33,55,0.14);--glassbrd:rgba(15,33,55,0.16);--glasshi:rgba(255,255,255,0.75)';
      } else if (flip) {
        fix =
          '--glassTint:#0B1322;--glassPct:' +
          (clearGlass ? '92%' : '78%') +
          ';--ink:#F2F5FA;--muted:#D6E0EC;--soft:#AEBDD2;--pill:rgba(255,255,255,0.14);--hair:rgba(255,255,255,0.12);--glassbrd:rgba(255,255,255,0.2);--glasshi:rgba(255,255,255,0.3)';
      } else if (theme !== 'light') {
        if (backL > (clearGlass ? 0.12 : 0.2)) {
          let p = Math.ceil(((backL - (clearGlass ? 0.1 : 0.18)) / Math.max(backL - 0.03, 0.01)) * 100) + (clearGlass ? 14 : 0);
          p = Math.max(basePct, Math.min(93, p));
          if (p > basePct + 1) fix = '--glassTint:#070B14;--glassPct:' + p + '%;--muted:#D6E0EC;--soft:#BCC9DA';
        }
      } else {
        if (backL < (clearGlass ? 0.7 : 0.6)) {
          let p = Math.ceil(((0.72 - backL) / Math.max(0.97 - backL, 0.01)) * 100) + (clearGlass ? 14 : 0);
          p = Math.max(basePct, Math.min(94, p));
          if (p > basePct + 1) fix = '--glassTint:#FFFFFF;--glassPct:' + p + '%;--muted:#3D4A5E;--soft:#55647A';
        }
      }
      applyNavFix(pill, fix);
    }
  };
  memo.raf = requestAnimationFrame(run);
  memo.to = setTimeout(run, 200);
}

/* ---------------------------------------------------------------- Vibrancy (App v2) ---------------------------- */

const VIBRANT_PCT = 66;
const VIBRANT_DARK = `--glassTint:#0B1322;--glassPct:${VIBRANT_PCT}%;--ink:#F4F7FB;--muted:#E6ECF4;--soft:#D2DBE8;--pill:rgba(255,255,255,0.16);--hair:rgba(255,255,255,0.12);--glassbrd:rgba(255,255,255,0.22);--glasshi:rgba(255,255,255,0.32)`;
const VIBRANT_LIGHT = `--glassTint:#F4F7FB;--glassPct:${VIBRANT_PCT}%;--ink:#0B1626;--muted:#1C2A40;--soft:#2E3D55;--pill:rgba(15,33,55,0.1);--hair:rgba(15,33,55,0.14);--glassbrd:rgba(15,33,55,0.16);--glasshi:rgba(255,255,255,0.8)`;
const L_DARK_TINT = relLum({ r: 11, g: 19, b: 34, a: 1 });
const L_LIGHT_TINT = relLum({ r: 244, g: 247, b: 251, a: 1 });
const L_WHITE_TEXT = relLum({ r: 244, g: 247, b: 251, a: 1 });
const L_BLACK_TEXT = relLum({ r: 11, g: 22, b: 38, a: 1 });
const ratio = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

/**
 * Wählt das Material: 'dark' (dunkle Tönung, weiße Schrift) oder 'light' (helle Tönung, schwarze Schrift).
 * Rechnet je Messpunkt die Mischung aus Glas-Tönung (Anteil a) und Hintergrund und nimmt den schlechtesten Punkt.
 * Die Theme-Variante bleibt, solange sie ≥ 7:1 schafft; die bisherige Wahl bleibt bei ≥ 6:1 (Hysterese, kein Flackern).
 */
export function pickScheme(lums: number[], theme: string, prev: 'dark' | 'light' | undefined, a: number): 'dark' | 'light' {
  if (!lums.length) return theme === 'light' ? 'light' : 'dark';
  const worst = (sc: 'dark' | 'light') =>
    Math.min(
      ...lums.map((L) =>
        sc === 'dark' ? ratio(L_WHITE_TEXT, a * L_DARK_TINT + (1 - a) * L) : ratio(a * L_LIGHT_TINT + (1 - a) * L, L_BLACK_TEXT),
      ),
    );
  const natural = theme === 'light' ? 'light' : 'dark';
  if (prev && worst(prev) >= 6) return prev;
  if (worst(natural) >= 7) return natural;
  return worst('dark') >= worst('light') ? 'dark' : 'light';
}

/** Luminanz hinter einer Fläche in einem cols×rows-Raster (Hero-Shader über data-ldsample, sonst Hintergrundfarben). */
export function sampleLums(el: Element, theme: string, cols: number, rows: number): number[] {
  const r = el.getBoundingClientRect();
  if (!r.width || !r.height) return [];
  const sampleEls = [...document.querySelectorAll('[data-ldsample]')];
  const out: number[] = [];
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) {
      const x = r.left + r.width * (0.06 + (0.88 * i) / Math.max(1, cols - 1));
      const y = r.top + r.height * (0.06 + (0.88 * j) / Math.max(1, rows - 1));
      let lum: number | null = null;
      for (const se of sampleEls) {
        const rr = se.getBoundingClientRect();
        if (x >= rr.left && x <= rr.right && y >= rr.top && y <= rr.bottom) {
          const parts = String(se.getAttribute('data-ldsample')).split(',');
          lum = parseFloat(theme === 'light' && parts[1] !== undefined ? parts[1] : parts[0]);
        }
      }
      if (lum === null || isNaN(lum)) {
        const stack = document.elementsFromPoint(x, y) || [];
        let n: Element | null | undefined = stack.find(
          (e) =>
            e instanceof Element &&
            !e.closest('[data-ldvibrant-sheet]') &&
            !e.closest('[data-ldchrome]') &&
            !e.closest('.ldnavvt') &&
            !e.closest('#ld-tabbar'),
        );
        while (n && n !== document.documentElement && lum === null) {
          const c = getComputedStyle(n);
          const bc = parseColor(c.backgroundColor);
          if (bc && bc.a >= 0.45) lum = relLum(bc);
          else if (c.backgroundImage && c.backgroundImage !== 'none') {
            const cols2 = (c.backgroundImage.match(/rgba?\([^)]+\)/g) || [])
              .map((s2) => parseColor(s2))
              .filter((v): v is Rgba => !!v && v.a > 0.4);
            if (cols2.length) lum = cols2.map((v) => relLum(v)).reduce((p, q) => p + q, 0) / cols2.length;
          }
          // Bilder/Video: Helligkeit unbekannt → hell annehmen (sicherer Fall für weiße Schrift)
          if (lum === null && (n.tagName === 'IMG' || n.tagName === 'VIDEO' || n.tagName === 'CANVAS')) lum = 0.6;
          n = n.parentElement;
        }
        if (lum === null) {
          const bb = parseColor(getComputedStyle(document.body).backgroundColor);
          lum = bb ? relLum(bb) : 0.05;
        }
      }
      out.push(lum);
    }
  return out;
}
