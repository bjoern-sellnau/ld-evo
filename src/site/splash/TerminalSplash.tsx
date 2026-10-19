'use client';

import { useEffect, useState } from 'react';
import { EXTRA_MODES } from '../hero/extra/meta';
import { useT } from '../i18n/LocaleProvider';

/**
 * Splash „Terminal“ (neu, nicht im Prototyp — Wunsch vom 19.10.2026): Schwarz, ein Terminal öffnet sich, der Dev-Server
 * startet, dann wird der sichtbare Teil der Startseite geschrieben — Menü, Hero mit der gewählten Hero-Animation,
 * Hero-Fußleiste und Scroll-Hinweis (keine News, keine Fußzeile: nur, was man oben sieht). Danach blendet der Splash aus
 * und die Seite lädt mit dieser Hero-Animation. Klick oder Taste überspringt (Splash.tsx).
 */

type Kind = 'cmd' | 'code' | 'ok' | 'info';
interface Line {
  k: Kind;
  s: string;
}

const linesFor = (mode: string): Line[] => [
  { k: 'cmd', s: '$ npm run dev' },
  { k: 'info', s: '▲ Next.js 16 · ready in 1.1s' },
  { k: 'cmd', s: '$ nvim src/site/pages/HalloPage.tsx' },
  { k: 'code', s: '<SiteNav />' },
  { k: 'code', s: `<Hero animation="${mode}">` },
  { k: 'code', s: '  <h1>{home.titleLine1} {home.titleLine2}</h1>' },
  { k: 'code', s: '  <HeroButtons />' },
  { k: 'code', s: '</Hero>' },
  { k: 'code', s: '<HeroFooter seconds={seconds} />' },
  { k: 'code', s: '<ScrollIndicator />' },
  { k: 'cmd', s: ':wq' },
  { k: 'ok', s: '✓ Compiled / in 96ms' },
  { k: 'info', s: '→ http://localhost:3000' },
];

const OPEN = 0.7; // s, bis das Fenster offen ist und getippt wird
const CPS: Record<Kind, number> = { cmd: 26, code: 52, ok: 0, info: 0 };
const PAUSE: Record<Kind, number> = { cmd: 0.45, code: 0.12, ok: 0.5, info: 0.35 };

const schedule = (lines: Line[]) => {
  let at = OPEN + 0.4;
  const rows = lines.map((l) => {
    const dur = CPS[l.k] ? l.s.length / CPS[l.k] : 0;
    const r = { ...l, at, end: at + dur };
    at = r.end + PAUSE[l.k];
    return r;
  });
  return { rows, total: at + 0.5 };
};

/** Gesamtdauer in ms (Splash.tsx blendet danach aus). */
export const terminalSplashMs = (mode: string) => Math.round(schedule(linesFor(mode)).total * 1000);

const COL = {
  kw: '#FFB224',
  tag: '#FF7A9C',
  str: '#FF9F5A',
  punct: 'rgba(160,172,190,0.85)',
  text: 'rgba(228,233,242,0.92)',
  cmd: 'rgba(240,244,250,0.96)',
  ok: '#5BD97A',
  info: 'rgba(170,180,196,0.85)',
};
const tokColor = (tok: string) =>
  /^[A-Z]/.test(tok) ? COL.tag : /^"/.test(tok) ? COL.str : /^[<>/{}()=]/.test(tok) ? COL.punct : COL.text;

export function TerminalSplash({ mode, still }: { mode: string; still: boolean }) {
  const t = useT();
  const [time, setTime] = useState(still ? 999 : 0);
  const { rows } = schedule(linesFor(mode));
  useEffect(() => {
    if (still) return;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      setTime((now - t0) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [still]);

  const open = Math.min(1, time / OPEN);
  const vis = rows.filter((r) => r.at <= time);
  const label = EXTRA_MODES[mode]?.label;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          width: 'min(620px, calc(100% - 32px))',
          height: 'min(380px, calc(100% - 120px))',
          borderRadius: 12,
          background: 'rgba(12,14,20,0.97)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
          opacity: 1 - Math.pow(1 - open, 3),
          transform: `scale(${0.9 + 0.1 * (1 - Math.pow(1 - open, 3))})`,
          overflow: 'hidden',
          fontFamily: 'var(--ld-font-mono), ui-monospace, monospace',
          fontSize: 13,
          lineHeight: 1.62,
        }}
      >
        <div
          style={{
            height: 30,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '0 12px',
            background: 'rgba(255,255,255,0.04)',
            position: 'relative',
          }}
        >
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <span key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />
          ))}
          <span style={{ position: 'absolute', left: 0, right: 0, textAlign: 'center', fontSize: 12, color: 'rgba(220,226,236,0.7)' }}>
            zsh — ld-evo
          </span>
        </div>
        <div style={{ padding: '10px 14px', whiteSpace: 'pre', overflow: 'hidden' }}>
          {vis.map((r, i) => {
            const n = r.end > r.at && time < r.end ? Math.floor(((time - r.at) / (r.end - r.at)) * r.s.length) : r.s.length;
            const txt = r.s.slice(0, n);
            const last = i === vis.length - 1;
            return (
              <div key={i}>
                {r.k === 'code' ? (
                  (txt.match(/"[^"]*"?|\w+|\s+|./g) ?? []).map((tok, j) => (
                    <span key={j} style={{ color: tokColor(tok) }}>
                      {tok}
                    </span>
                  ))
                ) : (
                  <span style={{ color: r.k === 'cmd' ? COL.cmd : r.k === 'ok' ? COL.ok : COL.info }}>{txt}</span>
                )}
                {/* Hinweis auf die Hero-Animation, die gleich lädt */}
                {r.k === 'code' && r.s.startsWith('<Hero ') && n === r.s.length && label && (
                  <span style={{ color: 'rgba(126,144,169,0.85)' }}>{`  // ${label}`}</span>
                )}
                {last && Math.floor(time * 2.2) % 2 === 0 && (
                  <span style={{ display: 'inline-block', width: 7, height: 14, marginLeft: 1, verticalAlign: -2, background: COL.kw }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
      <span
        style={{
          position: 'absolute',
          bottom: 22,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: 'var(--ld-font-mono), monospace',
          fontSize: 11,
          color: 'rgba(200,208,222,0.6)',
        }}
      >
        {t('splash.skip')}
      </span>
    </div>
  );
}
