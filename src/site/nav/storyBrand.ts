'use client';

import { usePathname } from 'next/navigation';
import { useLayoutEffect, useMemo, useState } from 'react';
import type { LoonaProductKey } from '@/components/brand/products';
import { useContent } from '../content/ContentProvider';
import { canonicalPath } from '../i18n/locale';

export interface StoryBrand {
  /** Loona-Produktmarke (Zeichen aus src/components/brand) oder 'eigenes' (Bild aus LD Flow). */
  product: LoonaProductKey | 'eigenes';
  /** Eigenes Logo (bei 'eigenes'). */
  src?: string;
  alt?: string;
  /** Optionaler Text neben dem Zeichen, z. B. „LD Buddy.“. */
  name?: string;
  /** Beschriftung des Menüeintrags zur Startseite, der das LD-Logo ersetzt (Standard „Loona! Designs“). */
  homeLabel: string;
}

/** Standard-Beschriftung für den Weg zur Startseite auf Story-Seiten mit eigener Marke. */
export const STORY_HOME_LABEL = 'Loona! Designs';

const PRODUCTS = new Set(['flow', 'nova', 'buddy', 'ivy']);

/**
 * Eigene Marke einer Story-Seite (Projekt-Felder „brand“, „brandLogo“, „brandName“, neu — nicht im Prototyp):
 * Auf /projekte/<id> bzw. /labs/<id> mit Layout „Story“ ersetzt sie im Menü das LD-Logo; sonst null.
 */
export function useStoryBrand(): StoryBrand | null {
  const pathname = canonicalPath(usePathname());
  const { projects } = useContent();
  const m = /^\/(projekte|labs)\/([^/]+)\/?$/.exec(pathname);
  const p = m ? projects.find((x) => x.id === m[2]) : undefined;
  // Stabiles Objekt (useMemo): Effekte, die auf die Marke hören (BrandSwap, useLatchedStoryBrand), setzen sonst bei
  // jedem Render neu → Endlosschleife (React #185).
  return useMemo(() => {
    if (!p || p.layout !== 'story' || !p.brand || p.brand === 'ld') return null;
    const homeLabel = p.homeLabel?.trim() || STORY_HOME_LABEL;
    if (p.brand === 'eigenes')
      return p.brandLogo?.src ? { product: 'eigenes', src: p.brandLogo.src, alt: p.brandLogo.alt, name: p.brandName, homeLabel } : null;
    return PRODUCTS.has(p.brand) ? { product: p.brand as LoonaProductKey, name: p.brandName, homeLabel } : null;
  }, [p]);
}

/** Wie useStoryBrand, dazu die zuletzt aktive Marke — damit Texte beim Hinausgleiten stehen bleiben. */
export function useLatchedStoryBrand(): [StoryBrand | null, StoryBrand | null] {
  const brand = useStoryBrand();
  const [last, setLast] = useState<StoryBrand | null>(brand);
  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- letzte Marke für die Ausblend-Animation merken
    if (brand) setLast(brand);
  }, [brand]);
  return [brand, brand ?? last];
}
