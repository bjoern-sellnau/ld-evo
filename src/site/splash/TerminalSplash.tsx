'use client';

import { useEffect, useRef } from 'react';
import { EXTRA_MODES } from '../hero/extra/meta';
import { useT } from '../i18n/LocaleProvider';

/**
 * Splash „Terminal“ (neu, nicht im Prototyp — Wunsch vom 19.10.2026): derselbe Ablauf und dasselbe Tempo wie die
 * Hero-Animation „Live-Build: Dev-Server + Code“ — schwarz, das Terminal öffnet sich, Tab 1 startet den Dev-Server,
 * in Tab 2 wird der sichtbare Teil der Startseite geschrieben (Menü, Hero mit der gewählten Hero-Animation,
 * Hero-Fußleiste, Scroll-Hinweis; keine News, keine Fußzeile), zum Schluss schaltet das Terminal ab wie ein
 * Röhren-Monitor. Danach blendet der Splash aus und die Seite lädt mit dieser Hero-Animation.
 * Gezeichnet vom Renderer der Hero-Animation (hero/extra/build.ts, Modus „splashterm“); Dauer: terminalSplashMs.
 * Klick oder Taste überspringt (Splash.tsx).
 */
export { terminalSplashMs } from '../hero/extra/build';

export function TerminalSplash({ mode, anim }: { mode: string; anim: boolean }) {
  const t = useT();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let stop = () => {};
    let gone = false;
    void import('../hero/extra/renderers').then(({ runExtra }) => {
      const cv = ref.current;
      if (gone || !cv) return;
      stop = runExtra(cv, 'splashterm', ['#FFB224', '#FF7A2F', '#FF9F5A', '#FF7A9C', '#5BD97A'], {
        anim,
        fpsHalf: false,
        bg: '#000000',
        cfg: { splash: true, crt: true, hero: mode, heroLabel: EXTRA_MODES[mode]?.label },
      });
    });
    return () => {
      gone = true;
      stop();
    };
  }, [mode, anim]);

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />
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
