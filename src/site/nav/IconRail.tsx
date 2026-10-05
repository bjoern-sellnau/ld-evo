'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { GlassSurface } from '../glass/GlassSurface';
import { useSite } from '../settings/SiteProvider';
import { LogoTile } from '../settings/LogoTile';
import { useContent } from '../content/ContentProvider';
import { useHref, useT } from '../i18n/LocaleProvider';
import { canonicalPath } from '../i18n/locale';
import { isActiveHref } from './pages';
import { useBack } from './useBack';
import styles from './SiteNav.module.css';

/**
 * Ansicht „Wide 2“ (neu, nicht im Prototyp — Vorschlag 04.10.2026): statt der 224 px breiten Glas-Seitenleiste eine
 * schmale Liquid-Glass-Icon-Leiste (64 px) links mittig. Beschriftung erscheint als Glas-Etikett neben dem Icon
 * (Hover und Tastaturfokus); Werkzeuge (Theme, Suche, Animation, Einstellungen) und Kontakt sitzen unten.
 * Die Leiste läuft durch Auto-Kontrast und Refraktion wie die Desktop-Leiste (.ldnavvt → erstes Kind).
 */
const ICONS: Record<string, string> = {
  '/': '⌂',
  '/projekte': '▦',
  '/ueber-mich': '◉',
  '/labs': '⚗',
  '/reise': '✦',
  '/tech': '{}',
  '/impressum': '§',
};

export function IconRail() {
  const { settings, setOverlay, toggleTheme, toggleAnim, navigate } = useSite();
  const pathname = canonicalPath(usePathname());
  const { navigation } = useContent();
  const t = useT();
  const href = useHref();
  const back = useBack();
  const [tip, setTip] = useState<string | null>(null);

  const go = (h: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || !h.startsWith('/')) return;
    e.preventDefault();
    navigate(h);
  };
  const tipProps = (id: string) => ({
    onMouseEnter: () => setTip(id),
    onMouseLeave: () => setTip((x) => (x === id ? null : x)),
    onFocus: () => setTip(id),
    onBlur: () => setTip((x) => (x === id ? null : x)),
  });

  return (
    <nav
      aria-label={t('nav.main')}
      className="ldnavvt"
      style={{ position: 'fixed', zIndex: 60, top: 0, bottom: 0, left: 16, display: 'flex', alignItems: 'center', pointerEvents: 'none' }}
    >
      <GlassSurface
        radius="32px"
        sheen
        style={{
          pointerEvents: 'auto',
          width: 64,
          boxSizing: 'border-box',
          padding: '10px 8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          maxHeight: 'calc(100vh - 32px)',
        }}
      >
        {back.show && (
          <RailItem id="back" tip={tip} label={t('nav.back')} {...tipProps('back')}>
            <button type="button" onClick={back.go} aria-label={t('nav.back')} className={styles.reset} style={btn(false)}>
              <span aria-hidden style={{ fontSize: 18, color: back.color }}>
                ‹
              </span>
            </button>
          </RailItem>
        )}
        <RailItem id="home" tip={tip} label={t('nav.home')} {...tipProps('home')}>
          <Link
            href={href('/')}
            onClick={go('/')}
            aria-label={t('nav.home')}
            className={styles.reset}
            style={{ ...btn(false), height: 52 }}
          >
            <LogoTile variant="color" size={40} style={{ display: 'block' }} />
          </Link>
        </RailItem>
        <span aria-hidden style={divider} />
        {navigation
          .filter((n) => n.href !== '/')
          .map((n) => {
            const on = isActiveHref(pathname, n.href);
            const external = /^https?:/i.test(n.href);
            const icon = ICONS[n.href] ?? n.label.slice(0, 1);
            return (
              <RailItem key={n.href + n.label} id={n.href} tip={tip} label={n.label} {...tipProps(n.href)}>
                <Link
                  href={href(n.href)}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  onClick={go(n.href)}
                  aria-label={n.label}
                  aria-current={on ? 'page' : undefined}
                  data-navactive={on}
                  className={styles.reset}
                  style={btn(on)}
                >
                  <span
                    aria-hidden
                    style={{ fontSize: icon === '{}' ? 13 : 17, fontFamily: icon === '{}' ? 'var(--ld-font-mono),monospace' : undefined }}
                  >
                    {icon}
                  </span>
                </Link>
              </RailItem>
            );
          })}
        <span aria-hidden style={{ ...divider, marginTop: 'auto' }} />
        <RailItem id="theme" tip={tip} label={settings.theme === 'light' ? t('nav.themeDark') : t('nav.themeLight')} {...tipProps('theme')}>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={settings.theme === 'light' ? t('nav.themeDark') : t('nav.themeLight')}
            className={styles.reset}
            style={btn(false)}
          >
            <span aria-hidden>{settings.theme === 'light' ? '☾' : '☀'}</span>
          </button>
        </RailItem>
        <RailItem id="search" tip={tip} label={t('nav.searchTitle')} {...tipProps('search')}>
          <button
            type="button"
            onClick={() => setOverlay('search')}
            aria-label={t('nav.search')}
            className={styles.reset}
            style={btn(false)}
          >
            <span aria-hidden>⌕</span>
          </button>
        </RailItem>
        <RailItem id="anim" tip={tip} label={settings.anim ? t('nav.animPause') : t('nav.animStart')} {...tipProps('anim')}>
          <button
            type="button"
            onClick={toggleAnim}
            aria-label={settings.anim ? t('nav.animPause') : t('nav.animStart')}
            aria-pressed={!settings.anim}
            className={styles.reset}
            style={btn(false)}
          >
            <span aria-hidden style={{ fontSize: 13 }}>
              {settings.anim ? '⏸' : '▶'}
            </span>
          </button>
        </RailItem>
        <RailItem id="settings" tip={tip} label={t('nav.settings')} {...tipProps('settings')}>
          <button
            type="button"
            onClick={() => setOverlay('settings')}
            aria-label={t('nav.settings')}
            className={styles.reset}
            style={btn(false)}
          >
            <span aria-hidden>⚙</span>
          </button>
        </RailItem>
        <RailItem id="contact" tip={tip} label={t('nav.contact')} {...tipProps('contact')}>
          <button
            type="button"
            onClick={() => setOverlay('kontakt')}
            aria-label={t('nav.contact')}
            className={styles.reset}
            data-ldcta={settings.ctaAuto ? '' : undefined}
            style={{
              ...btn(false),
              background: 'var(--ld-cta-bg, var(--accent))',
              color: 'var(--ld-cta-ink, var(--on-accent))',
              transition: 'background-color 0.5s ease,color 0.5s ease',
              marginTop: 2,
            }}
          >
            <span aria-hidden>✉</span>
          </button>
        </RailItem>
      </GlassSurface>
    </nav>
  );
}

const divider: CSSProperties = { width: 28, height: 1, margin: '5px 0', background: 'var(--hair)', flex: 'none' };
const btn = (on: boolean): CSSProperties => ({
  width: 46,
  height: 44,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 14,
  cursor: 'pointer',
  fontSize: 17,
  color: on ? 'var(--ink)' : 'var(--muted)',
  background: on ? 'var(--pill)' : 'transparent',
  transition: 'background 0.25s,color 0.25s',
});

/** Ein Eintrag mit Glas-Etikett rechts daneben (sichtbar bei Hover/Fokus). */
function RailItem({
  id,
  tip,
  label,
  children,
  ...handlers
}: {
  id: string;
  tip: string | null;
  label: string;
  children: ReactNode;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onFocus: () => void;
  onBlur: () => void;
}) {
  const show = tip === id;
  return (
    <span style={{ position: 'relative', display: 'flex' }} {...handlers}>
      {children}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: 'calc(100% + 18px)',
          top: '50%',
          transform: show ? 'translate(0,-50%)' : 'translate(-6px,-50%)',
          opacity: show ? 1 : 0,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          padding: '7px 12px',
          borderRadius: 12,
          fontSize: 12.5,
          fontWeight: 700,
          color: 'var(--ink)',
          background: 'linear-gradient(180deg,var(--glassg1),var(--glassg2)),color-mix(in srgb,var(--bg) 82%,transparent)',
          border: '1px solid var(--glassbrd)',
          boxShadow: 'inset 0 1px 1px var(--glasshi),var(--shadow)',
          backdropFilter: 'blur(14px) saturate(1.6)',
          transition: 'opacity 0.18s ease,transform 0.18s ease',
        }}
      >
        {label}
      </span>
    </span>
  );
}
