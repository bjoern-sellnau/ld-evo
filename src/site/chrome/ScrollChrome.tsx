'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { isDetailPath, useSite } from '../settings/SiteProvider';
import styles from './chrome.module.css';
import { useT } from '../i18n/LocaleProvider';
import { canonicalPath } from '../i18n/locale';
import { simBottom } from './phoneBox';

/**
 * Scroll-Scrim (Scroll-BG: weicher Blur-Verlauf hinter der Nav ab 24 px, nur mit Auto-Kontrast),
 * Parallax der Hero-FX (nur Full-Hero auf der Startseite, Animationen an: 0,35 × scrollY),
 * Lesefortschritt (3 px Akzentbalken oben, nur Detailseiten) und „Nach oben“ ab 600 px Scrolltiefe.
 * Prototyp: READING PROGRESS / BACK TO TOP (Zeile 1213 ff.).
 */
export function ScrollChrome() {
  const { settings, mob, isMobile, sideActive, mobDesign } = useSite();
  const pathname = canonicalPath(usePathname());
  const t = useT();
  const detail = isDetailPath(pathname);
  const bar = useRef<HTMLDivElement>(null);
  const [showTop, setShowTop] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const paraWas = useRef(false);
  const paraOn = settings.fullHero && pathname === '/' && settings.anim;

  useEffect(() => {
    const on = () => {
      setShowTop(window.scrollY > 600);
      setScrolled(window.scrollY > 24);
      if (paraOn || paraWas.current) {
        const py = Math.min(window.scrollY, window.innerHeight) * 0.35;
        document.querySelectorAll<HTMLElement>('[data-ldpara]').forEach((el) => {
          el.style.translate = paraOn ? `0 ${py}px` : '';
        });
        paraWas.current = paraOn;
      }
      if (bar.current) {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        bar.current.style.transform = `scaleX(${h > 0 ? Math.min(1, window.scrollY / h) : 0})`;
      }
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [pathname, paraOn]);

  return (
    <>
      <div
        data-ldscrim="1"
        aria-hidden
        style={{
          position: 'fixed',
          ...(mob && !isMobile
            ? { top: 10, left: '50%', width: 430, transform: 'translateX(-50%)', borderRadius: '30px 30px 0 0' }
            : { top: 0, left: 0, right: 0 }),
          height: 118,
          zIndex: 55,
          pointerEvents: 'none',
          opacity: scrolled && settings.autoC && settings.scrollBg && !sideActive ? 1 : 0,
          transition: 'opacity 0.45s ease',
          background: 'linear-gradient(180deg,color-mix(in srgb,var(--bg) 55%,transparent),transparent 82%)',
          backdropFilter: 'blur(12px) saturate(1.15)',
          WebkitMask: 'linear-gradient(180deg,#000 0%,rgba(0,0,0,0.55) 52%,transparent 96%)',
          mask: 'linear-gradient(180deg,#000 0%,rgba(0,0,0,0.55) 52%,transparent 96%)',
        }}
      />
      {detail && (
        <div
          aria-hidden
          style={{
            position: 'fixed',
            // Simulierter Mobil-Modus: nur über die Telefonbreite (im Rahmen, oben an den Ecken beschnitten)
            ...(mob && !isMobile
              ? { top: 10, left: 'calc(50% - 215px)', width: 430, borderRadius: '32px 32px 0 0', overflow: 'hidden' }
              : { top: 0, left: 0, right: 0 }),
            height: 3,
            zIndex: 70,
            pointerEvents: 'none',
          }}
        >
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
      {/* App v2 hat „Nach oben“ fest über der Tab-Leiste (MobileChrome2). */}
      {showTop && mobDesign !== 'appv2' && (
        <button
          type="button"
          title={t('chrome.toTop')}
          aria-label={t('chrome.toTop')}
          onClick={() => window.scrollTo({ top: 0, behavior: settings.anim ? 'smooth' : 'auto' })}
          className={styles.toTop}
          style={{ right: mob && !isMobile ? 'calc(50vw - 202px)' : 24, bottom: mob ? (isMobile ? 92 : simBottom(92)) : 24 }}
        >
          ↑
        </button>
      )}
    </>
  );
}
