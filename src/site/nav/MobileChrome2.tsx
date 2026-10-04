'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { LoonaLockup, LoonaTile } from '@/components/brand';
import { useSite } from '../settings/SiteProvider';
import { useContent } from '../content/ContentProvider';
import { useHref, useT } from '../i18n/LocaleProvider';
import { canonicalPath } from '../i18n/locale';
import { LanguageSwitch } from '../i18n/LanguageSwitch';
import { isActiveHref } from './pages';
import { useBack } from './useBack';
import { AppV2Bar } from './AppV2Bar';
import styles from './SiteNav.module.css';
import { useLogo } from '../settings/useLogo';

/**
 * Mobil-Designs 2 (neu, nicht im Prototyp — Einstellung „Mobil-Design“, ld-mobdesign). Ersetzt auf dem Telefon die
 * Prototyp-Navigation (Glas-Pille oben, Tab-Leiste, Vollbild-Menü) je nach Variante:
 *  - App:       Kopfzeile mit Seitentitel + Suche; Tab-Leiste angedockt und Menü als Bottom-Sheet (MobileTabBar/-Menu)
 *  - Editorial: ruhige Kopfzeile mit Wortmarke, „Menü“ öffnet ein Vollbild-Inhaltsverzeichnis, keine Tab-Leiste
 *  - Lab:       Dock-Knopf unten, der ein Fächermenü im Daumenbereich öffnet; Pfadanzeige oben
 * Die Inhalte gestaltet site.css über die Body-Klassen md-app / md-editorial / md-lab um.
 */
export function MobileChrome2() {
  const { mobDesign } = useSite();
  if (mobDesign === 'app') return <AppBar />;
  if (mobDesign === 'appv2') return <AppV2Bar />;
  if (mobDesign === 'editorial') return <EditorialChrome />;
  if (mobDesign === 'lab') return <LabDock />;
  return null;
}

/** Breite/Lage im Telefonrahmen der Desktop-Simulation bzw. auf dem echten Gerät. */
function useScreenBox() {
  const { isMobile } = useSite();
  const framed = !isMobile;
  return { framed, box: (framed ? { left: 'calc(50% - 215px)', width: 430 } : { left: 0, right: 0 }) as CSSProperties };
}

function useGo() {
  const { navigate } = useSite();
  return (href: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || !href.startsWith('/')) return;
    e.preventDefault();
    navigate(href);
  };
}

function useScrolled(y: number) {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const f = () => setPast(window.scrollY > y);
    f();
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, [y]);
  return past;
}

const reset = styles.reset;
const round: CSSProperties = {
  width: 44,
  height: 44,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 999,
  cursor: 'pointer',
  color: 'var(--ink)',
  background: 'transparent',
  fontSize: 18,
};

/* ------------------------------------------------------------------ App ------------------------------------------- */

function AppBar() {
  const logo = useLogo();
  const { setOverlay } = useSite();
  const { framed, box } = useScreenBox();
  const t = useT();
  const href = useHref();
  const go = useGo();
  const back = useBack();
  const pathname = canonicalPath(usePathname());
  const nav = useContent().navigation;
  const title = nav.find((n) => n.href !== '/' && isActiveHref(pathname, n.href))?.label ?? 'Loona! Designs';
  const scrolled = useScrolled(56);
  return (
    <header
      style={{
        position: 'fixed',
        top: framed ? 10 : 0,
        ...box,
        zIndex: 70,
        paddingTop: framed ? 0 : 'env(safe-area-inset-top)',
        borderRadius: framed ? '32px 32px 0 0' : 0,
        background: scrolled ? 'color-mix(in srgb,var(--bg) 72%,transparent)' : 'transparent',
        backdropFilter: scrolled ? 'blur(22px) saturate(1.8)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(22px) saturate(1.8)' : 'none',
        borderBottom: `1px solid ${scrolled ? 'var(--hair)' : 'transparent'}`,
        transition: 'background 0.3s,border-color 0.3s',
      }}
    >
      <nav
        aria-label={t('nav.main')}
        style={{ height: 56, display: 'grid', gridTemplateColumns: '88px 1fr 88px', alignItems: 'center', padding: '0 10px' }}
      >
        {back.show ? (
          <button
            type="button"
            onClick={back.go}
            className={reset}
            style={{
              ...round,
              width: 'auto',
              height: 36,
              padding: '0 12px',
              fontSize: 14,
              fontWeight: 700,
              color: back.color,
              // Eigene, deckende Pille: über farbigen Titelbildern bleibt der Kontrast ≥ 4,5:1.
              background: 'color-mix(in srgb,var(--bg) 92%,transparent)',
              justifySelf: 'start',
            }}
          >
            {back.text}
          </button>
        ) : (
          <Link href={href('/')} onClick={go('/')} aria-label={t('nav.home')} className={reset} style={{ ...round, justifySelf: 'start' }}>
            <LoonaTile product="ld" variant={logo.tile('ink')} size={32} decorative style={{ display: 'block', borderRadius: 9 }} />
          </Link>
        )}
        {/* Seitentitel blendet ein, sobald die große Überschrift der Seite weggescrollt ist (iOS „Large Title“). */}
        <span
          aria-hidden={!scrolled}
          style={{
            textAlign: 'center',
            fontSize: 15,
            fontWeight: 700,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            opacity: scrolled ? 1 : 0,
            transform: scrolled ? 'none' : 'translateY(6px)',
            transition: 'opacity 0.3s,transform 0.3s',
          }}
        >
          {title}
        </span>
        <span style={{ justifySelf: 'end', display: 'flex' }}>
          <button type="button" onClick={() => setOverlay('search')} aria-label={t('nav.search')} className={reset} style={round}>
            ⌕
          </button>
        </span>
      </nav>
    </header>
  );
}

/* -------------------------------------------------------------- Editorial ----------------------------------------- */

function EditorialChrome() {
  const logo = useLogo();
  const { overlay, setOverlay, settings, toggleTheme } = useSite();
  const { framed, box } = useScreenBox();
  const t = useT();
  const href = useHref();
  const go = useGo();
  const back = useBack();
  const pathname = canonicalPath(usePathname());
  const nav = useContent().navigation;
  const open = overlay === 'mobileNav';
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLElement>('a,button')?.focus({ preventScroll: true });
    return () => prev?.focus?.({ preventScroll: true });
  }, [open]);

  const mono: CSSProperties = {
    fontFamily: 'var(--ld-font-mono),monospace',
    fontSize: 11,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  };
  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: framed ? 10 : 0,
          ...box,
          zIndex: 78,
          paddingTop: framed ? 0 : 'env(safe-area-inset-top)',
          borderRadius: framed ? '32px 32px 0 0' : 0,
          background: 'var(--bg)',
          borderBottom: '1px solid var(--hair)',
        }}
      >
        <nav
          aria-label={t('nav.main')}
          style={{ height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px' }}
        >
          {back.show && !open ? (
            <button
              type="button"
              onClick={back.go}
              className={reset}
              style={{ ...mono, minHeight: 44, cursor: 'pointer', color: 'var(--ink)', background: 'transparent' }}
            >
              ← {t('nav.back')}
            </button>
          ) : (
            <Link
              href={href('/')}
              onClick={go('/')}
              aria-label={t('nav.home')}
              className={reset}
              style={{ display: 'flex', alignItems: 'center', minHeight: 44, color: 'var(--ink)' }}
            >
              <LoonaLockup
                markSize={22}
                theme={settings.theme}
                tone={logo.markTone(settings.theme)}
                variant="full"
                style={{ color: 'var(--ink)', '--loona-lockup-muted': 'var(--muted)' } as CSSProperties}
              />
            </Link>
          )}
          <button
            type="button"
            onClick={() => setOverlay(open ? null : 'mobileNav')}
            aria-expanded={open}
            aria-controls="ld-menu"
            className={reset}
            style={{ ...mono, minHeight: 44, padding: '0 2px', cursor: 'pointer', color: 'var(--ink)', background: 'transparent' }}
          >
            {open ? `${t('menu.close')} ✕` : t('tab.menu')}
          </button>
        </nav>
      </header>
      {open && (
        <div
          id="ld-menu"
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label={t('menu.label')}
          style={{
            position: 'fixed',
            top: framed ? 10 : 0,
            bottom: framed ? 10 : 0,
            ...box,
            zIndex: 77,
            background: 'var(--bg)',
            borderRadius: framed ? 32 : 0,
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            padding: '86px 18px 40px',
            boxSizing: 'border-box',
            animation: 'ldPageIn 0.35s cubic-bezier(0.22,1,0.32,1)',
          }}
        >
          <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {nav.map((n, i) => {
              const on = isActiveHref(pathname, n.href);
              return (
                <li key={n.href + n.label} style={{ borderTop: '1px solid var(--hair)' }}>
                  <Link
                    href={href(n.href)}
                    onClick={go(n.href)}
                    aria-current={on ? 'page' : undefined}
                    className={reset}
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 14,
                      padding: '16px 0',
                      color: on ? 'var(--accent)' : 'var(--ink)',
                      animation: `ldMenuItem 0.4s ${(0.04 * i).toFixed(2)}s cubic-bezier(0.22,1,0.32,1) both`,
                    }}
                  >
                    <span style={{ ...mono, fontSize: 10, color: 'var(--soft)', width: 22 }}>{String(i + 1).padStart(2, '0')}</span>
                    <span style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05 }}>{n.label}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
          <div style={{ borderTop: '1px solid var(--hair)', paddingTop: 18, display: 'flex', flexWrap: 'wrap', gap: '6px 22px' }}>
            <button
              type="button"
              onClick={toggleTheme}
              className={reset}
              style={{ ...mono, minHeight: 44, color: 'var(--ink)', background: 'transparent', cursor: 'pointer' }}
            >
              {settings.theme === 'light' ? t('nav.themeDark') : t('nav.themeLight')}
            </button>
            <button
              type="button"
              onClick={() => setOverlay('search')}
              className={reset}
              style={{ ...mono, minHeight: 44, color: 'var(--ink)', background: 'transparent', cursor: 'pointer' }}
            >
              {t('nav.search')}
            </button>
            <button
              type="button"
              onClick={() => setOverlay('settings')}
              className={reset}
              style={{ ...mono, minHeight: 44, color: 'var(--ink)', background: 'transparent', cursor: 'pointer' }}
            >
              {t('nav.settings')}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setOverlay('kontakt')}
            className={reset}
            style={{
              marginTop: 24,
              width: '100%',
              minHeight: 52,
              borderRadius: 0,
              cursor: 'pointer',
              background: 'var(--ink)',
              color: 'var(--bg)',
              fontSize: 15,
              fontWeight: 700,
            }}
          >
            {t('menu.contact')} →
          </button>
          <div style={{ marginTop: 18 }}>
            <LanguageSwitch variant="mono" />
          </div>
        </div>
      )}
    </>
  );
}

/* -------------------------------------------------------------------- Lab ----------------------------------------- */

const LAB_PAGES = [
  { href: '/', icon: '⌂' },
  { href: '/projekte', icon: '▦' },
  { href: '/ueber-mich', icon: '◉' },
  { href: '/labs', icon: '⚗' },
  { href: '/reise', icon: '✦' },
  { href: '/tech', icon: '{}' },
  { href: '/impressum', icon: '§' },
];

function LabDock() {
  const logo = useLogo();
  const { overlay, setOverlay, settings, toggleTheme } = useSite();
  const { framed } = useScreenBox();
  const t = useT();
  const href = useHref();
  const go = useGo();
  const back = useBack();
  const pathname = canonicalPath(usePathname());
  const nav = useContent().navigation;
  const open = overlay === 'mobileNav';
  const fan = useRef<HTMLDivElement>(null);
  const label = (h: string) => nav.find((n) => n.href === h)?.label ?? h;
  const path = pathname === '/' ? '~' : `~${pathname}`;

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    fan.current?.querySelector<HTMLElement>('a,button')?.focus({ preventScroll: true });
    return () => prev?.focus?.({ preventScroll: true });
  }, [open]);

  const bottom = framed ? 30 : 'calc(20px + env(safe-area-inset-bottom))';
  const anim = settings.anim;
  // Außen: Seiten auf einem Halbkreis (r 148), innen: Werkzeuge (r 78) — alles im Daumenbereich über dem Dock.
  const arc = (i: number, n: number, r: number) => {
    const a = Math.PI - (i * Math.PI) / (n - 1);
    return { x: Math.cos(a) * r, y: -Math.sin(a) * r };
  };
  const tools = [
    { key: 'search', icon: '⌕', text: t('nav.search'), on: () => setOverlay('search') },
    {
      key: 'theme',
      icon: settings.theme === 'light' ? '☾' : '☀',
      text: settings.theme === 'light' ? t('nav.themeDark') : t('nav.themeLight'),
      on: () => {
        setOverlay(null);
        toggleTheme();
      },
    },
    { key: 'settings', icon: '⚙', text: t('nav.settings'), on: () => setOverlay('settings') },
    { key: 'contact', icon: '✉', text: t('nav.contact'), on: () => setOverlay('kontakt') },
  ];
  const bubble = (x: number, y: number, i: number): CSSProperties => ({
    position: 'absolute',
    left: '50%',
    bottom: 0,
    width: 50,
    height: 50,
    marginLeft: -25,
    borderRadius: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 17,
    color: 'var(--ink)',
    background: 'color-mix(in srgb,var(--bg) 92%,transparent)',
    border: '1px solid color-mix(in srgb,var(--accent) 55%,transparent)',
    boxShadow: '0 0 18px -6px var(--accent)',
    backdropFilter: 'blur(12px)',
    cursor: 'pointer',
    transform: `translate(${x.toFixed(1)}px,${(y - 8).toFixed(1)}px)`,
    animation: anim ? `ldLabPop 0.42s ${(i * 0.035).toFixed(3)}s cubic-bezier(0.2,1.4,0.4,1) both` : undefined,
  });

  return (
    <>
      {/* Pfadanzeige oben links — zeigt, wo man ist (wie ein Prompt) */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          top: framed ? 22 : 'calc(12px + env(safe-area-inset-top))',
          left: framed ? 'calc(50% - 199px)' : 16,
          zIndex: 70,
          fontFamily: 'var(--ld-font-mono),monospace',
          fontSize: 11,
          letterSpacing: '0.04em',
          padding: '6px 10px',
          borderRadius: 8,
          color: 'var(--ink)',
          background: 'color-mix(in srgb,var(--bg) 92%,transparent)',
          border: '1px solid color-mix(in srgb,var(--accent) 45%,transparent)',
          backdropFilter: 'blur(10px)',
          maxWidth: 260,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ color: settings.coverFull ? 'var(--ink)' : 'var(--accent)' }}>ld:</span>
        {path}
        <span className={anim ? 'ld-caret' : undefined}>▍</span>
      </div>

      {open && (
        <div
          aria-hidden
          onClick={() => setOverlay(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 73,
            background: 'color-mix(in srgb,var(--bg) 55%,transparent)',
            backdropFilter: 'blur(6px)',
          }}
        />
      )}

      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom,
          zIndex: 75,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <div style={{ position: 'relative', width: 66, height: 66, pointerEvents: 'auto' }}>
          {open && (
            <div
              ref={fan}
              id="ld-menu"
              role="dialog"
              aria-modal="true"
              aria-label={t('menu.label')}
              style={{ position: 'absolute', left: 0, right: 0, bottom: 66 }}
            >
              {LAB_PAGES.map((p, i) => {
                const { x, y } = arc(i, LAB_PAGES.length, 148);
                const on = isActiveHref(pathname, p.href);
                return (
                  <Link
                    key={p.href}
                    href={href(p.href)}
                    onClick={go(p.href)}
                    aria-label={label(p.href)}
                    aria-current={on ? 'page' : undefined}
                    className={reset}
                    style={{ ...bubble(x, y, i), ...(on && { background: 'var(--accent)', color: 'var(--on-accent)' }) }}
                  >
                    <span
                      aria-hidden
                      style={{
                        fontFamily: p.icon === '{}' ? 'var(--ld-font-mono),monospace' : undefined,
                        fontSize: p.icon === '{}' ? 14 : 17,
                      }}
                    >
                      {p.icon}
                    </span>
                    <span
                      aria-hidden
                      style={{
                        position: 'absolute',
                        top: '100%',
                        marginTop: 3,
                        fontFamily: 'var(--ld-font-mono),monospace',
                        fontSize: 9,
                        color: 'var(--ink)',
                        whiteSpace: 'nowrap',
                        textShadow: '0 0 6px var(--bg)',
                      }}
                    >
                      {label(p.href)}
                    </span>
                  </Link>
                );
              })}
              {tools.map((x, i) => {
                const p = arc(i, tools.length, 78);
                return (
                  <button
                    key={x.key}
                    type="button"
                    onClick={x.on}
                    aria-label={x.text}
                    title={x.text}
                    className={reset}
                    style={bubble(p.x, p.y, i + LAB_PAGES.length)}
                  >
                    <span aria-hidden>{x.icon}</span>
                  </button>
                );
              })}
            </div>
          )}
          <button
            type="button"
            onClick={() => setOverlay(open ? null : 'mobileNav')}
            aria-expanded={open}
            aria-label={open ? t('dock.close') : t('dock.open')}
            className={reset}
            style={{
              width: 66,
              height: 66,
              borderRadius: 22,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              boxShadow: `0 0 0 1.5px color-mix(in srgb,var(--accent) 70%,transparent),0 0 ${open ? 34 : 22}px -4px var(--accent)`,
              transform: open ? 'rotate(45deg) scale(0.92)' : 'none',
              transition: 'transform 0.35s cubic-bezier(0.2,1.3,0.4,1),box-shadow 0.35s',
            }}
          >
            <LoonaTile
              product="ld"
              variant={logo.tile('ink')}
              size={58}
              decorative
              style={{ display: 'block', transform: open ? 'rotate(-45deg)' : 'none', transition: 'transform 0.35s' }}
            />
          </button>
        </div>
      </div>

      {back.show && !open && (
        <button
          type="button"
          onClick={back.go}
          className={reset}
          style={{
            position: 'fixed',
            bottom: framed ? 42 : 'calc(32px + env(safe-area-inset-bottom))',
            left: framed ? 'calc(50% - 199px)' : 16,
            zIndex: 75,
            minHeight: 44,
            padding: '0 14px',
            borderRadius: 10,
            cursor: 'pointer',
            fontFamily: 'var(--ld-font-mono),monospace',
            fontSize: 12,
            color: 'var(--ink)',
            background: 'color-mix(in srgb,var(--bg) 92%,transparent)',
            border: '1px solid color-mix(in srgb,var(--accent) 45%,transparent)',
            backdropFilter: 'blur(10px)',
          }}
        >
          cd ..
        </button>
      )}
    </>
  );
}
