'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { LoonaTile } from '@/components/brand';
import { useSite } from '../settings/SiteProvider';
import styles from './MobileMenu.module.css';
import { useContent } from '../content/ContentProvider';
import { isActiveHref } from './pages';
import { useHref, useT } from '../i18n/LocaleProvider';
import { canonicalPath } from '../i18n/locale';
import { LanguageSwitch } from '../i18n/LanguageSwitch';

const item = (delay: string): CSSProperties => ({ animation: `ldMenuItem 0.45s ${delay} cubic-bezier(0.22,1,0.32,1) both` });

/** Mobile-Menü als Vollbild-Glas-Page (slide-up 0.45 s, gestaffelte Items). Markup: Prototyp Zeile 913 ff. */
export function MobileMenu() {
  const { settings, mob, isMobile, overlay, setOverlay, toggleTheme, toggleAnim, navigate } = useSite();
  const pathname = canonicalPath(usePathname());
  const t = useT();
  const href = useHref();
  // Prototyp: menuSheetItems — was nicht in der Tab-Bar steht (pflegbar in LD Flow → Navigation).
  const ITEMS = useContent().navigation.filter((n) => n.inMenu);
  const open = mob && overlay === 'mobileNav';
  const panel = useRef<HTMLDivElement>(null);

  // Fokus ins Menü, beim Schließen zurück auf den Menü-Button der Tab-Bar.
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLElement>('a,button')?.focus({ preventScroll: true });
    return () => prev?.focus?.({ preventScroll: true });
  }, [open]);

  if (!open) return null;

  // Desktop-Simulation: im Telefonrahmen (430 px, Radius 32); echtes Mobilgerät: Vollbild.
  const framed = !isMobile;
  const rad = framed ? '32px' : '0px';
  const go = (href: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || !href.startsWith('/')) return;
    e.preventDefault();
    navigate(href);
  };

  return (
    <>
      <div
        aria-hidden
        onClick={() => setOverlay(null)}
        style={{ position: 'fixed', inset: 0, background: 'rgba(5,10,20,0.3)', zIndex: 73 }}
      />
      <div
        id="ld-menu"
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={t('menu.label')}
        style={{
          position: 'fixed',
          ...(framed
            ? { top: 10, bottom: 10, left: 'calc(50% - 215px)', width: 430, borderRadius: 32 }
            : { top: 0, bottom: 0, left: 0, right: 0, borderRadius: 0 }),
          zIndex: 74,
          overflow: 'hidden',
          background: 'linear-gradient(180deg,var(--glassg1),var(--glassg2)),color-mix(in srgb,var(--bg) 62%,transparent)',
          border: '1px solid var(--glassbrd)',
          boxShadow: 'inset 0 1.5px 1px var(--glasshi),var(--shadow)',
          animation: 'ldPageIn 0.45s cubic-bezier(0.22,1,0.32,1)',
        }}
      >
        <div data-ldfrost="1" aria-hidden style={{ borderRadius: rad }} />
        <div data-ldedge="1" aria-hidden style={{ borderRadius: rad }} />
        <div data-ldrim="1" aria-hidden style={{ borderRadius: rad }} />
        <div
          style={{
            position: 'relative',
            height: '100%',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            padding: '88px 26px 108px',
            overflowY: 'auto',
            overscrollBehavior: 'contain',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, ...item('0.05s') }}>
            <LoonaTile product="ld" variant="color" size={26} decorative style={{ display: 'block' }} />
            <span style={{ fontFamily: 'var(--ld-font-mono),monospace', fontSize: 10, letterSpacing: '0.2em', color: 'var(--soft)' }}>
              {t('menu.kicker')}
            </span>
          </div>

          <div style={{ marginTop: 26 }}>
            {ITEMS.map((x, i) => {
              const on = isActiveHref(pathname, x.href);
              return (
                <Link
                  key={x.href + x.label}
                  href={href(x.href)}
                  onClick={go(x.href)}
                  aria-current={on ? 'page' : undefined}
                  className={styles.sheetItem}
                  style={{ color: on ? 'var(--accent)' : 'var(--ink)', ...item(`${(0.1 + i * 0.06).toFixed(2)}s`) }}
                >
                  {x.menuLabel || x.label}
                  <span aria-hidden style={{ color: 'var(--soft)', fontSize: 17, fontWeight: 400 }}>
                    ›
                  </span>
                </Link>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 26, ...item('0.22s') }}>
            <Tile icon={settings.theme === 'light' ? '☾' : '☀'} iconSize={17} label={t('menu.theme')} onClick={toggleTheme} />
            <Tile icon="⌕" iconSize={18} label={t('menu.search')} onClick={() => setOverlay('search')} />
            <Tile icon={settings.anim ? '⏸' : '▶'} iconSize={15} label={t('menu.anim')} onClick={toggleAnim} pressed={!settings.anim} />
            <Tile icon="⚙" iconSize={18} label={t('menu.options')} onClick={() => setOverlay('settings')} />
          </div>

          <div style={{ marginTop: 'auto', paddingTop: 26, ...item('0.3s') }}>
            <button type="button" onClick={() => setOverlay('kontakt')} className={styles.kontakt}>
              {t('menu.contact')}
            </button>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 16,
                fontFamily: 'var(--ld-font-mono),monospace',
                fontSize: 9,
                letterSpacing: '0.1em',
                color: 'var(--soft)',
              }}
            >
              <span>© 2026 BJÖRN SELLNAU</span>
              <LanguageSwitch variant="mono" />
              <span>/// THE WEB. MY PASSION</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Tile({
  icon,
  iconSize,
  label,
  onClick,
  pressed,
}: {
  icon: ReactNode;
  iconSize: number;
  label: string;
  onClick: () => void;
  pressed?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} aria-pressed={pressed} className={styles.tile}>
      <span aria-hidden style={{ fontSize: iconSize }}>
        {icon}
      </span>
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--soft)' }}>{label}</span>
    </button>
  );
}
