'use client';

import Link from 'next/link';
import type { Article } from '@content/articles';
import { inkOn } from '../lib/color';
import { articleHref } from '../lib/routes';
import { useSite } from '../settings/SiteProvider';
import styles from './cards.module.css';
import { mono, useOpenItem } from './ProjectCard';
import { useHref, useT } from '../i18n/LocaleProvider';

/**
 * News-Karte der Startseite (Prototyp Zeile 452 ff., mkArt). Kategorie in Artikelfarbe, bei dunkler Farbe Amber —
 * als var(--accent), damit das helle Theme den dunkleren Ton bekommt (README Z. 51; fest #FFB224 ergab 1,8:1).
 */
export function NewsCard({ a }: { a: Article }) {
  const { vtTarget, morphOk } = useSite();
  const href = articleHref(a);
  const onClick = useOpenItem(href, a.id);
  const katColor = inkOn(a.color) === '#FFFFFF' ? 'var(--accent)' : a.color;
  const lh = useHref();
  const t = useT();
  return (
    <Link
      href={lh(href)}
      onClick={onClick}
      className={styles.card}
      data-m-card
      style={{
        viewTransitionName: morphOk && vtTarget === a.id ? `artn-${a.id}` : 'none',
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 18,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        boxShadow: 'var(--cardShadow)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: mono, fontSize: 9.5 }}>
        <span
          style={{
            color: katColor,
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 999,
            padding: '4px 10px',
            letterSpacing: '0.1em',
          }}
        >
          {a.kat}
        </span>
        <span style={{ color: 'var(--soft)' }}>{a.datum}</span>
      </div>
      <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.3, flex: 1 }}>{a.titel}</div>
      <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.6 }}>{a.teaser}</div>
      <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--accent)' }}>{t('card.read')}</span>
    </Link>
  );
}
