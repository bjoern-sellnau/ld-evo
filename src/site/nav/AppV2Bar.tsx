'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { GlassSurface } from '../glass/GlassSurface';
import { useSite } from '../settings/SiteProvider';
import { useHref, useT } from '../i18n/LocaleProvider';
import { canonicalPath } from '../i18n/locale';
import type { UiKey } from '../i18n/dict';
import { SITE_PAGES, pageForPath, type SitePageId } from './pages';
import { useBack } from './useBack';
import styles from './SiteNav.module.css';
import { LogoTile } from '../settings/LogoTile';
import { simBottom } from '../chrome/phoneBox';
import { useScrollHide } from './useScrollHide';

/**
 * Mobil-Design „App v2“ (neu, nicht im Prototyp — Wunsch vom 04.10.2026):
 *  - Tab-Leiste im Liquid-Glass der Desktop-Leiste (GlassSurface mit Sheen) mit Über mich · Projekte · Home · Labs · Menü;
 *    Home ist das LD-Logo, größer und mittig leicht über die Leiste gehoben.
 *  - Darüber schwebende Glasknöpfe: links „Zurück“ (nur Detailseiten), rechts „Nach oben“ und „Suche“.
 *  - Alle Glasflächen laufen durch denselben Auto-Kontrast wie die Desktop-Leiste (id ld-tabbar bzw. data-ldcontrast,
 *    src/site/glass/navContrast.ts): Theme-Look bleibt, die Tönung wird über Cover-Farben dichter, gekippt wird nur,
 *    wenn es nötig ist (Wunsch vom 04.10.2026 — vorher eigene Schwarz/Weiß-Wahl, die auf Detailseiten fast immer hell wurde).
 * Das Menü öffnet MobileMenu als kontraststarkes Bottom-Sheet (ld-sheet2), die Suche ein Panel über der Leiste.
 */
const TABS: { id: SitePageId; label: UiKey; icon: string }[] = [
  { id: 'ueber', label: 'tab.about', icon: '◉' },
  { id: 'projekte', label: 'tab.projects', icon: '▦' },
  { id: 'hallo', label: 'tab.home', icon: '' },
  { id: 'labs', label: 'tab.labs', icon: '⚗' },
];
const hrefOf = (id: SitePageId) => SITE_PAGES.find((p) => p.id === id)!.href;

/** Abstand der Tab-Leiste vom unteren Rand (auch für Such-Panel und Menü). */
export const APPV2_BAR_BOTTOM = 16;
export const APPV2_BAR_HEIGHT = 66;

export function AppV2Bar() {
  const { settings, overlay, setOverlay, navigate, isMobile } = useSite();
  const t = useT();
  const href = useHref();
  const back = useBack();
  const path = canonicalPath(usePathname());
  const page = pageForPath(path);
  const menuOpen = overlay === 'mobileNav';
  // „Leiste beim Scrollen ausblenden“: Startseite anfangs ohne Leiste — unten bleibt nur die Suche (Wunsch 05.10.2026).
  const [scrollHidden, setScrollHidden] = useScrollHide(settings.scrollHide, { hiddenAtTop: path === '/', resetKey: path });
  const barHidden = scrollHidden && overlay === null;
  const framed = !isMobile;
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 320);
    f();
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);

  const go = (h: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    navigate(h);
  };
  const bottom = framed ? simBottom(APPV2_BAR_BOTTOM + 10) : `calc(${APPV2_BAR_BOTTOM}px + env(safe-area-inset-bottom))`;
  const width = framed ? 400 : 'calc(100% - 28px)';
  // Knöpfe über der Leiste nur, wenn kein Overlay offen ist (sonst liegen Menü/Suche dort).
  const showRow = overlay === null;

  return (
    <div
      data-ldchrome
      // Tastatur: Fokus in der ausgeblendeten Leiste holt sie zurück.
      onFocusCapture={() => setScrollHidden(false)}
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom,
        // Ausgeblendet: alles rutscht um die Leistenhöhe nach unten — die Glasknöpfe sitzen dann, wo die Leiste war.
        transform: barHidden ? `translateY(${APPV2_BAR_HEIGHT + 10}px)` : 'none',
        transition: 'transform 0.5s cubic-bezier(0.32,1.2,0.35,1)',
        zIndex: 75,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        pointerEvents: 'none',
      }}
    >
      {showRow && (
        <div style={{ width, maxWidth: 420, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <span>
            {back.show && (
              <GlassButton onClick={back.go} label={t('nav.back')} wide>
                <span style={{ color: 'var(--ink)', fontWeight: 700, fontSize: 14, whiteSpace: 'pre' }}>{back.text}</span>
              </GlassButton>
            )}
          </span>
          <span style={{ display: 'flex', gap: 8 }}>
            {scrolled && (
              <GlassButton
                onClick={() => window.scrollTo({ top: 0, behavior: settings.anim ? 'smooth' : 'auto' })}
                label={t('chrome.toTop')}
              >
                ↑
              </GlassButton>
            )}
            <GlassButton onClick={() => setOverlay('search')} label={t('nav.search')}>
              ⌕
            </GlassButton>
          </span>
        </div>
      )}

      <GlassSurface
        as="nav"
        id="ld-tabbar"
        aria-label={t('nav.main')}
        radius="30px"
        sheen
        style={{
          pointerEvents: barHidden ? 'none' : 'auto',
          opacity: barHidden ? 0 : 1,
          transform: barHidden ? 'translateY(24px) scale(0.96)' : 'none',
          transition: '--glassTint 0.5s ease,--glassPct 0.5s ease,opacity 0.3s ease,transform 0.5s cubic-bezier(0.32,1.2,0.35,1)',
          width,
          maxWidth: 420,
          height: APPV2_BAR_HEIGHT,
          boxSizing: 'border-box',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 76px 1fr 1fr',
          alignItems: 'center',
          padding: '0 6px',
        }}
      >
        {TABS.map((tab) => {
          const on = !menuOpen && page === tab.id;
          const h = hrefOf(tab.id);
          if (tab.id === 'hallo')
            return (
              <Link
                key={tab.id}
                href={href(h)}
                onClick={go(h)}
                aria-label={t('tab.home')}
                aria-current={on ? 'page' : undefined}
                className={styles.reset}
                style={{ justifySelf: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginTop: -26 }}
              >
                {/* Home: LD-Logo, größer und über die Leiste gehoben (Logo-Regel: keine Schatten/Glow) */}
                <span
                  style={{
                    display: 'block',
                    padding: 3,
                    borderRadius: 20,
                    // Rahmen statt Schatten: trennt das Logo auch auf orangen Cover-Flächen sichtbar vom Grund.
                    background: 'color-mix(in srgb,var(--bg) 78%,transparent)',
                    border: '1px solid var(--glassbrd)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                  }}
                >
                  <LogoTile variant="color" size={54} style={{ display: 'block' }} />
                </span>
                <span
                  aria-hidden
                  style={{
                    width: on ? 18 : 4,
                    height: 4,
                    borderRadius: 2,
                    background: 'var(--ink)',
                    opacity: on ? 1 : 0.35,
                    transition: 'width 0.3s,opacity 0.3s',
                  }}
                />
              </Link>
            );
          return (
            <Link
              key={tab.id}
              href={href(h)}
              onClick={go(h)}
              aria-current={on ? 'page' : undefined}
              data-navactive={on}
              className={styles.reset}
              style={tabStyle(on)}
            >
              <span aria-hidden style={{ fontSize: 17, lineHeight: 1 }}>
                {tab.icon}
              </span>
              <span style={tabLabel}>{t(tab.label)}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setOverlay(menuOpen ? null : 'mobileNav')}
          aria-expanded={menuOpen}
          aria-controls="ld-menu"
          className={styles.reset}
          style={{ ...tabStyle(menuOpen), cursor: 'pointer' }}
        >
          <span aria-hidden style={{ fontSize: 17, lineHeight: 1 }}>
            {menuOpen ? '✕' : '☰'}
          </span>
          <span style={tabLabel}>{t('tab.menu')}</span>
        </button>
      </GlassSurface>
    </div>
  );
}

// Aktiv: Text in --ink auf der Pille (nicht Akzent) — bleibt auch über Cover-Farben lesbar (Auto-Kontrast tönt --ink).
const tabStyle = (on: boolean): CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
  height: 52,
  margin: '0 2px',
  borderRadius: 22,
  color: on ? 'var(--ink)' : 'var(--muted)',
  background: on ? 'var(--pill)' : 'transparent',
  transition: 'background 0.25s,color 0.25s',
});
const tabLabel: CSSProperties = { fontSize: 9.5, fontWeight: 700, letterSpacing: '0.02em', whiteSpace: 'nowrap' };

function GlassButton({ onClick, label, wide, children }: { onClick: () => void; label: string; wide?: boolean; children: ReactNode }) {
  return (
    <span style={{ position: 'relative', zIndex: 0, display: 'inline-flex', pointerEvents: 'auto' }}>
      <GlassSurface as="span" data-ldcontrast radius="999px" sheen style={{ display: 'inline-flex' }}>
        <button
          type="button"
          onClick={onClick}
          aria-label={label}
          title={label}
          className={styles.reset}
          style={{
            position: 'relative',
            height: 48,
            minWidth: 48,
            padding: wide ? '0 18px' : 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--ink)',
            background: 'transparent',
            borderRadius: 999,
            fontSize: 18,
          }}
        >
          {children}
        </button>
      </GlassSurface>
    </span>
  );
}
