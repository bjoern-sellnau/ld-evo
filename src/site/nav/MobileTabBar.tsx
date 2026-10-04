'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { GlassSurface } from '../glass/GlassSurface';
import { useSite } from '../settings/SiteProvider';
import { MobileBackPill } from './MobileBackPill';
import styles from './SiteNav.module.css';
import { SITE_PAGES, pageForPath, type SitePageId } from './pages';
import { useHref, useT } from '../i18n/LocaleProvider';
import { canonicalPath } from '../i18n/locale';
import type { UiKey } from '../i18n/dict';
import { LogoTile } from '../settings/LogoTile';
import { simBottom } from '../chrome/phoneBox';

interface Tab {
  id: SitePageId;
  label: UiKey;
  icon: string;
  logo?: boolean;
}

// Prototyp: renderVals → tabItems (Modern: Logo-Home mittig; klassisch: Home zuerst).
const MODERN: Tab[] = [
  { id: 'projekte', label: 'tab.projects', icon: '▦' },
  { id: 'ueber', label: 'tab.about', icon: '◉' },
  { id: 'hallo', label: 'tab.home', icon: '', logo: true },
  { id: 'labs', label: 'tab.labs', icon: '⚗' },
];
const CLASSIC: Tab[] = [
  { id: 'hallo', label: 'tab.home', icon: '⌂' },
  { id: 'projekte', label: 'tab.projects', icon: '▦' },
  { id: 'ueber', label: 'tab.about', icon: '◉' },
  { id: 'labs', label: 'tab.labs', icon: '⚗' },
];

const hrefOf = (id: SitePageId) => SITE_PAGES.find((p) => p.id === id)!.href;

/**
 * Scrollhide (Prototyp: Scroll-Handler): Runter > 150 px blendet aus, hoch > 28 px zeigt, oben (< 70 px) immer sichtbar.
 */
function useNavHidden(enabled: boolean) {
  const [hidden, setHidden] = useState(false);
  const acc = useRef({ last: 0, down: 0, up: 0 });
  useEffect(() => {
    if (!enabled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Abschalten des Scrollhide soll die Leiste sofort wieder zeigen
      setHidden(false);
      return;
    }
    acc.current.last = window.scrollY;
    const onScroll = () => {
      const a = acc.current;
      const y = window.scrollY;
      const dy = y - a.last;
      a.last = y;
      if (dy > 0) {
        a.down += dy;
        a.up = 0;
      } else if (dy < 0) {
        a.up -= dy;
        a.down = 0;
      }
      setHidden((h) => (y < 70 ? false : a.down > 150 ? true : a.up > 28 ? false : h));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [enabled]);
  return hidden;
}

/** Floating-Tab-Bar (iOS-26-Insel): bottom 18 px, Breite calc(100% − 44px) max. 386 px, Radius 28 px. */
export function MobileTabBar() {
  const { settings, mob, isMobile, mobDesign, overlay, setOverlay, navigate } = useSite();
  const page = pageForPath(canonicalPath(usePathname()));
  const tr = useT();
  const href = useHref();
  const hidden = useNavHidden(mob && settings.scrollHide);
  const menuOpen = overlay === 'mobileNav';

  // Editorial und Lab kommen ohne Tab-Leiste aus (MobileChrome2); App dockt sie unten an.
  if (!mob || mobDesign === 'editorial' || mobDesign === 'lab' || mobDesign === 'appv2') return null;
  const docked = mobDesign === 'app';
  const framed = !isMobile;

  const tabs = settings.mobModern ? MODERN : CLASSIC;
  const go = (href: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    navigate(href);
  };

  return (
    <>
      {!docked && <MobileBackPill tabBarHidden={hidden} />}
      <div
        style={{
          position: 'fixed',
          bottom: framed ? simBottom(docked ? 10 : 18) : docked ? 0 : 18,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          zIndex: 75,
          pointerEvents: 'none',
          transform: hidden ? 'translateY(130px)' : 'translateY(0)',
          transition: 'transform 0.55s cubic-bezier(0.32,1.2,0.35,1)',
        }}
      >
        <GlassSurface
          as="nav"
          id="ld-tabbar"
          aria-label={tr('nav.main')}
          radius={docked ? (framed ? '22px 22px 32px 32px' : '22px 22px 0 0') : '28px'}
          lite
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'stretch',
            gap: 2,
            padding: 6,
            width: 'calc(100% - 44px)',
            maxWidth: 386,
            // App-Design: angedockt über die volle Breite, mit Platz für den Home-Indikator.
            ...(docked && {
              width: framed ? 430 : '100%',
              maxWidth: 'none',
              padding: '6px 10px calc(8px + env(safe-area-inset-bottom))',
              boxSizing: 'border-box',
            }),
          }}
        >
          {tabs.map((t) => {
            // Modern: Home bleibt auch auf .Tech/Artikel/Impressum aktiv (die liegen im Menü).
            const on =
              !menuOpen && (page === t.id || (t.id === 'hallo' && settings.mobModern && (page === 'tech' || page === 'impressum')));
            return (
              <Link
                key={t.id}
                href={href(hrefOf(t.id))}
                onClick={go(hrefOf(t.id))}
                aria-current={page === t.id ? 'page' : undefined}
                aria-label={t.logo ? tr('tab.home') : undefined}
                data-navactive={on}
                className={styles.reset}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                  minHeight: 46,
                  borderRadius: 20,
                  cursor: 'pointer',
                  background: on && !t.logo ? 'var(--pill)' : 'transparent',
                  transition: 'background 0.25s',
                }}
              >
                <TabIcon icon={t.icon} logo={t.logo} color={on ? 'var(--accent)' : 'var(--muted)'} />
                {!t.logo && <TabLabel color={on ? 'var(--accent)' : 'var(--muted)'}>{tr(t.label)}</TabLabel>}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setOverlay(menuOpen ? null : 'mobileNav')}
            aria-expanded={menuOpen}
            aria-controls="ld-menu"
            className={styles.reset}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              minHeight: 46,
              borderRadius: 20,
              cursor: 'pointer',
              background: menuOpen ? 'var(--pill)' : 'transparent',
              transition: 'background 0.25s',
            }}
          >
            <TabIcon icon={menuOpen ? '✕' : '☰'} color={menuOpen ? 'var(--accent)' : 'var(--muted)'} />
            <TabLabel color={menuOpen ? 'var(--accent)' : 'var(--muted)'}>{tr('tab.menu')}</TabLabel>
          </button>
        </GlassSurface>
      </div>
    </>
  );
}

function TabIcon({ icon, logo, color }: { icon: string; logo?: boolean; color: string }) {
  // Home-Button (Modern): LD-Kachel im App-Icon-Stil statt der früheren „L!“-Verlaufskachel.
  // Ohne Schatten/Glow — Logo-Regel „keine Schatten“ (Logo-Handoff §5).
  if (logo) return <LogoTile variant="color" size={34} style={{ display: 'block' }} />;
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 17,
        fontWeight: 400,
        lineHeight: 1,
        color,
        transition: 'color 0.25s,transform 0.3s',
      }}
    >
      {icon}
    </span>
  );
}

function TabLabel({ color, children }: { color: string; children: string }) {
  return (
    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.03em', color, transition: 'color 0.25s', whiteSpace: 'nowrap' }}>
      {children}
    </span>
  );
}
