'use client';

import { useSite } from '../settings/SiteProvider';
import { heroCfgOf, resolvePal } from './palettes';

/**
 * Hero-Modus „Flow“ (Default, reines CSS): rotierendes Squircle 110vw × 470 px, Radius 96, −8°, mit wanderndem
 * Farbband, Echo und zwei Satelliten. Markup/Werte 1:1 aus dem Prototyp (Zeile 377 ff.); Größe/Position aus
 * ld-herocfg.flow (s/x/y). Die Ebenen sind Geschwister des Hero-Texts im selben Stacking-Context, damit
 * mix-blend-mode:difference auf den Text greift (Nachtrag v13) — daher hier kein isolierender Wrapper.
 */
export function FlowHero() {
  const { settings } = useSite();
  const cfg = heroCfgOf(settings.heroCfg, 'flow');
  const p = resolvePal(cfg);
  const flowGrad = `linear-gradient(100deg,${p[0]} 0%,${p[1]} 12%,${p[2]} 26%,${p[3]} 40%,${p[4]} 52%,${p[3]} 64%,${p[2]} 76%,${p[1]} 88%,${p[0]} 100%)`;
  const dx = ((cfg.x ?? 50) - 50) * 0.7;
  const dy = ((cfg.y ?? 50) - 50) * 3;
  const scale = (cfg.s ?? 100) / 100;

  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        transform: `translate(${dx}%,${dy}px) scale(${scale})`,
        transformOrigin: '62% 18%',
        transition: 'transform 0.2s ease',
      }}
    >
      <div
        data-ldsample="0.2,0.78"
        style={{
          position: 'absolute',
          top: -90,
          left: '38%',
          width: '110vw',
          height: 210,
          borderRadius: 70,
          transform: 'rotate(-8deg)',
          transformOrigin: 'left center',
          animation: 'ldFloatRot 12s ease-in-out -4s infinite',
          background: `linear-gradient(100deg,${p[1]},${p[3]} 45%,${p[4]})`,
          filter: 'blur(30px)',
          opacity: 0.4,
          pointerEvents: 'none',
        }}
      />
      <div
        data-ldsample="0.52"
        style={{
          position: 'absolute',
          top: -70,
          left: '35%',
          width: '110vw',
          height: 470,
          borderRadius: 96,
          transform: 'rotate(-8deg)',
          transformOrigin: 'left center',
          animation: 'ldFloatRot 9s ease-in-out infinite',
          overflow: 'hidden',
          boxShadow: '0 30px 80px rgba(255,122,47,0.18)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: '200%',
            background: flowGrad,
            animation: 'ldWave 26s ease-in-out infinite alternate',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '52%',
            background: 'linear-gradient(180deg,rgba(255,255,255,0.28),rgba(255,255,255,0))',
          }}
        />
      </div>
      <div
        data-ldsample="0.42,0.5"
        style={{
          position: 'absolute',
          top: 34,
          left: '29%',
          width: 140,
          height: 28,
          borderRadius: 12,
          transform: 'rotate(-8deg)',
          animation: 'ldFloatRot 7s ease-in-out -2s infinite',
          background: `linear-gradient(90deg,${p[2]},${p[3]})`,
          opacity: 0.85,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 80,
          left: '26%',
          width: 80,
          height: 17,
          borderRadius: 8,
          transform: 'rotate(-8deg)',
          animation: 'ldFloatRot 8s ease-in-out -5s infinite',
          background: p[4],
          opacity: 0.55,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
