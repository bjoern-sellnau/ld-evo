/** Hero-Paletten (Prototyp: pals() / resolvePal()). */
export const PALETTES = {
  amber: ['#FFD36E', '#FFB224', '#FF7A2F', '#FF5E8A', '#7A4ADB'],
  ocean: ['#8FF5E4', '#38C6F4', '#2F7AD6', '#5E5AE6', '#8A4ADB'],
  candy: ['#FFD6E8', '#FF8AC2', '#FF5E8A', '#C44ADB', '#7A4ADB'],
  forest: ['#EAFFB0', '#A8E063', '#4CAF50', '#1F8A5B', '#0F5F46'],
  mono: ['#F5F7FA', '#C9D4E0', '#8A97A8', '#55606E', '#2A323C'],
} as const;

export type PaletteName = keyof typeof PALETTES;

/** Konfiguration eines Hero-Modus in ld-herocfg: Größe/Position/Winkel/Transparenz/Palette/Custom-Farben. */
export interface HeroModeCfg {
  s?: number;
  x?: number;
  y?: number;
  a?: number;
  t?: boolean;
  pal?: PaletteName | 'custom';
  cust?: string[];
  [k: string]: unknown;
}

export function resolvePal(cfg: HeroModeCfg | undefined): readonly string[] {
  const c = cfg ?? {};
  if (c.pal === 'custom' && Array.isArray(c.cust) && c.cust.length === 5) return c.cust;
  return (c.pal && c.pal !== 'custom' && PALETTES[c.pal]) || PALETTES.amber;
}

export function heroCfgOf(heroCfg: Record<string, unknown>, mode: string): HeroModeCfg {
  return (heroCfg[mode] as HeroModeCfg | undefined) ?? {};
}
