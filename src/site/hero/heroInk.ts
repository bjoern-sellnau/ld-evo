import { lum, rgbList } from '../lib/color';
import type { Settings } from '../settings/schema';

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
  const raw = FX_LUM[mode] ?? (mode === 'flow' ? (lightTheme ? 0.85 : 0.5) : lightTheme ? 0.9 : 0.2);
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
}

export interface ButtonStyle {
  bg: string;
  fg: string;
  border: string;
  blur: string;
  shadow: string;
  pad: string;
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

  const btn = (inkMode: string, styleMode: string, primary: boolean): ButtonStyle => {
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
    if (styleMode === 'solid') {
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
      bg = `rgba(${rgb},0.14)`;
      blur = 'blur(14px) saturate(1.5)';
      border = `1px solid rgba(${rgb},0.3)`;
      fg = C == null ? 'var(--ink)' : C;
      shadow = 'inset 0 1px 0 rgba(255,255,255,0.3)';
    } else {
      bg = `linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.03)),rgba(${rgb},0.10)`;
      blur = 'blur(22px) saturate(1.8)';
      border = `1px solid rgba(${rgb},0.24)`;
      fg = C == null ? 'var(--ink)' : C;
      shadow = 'inset 0 1px 0 rgba(255,255,255,0.45),0 10px 26px rgba(0,0,0,0.28)';
    }
    const boxed = styleMode === 'solid' || styleMode === 'glas' || styleMode === 'liquid';
    const pad = boxed ? '13px 26px' : primary ? '13px 22px' : '13px 6px';
    return { bg, fg, border, blur, shadow, pad };
  };

  return {
    bar: barAuto ? { col: 'var(--muted)', blend: 'normal', auto: true } : { ...barR, auto: false },
    t1: resolve(parts.t1),
    t2: resolve(parts.t2),
    sub: subAuto ? { col: '#8A94A4', blend: 'difference' } : resolve(parts.sub),
    job: resolve(parts.job),
    intro: introAuto ? { col: '#C7CFDC', blend: 'difference' } : resolve(parts.intro),
    btn1: btn(parts.btn1 || 'auto', parts.btn1s || 'solid', true),
    btn2: btn(parts.btn2 || 'auto', parts.btn2s || 'ghost', false),
  };
}
