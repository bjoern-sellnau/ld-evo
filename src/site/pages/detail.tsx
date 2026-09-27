'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import type { GalleryImage } from '@content/projects';
import { mono } from '../cards/ProjectCard';
import { Lightbox } from '../overlays/Lightbox';
import overlayStyles from '../overlays/overlays.module.css';
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
  images = [],
}: {
  wide: number;
  small: number;
  cols2: string;
  labels: [string, string, string];
  images?: (GalleryImage | null)[];
}) {
  const [open, setOpen] = useState<number | null>(null);
  // Durchblättern über alle gefüllten Slots (leere übersprungen, Wrap-around).
  const filled = [0, 1, 2].map((i) => images[i]).filter((im): im is GalleryImage => !!im?.src);
  const zoom = (i: number) => {
    const im = images[i];
    if (im?.src) setOpen(filled.indexOf(im));
  };
  return (
    <>
      <Slot height={wide} label={labels[0]} image={images[0]} onZoom={() => zoom(0)} style={{ marginTop: 16 }} />
      <div style={{ display: 'grid', gridTemplateColumns: cols2, gap: 12, marginTop: 12 }}>
        <Slot height={small} label={labels[1]} image={images[1]} onZoom={() => zoom(1)} />
        <Slot height={small} label={labels[2]} image={images[2]} onZoom={() => zoom(2)} />
      </div>
      {open !== null && filled.length > 0 && <Lightbox images={filled} start={open} onClose={() => setOpen(null)} />}
    </>
  );
}

function Slot({
  height,
  label,
  image,
  onZoom,
  style,
}: {
  height: number;
  label: string;
  image?: GalleryImage | null;
  onZoom: () => void;
  style?: CSSProperties;
}) {
  const box: CSSProperties = {
    position: 'relative',
    height,
    borderRadius: 18,
    overflow: 'hidden',
    border: '1px solid var(--border)',
    background: 'var(--card)',
    ...style,
  };
  if (image?.src) {
    return (
      <div style={box}>
        <img
          src={image.src}
          alt={image.alt}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <button
          type="button"
          title="Vergrößern"
          aria-label={`${image.alt || label} vergrößern`}
          onClick={onZoom}
          className={overlayStyles.zoom}
        >
          ⤢
        </button>
      </div>
    );
  }
  return (
    <div
      role="img"
      aria-label={`${label} (Bild folgt)`}
      style={{ ...box, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
