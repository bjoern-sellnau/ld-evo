'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSite } from '../settings/SiteProvider';
import { GlassLayers, panelGlass } from './GlassPanel';
import styles from './overlays.module.css';
import { useHref, useT } from '../i18n/LocaleProvider';

/**
 * Cookie-Hinweis („Keine Krümel, versprochen.“): erscheint 900 ms nach dem Laden, solange ld-cookie fehlt;
 * Strg+C ohne Textauswahl blendet ihn zum Testen ein/aus. Markup: Prototyp Zeile 1223 ff.
 */
export function CookieBanner() {
  const { settings, hydrated, set, mob, navigate } = useSite();
  const [show, setShow] = useState(false);
  const t = useT();
  const href = useHref();

  useEffect(() => {
    if (!hydrated || settings.cookie) return;
    const t = setTimeout(() => setShow(true), 900);
    return () => clearTimeout(t);
    // Nur beim ersten Laden prüfen.
  }, [hydrated]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && !e.metaKey && !e.altKey && e.key.toLowerCase() === 'c' && !String(window.getSelection() ?? '').length)
        setShow((v) => !v);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  if (!show) return null;
  const radius = 'var(--radL,20px)';
  return (
    <div
      role="region"
      aria-label={t('cookie.region')}
      style={{
        ...panelGlass(radius),
        position: 'fixed',
        left: '50%',
        bottom: 22,
        transform: 'translateX(-50%)',
        zIndex: 70,
        width: 560,
        maxWidth: mob ? 'min(400px, 92vw)' : '92vw',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '16px 18px',
        animation: 'ldPop 0.35s cubic-bezier(0.2,0.9,0.3,1)',
      }}
    >
      <GlassLayers radius={radius} />
      <span
        aria-hidden
        style={{
          position: 'relative',
          flex: 'none',
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 30%,#FFC96B,#E8862A)',
          boxShadow: 'inset -4px -5px 9px rgba(120,60,0,0.35)',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 10,
            left: 13,
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: '#6E3E12',
            boxShadow: '11px 7px 0 #6E3E12,2px 15px 0 #6E3E12',
          }}
        />
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700 }}>{t('cookie.title')}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, marginTop: 3 }}>{t('cookie.text')}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, flex: 'none' }}>
        <button
          type="button"
          className={styles.accept}
          onClick={() => {
            set('cookie', 'ok');
            setShow(false);
          }}
        >
          {t('cookie.ok')}
        </button>
        <Link
          href={href('/impressum')}
          className={styles.quiet}
          onClick={(e) => {
            e.preventDefault();
            navigate('/impressum');
          }}
        >
          {t('cookie.details')}
        </Link>
      </div>
    </div>
  );
}
