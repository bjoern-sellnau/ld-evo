'use client';

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { LoonaMark } from '@/components/brand';
import { isSafeMediaSrc } from '@/cms/safe';
import { useSite } from '../settings/SiteProvider';
import type { StoryBrand } from './storyBrand';
import styles from './BrandSwap.module.css';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** Zeichen der Story-Marke (Loona-Produkt oder eigenes Bild) + optionaler Text. */
export function BrandMark({ brand, size, withName = true }: { brand: StoryBrand; size: number; withName?: boolean }) {
  const { settings } = useSite();
  const src = brand.src && isSafeMediaSrc(brand.src) ? (brand.src.startsWith('/') ? BASE + brand.src : brand.src) : undefined;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, whiteSpace: 'nowrap' }}>
      {brand.product === 'eigenes' ? (
        src && (
          <img
            src={src}
            alt={withName && brand.name ? '' : (brand.alt ?? '')}
            height={size}
            style={{ height: size, width: 'auto', display: 'block' }}
          />
        )
      ) : (
        <LoonaMark
          product={brand.product}
          size={size}
          tone={settings.theme === 'light' ? 'ink' : 'color'}
          decorative={!!(withName && brand.name)}
          title={brand.name}
        />
      )}
      {withName && brand.name && (
        <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--ink)' }}>{brand.name}</span>
      )}
    </span>
  );
}

/**
 * Wechsel LD-Logo ↔ Story-Marke im Menü (neu): das eine gleitet nach oben hinaus, das andere von unten herein; die
 * Breite folgt weich. Die gerade nicht sichtbare Ebene ist inert (nicht fokussierbar, nicht vorgelesen).
 * Die zuletzt gezeigte Marke bleibt während des Rückwechsels stehen, damit auch das Hinausgleiten zu sehen ist.
 */
export function BrandSwap({ brand, ld, brandNode }: { brand: StoryBrand | null; ld: ReactNode; brandNode: (b: StoryBrand) => ReactNode }) {
  const [last, setLast] = useState<StoryBrand | null>(brand);
  const shown = brand ?? last;
  const on = !!brand;
  const ldRef = useRef<HTMLSpanElement>(null);
  const brRef = useRef<HTMLSpanElement>(null);
  const [w, setW] = useState<number | null>(null);
  // Feste Breite erst, sobald es eine Marke gibt bzw. gab — auf allen anderen Seiten bleibt das Logo unberührt
  // (keine Messung, kein Layout-Sprung).
  const active = on || !!last;
  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- letzte Marke merken (für das Hinausgleiten)
    if (brand) setLast(brand);
  }, [brand]);
  useLayoutEffect(() => {
    const el = (on ? brRef : ldRef).current;
    if (!el || !active) return;
    const fit = () => setW(el.getBoundingClientRect().width);
    fit();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, [on, shown, active]);
  return (
    <span className={styles.swap} data-on={on} style={w ? { width: w } : undefined}>
      <span ref={ldRef} className={styles.layer} data-layer="ld" inert={on || undefined} aria-hidden={on || undefined}>
        {ld}
      </span>
      {shown && (
        <span ref={brRef} className={styles.layer} data-layer="brand" inert={!on || undefined} aria-hidden={!on || undefined}>
          {brandNode(shown)}
        </span>
      )}
    </span>
  );
}
