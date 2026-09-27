/**
 * Einstellungen der Site mit den localStorage-Keys und Kodierungen des Prototyps
 * (Loona Site V2.dc.html → componentDidMount / Setter in renderVals).
 */

export type Theme = 'dark' | 'light';
export type StyleMode = 'liquid' | 'fluent' | 'glassm';
export type ViewMode = 'auto' | 'desktop' | 'mobile' | 'wide';
export type Frame = 'clear' | 'island' | 'hole' | 'notch';
/** Browser-UI-Farbe: Marken-Ink (Logo-Handoff) oder Seitenhintergrund (--bg). */
export type ThemeColorMode = 'brand' | 'site';

export interface Settings {
  theme: Theme;
  anim: boolean;
  hc: boolean;
  shadowOn: boolean;
  flat: boolean;
  blurOn: boolean;
  refrOn: boolean;
  styleMode: StyleMode;
  glassLvl: number;
  accentSel: string | null;
  autoC: boolean;
  oppC: boolean;
  ctShadow: boolean;
  ctStrength: number;
  scrollBg: boolean;
  coverFull: boolean;
  heroAnim: string;
  auroraPre: string;
  heroCfg: Record<string, unknown>;
  heroInk: string;
  heroParts: Record<string, string>;
  viewMode: ViewMode;
  mobModern: boolean;
  scrollHide: boolean;
  frame: Frame;
  frameCfg: Record<string, unknown>;
  navSide: boolean;
  perfMode: boolean;
  fpsHalf: boolean;
  splashOn: boolean;
  splashAnim: string;
  heroStats: boolean;
  fullHero: boolean;
  pageVt: string;
  detailPlain: boolean;
  mxCine: boolean;
  mxT1: string | null;
  mxT2: string | null;
  mxLater: boolean;
  mxSize: number;
  cookie: string | null;
  themeColor: ThemeColorMode;
}

/** SSR-Defaults (dark, Animationen an) — entsprechen dem initialen State des Prototyps. */
export const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  anim: true,
  hc: false,
  shadowOn: true,
  flat: false,
  blurOn: true,
  refrOn: true,
  styleMode: 'liquid',
  glassLvl: 3,
  accentSel: null,
  autoC: true,
  oppC: true,
  ctShadow: false,
  ctStrength: 100,
  scrollBg: true,
  coverFull: true,
  heroAnim: 'flow',
  auroraPre: 'current',
  heroCfg: {},
  heroInk: 'auto',
  heroParts: {},
  viewMode: 'auto',
  mobModern: false,
  scrollHide: false,
  frame: 'clear',
  frameCfg: {},
  navSide: false,
  perfMode: false,
  fpsHalf: false,
  splashOn: true,
  splashAnim: 'logo',
  heroStats: false,
  fullHero: false,
  pageVt: 'fade',
  detailPlain: false,
  mxCine: true,
  mxT1: null,
  mxT2: null,
  mxLater: false,
  mxSize: 100,
  cookie: null,
  themeColor: 'brand',
};

interface Codec<T> {
  key: string;
  read: (raw: string | null) => T;
  write: (value: T) => string | null;
}

/** Default an, gespeichert wird 'off' zum Abschalten (Prototyp: `x !== 'off'`). */
const onUnlessOff = (key: string): Codec<boolean> => ({ key, read: (r) => r !== 'off', write: (v) => (v ? 'on' : 'off') });
/** Default aus, nur 'on' schaltet ein (Prototyp: `x === 'on'`). */
const offUnlessOn = (key: string): Codec<boolean> => ({ key, read: (r) => r === 'on', write: (v) => (v ? 'on' : 'off') });
const str = <T extends string>(key: string, fallback: T): Codec<T> => ({ key, read: (r) => (r ?? fallback) as T, write: (v) => v });
const nullableStr = (key: string): Codec<string | null> => ({ key, read: (r) => r, write: (v) => v });
const int = (key: string, fallback: number): Codec<number> => ({
  key,
  read: (r) => (r ? parseInt(r, 10) || fallback : fallback),
  write: (v) => String(v),
});
const json = <T>(key: string): Codec<T> => ({
  key,
  read: (r) => {
    try {
      return (JSON.parse(r || '{}') || {}) as T;
    } catch {
      return {} as T;
    }
  },
  write: (v) => JSON.stringify(v),
});

export const SETTINGS_CODECS: { [K in keyof Settings]: Codec<Settings[K]> } = {
  theme: str<Theme>('ld-theme', 'dark'),
  anim: { key: 'ld-anim', read: (r) => (r === null ? true : r === 'on'), write: (v) => (v ? 'on' : 'off') },
  hc: offUnlessOn('ld-hc'),
  shadowOn: onUnlessOff('ld-shadow'),
  flat: offUnlessOn('ld-flat'),
  blurOn: onUnlessOff('ld-blur'),
  refrOn: onUnlessOff('ld-refr'),
  styleMode: str<StyleMode>('ld-style', 'liquid'),
  glassLvl: int('ld-glasslvl', 3),
  accentSel: nullableStr('ld-accent'),
  autoC: onUnlessOff('ld-autoc'),
  oppC: onUnlessOff('ld-oppc'),
  ctShadow: offUnlessOn('ld-ctshadow'),
  ctStrength: int('ld-ctstrength', 100),
  scrollBg: onUnlessOff('ld-scrollbg'),
  coverFull: onUnlessOff('ld-coverfull'),
  // Alt-Stände 'mesh'/'portal' → 'ribbon'/'flow' (Nachtrag v6)
  heroAnim: {
    key: 'ld-heroanim',
    read: (r) => (r === 'mesh' ? 'ribbon' : r === 'portal' ? 'flow' : r) || 'flow',
    write: (v) => v,
  },
  auroraPre: str<string>('ld-aurorapre', 'current'),
  heroCfg: json('ld-herocfg'),
  heroInk: str<string>('ld-heroink', 'auto'),
  heroParts: json('ld-heroparts'),
  viewMode: str<ViewMode>('ld-viewmode', 'auto'),
  mobModern: offUnlessOn('ld-mobnav'),
  scrollHide: offUnlessOn('ld-scrollhide'),
  frame: str<Frame>('ld-frame', 'clear'),
  frameCfg: json('ld-framecfg'),
  navSide: offUnlessOn('ld-navside'),
  perfMode: offUnlessOn('ld-perfmode'),
  fpsHalf: offUnlessOn('ld-fpshalf'),
  splashOn: onUnlessOff('ld-splash'),
  splashAnim: str<string>('ld-splashanim', 'logo'),
  heroStats: offUnlessOn('ld-herostats'),
  fullHero: offUnlessOn('ld-fullhero'),
  pageVt: str<string>('ld-pagevt', 'fade'),
  detailPlain: offUnlessOn('ld-detailplain'),
  mxCine: onUnlessOff('ld-mxcine'),
  mxT1: nullableStr('ld-mxt1'),
  mxT2: nullableStr('ld-mxt2'),
  mxLater: offUnlessOn('ld-mxlater'),
  mxSize: int('ld-mxsize', 100),
  cookie: nullableStr('ld-cookie'),
  // Neu (nicht im Prototyp): wählbare theme-color
  themeColor: str<ThemeColorMode>('ld-themecolor', 'brand'),
};

export function readSettings(storage: Pick<Storage, 'getItem'>): Settings {
  const out = { ...DEFAULT_SETTINGS };
  for (const k of Object.keys(SETTINGS_CODECS) as (keyof Settings)[]) {
    const codec = SETTINGS_CODECS[k] as Codec<unknown>;
    let raw: string | null = null;
    try {
      raw = storage.getItem(codec.key);
    } catch {
      /* Storage gesperrt (Private Mode etc.) */
    }
    (out as Record<string, unknown>)[k] = codec.read(raw);
  }
  return out;
}

export function writeSetting<K extends keyof Settings>(storage: Pick<Storage, 'setItem' | 'removeItem'>, key: K, value: Settings[K]) {
  const codec = SETTINGS_CODECS[key];
  const raw = codec.write(value);
  try {
    if (raw === null) storage.removeItem(codec.key);
    else storage.setItem(codec.key, raw);
  } catch {
    /* ignorieren */
  }
}

/** Akzent-Auswahl, pro Theme gemappt (Prototyp: applyBody MAP / accents). */
export const ACCENTS = [
  { name: 'Gelb', key: '#FFB224', dark: '#FFB224', light: '#B45309' },
  { name: 'Orange', key: '#FF7A2F', dark: '#FF7A2F', light: '#C2410C' },
  { name: 'Blau', key: '#3B82F6', dark: '#3B82F6', light: '#1D4ED8' },
] as const;
