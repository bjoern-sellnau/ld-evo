'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { MIGRATE_TERMINAL_MS } from '../hero/extra/build';
import { useT } from '../i18n/LocaleProvider';
import styles from './welcome.module.css';

/**
 * Welcome-Effekt „Migration“ (neu, Wunsch vom 30.10.2026). Ablauf:
 *  1. Die alte Website steht; darüber öffnet sich das Terminal (Renderer „welcomemigrate“ in hero/extra/build.ts —
 *     dieselbe Optik wie Live-Build und Splash „Terminal“): `cd ../ld-beyond`, `npm run migrate` mit Sicherung,
 *     Rückfrage (y), Import der neuen Seiten und Start des Servers; „ld beyond. is up and running“.
 *  2. Das Terminal schließt sich, die alte Seite schaltet ab wie ein Röhrenfernseher (fällt zur Linie, dann zum Punkt).
 *  3. Schwarzer Bildschirm mit Boot-Code wie beim Rechnerstart, dann „ld beyond.“.
 *  4. Die neue Startseite (liegt schon darunter) erscheint; Welcome.tsx stellt die Adresse auf die Startseite um.
 * Ohne Bewegung läuft dieser Effekt nicht (Welcome.tsx blendet dann nur über). Überspringen jederzeit (Knopf, Esc).
 */
const PAL = ['#FFB224', '#FF7816', '#FF9F5A', '#FF7A9C', '#5BD97A'];
const BOOT = [
  'LD BIOS v2.6 — (c) 2026 loona! designs',
  'CPU: Next.js 16 · React 19 · Node 22 ............ OK',
  'Memory test: 65536K ............................. OK',
  'Detecting content: about, projects, labs, home, imprint',
  'Checking accessibility (WCAG 2.2 AA) ............ OK',
  'Mounting /media ................................. OK',
  'Booting ld beyond. …',
];
/** Takt der Boot-Zeilen, Standzeit von „ld beyond.“, Ausblenden (ms). */
const BOOT_STEP = 170;
const BRAND_MS = 1500;
const OUT_MS = 600;

type Stage = 'term' | 'crt' | 'boot' | 'brand' | 'out';

export function Migrate({ shot, onDone }: { shot: ReactNode; onDone: () => void }) {
  const t = useT();
  const [stage, setStage] = useState<Stage>('term');
  const [lines, setLines] = useState(0);
  const cv = useRef<HTMLCanvasElement>(null);
  const stopRef = useRef<() => void>(() => {});
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  // 1. Terminal (Canvas über dem Bild der alten Seite); Sicherheitsnetz, falls der Renderer nicht meldet
  useEffect(() => {
    let gone = false;
    let stop = () => {};
    const safety = setTimeout(() => setStage((s) => (s === 'term' ? 'crt' : s)), MIGRATE_TERMINAL_MS + 2500);
    void import('../hero/extra/renderers').then(({ runExtra }) => {
      if (gone || !cv.current) return;
      stop = stopRef.current = runExtra(cv.current, 'welcomemigrate', PAL, {
        anim: true,
        fpsHalf: false,
        bg: '#000000',
        cfg: { splash: true, onClosed: () => setStage('crt') },
      });
    });
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && doneRef.current();
    window.addEventListener('keydown', onKey);
    return () => {
      gone = true;
      clearTimeout(safety);
      stop();
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    if (stage !== 'term') stopRef.current();
    if (stage === 'crt') {
      // Röhren-Aus (CSS, 1 s) — Sicherheitsnetz, falls animationend ausbleibt
      const id = setTimeout(() => setStage('boot'), 1300);
      return () => clearTimeout(id);
    }
    if (stage === 'boot') {
      const id = setInterval(() => setLines((n) => n + 1), BOOT_STEP);
      const next = setTimeout(() => setStage('brand'), BOOT_STEP * (BOOT.length + 3));
      return () => {
        clearInterval(id);
        clearTimeout(next);
      };
    }
    if (stage === 'brand') {
      const id = setTimeout(() => setStage('out'), BRAND_MS);
      return () => clearTimeout(id);
    }
    if (stage === 'out') {
      const id = setTimeout(() => doneRef.current(), OUT_MS);
      return () => clearTimeout(id);
    }
  }, [stage]);

  const dark = stage !== 'term';
  return (
    <div className={[styles.migrate, stage === 'out' ? styles.migrateOut : ''].join(' ')} style={{ background: dark ? '#000' : undefined }}>
      {(stage === 'term' || stage === 'crt') && (
        <div className={stage === 'crt' ? styles.crtOff : undefined} onAnimationEnd={() => stage === 'crt' && setStage('boot')}>
          {shot}
          {stage === 'crt' && <span aria-hidden className={styles.crtGlow} />}
        </div>
      )}
      {stage === 'term' && <canvas ref={cv} aria-hidden className={styles.migrateCanvas} />}
      {(stage === 'boot' || stage === 'brand' || stage === 'out') && (
        <div aria-hidden className={styles.boot}>
          {stage === 'boot' ? (
            <pre className={styles.bootLog}>
              {BOOT.slice(0, lines).join('\n')}
              <span className={styles.bootCursor}>▌</span>
            </pre>
          ) : (
            <p className={styles.bootBrand}>
              ld beyond.<span className={styles.bootCursor}>▌</span>
            </p>
          )}
        </div>
      )}
      {stage !== 'out' && (
        <button type="button" className={styles.migrateSkip} onClick={() => doneRef.current()}>
          {t('welcome.skip')}
        </button>
      )}
    </div>
  );
}
