'use client';

import Link from 'next/link';
import type { MouseEvent } from 'react';
import type { Project } from '@content/projects';
import { inkOn, readableAlpha } from '../lib/color';
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

// Maße je Variante: Featured (Hallo, Zeile 427 ff.) vs. Katalog-Grid (Zeile 513 ff., mit Status-Zeile).
const SIZES = {
  featured: {
    h: 120,
    pad: '14px 18px',
    mono: 44,
    katTop: 12,
    katRight: 14,
    katFs: 9,
    katPad: '3px 9px',
    body: '16px 18px 18px',
    name: 17.5,
    nameMt: 8,
    descMt: 5,
  },
  grid: {
    h: 110,
    pad: '12px 16px',
    mono: 38,
    katTop: 11,
    katRight: 13,
    katFs: 8.5,
    katPad: '3px 8px',
    body: '15px 17px 17px',
    name: 16.5,
    nameMt: 7,
    descMt: 4,
  },
} as const;

/**
 * Projektkarte: Cover-Fläche in Projektfarbe mit Mono-Kürzel und Streifen-Textur.
 * `prefix` trennt Morph-Namen je Herkunft (cf- Hallo, c- Katalog; Nachtrag v19.1).
 */
export function ProjectCard({ p, prefix, variant = 'featured' }: { p: Project; prefix: 'cf-' | 'c-'; variant?: keyof typeof SIZES }) {
  const z = SIZES[variant];
  const { vtTarget, morphOk } = useSite();
  const href = projectHref(p);
  const onClick = useOpenItem(href, p.id);
  const ink = inkOn(p.color);
  return (
    <Link
      href={href}
      onClick={onClick}
      className={styles.card}
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 18,
        overflow: 'hidden',
        boxShadow: 'var(--cardShadow)',
      }}
    >
      <div
        style={{
          viewTransitionName: morphOk && vtTarget === p.id ? `${prefix}${p.id}` : 'none',
          height: z.h,
          background: p.color,
          color: ink,
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          padding: z.pad,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'repeating-linear-gradient(-45deg,rgba(255,255,255,0.05) 0 2px,transparent 2px 14px)',
          }}
        />
        <span aria-hidden style={{ position: 'relative', fontSize: z.mono, fontWeight: 800, letterSpacing: '-0.03em', opacity: 0.9 }}>
          {p.mono}
        </span>
        <span
          style={{
            position: 'absolute',
            top: z.katTop,
            right: z.katRight,
            fontFamily: mono,
            fontSize: z.katFs,
            letterSpacing: '0.12em',
            border: `1px solid ${ink}`,
            borderRadius: 999,
            padding: z.katPad,
            opacity: readableAlpha(p.color, ink, 0.8),
          }}
        >
          {p.kat}
        </span>
      </div>
      <div style={{ padding: z.body }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: mono, fontSize: 9.5, color: 'var(--soft)' }}>
          <span style={{ color: 'var(--accent)' }}>{p.tag}</span>
          <span>{p.datum}</span>
        </div>
        <div style={{ fontSize: z.name, fontWeight: 700, marginTop: z.nameMt }}>{p.name}</div>
        <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.55, marginTop: z.descMt }}>{p.desc}</div>
        {variant === 'grid' && <div style={{ fontSize: 11, color: 'var(--soft)', marginTop: 10 }}>{projectStatus(p)}</div>}
      </div>
    </Link>
  );
}

/** Status-Zeile der Katalog-Karte (Prototyp: mkCard.status). */
export function projectStatus(p: Project): string {
  return p.status || (p.link ? '● spielbar im Browser' : 'Status: in Arbeit');
}
