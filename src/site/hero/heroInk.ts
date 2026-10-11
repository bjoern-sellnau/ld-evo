import { lum, rgbList } from '../lib/color';
import type { Settings } from '../settings/schema';
import { EXTRA_MODES } from './extra/meta';

/**
 * Hero-Textfarben (Prototyp: renderVals → resolveInk / btnStyle; Nachträge v8 + v13).
 * 'auto' = Stripe-Verhalten: #FFF mit mix-blend-mode:difference (invertiert live gegen die Animation).
 * 'contrast' = Schwarz/Weiß per Modus-Luminanz, 'white'/'black'/'#hex' = statisch.
 */
export interface Ink {
  col: string;
  blend: 'normal' | 'difference';
}

// Mittlere Luminanz je Hero-Modus (nur für die Option „Kontr.“).
const FX_LUM: Record<string, number> = {
  lava: 0.14,
  aurora: 0.1,
  orbit: 0.06,
  blackhole: 0.05,
  nova: 0.09,
  matrix: 0.05,
  rain: 0.08,
  swarm: 0.06,
  firefly: 0.05,
  shooting: 0.04,
  snow: 0.1,
  clouds: 0.58,
  storm: 0.07,
  ink: 0.75,
  grid: 0.06,
};

export function heroMode(s: Settings): string {
  return s.heroAnim === 'mesh' ? 'ribbon' : s.heroAnim === 'portal' ? 'flow' : s.heroAnim || 'flow';
}

export function contrastColor(mode: string, lightTheme: boolean): string {
  const raw = FX_LUM[mode] ?? EXTRA_MODES[mode]?.lum ?? (mode === 'flow' ? (lightTheme ? 0.85 : 0.5) : lightTheme ? 0.9 : 0.2);
  return raw > 0.52 ? '#10151D' : '#FFFFFF';
}

export interface HeroInkValues {
  bar: Ink & { auto: boolean };
  t1: Ink;
  t2: Ink;
  sub: Ink;
  job: Ink;
  intro: Ink;
  btn1: ButtonStyle;
  btn2: ButtonStyle;
  /** Job-Leiste und Jobtitel: eigener Hintergrund (barbg/barba, jobbg/jobba) und Textschatten (…ts/…tc). */
  barDeco: Deco;
  jobDeco: Deco;
}

export interface Deco {
  /** Hintergrund (rgba) oder undefined = Standard (Job-Leiste: Glas, Jobtitel: keiner). */
  bg?: string;
  textShadow: string;
}

export interface ButtonStyle {
  bg: string;
  fg: string;
  border: string;
  blur: string;
  shadow: string;
  pad: string;
  /** Textschatten der Beschriftung (heroParts btn1ts/btn2ts Stärke, btn1tc/btn2tc Farbe); 'none' ohne. */
  textShadow: string;
}

export function heroInk(s: Settings): HeroInkValues {
  const mode = heroMode(s);
  const contrastCol = contrastColor(mode, s.theme === 'light');
  const global = s.heroInk || 'auto';
  const parts = s.heroParts || {};

  const resolve = (part?: string): Ink => {
    let m = part || 'auto';
    if (m === 'auto') m = global;
    if (m === 'auto') return { col: '#FFFFFF', blend: 'difference' };
    if (m === 'contrast') return { col: contrastCol, blend: 'normal' };
    if (m === 'white') return { col: '#FFFFFF', blend: 'normal' };
    if (m === 'black') return { col: '#10151D', blend: 'normal' };
    if (m.startsWith('#')) return { col: m, blend: 'normal' };
    return { col: '#FFFFFF', blend: 'difference' };
  };

  const subAuto = (!parts.sub || parts.sub === 'auto') && global === 'auto';
  const introAuto = (!parts.intro || parts.intro === 'auto') && global === 'auto';
  const barAuto = !parts.bar || parts.bar === 'auto';
  const barR = resolve(parts.bar);

  /**
   * alphaPct (neu, nicht im Prototyp — Wunsch 11.10.2026): Deckkraft der Button-Fläche in % (heroParts btn1a/btn2a).
   * Glas/Liquid tönen damit in der gewählten Farbe; ab ~35 % wechselt die Schrift auf Schwarz/Weiß nach Luminanz,
   * damit sie auf der eigenen Tönung lesbar bleibt. Solid wird unter 100 % zu getöntem Glas.
   */
  const btn = (inkMode: string, styleMode: string, primary: boolean, alphaPct?: number): ButtonStyle => {
    let C: string | null = null;
    if (inkMode === 'contrast') C = contrastCol;
    else if (inkMode === 'white') C = '#FFFFFF';
    else if (inkMode === 'black') C = '#10151D';
    else if (inkMode.startsWith('#')) C = inkMode;
    const rgb = C ? rgbList(C) : '255,255,255';
    let bg = 'transparent';
    let fg: string;
    let border = 'none';
    let blur = 'none';
    let shadow = 'none';
    const a = alphaPct == null || Number.isNaN(alphaPct) ? null : Math.max(0, Math.min(100, alphaPct)) / 100;
    const readable = (c: string) => (lum(c) > 0.55 ? '#141210' : '#FFFFFF');
    if (styleMode === 'solid' && a != null && a < 1 && C != null) {
      bg = `linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.02)),rgba(${rgb},${a})`;
      blur = 'blur(18px) saturate(1.6)';
      border = `1px solid rgba(${rgb},${Math.min(0.6, a + 0.15).toFixed(2)})`;
      fg = a >= 0.35 ? readable(C) : 'var(--ink)';
      shadow = 'inset 0 1px 0 rgba(255,255,255,0.4),0 8px 22px rgba(0,0,0,0.22)';
    } else if (styleMode === 'solid') {
      if (C == null) {
        bg = primary ? 'var(--btn)' : 'var(--accent)';
        fg = primary ? 'var(--btn-ink)' : 'var(--on-accent)';
      } else {
        bg = C;
        fg = lum(C) > 0.55 ? '#141210' : '#FFFFFF';
      }
      shadow = 'inset 0 1px 0 rgba(255,255,255,0.28)';
    } else if (styleMode === 'ghost') {
      fg = C == null ? (primary ? 'var(--ink)' : 'var(--accent)') : C;
      border = C == null ? (primary ? '1.5px solid var(--border)' : 'none') : `1.5px solid ${C}`;
    } else if (styleMode === 'glas') {
      const ga = a ?? 0.14;
      bg = `rgba(${rgb},${ga})`;
      blur = 'blur(14px) saturate(1.5)';
      border = `1px solid rgba(${rgb},${Math.min(0.6, ga + 0.16).toFixed(2)})`;
      fg = C == null ? 'var(--ink)' : ga >= 0.35 ? readable(C) : C;
      shadow = 'inset 0 1px 0 rgba(255,255,255,0.3)';
    } else {
      const la = a ?? 0.1;
      bg = `linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.03)),rgba(${rgb},${la})`;
      blur = 'blur(22px) saturate(1.8)';
      border = `1px solid rgba(${rgb},${Math.min(0.6, la + 0.14).toFixed(2)})`;
      fg = C == null ? 'var(--ink)' : la >= 0.35 ? readable(C) : C;
      shadow = 'inset 0 1px 0 rgba(255,255,255,0.45),0 10px 26px rgba(0,0,0,0.28)';
    }
    const boxed = styleMode === 'solid' || styleMode === 'glas' || styleMode === 'liquid';
    const pad = boxed ? '13px 26px' : primary ? '13px 22px' : '13px 6px';
    return { bg, fg, border, blur, shadow, pad, textShadow: 'none' };
  };

  /**
   * Beschriftung der Buttons (neu, Wunsch 11.10.2026): eigene Schriftfarbe (btnXl, '#hex', sonst automatisch wie oben)
   * und Textschatten mit Stärke 0–100 (btnXts) und Farbe (btnXtc, Standard Schwarz).
   */
  const textShadowOf = (key: string): string => {
    const ts = Number(parts[`${key}ts`] ?? 0);
    const k = Math.max(0, Math.min(100, Number.isNaN(ts) ? 0 : ts)) / 100;
    const sc = rgbList(parts[`${key}tc`]?.startsWith('#') ? parts[`${key}tc`] : '#000000');
    return k > 0
      ? `0 1px ${(1 + 2 * k).toFixed(1)}px rgba(${sc},${(0.3 + 0.6 * k).toFixed(2)}),0 2px ${(4 + 14 * k).toFixed(1)}px rgba(${sc},${(0.2 + 0.55 * k).toFixed(2)})`
      : 'none';
  };
  const label = (b: ButtonStyle, key: 'btn1' | 'btn2'): ButtonStyle => {
    const l = parts[`${key}l`];
    return { ...b, fg: l && l.startsWith('#') ? l : b.fg, textShadow: textShadowOf(key) };
  };
  /** Job-Leiste/Jobtitel (Wunsch 11.10.2026): Hintergrundfarbe mit Deckkraft (Standard 60 %) + Textschatten. */
  const deco = (key: 'bar' | 'job'): Deco => {
    const bg = parts[`${key}bg`];
    const a = Math.max(0, Math.min(100, Number(parts[`${key}ba`] ?? 60))) / 100;
    return { bg: bg && bg.startsWith('#') ? `rgba(${rgbList(bg)},${a})` : undefined, textShadow: textShadowOf(key) };
  };

  return {
    bar: barAuto ? { col: 'var(--muted)', blend: 'normal', auto: true } : { ...barR, auto: false },
    t1: resolve(parts.t1),
    t2: resolve(parts.t2),
    sub: subAuto ? { col: '#8A94A4', blend: 'difference' } : resolve(parts.sub),
    job: resolve(parts.job),
    intro: introAuto ? { col: '#C7CFDC', blend: 'difference' } : resolve(parts.intro),
    btn1: label(btn(parts.btn1 || 'auto', parts.btn1s || 'solid', true, parts.btn1a ? Number(parts.btn1a) : undefined), 'btn1'),
    barDeco: deco('bar'),
    jobDeco: deco('job'),
    btn2: label(btn(parts.btn2 || 'auto', parts.btn2s || 'ghost', false, parts.btn2a ? Number(parts.btn2a) : undefined), 'btn2'),
  };
}
