'use client';

import { useSite } from '../settings/SiteProvider';

const num = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) ? v : d);

/**
 * Telefon-Simulation am Desktop (nur simulierter Mobile-Modus): Bezel mit „Schreibtisch“ ringsum (9999-px-Schatten)
 * und optional Dynamic Island / Camera Hole / Notch. Markup/Werte 1:1 aus dem Prototyp (Zeile 316–324, renderVals).
 */
export function PhoneFrame() {
  const { settings: s, mob, isMobile } = useSite();
  if (!mob || isMobile) return null;
  const cfg = s.frameCfg || {};
  const frame = s.frame || 'clear';
  return (
    <>
      <div
        aria-hidden
        style={{
          position: 'fixed',
          top: 10,
          bottom: 10,
          left: '50%',
          width: 434,
          transform: 'translateX(-50%)',
          borderRadius: 32,
          pointerEvents: 'none',
          zIndex: 50,
          boxShadow:
            s.theme === 'light'
              ? '0 0 0 1.5px rgba(15,33,55,0.22), 0 30px 90px rgba(15,33,55,0.3), 0 0 0 9999px #D9E0E8'
              : '0 0 0 1.5px rgba(255,255,255,0.16), 0 30px 90px rgba(0,0,0,0.65), 0 0 0 9999px #04060B',
          transition: 'box-shadow 0.35s ease',
        }}
      />
      {frame !== 'clear' && (
        <div
          aria-hidden
          style={{
            position: 'fixed',
            top: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 434,
            height: 64,
            zIndex: 78,
            pointerEvents: 'none',
            overflow: 'hidden',
            borderRadius: '32px 32px 0 0',
          }}
        >
          {frame === 'island' && (
            <div
              style={{
                position: 'absolute',
                top: 13,
                left: '50%',
                transform: 'translateX(-50%)',
                width: num(cfg.island, 118),
                height: 27,
                borderRadius: 999,
                background: '#000',
                boxShadow: 'inset 0 0 5px rgba(255,255,255,0.09),0 2px 8px rgba(0,0,0,0.45)',
                transition: 'width 0.3s ease',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: 9,
                  transform: 'translateY(-50%)',
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 36% 32%,#173049,#04070C 62%)',
                  boxShadow: 'inset 0 0 2px rgba(90,140,220,0.5)',
                }}
              />
            </div>
          )}
          {frame === 'hole' && (
            <div
              style={{
                position: 'absolute',
                top: 17,
                left: `${num(cfg.hole, 26)}%`,
                transform: 'translateX(-50%)',
                width: 15,
                height: 15,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 38% 32%,#101E30,#000 65%)',
                boxShadow: '0 0 0 2.5px rgba(0,0,0,0.4),inset 0 0 3px rgba(110,160,230,0.35)',
                transition: 'left 0.3s ease',
              }}
            />
          )}
          {frame === 'notch' && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: num(cfg.notch, 158),
                height: 27,
                borderRadius: '0 0 18px 18px',
                background: '#000',
                transition: 'width 0.3s ease',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 44,
                  height: 5,
                  borderRadius: 999,
                  background: '#111823',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  top: 7,
                  right: 22,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 36% 32%,#173049,#04070C 62%)',
                }}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}
