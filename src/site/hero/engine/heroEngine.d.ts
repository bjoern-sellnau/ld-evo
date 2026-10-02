/** Typen für die generierte Prototyp-Engine (heroEngine.js). */
export interface HeroEngineState {
  page: string;
  heroAnim: string;
  anim: boolean;
  heroCfg: Record<string, unknown>;
  fpsHalf: boolean;
  perfMode: boolean;
  auroraPre: string;
  mxCine: boolean;
  mxT1: string | null;
  mxT2: string | null;
  mxSize: number;
  cineDone?: boolean;
}

export class HeroEngine {
  constructor(getState: () => HeroEngineState, onState: (patch: Partial<HeroEngineState>) => void);
  ensureLava(): void;
  stopLava(): void;
  attachHeroObserver(): void;
  destroy(): void;
}
