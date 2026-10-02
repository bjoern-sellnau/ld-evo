'use client';

import { useEffect, useState } from 'react';
import type { RailTarget } from '@content/about';
import { useSite } from '../settings/SiteProvider';
import styles from './rail.module.css';

/** Scroll-Spy: aktiv ist das letzte Ziel, dessen Oberkante über 40 % der Viewport-Höhe liegt (Prototyp: _sc). */
export function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    let raf = 0;
    const run = () => {
      raf = 0;
      let cur = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.4) cur = id;
      }
      setActive(cur);
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(run);
    };
    run();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
    };
  }, [ids]);
  return active;
}

/**
 * Punkt-Rail rechts (Prototyp: mkRail): Labels nur bei Hover/aktiv (Fade + Slide 0,3 s),
 * Punktgrößen 9/7/5 px nach Hierarchie; Klick scrollt 120 px unter die Oberkante.
 */
export function ScrollRail({ targets, active, label }: { targets: RailTarget[]; active: string; label: string }) {
  const { settings, mob } = useSite();
  const [hover, setHover] = useState<string | null>(null);
  if (mob) return null;
  return (
    <nav
      aria-label={label}
      style={{
        position: 'fixed',
        right: 26,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        gap: 0, // Prototyp 5 — die Einträge sind jetzt selbst 24px hoch (rail.module.css)
      }}
    >
      {targets.map((u) => {
        const on = active === u.id;
        const show = on || hover === u.id;
        const ds = u.proj ? 5 : u.sub ? 7 : 9;
        return (
          <button
            key={u.id}
            type="button"
            aria-current={on ? 'location' : undefined}
            onMouseEnter={() => setHover(u.id)}
            onMouseLeave={() => setHover((h) => (h === u.id ? null : h))}
            onFocus={() => setHover(u.id)}
            onBlur={() => setHover((h) => (h === u.id ? null : h))}
            onClick={() => {
              const el = document.getElementById(u.id);
              if (el)
                window.scrollTo({
                  top: el.getBoundingClientRect().top + window.scrollY - 120,
                  behavior: settings.anim ? 'smooth' : 'auto',
                });
            }}
            className={styles.item}
          >
            <span
              style={{
                fontSize: u.proj ? 10 : u.sub ? 10.5 : 11,
                fontWeight: 600,
                color: on ? 'var(--ink)' : 'var(--muted)',
                opacity: show ? 1 : 0,
                transform: `translateX(${show ? 0 : 7}px)`,
                transition: 'opacity 0.3s ease,transform 0.3s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {u.label}
            </span>
            <span style={{ width: 9, display: 'inline-flex', justifyContent: 'center', alignItems: 'center', flex: 'none' }}>
              <span
                style={{
                  width: ds,
                  height: ds,
                  flex: 'none', // nicht in den 9px-Rahmen stauchen (sonst oval)
                  borderRadius: '50%',
                  background: on ? 'var(--accent)' : 'var(--pill)',
                  border: '1px solid var(--glassbrd)',
                  transition: 'background 0.3s',
                }}
              />
            </span>
          </button>
        );
      })}
    </nav>
  );
}
