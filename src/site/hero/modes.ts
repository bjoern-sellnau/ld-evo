/**
 * Hero-Modi: EINE Map Modus → Renderer als Quelle für Routing und Canvas-Wahl (Lehre aus Nachtrag v6).
 * bg = statischer Hintergrund der FX-Fläche (auch Fallback bei WebGL-Fehler), sample = "dunkelLum,hellLum"
 * für den Auto-Kontrast. Werte 1:1 aus renderVals (heroFxBg / heroFxSample / heroGlDisp / heroOrbitDisp).
 */
import { lum } from '../lib/color';
import { heroCfgOf, resolvePal } from './palettes';

export type HeroRenderer = 'css' | 'webgl' | 'canvas2d';

export interface HeroModeDef {
  renderer: HeroRenderer;
  bg: string | null;
  sample: string | null;
}

export const HERO_MODES: Record<string, HeroModeDef> = {
  flow: { renderer: 'css', bg: 'transparent', sample: '0.52' },
  lava: { renderer: 'webgl', bg: 'linear-gradient(180deg,#180A20,#0B0710)', sample: '0.14,0.14' },
  aurora: { renderer: 'webgl', bg: 'linear-gradient(180deg,#03101E,#01060D)', sample: '0.10,0.10' },
  ribbon: { renderer: 'webgl', bg: null, sample: null }, // BG/Sample aus Palette + cfg.t (heroFxBgOf)
  blackhole: { renderer: 'webgl', bg: 'linear-gradient(180deg,#0A0512,#020108)', sample: '0.05,0.05' },
  nova: { renderer: 'webgl', bg: 'linear-gradient(180deg,#100617,#030109)', sample: '0.09,0.09' },
  plasma: { renderer: 'webgl', bg: 'linear-gradient(180deg,#0B0518,#02010A)', sample: '0.34,0.34' },
  fire: { renderer: 'webgl', bg: 'linear-gradient(180deg,#1A0A02,#050100)', sample: '0.16,0.16' },
  clouds: { renderer: 'webgl', bg: 'linear-gradient(180deg,#7FA8D6,#B9CCE4)', sample: '0.55,0.62' },
  storm: { renderer: 'webgl', bg: 'linear-gradient(180deg,#02050B,#051017)', sample: '0.07,0.07' },
  ink: { renderer: 'webgl', bg: '#F1EFEA', sample: '0.72,0.78' },
  grid: { renderer: 'webgl', bg: 'linear-gradient(180deg,#080212,#12041F)', sample: '0.06,0.06' },
  orbit: { renderer: 'canvas2d', bg: 'linear-gradient(180deg,#070A16,#03040A)', sample: '0.06,0.06' },
  matrix: { renderer: 'canvas2d', bg: '#040705', sample: '0.05,0.05' },
  rain: { renderer: 'canvas2d', bg: 'linear-gradient(180deg,#0B1220,#05070E)', sample: '0.08,0.08' },
  swarm: { renderer: 'canvas2d', bg: '#05070D', sample: '0.06,0.06' },
  firefly: { renderer: 'canvas2d', bg: 'linear-gradient(180deg,#060B14,#0A1410)', sample: '0.05,0.05' },
  shooting: { renderer: 'canvas2d', bg: 'linear-gradient(180deg,#04070F,#0A0F1E)', sample: '0.04,0.04' },
  snow: { renderer: 'canvas2d', bg: 'linear-gradient(180deg,#0A0E1A,#141B2C)', sample: '0.10,0.10' },
  matrix2: { renderer: 'canvas2d', bg: '#020403', sample: '0.04,0.04' },
  helix: { renderer: 'canvas2d', bg: 'linear-gradient(180deg,#04060C,#020308)', sample: '0.05,0.05' },
  comet: { renderer: 'canvas2d', bg: '#030509', sample: '0.04,0.04' },
  galaxy: { renderer: 'canvas2d', bg: '#02040A', sample: '0.05,0.05' },
  ocean: { renderer: 'canvas2d', bg: 'linear-gradient(180deg,#050810,#0A1626)', sample: '0.08,0.08' },
  storm2: { renderer: 'canvas2d', bg: 'linear-gradient(180deg,#0A0C14,#04050A)', sample: '0.06,0.06' },
  hourglass: { renderer: 'canvas2d', bg: 'linear-gradient(180deg,#070A12,#03040A)', sample: '0.05,0.05' },
  fireworks: { renderer: 'canvas2d', bg: 'linear-gradient(180deg,#06060F,#030308)', sample: '0.04,0.04' },
};

/** FX-Hintergrund; Ribbon: Palette[0]→[1] bzw. transparent bei cfg.t. */
export function heroFxBgOf(mode: string, heroCfg: Record<string, unknown>): string {
  if (mode === 'ribbon') {
    const cfg = heroCfgOf(heroCfg, 'ribbon');
    const p = resolvePal(cfg);
    return cfg.t ? 'transparent' : `linear-gradient(180deg,${p[0]},${p[1]})`;
  }
  return HERO_MODES[mode]?.bg ?? 'transparent';
}

export function heroFxSampleOf(mode: string, heroCfg: Record<string, unknown>): string {
  if (mode === 'ribbon') {
    const cfg = heroCfgOf(heroCfg, 'ribbon');
    const l = lum(resolvePal(cfg)[1]).toFixed(2);
    return cfg.t ? '0.05,0.95' : `${l},${l}`;
  }
  return HERO_MODES[mode]?.sample ?? '0.52';
}
