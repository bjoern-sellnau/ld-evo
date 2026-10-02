'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { LoonaTile } from '@/components/brand';
import { heroMode } from '../hero/heroInk';
import { useSite } from '../settings/SiteProvider';
import { SKETCH_HTML } from './sketchMarkup';

/** Event, mit dem das Einstellungs-Panel den gewählten Splash sofort zur Vorschau abspielt (Nachtrag v17). */
export const SPLASH_REPLAY_EVENT = 'ld-splash-replay';

const mono = 'var(--ld-font-mono),monospace';
const BAR = 'linear-gradient(90deg,rgba(255,178,36,0),#FFB224,#FF7A2F,rgba(255,122,47,0))';

/**
 * Brand-Splash beim Laden (immer dunkel): 2,5 s sichtbar, 0,5 s Fade, danach entfernt. Varianten Logo / Lines / Sketch.
 * Markup und Timings 1:1 aus dem Prototyp (Zeile 201–301, componentDidMount). Die „L!“-Kachel ist durch die
 * LD-Kachel aus dem Logo-Handoff ersetzt (Entscheidung: neues Logo).
 */
export function Splash() {
  const { settings: s, hydrated, mob, sideActive } = useSite();
  // 2 = sichtbar, 1 = blendet aus, 0 = entfernt. Vor der Hydration nur der dunkle Grund (Boot-Script blendet bei „aus“ aus).
  const [phase, setPhase] = useState<0 | 1 | 2>(2);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (!hydrated) return;
    if (!s.splashOn && run === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Splash-Ablauf hängt an Einstellungen aus localStorage, erst nach der Hydration bekannt
      setPhase(0);
      return;
    }
    setPhase(2);
    const t1 = setTimeout(() => setPhase(1), 2500);
    const t2 = setTimeout(() => setPhase(0), 3100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // Nur beim Start und bei einer Vorschau neu armieren — nicht bei jeder Einstellungsänderung.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, run]);

  useEffect(() => {
    const on = () => {
      document.body.classList.remove('ldnosplash');
      setRun((r) => r + 1);
    };
    window.addEventListener(SPLASH_REPLAY_EVENT, on);
    return () => window.removeEventListener(SPLASH_REPLAY_EVENT, on);
  }, []);

  if (phase === 0) return null;
  const anim = hydrated ? s.splashAnim || 'logo' : null;
  const hm = heroMode(s);
  const sk: Record<string, string> = {
    skNavTopDisp: !mob && !sideActive ? 'block' : 'none',
    skNavSideDisp: sideActive ? 'block' : 'none',
    skNavTabDisp: mob ? 'block' : 'none',
    skTabCenterDisp: mob && s.mobModern ? 'block' : 'none',
    skMobLogoDisp: mob && !s.mobModern ? 'block' : 'none',
    skSquircleDisp: hm === 'flow' ? 'block' : 'none',
    skFullDisp: hm === 'flow' ? 'none' : 'block',
    skShift: s.fullHero && !mob ? 'max(0px, calc(50vh - 350px))' : '0px',
    skStatsDisp: !s.fullHero || s.heroStats ? 'block' : 'none',
    skStatsShift: s.fullHero && s.heroStats && !mob ? 'max(0px, calc(100vh - 700px))' : '0px',
    skCardsDisp: s.fullHero ? 'none' : 'flex',
    skScrollDisp: s.fullHero && !mob ? 'block' : 'none',
  };

  return (
    <div
      key={run}
      data-ldsplash="1"
      aria-hidden
      style={{
        display: 'flex',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 200,
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(90% 70% at 50% 38%,#101A2E,#0A1220 70%)',
        opacity: phase === 2 ? 1 : 0,
        transition: 'opacity 0.5s ease',
        pointerEvents: phase === 2 ? 'auto' : 'none',
      }}
    >
      {anim === 'sketch' && (
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'hidden',
            animation: 'ldSpSketchOut 0.5s 2.1s ease both',
          }}
          dangerouslySetInnerHTML={{ __html: SKETCH_HTML.replace(/\{\{ (\w+) \}\}/g, (_, k: string) => sk[k] ?? '') }}
        />
      )}
      {anim === 'lines' && (
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <span
            style={line(
              'h',
              'top:50%',
              'linear-gradient(90deg,transparent,rgba(255,178,36,0.7),transparent)',
              'left center',
              '0.85s 0.05s',
            )}
          />
          <span
            style={line(
              'v',
              'left:50%',
              'linear-gradient(180deg,transparent,rgba(255,178,36,0.7),transparent)',
              'center top',
              '0.85s 0.2s',
            )}
          />
          <span style={line('h', 'top:calc(50% - 76px)', 'rgba(255,255,255,0.08)', 'right center', '1s 0.3s')} />
          <span style={line('h', 'top:calc(50% + 76px)', 'rgba(255,255,255,0.08)', 'left center', '1s 0.42s')} />
          <span style={line('v', 'left:calc(50% - 76px)', 'rgba(255,255,255,0.08)', 'center bottom', '1s 0.36s')} />
          <span style={line('v', 'left:calc(50% + 76px)', 'rgba(255,255,255,0.08)', 'center top', '1s 0.48s')} />
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <span
              style={{
                width: 76,
                height: 76,
                borderRadius: 20,
                display: 'inline-flex',
                boxShadow: '0 12px 44px rgba(255,122,47,0.5)',
                animation: 'ldSpBox 0.65s 0.85s cubic-bezier(0.2,1.35,0.3,1) both',
              }}
            >
              <LoonaTile product="ld" variant="color" size={76} decorative style={{ display: 'block' }} />
            </span>
            <span
              style={{
                fontFamily: mono,
                fontSize: 11,
                letterSpacing: '0.3em',
                color: '#F2F5FA',
                animation: 'ldSplashText 0.55s 1.2s cubic-bezier(0.2,0.9,0.3,1) both',
              }}
            >
              LOONA! DESIGNS
            </span>
            <span
              style={{
                width: 148,
                height: 2,
                borderRadius: 999,
                background: 'rgba(255,255,255,0.09)',
                overflow: 'hidden',
                position: 'relative',
                animation: 'ldSplashText 0.5s 1.45s cubic-bezier(0.2,0.9,0.3,1) both',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: 0,
                  width: 58,
                  borderRadius: 999,
                  background: BAR,
                  animation: 'ldSplashBar 1.4s 1.55s cubic-bezier(0.4,0,0.4,1) infinite',
                }}
              />
            </span>
          </div>
        </div>
      )}
      {anim === 'logo' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
          <span
            style={{
              width: 84,
              height: 84,
              borderRadius: 24,
              display: 'inline-flex',
              boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.5),0 10px 34px rgba(255,122,47,0.35)',
              animation: 'ldSplashLogo 0.7s cubic-bezier(0.2,0.9,0.3,1) both,ldSplashBreath 2.2s ease-in-out 0.7s infinite',
            }}
          >
            <LoonaTile product="ld" variant="color" size={84} decorative style={{ display: 'block' }} />
          </span>
          <span
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              animation: 'ldSplashText 0.6s 0.25s cubic-bezier(0.2,0.9,0.3,1) both',
            }}
          >
            <span style={{ fontSize: 23, fontWeight: 700, color: '#F2F5FA', letterSpacing: '-0.02em' }}>
              Loona<span style={{ color: '#FFB224' }}>!</span> Designs
            </span>
            <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.18em', color: '#7E90A9' }}>/// THE WEB. MY PASSION</span>
          </span>
          <span
            style={{
              width: 148,
              height: 3,
              borderRadius: 999,
              background: 'rgba(255,255,255,0.09)',
              overflow: 'hidden',
              position: 'relative',
              animation: 'ldSplashText 0.6s 0.4s cubic-bezier(0.2,0.9,0.3,1) both',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                width: 58,
                borderRadius: 999,
                background: BAR,
                animation: 'ldSplashBar 1.1s ease-in-out infinite',
              }}
            />
          </span>
        </div>
      )}
    </div>
  );
}

/** Haarlinie der Lines-Variante (ldSpLineH/V, cubic-bezier(0.75,0,0.2,1)). */
function line(dir: 'h' | 'v', pos: string, background: string, origin: string, timing: string): CSSProperties {
  const [k, v] = pos.split(':');
  return {
    position: 'absolute',
    [k]: v,
    ...(dir === 'h' ? { left: 0, right: 0, height: 1 } : { top: 0, bottom: 0, width: 1 }),
    background,
    transformOrigin: origin,
    animation: `${dir === 'h' ? 'ldSpLineH' : 'ldSpLineV'} ${timing} cubic-bezier(0.75,0,0.2,1) both`,
  };
}
