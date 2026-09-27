'use client';

import Link from 'next/link';
import type { MouseEvent } from 'react';
import type { Project } from '@content/projects';
import { inkOn } from '../lib/color';
import { projectHref } from '../lib/routes';
import { useSite } from '../settings/SiteProvider';
import styles from './cards.module.css';

export const mono = 'var(--ld-font-mono),monospace';

/** Klick → Detail mit Karten-Morph (nur Links ohne Modifier-Taste). */
export function useOpenItem(href: string, id: string) {
  const { openItem } = useSite();
  return (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    openItem(href, id);
  };
}

/**
 * Projektkarte (Featured auf Hallo, Katalog-Grid): Cover-Fläche in Projektfarbe mit Mono-Kürzel und Streifen-Textur.
 * Markup: Prototyp Zeile 427 ff. `prefix` trennt Morph-Namen je Herkunft (cf- Hallo, c- Katalog; Nachtrag v19.1).
 */
export function ProjectCard({ p, prefix }: { p: Project; prefix: 'cf-' | 'c-' }) {
  const { vtTarget, morphOk } = useSite();
  const href = projectHref(p);
  const onClick = useOpenItem(href, p.id);
  const ink = inkOn(p.color);
  return (
    <Link
      href={href}
      onClick={onClick}
      className={styles.card}
      style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 18, overflow: 'hidden', boxShadow: 'var(--cardShadow)' }}
    >
      <div
        style={{
          viewTransitionName: morphOk && vtTarget === p.id ? `${prefix}${p.id}` : 'none',
          height: 120,
          background: p.color,
          color: ink,
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          padding: '14px 18px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'repeating-linear-gradient(-45deg,rgba(255,255,255,0.05) 0 2px,transparent 2px 14px)',
          }}
        />
        <span aria-hidden style={{ position: 'relative', fontSize: 44, fontWeight: 800, letterSpacing: '-0.03em', opacity: 0.9 }}>
          {p.mono}
        </span>
        <span
          style={{
            position: 'absolute',
            top: 12,
            right: 14,
            fontFamily: mono,
            fontSize: 9,
            letterSpacing: '0.12em',
            border: `1px solid ${ink}`,
            borderRadius: 999,
            padding: '3px 9px',
            opacity: 0.8,
          }}
        >
          {p.kat}
        </span>
      </div>
      <div style={{ padding: '16px 18px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: mono, fontSize: 9.5, color: 'var(--soft)' }}>
          <span style={{ color: 'var(--accent)' }}>{p.tag}</span>
          <span>{p.datum}</span>
        </div>
        <div style={{ fontSize: 17.5, fontWeight: 700, marginTop: 8 }}>{p.name}</div>
        <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.55, marginTop: 5 }}>{p.desc}</div>
      </div>
    </Link>
  );
}

/** Status-Zeile der Katalog-Karte (Prototyp: mkCard.status). */
export function projectStatus(p: Project): string {
  return p.status || (p.link ? '● spielbar im Browser' : 'Status: in Arbeit');
}

