'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { mono } from '../cards/ProjectCard';
import { useSite } from '../settings/SiteProvider';
import styles from './chrome.module.css';
import { useHref, useT } from '../i18n/LocaleProvider';
import { canonicalPath } from '../i18n/locale';
import { LanguageSwitch } from '../i18n/LanguageSwitch';
import { LoonaTile } from '@/components/brand';
import { faviconChoice, faviconUri } from '../settings/favicon';
import type { ReactNode } from 'react';

/** Symbole der Footer-Links (GitHub: Octicons „mark-github“, MIT; LinkedIn: Simple Icons, CC0). */
const ICON = {
  linkedin:
    'M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z',
  github:
    'M12 0C5.37 0 0 5.37 0 12c0 5.31 3.44 9.8 8.21 11.39.6.11.82-.26.82-.57v-2.24c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.82.57A12 12 0 0 0 24 12c0-6.63-5.37-12-12-12z',
};
const svg = (d: string) => (
  <svg aria-hidden focusable="false" viewBox="0 0 24 24" width={16} height={16} fill="currentColor" style={{ display: 'block' }}>
    <path d={d} />
  </svg>
);
/** Symbol-Modus: quadratische Klickfläche (≥ 24 px, WCAG 2.5.8), Name per aria-label + title. */
const iconBox = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 28, height: 28 } as const;

/**
 * Footer (Prototyp Zeile 900 ff.) — auf „Meine Reise“ ausgeblendet (Vollbild-Timeline).
 * Anpassbar über die Einstellungen (neu, nicht im Prototyp): Marke als Wortmarke mit/ohne Akzent-„!“ oder LD-Logo,
 * freier Zusatz und freie Copyright-Zeile (leer = ausgeblendet), Links rechts als Text oder Symbole.
 */
export function SiteFooter() {
  const { navigate, settings } = useSite();
  const pathname = canonicalPath(usePathname());
  const t = useT();
  const href = useHref();
  if (pathname === '/reise') return null;
  return (
    <footer
      id="fuss"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid var(--hair)',
        padding: '26px 0 30px',
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      <span style={{ fontSize: 13.5, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {settings.footBrand === 'logo' ? (
          // Variante wie beim Favicon; „Farb-Kachel“ = bisheriges LoonaTile (Standard)
          (() => {
            const f = faviconChoice(settings.footLogo);
            return !f || f.key === 'color' ? (
              <LoonaTile product="ld" variant="color" size={settings.footLogoSize} title="Loona! Designs" style={{ display: 'block' }} />
            ) : (
              <img
                src={faviconUri(f.svg)}
                alt="Loona! Designs"
                width={settings.footLogoSize}
                height={settings.footLogoSize}
                style={{ display: 'block' }}
              />
            );
          })()
        ) : (
          <span>
            Loona<span style={settings.footBrand === 'plain' ? undefined : { color: 'var(--accent)' }}>!</span> Designs
          </span>
        )}
        {settings.footTag.trim() && (
          <span style={{ fontWeight: 400, color: 'var(--soft)', fontFamily: mono, fontSize: 10.5 }}>{settings.footTag}</span>
        )}
      </span>
      {settings.footCopy.trim() && (
        <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.12em', color: 'var(--soft)' }}>{settings.footCopy}</span>
      )}
      <span style={{ display: 'flex', gap: settings.footIcons ? 8 : 16, fontSize: 12.5, alignItems: 'center' }}>
        <FootLink
          href="https://www.linkedin.com/in/bjoern-sellnau/"
          icon={settings.footIcons ? svg(ICON.linkedin) : null}
          label="LinkedIn"
        />
        <FootLink href="https://github.com/bjoern-sellnau/" icon={settings.footIcons ? svg(ICON.github) : null} label="GitHub" />
        <Link
          href={href('/impressum')}
          className={styles.footLink}
          aria-label={settings.footIcons ? t('footer.imprint') : undefined}
          title={settings.footIcons ? t('footer.imprint') : undefined}
          style={settings.footIcons ? { ...iconBox, fontSize: 15 } : undefined}
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
            e.preventDefault();
            navigate('/impressum');
          }}
        >
          {settings.footIcons ? <span aria-hidden>§</span> : t('footer.imprint')}
        </Link>
        <LanguageSwitch
          className={styles.footLink}
          variant={settings.footIcons ? 'mono' : 'link'}
          style={settings.footIcons ? { ...iconBox, fontFamily: mono, fontSize: 11, letterSpacing: '0.08em' } : undefined}
        />
      </span>
    </footer>
  );
}

/** Externer Footer-Link: Text oder Symbol (dann mit aria-label/title). */
function FootLink({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.footLink}
      aria-label={icon ? label : undefined}
      title={icon ? label : undefined}
      style={icon ? iconBox : undefined}
    >
      {icon ?? label}
    </a>
  );
}
