'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { mono } from '../cards/ProjectCard';
import { useSite } from '../settings/SiteProvider';
import styles from './chrome.module.css';
import { useHref, useT } from '../i18n/LocaleProvider';
import { canonicalPath } from '../i18n/locale';
import { LanguageSwitch } from '../i18n/LanguageSwitch';

/** Footer (Prototyp Zeile 900 ff.) — auf „Meine Reise“ ausgeblendet (Vollbild-Timeline). */
export function SiteFooter() {
  const { navigate } = useSite();
  const pathname = canonicalPath(usePathname());
  const t = useT();
  const href = useHref();
  if (pathname === '/reise') return null;
  return (
    <footer
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
      <span style={{ fontSize: 13.5, fontWeight: 700 }}>
        Loona<span style={{ color: 'var(--accent)' }}>!</span> Designs{' '}
        <span style={{ fontWeight: 400, color: 'var(--soft)', fontFamily: mono, fontSize: 10.5 }}>/// the web. my passion</span>
      </span>
      <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.12em', color: 'var(--soft)' }}>© 2026 BJÖRN SELLNAU — BERLIN</span>
      <span style={{ display: 'flex', gap: 16, fontSize: 12.5, alignItems: 'center' }}>
        <a href="https://www.linkedin.com/in/bjoern-sellnau/" target="_blank" rel="noopener noreferrer" className={styles.footLink}>
          LinkedIn
        </a>
        <a href="https://github.com/bjoern-sellnau/" target="_blank" rel="noopener noreferrer" className={styles.footLink}>
          GitHub
        </a>
        <Link
          href={href('/impressum')}
          className={styles.footLink}
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
            e.preventDefault();
            navigate('/impressum');
          }}
        >
          {t('footer.imprint')}
        </Link>
        <LanguageSwitch className={styles.footLink} />
      </span>
    </footer>
  );
}
