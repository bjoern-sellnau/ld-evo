/**
 * Zusätzliche Hero-Animationen (neu, nicht im Prototyp — Wunsch vom 11.10.2026: „20 mehr, kreativer“).
 * Bewusst getrennt von der generierten Prototyp-Engine (heroEngine.js, nicht von Hand ändern): Die Engine kennt diese
 * Modi nicht und hält sich raus; gezeichnet wird in #ld-extra-canvas (src/site/hero/extra/useExtraHero.ts).
 * Hier nur die leichten Metadaten — die Renderer (renderers.ts) werden erst geladen, wenn ein Modus gewählt ist.
 *
 * bg = statischer Hintergrund der FX-Fläche (auch Fallback ohne WebGL), sample = Luminanz „dunkel,hell“ für den
 * Auto-Kontrast der Leisten, lum = mittlere Helligkeit für die Hero-Text-Option „Kontrast“.
 */
export interface ExtraModeMeta {
  label: string;
  renderer: 'webgl' | 'canvas2d';
  bg: string;
  sample: string;
  lum: number;
}

export const EXTRA_MODES: Record<string, ExtraModeMeta> = {
  kaleido: { label: 'Kaleidoskop', renderer: 'webgl', bg: '#07040F', sample: '0.12,0.12', lum: 0.12 },
  tunnel: { label: 'Hypertunnel', renderer: 'webgl', bg: '#020309', sample: '0.08,0.08', lum: 0.08 },
  mosaic: { label: 'Glasmosaik', renderer: 'webgl', bg: '#0A0710', sample: '0.16,0.16', lum: 0.16 },
  topo: { label: 'Topografie', renderer: 'webgl', bg: '#05080D', sample: '0.07,0.07', lum: 0.07 },
  metal: { label: 'Flüssigmetall', renderer: 'webgl', bg: '#0B0C10', sample: '0.2,0.2', lum: 0.2 },
  prism: { label: 'Prisma', renderer: 'webgl', bg: '#04040A', sample: '0.1,0.1', lum: 0.1 },
  moire: { label: 'Moiré', renderer: 'webgl', bg: '#06060B', sample: '0.14,0.14', lum: 0.14 },
  flowfield: { label: 'Strömungsfeld', renderer: 'canvas2d', bg: '#05060B', sample: '0.06,0.06', lum: 0.06 },
  chladni: { label: 'Klangfiguren', renderer: 'canvas2d', bg: '#08070C', sample: '0.07,0.07', lum: 0.07 },
  life: { label: 'Neon-Leben', renderer: 'canvas2d', bg: '#040608', sample: '0.05,0.05', lum: 0.05 },
  turing: { label: 'Turing-Muster', renderer: 'canvas2d', bg: '#06050A', sample: '0.12,0.12', lum: 0.12 },
  harmonograph: { label: 'Harmonograph', renderer: 'canvas2d', bg: '#05050A', sample: '0.05,0.05', lum: 0.05 },
  pendulum: { label: 'Pendelwelle', renderer: 'canvas2d', bg: '#05070C', sample: '0.05,0.05', lum: 0.05 },
  circuit: { label: 'Platinenstrom', renderer: 'canvas2d', bg: '#03080A', sample: '0.05,0.05', lum: 0.05 },
  plexus: { label: 'Sternbilder', renderer: 'canvas2d', bg: '#04060E', sample: '0.05,0.05', lum: 0.05 },
  bubbles: { label: 'Seifenblasen', renderer: 'canvas2d', bg: '#060912', sample: '0.07,0.07', lum: 0.07 },
  mandala: { label: 'Mandala', renderer: 'canvas2d', bg: '#07050C', sample: '0.07,0.07', lum: 0.07 },
  silk: { label: 'Seidenfäden', renderer: 'canvas2d', bg: '#05040A', sample: '0.06,0.06', lum: 0.06 },
  cells: { label: 'Zellteilung', renderer: 'canvas2d', bg: '#050A0C', sample: '0.07,0.07', lum: 0.07 },
  ldswarm: { label: 'LD-Partikel', renderer: 'canvas2d', bg: '#06050A', sample: '0.06,0.06', lum: 0.06 },
  // Zweite Welle (17.10.2026), Renderer in renderers2.ts
  zeitreise: { label: 'Zeitreise 2007 → heute', renderer: 'canvas2d', bg: '#070910', sample: '0.06,0.06', lum: 0.08 },
  livecode: { label: 'Live-Code', renderer: 'canvas2d', bg: '#06080D', sample: '0.05,0.05', lum: 0.06 },
  agent: { label: 'Agent-Terminal', renderer: 'canvas2d', bg: '#05070C', sample: '0.05,0.05', lum: 0.06 },
  commits: { label: 'Commit-Galaxie', renderer: 'canvas2d', bg: '#04050A', sample: '0.05,0.05', lum: 0.05 },
  fluid: { label: 'Cursor-Flüssigkeit', renderer: 'canvas2d', bg: '#05060B', sample: '0.07,0.07', lum: 0.08 },
  magnet: { label: 'Magnetische Zeichen', renderer: 'canvas2d', bg: '#05060B', sample: '0.06,0.06', lum: 0.07 },
  lens: { label: 'Glas-Lupe', renderer: 'webgl', bg: '#06070D', sample: '0.12,0.12', lum: 0.12 },
  tetris: { label: 'Pixel-Tetris', renderer: 'canvas2d', bg: '#06070C', sample: '0.06,0.06', lum: 0.08 },
  raycast: { label: 'Retro-Raycaster', renderer: 'canvas2d', bg: '#05060C', sample: '0.08,0.08', lum: 0.1 },
  descent: { label: '6D-Flug', renderer: 'canvas2d', bg: '#04050A', sample: '0.05,0.05', lum: 0.06 },
  synthwave: { label: 'Synthwave-Straße', renderer: 'canvas2d', bg: '#07040F', sample: '0.1,0.1', lum: 0.12 },
  paper: { label: 'Papierschichten', renderer: 'canvas2d', bg: '#0A0B12', sample: '0.1,0.1', lum: 0.12 },
  sky: { label: 'Tageszeit-Himmel (Berlin)', renderer: 'canvas2d', bg: '#0A1230', sample: '0.12,0.12', lum: 0.14 },
  weather: { label: 'Wetter Berlin', renderer: 'canvas2d', bg: '#1A2433', sample: '0.14,0.14', lum: 0.15 },
  inkwater: { label: 'Tinte im Wasser', renderer: 'webgl', bg: '#04070C', sample: '0.06,0.06', lum: 0.07 },
  // Zwei Horizonte (horizons.ts): Schwarze Löcher über Feldern — im Wechsel oder je eine Szene
  horizons: { label: 'Zwei Horizonte', renderer: 'webgl', bg: '#0A0710', sample: '0.12,0.12', lum: 0.14 },
  aurum: { label: 'Zwei Horizonte: Aurum', renderer: 'webgl', bg: '#120804', sample: '0.12,0.12', lum: 0.14 },
  viola: { label: 'Zwei Horizonte: Viola', renderer: 'webgl', bg: '#16141F', sample: '0.16,0.16', lum: 0.18 },
  // Live-Build (build.ts): schwarze Seite, Terminal baut die Startseite, Elemente erscheinen nach und nach
  buildcode: { label: 'Live-Build: Code', renderer: 'canvas2d', bg: '#000000', sample: '0.03,0.03', lum: 0.03 },
  buildcodets: { label: 'Live-Build: Code (Timeshift)', renderer: 'canvas2d', bg: '#000000', sample: '0.03,0.03', lum: 0.03 },
  buildserver: { label: 'Live-Build: Dev-Server + Code', renderer: 'canvas2d', bg: '#000000', sample: '0.03,0.03', lum: 0.03 },
  buildserverts: {
    label: 'Live-Build: Dev-Server + Code (Timeshift)',
    renderer: 'canvas2d',
    bg: '#000000',
    sample: '0.03,0.03',
    lum: 0.03,
  },
  buildagents: { label: 'Live-Build: Agents', renderer: 'canvas2d', bg: '#000000', sample: '0.03,0.03', lum: 0.03 },
  buildagentsts: { label: 'Live-Build: Agents (Timeshift)', renderer: 'canvas2d', bg: '#000000', sample: '0.03,0.03', lum: 0.03 },
};

export const isExtraMode = (mode: string): boolean => mode in EXTRA_MODES;

/**
 * Hero „LD-Partikel“: Logos, die die Teilchen formen können (Einstellung „Partikel-Logo“), und der Loop
 * (Wunsch 31.10.2026): Reihenfolge (cfg.order) und abgeschaltete Logos (cfg.off) frei wählbar, Wechsel alle cfg.every s.
 */
export const SWARM_LOGOS = [
  ['zeichen', 'Zeichen'],
  ['badge', 'Badge-LD'],
  ['bewegt', 'Bewegtes Zeichen'],
  ['wort', 'Wortmarke'],
  ['lockup', 'Lockup'],
] as const;
export type SwarmLogo = (typeof SWARM_LOGOS)[number][0];
const SWARM_KEYS: readonly string[] = SWARM_LOGOS.map(([k]) => k);
/** Wechsel im Loop: Standard wie der bisherige Takt (9 s), Regler 4–30 s. */
export const SWARM_EVERY = { def: 9, min: 4, max: 30 } as const;

/** Alle Logos in der gewählten Reihenfolge (unbekannte Einträge raus, fehlende hinten an). */
export function swarmOrder(cfg: Record<string, unknown>): SwarmLogo[] {
  const order = Array.isArray(cfg.order) ? cfg.order.filter((k): k is SwarmLogo => SWARM_KEYS.includes(k as string)) : [];
  const uniq = [...new Set(order)];
  return [...uniq, ...SWARM_KEYS.filter((k) => !uniq.includes(k as SwarmLogo))] as SwarmLogo[];
}
/** Logos, die im Loop gezeigt werden (mindestens eins). */
export function swarmLoop(cfg: Record<string, unknown>): SwarmLogo[] {
  const off = Array.isArray(cfg.off) ? cfg.off : [];
  const on = swarmOrder(cfg).filter((k) => !off.includes(k));
  return on.length ? on : ['zeichen'];
}
export function swarmEvery(cfg: Record<string, unknown>): number {
  const n = Number(cfg.every);
  return Number.isFinite(n) && n > 0 ? Math.min(SWARM_EVERY.max, Math.max(SWARM_EVERY.min, Math.round(n))) : SWARM_EVERY.def;
}
