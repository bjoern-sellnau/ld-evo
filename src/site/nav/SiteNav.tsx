'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { CSSProperties, MouseEvent } from 'react';
import { LoonaLockup } from '@/components/brand';
import { GlassSurface } from '../glass/GlassSurface';
import { useSite } from '../settings/SiteProvider';
import styles from './SiteNav.module.css';
import { useContent } from '../content/ContentProvider';
import { isActiveHref } from './pages';
import { useBack } from './useBack';
import { useHref, useT } from '../i18n/LocaleProvider';
import { canonicalPath } from '../i18n/locale';

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ');

const iconBtn: CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 999,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: 'var(--muted)',
  background: 'transparent',
  transition: 'transform 0.25s,background 0.25s',
};

/** Liquid-Glass-Nav: Top-Pille (Desktop) bzw. Glas-Sidebar (Wide). Markup/Werte aus dem Prototyp, Zeile 328 ff. */
export function SiteNav() {
  const { settings, mob, sideActive, isWide, frame, narrow, toggleTheme, toggleAnim, setOverlay, navigate, set } = useSiteNav();
  const pathname = canonicalPath(usePathname());
  const { navigation } = useContent();
  const back = useBack();
  const t = useT();
  const href = useHref();

  if (mob && settings.mobModern) return null;

  const navRad = settings.styleMode === 'fluent' ? (sideActive ? '16px' : '14px') : sideActive ? '28px' : '999px';
  const divider: CSSProperties = sideActive
    ? { alignSelf: 'stretch', height: 1, margin: '7px 4px', background: 'var(--hair)' }
    : { width: 1, height: 20, margin: '0 3px', background: 'var(--hair)' };

  const go = (href: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || !href.startsWith('/')) return;
    e.preventDefault();
    navigate(href);
  };

  return (
    <nav
      aria-label={t('nav.main')}
      className="ldnavvt"
      style={{
        position: 'fixed',
        zIndex: 60,
        pointerEvents: 'none',
        display: 'flex',
        ...(sideActive
          ? { top: 0, bottom: 0, left: 18, justifyContent: 'flex-start', alignItems: 'center' }
          : { top: mob && frame ? 58 : 16, left: 0, right: 0, justifyContent: 'center', transition: 'top 0.35s ease' }),
      }}
    >
      <GlassSurface
        radius={navRad}
        sheen
        style={
          {
            pointerEvents: 'auto',
            display: 'flex',
            gap: 3,
            padding: sideActive ? '14px 12px' : '7px 8px',
            '--ld-item-scale': sideActive ? '1.02' : '1.07',
            ...(sideActive
              ? {
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  width: 224,
                  boxSizing: 'border-box',
                  maxHeight: 'calc(100vh - 32px)',
                  overflowY: 'auto',
                }
              : { flexDirection: 'row', alignItems: 'center' }),
          } as unknown as CSSProperties
        }
      >
        {back.show && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
            <button
              type="button"
              onClick={back.go}
              aria-label={t('nav.back')}
              className={cx(styles.reset, styles.back)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '8px 13px',
                borderRadius: 999,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 700,
                color: back.color,
                background: 'var(--pill)',
                transition: 'transform 0.25s,color 0.3s',
                whiteSpace: 'pre',
              }}
            >
              {back.text}
            </button>
            <span aria-hidden style={divider} />
          </span>
        )}
        <Link
          href={href('/')}
          onClick={go('/')}
          aria-label={t('nav.home')}
          className={cx(styles.reset, styles.logo)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px 8px 9px',
            borderRadius: 999,
            color: 'var(--ink)',
            transition: 'transform 0.25s,color 0.25s',
          }}
        >
          {/* LD-Lockup (Logo-Handoff Prompt 2): Zeichenhöhe 28 px, unter 480 px nur das Zeichen.
              Textfarben folgen den Site-Tokens, damit Auto-Kontrast greift (Site-Nachtrag v23). */}
          <LoonaLockup
            markSize={28}
            theme={settings.theme}
            variant={narrow ? 'mark' : 'full'}
            style={{ color: 'var(--ink)', '--loona-lockup-muted': 'var(--muted)' } as CSSProperties}
          />
        </Link>

        {!mob && (
          <>
            <span aria-hidden style={divider} />
            {navigation.map((p) => {
              const on = isActiveHref(pathname, p.href);
              const external = /^https?:/i.test(p.href);
              return (
                <Link
                  key={p.href + p.label}
                  href={href(p.href)}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  onClick={go(p.href)}
                  aria-current={on ? 'page' : undefined}
                  data-navactive={on}
                  className={cx(styles.reset, styles.item)}
                  style={{
                    padding: sideActive ? '11px 14px' : '9px 15px',
                    borderRadius: sideActive ? 12 : 999,
                    fontSize: 13,
                    fontWeight: 600,
                    background: on ? 'var(--pill)' : 'transparent',
                    color: on ? 'var(--ink)' : 'var(--muted)',
                    transition: 'transform 0.25s,background 0.25s,color 0.25s',
                    whiteSpace: 'nowrap',
                    display: sideActive ? 'flex' : 'inline-block',
                    alignItems: 'center',
                  }}
                >
                  {p.label}
                </Link>
              );
            })}
            <span aria-hidden style={divider} />
            <span style={{ display: 'flex', gap: 3, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={toggleTheme}
                title="Light/Dark"
                aria-label={settings.theme === 'light' ? t('nav.themeDark') : t('nav.themeLight')}
                className={cx(styles.reset, styles.icon)}
                style={{ ...iconBtn, fontSize: 14 }}
              >
                {settings.theme === 'light' ? '☾' : '☀'}
              </button>
              <button
                type="button"
                onClick={() => setOverlay('search')}
                title={t('nav.searchTitle')}
                aria-label={t('nav.search')}
                className={cx(styles.reset, styles.icon)}
                style={{ ...iconBtn, fontSize: 15 }}
              >
                ⌕
              </button>
              <button
                type="button"
                onClick={toggleAnim}
                title={t('nav.animTitle')}
                aria-label={settings.anim ? t('nav.animPause') : t('nav.animStart')}
                aria-pressed={!settings.anim}
                className={cx(styles.reset, styles.icon)}
                style={{ ...iconBtn, fontSize: 12 }}
              >
                {settings.anim ? '⏸' : '▶'}
              </button>
              <button
                type="button"
                onClick={() => setOverlay('settings')}
                title={t('nav.settings')}
                aria-label={t('nav.settings')}
                className={cx(styles.reset, styles.icon)}
                style={{ ...iconBtn, fontSize: 15 }}
              >
                ⚙
              </button>
              {isWide && (
                <button
                  type="button"
                  onClick={() => set('navSide', !settings.navSide)}
                  title={t('nav.sideTitle')}
                  aria-label={sideActive ? t('nav.sideTop') : t('nav.sideTitle')}
                  aria-pressed={settings.navSide}
                  className={cx(styles.reset, styles.icon)}
                  style={{ ...iconBtn, fontSize: 14 }}
                >
                  {sideActive ? '⇥' : '⇤'}
                </button>
              )}
            </span>
          </>
        )}

        {!mob && (
          <button
            type="button"
            onClick={() => setOverlay('kontakt')}
            className={cx(styles.reset, styles.kontakt)}
            style={{
              display: 'inline-block',
              textAlign: 'center',
              textShadow: 'none',
              padding: '9px 17px',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              background: 'var(--accent)',
              color: 'var(--on-accent)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35)',
              transition: 'transform 0.25s',
            }}
          >
            {t('nav.contact')}
          </button>
        )}
      </GlassSurface>
    </nav>
  );
}

function useSiteNav() {
  const site = useSite();
  const s = site.settings;
  // Telefon-Hardware (Island/Hole/Notch) nur in der Desktop-Simulation → Top-Nav rückt auf 58 px.
  const frame = site.mob && !site.isMobile && s.frame !== 'clear';
  // Unter 480 px (auch im 430-px-Telefonrahmen der Desktop-Simulation) nur das Zeichen.
  const narrow = site.isNarrow || (site.mob && !site.isMobile);
  return { ...site, frame, narrow };
}
