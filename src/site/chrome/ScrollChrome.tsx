'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { isDetailPath, useSite } from '../settings/SiteProvider';
import styles from './chrome.module.css';

/**
 * Lesefortschritt (3 px Akzentbalken oben, nur Detailseiten) und „Nach oben“ ab 600 px Scrolltiefe.
 * Prototyp: READING PROGRESS / BACK TO TOP (Zeile 1213 ff.).
 */
export function ScrollChrome() {
  const { settings, mob, isMobile } = useSite();
  const pathname = usePathname();
  const detail = isDetailPath(pathname);
  const bar = useRef<HTMLDivElement>(null);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const on = () => {
      setShowTop(window.scrollY > 600);
      if (bar.current) {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        bar.current.style.transform = `scaleX(${h > 0 ? Math.min(1, window.scrollY / h) : 0})`;
      }
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [pathname]);

  return (
    <>
      {detail && (
        <div aria-hidden style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 70, pointerEvents: 'none' }}>
          <div
            ref={bar}
            style={{
              height: '100%',
              background: 'var(--accent)',
              transform: 'scaleX(0)',
              transformOrigin: 'left',
              transition: 'transform 0.1s linear',
            }}
          />
        </div>
      )}
      {showTop && (
        <button
          type="button"
          title="Nach oben"
          aria-label="Nach oben"
          onClick={() => window.scrollTo({ top: 0, behavior: settings.anim ? 'smooth' : 'auto' })}
          className={styles.toTop}
          style={{ right: mob && !isMobile ? 'calc(50vw - 202px)' : 24, bottom: mob ? 92 : 24 }}
        >
          ↑
        </button>
      )}
    </>
  );
}
