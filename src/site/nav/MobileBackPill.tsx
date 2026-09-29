'use client';

import { useSite } from '../settings/SiteProvider';
import styles from './SiteNav.module.css';
import { useBack } from './useBack';
import { useT } from '../i18n/LocaleProvider';

/**
 * Schwebende Glas-Zurück-Pille über der Tab-Bar (Modern Mobile-Nav, Detailseiten). bottom 92 px,
 * bei ausgeblendeter Tab-Bar (Scrollhide) 18 px. Markup: Prototyp Zeile 961 ff.
 */
export function MobileBackPill({ tabBarHidden }: { tabBarHidden: boolean }) {
  const { mob, settings } = useSite();
  const back = useBack();
  const t = useT();
  if (!(mob && settings.mobModern && back.show)) return null;
  return (
    <div
      style={{
        position: 'fixed',
        bottom: tabBarHidden ? 18 : 92,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 76,
        transition: 'bottom 0.55s cubic-bezier(0.32,1.2,0.35,1)',
        animation: 'ldPop 0.35s cubic-bezier(0.2,0.9,0.3,1)',
        pointerEvents: 'none',
      }}
    >
      <button
        type="button"
        id="ld-backpill"
        onClick={back.go}
        aria-label={t('nav.back')}
        className={`${styles.reset} ${styles.backPill}`}
        style={{
          pointerEvents: 'auto',
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          padding: '11px 20px',
          borderRadius: 999,
          background: 'linear-gradient(180deg,var(--glassg1),var(--glassg2)),var(--glass)',
          border: '1px solid var(--glassbrd)',
          boxShadow: 'inset 0 1.5px 1px var(--glasshi),inset 0 -9px 14px -11px rgba(0,0,0,0.35),var(--shadow)',
          fontSize: 13,
          fontWeight: 700,
          color: back.color,
          cursor: 'pointer',
          whiteSpace: 'pre',
          transition: '--glassTint 0.5s ease,--glassPct 0.5s ease,transform 0.2s,color 0.3s',
        }}
      >
        <span data-ldfrost="1" aria-hidden style={{ borderRadius: 999 }} />
        <span data-ldedge="1" aria-hidden style={{ borderRadius: 999 }} />
        <span data-ldrim="1" aria-hidden style={{ borderRadius: 999 }} />
        <span style={{ position: 'relative' }}>{back.text}</span>
      </button>
    </div>
  );
}
