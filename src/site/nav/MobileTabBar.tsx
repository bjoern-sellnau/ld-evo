'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { GlassSurface } from '../glass/GlassSurface';
import { useSite } from '../settings/SiteProvider';
import styles from './SiteNav.module.css';
import { SITE_PAGES, pageForPath, type SitePageId } from './pages';

interface Tab {
  id: SitePageId;
  label: string;
  icon: string;
  logo?: boolean;
}

// Prototyp: renderVals → tabItems (Modern: L!-Home mittig; klassisch: Home zuerst).
const MODERN: Tab[] = [
  { id: 'projekte', label: 'Projekte', icon: '▦' },
  { id: 'ueber', label: 'Über mich', icon: '◉' },
  { id: 'hallo', label: 'Home', icon: 'L!', logo: true },
  { id: 'labs', label: 'Labs', icon: '⚗' },
];
const CLASSIC: Tab[] = [
  { id: 'hallo', label: 'Home', icon: '⌂' },
  { id: 'projekte', label: 'Projekte', icon: '▦' },
  { id: 'ueber', label: 'Über mich', icon: '◉' },
  { id: 'labs', label: 'Labs', icon: '⚗' },
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
  const { settings, mob, overlay, setOverlay, navigate } = useSite();
  const pathname = usePathname();
  const page = pageForPath(pathname);
  const hidden = useNavHidden(mob && settings.scrollHide);
  const menuOpen = overlay === 'mobileNav';

  if (!mob) return null;

  const tabs = settings.mobModern ? MODERN : CLASSIC;
  const go = (href: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    navigate(href);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 18,
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
        aria-label="Hauptnavigation"
        radius="28px"
        lite
        style={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'stretch',
          gap: 2,
          padding: 6,
          width: 'calc(100% - 44px)',
          maxWidth: 386,
        }}
      >
        {tabs.map((t) => {
          // Modern: Home bleibt auch auf .Tech/Artikel/Impressum aktiv (die liegen im Menü).
          const on = !menuOpen && (page === t.id || (t.id === 'hallo' && settings.mobModern && (page === 'tech' || page === 'impressum')));
          return (
            <Link
              key={t.id}
              href={hrefOf(t.id)}
              onClick={go(hrefOf(t.id))}
              aria-current={page === t.id ? 'page' : undefined}
              aria-label={t.logo ? 'Home' : undefined}
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
              {!t.logo && <TabLabel color={on ? 'var(--accent)' : 'var(--muted)'}>{t.label}</TabLabel>}
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
          <TabLabel color={menuOpen ? 'var(--accent)' : 'var(--muted)'}>Menü</TabLabel>
        </button>
      </GlassSurface>
    </div>
  );
}

function TabIcon({ icon, logo, color }: { icon: string; logo?: boolean; color: string }) {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: logo ? 34 : 'auto',
        height: logo ? 34 : 'auto',
        borderRadius: logo ? 11 : 0,
        background: logo ? 'linear-gradient(135deg,#FFB224,#FF7A2F)' : 'transparent',
        boxShadow: logo ? 'inset 0 1px 0 rgba(255,255,255,0.5), 0 4px 12px rgba(255,122,47,0.45)' : 'none',
        fontSize: logo ? 13 : 17,
        fontWeight: logo ? 800 : 400,
        lineHeight: 1,
        color: logo ? '#241400' : color,
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
