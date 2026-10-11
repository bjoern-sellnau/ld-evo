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
};

export const isExtraMode = (mode: string): boolean => mode in EXTRA_MODES;
