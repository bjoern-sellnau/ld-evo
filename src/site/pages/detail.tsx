'use client';

import type { CSSProperties, ReactNode } from 'react';
import { mono } from '../cards/ProjectCard';
import styles from './detail.module.css';

/** Kapitel-Kopf „01 DIE AUSGANGSLAGE“ (Prototyp: Detail, Zeile 556 ff.). */
export function Chapter({ n, label, color, first }: { n: string; label: string; color: string; first?: boolean }) {
  return (
    <h2 style={{ display: 'flex', gap: 14, alignItems: 'baseline', margin: first ? 0 : '48px 0 0', fontWeight: 400 }}>
      <span style={{ fontFamily: mono, fontSize: 11, color: 'var(--soft)' }}>{n}</span>
      <span style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: '0.18em', color }}>{label}</span>
    </h2>
  );
}

/**
 * Galerie-Slots (Kapitel 06 bzw. nach dem Artikeltext): 1 breiter + 2 kleine Slots.
 * Der Prototyp nutzt Drag & Drop-Bildslots; auf der echten Site kommen die Bilder aus den Inhalten
 * (später per LD Flow. CMS). Solange keine Bilder hinterlegt sind, bleiben die Slots als ruhige Platzhalter stehen.
 */
export function GallerySlots({
  wide,
  small,
  cols2,
  labels,
}: {
  wide: number;
  small: number;
  cols2: string;
  labels: [string, string, string];
}) {
  return (
    <>
      <Slot height={wide} label={labels[0]} style={{ marginTop: 16 }} />
      <div style={{ display: 'grid', gridTemplateColumns: cols2, gap: 12, marginTop: 12 }}>
        <Slot height={small} label={labels[1]} />
        <Slot height={small} label={labels[2]} />
      </div>
    </>
  );
}

function Slot({ height, label, style }: { height: number; label: string; style?: CSSProperties }) {
  return (
    <div
      role="img"
      aria-label={`${label} (Bild folgt)`}
      style={{
        position: 'relative',
        height,
        borderRadius: 18,
        overflow: 'hidden',
        border: '1px solid var(--border)',
        background: 'var(--card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.12em', color: 'var(--soft)' }}>{label.toUpperCase()}</span>
    </div>
  );
}

/** Farbige Karte der Verwandte-Reihe (Prototyp: dRelCards / aRelCards). */
export function RelatedCard({
  href,
  onClick,
  color,
  ink,
  children,
  meta,
  stripes,
}: {
  href: string;
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  color: string;
  ink: string;
  children: ReactNode;
  meta: string;
  stripes?: boolean;
}) {
  return (
    <a href={href} onClick={onClick} className={styles.rel} style={{ background: color, color: ink }}>
      {stripes && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'repeating-linear-gradient(-45deg,rgba(255,255,255,0.05) 0 2px,transparent 2px 16px)',
          }}
        />
      )}
      {children}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
        <span style={{ fontFamily: mono, fontSize: 9.5, opacity: 0.75 }}>{meta}</span>
        <span aria-hidden style={{ fontSize: 16 }}>
          ›
        </span>
      </div>
    </a>
  );
}

/** Sortierung der Verwandte-Reihe: gleiche Kategorie zuerst, dann Listen-Nähe (zyklisch nach dem aktuellen Item). */
export function related<T extends { id: string; kat: string }>(list: T[], current: T, n = 3): T[] {
  const i = list.indexOf(current);
  const dist = (x: T) => (list.indexOf(x) - i + list.length) % list.length;
  return list
    .filter((x) => x.id !== current.id)
    .sort((a, b) => (b.kat === current.kat ? 1 : 0) - (a.kat === current.kat ? 1 : 0) || dist(a) - dist(b))
    .slice(0, n);
}
