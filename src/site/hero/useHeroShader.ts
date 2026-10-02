'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Settings } from '../settings/schema';
import { HeroEngine, type HeroEngineState } from './engine/heroEngine';

/**
 * Bindet die Prototyp-Engine an die Startseite. Wie im Prototyp (componentDidMount + componentDidUpdate):
 * nach jedem Render ensureLava()/attachHeroObserver(); die Engine entscheidet selbst, ob der laufende
 * Renderer weiterläuft oder neu startet. Rückgabe: cineDone (Matrix-Cinematic beendet).
 */
export function useHeroShader(s: Settings): boolean {
  const [cineDone, setCineDone] = useState(false);
  const engine = useRef<HeroEngine | null>(null);
  // Neuester Zustand für die Engine (liest ihn im Animations-Frame); cineDone-Patches kommen sofort hinzu.
  const next: HeroEngineState = {
    page: 'hallo',
    heroAnim: s.heroAnim,
    anim: s.anim,
    heroCfg: s.heroCfg,
    fpsHalf: s.fpsHalf,
    perfMode: s.perfMode,
    auroraPre: s.auroraPre,
    mxCine: s.mxCine,
    mxT1: s.mxT1,
    mxT2: s.mxT2,
    mxSize: s.mxSize,
    cineDone,
  };
  const state = useRef(next);
  useLayoutEffect(() => {
    state.current = next;
  });

  useEffect(() => {
    const e = new HeroEngine(
      () => state.current,
      (patch) => {
        if (typeof patch.cineDone === 'boolean') {
          state.current = { ...state.current, cineDone: patch.cineDone };
          setCineDone(patch.cineDone);
        }
      },
    );
    engine.current = e;
    return () => {
      e.destroy();
      engine.current = null;
    };
  }, []);

  useEffect(() => {
    const e = engine.current;
    if (!e) return;
    e.attachHeroObserver();
    e.ensureLava();
  });

  return cineDone;
}
