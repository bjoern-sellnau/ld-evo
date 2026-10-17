'use client';

import { usePathname } from 'next/navigation';
import type { LoonaProductKey } from '@/components/brand/products';
import { useContent } from '../content/ContentProvider';
import { canonicalPath } from '../i18n/locale';

export interface StoryBrand {
  /** Loona-Produktmarke (Zeichen aus src/components/brand) oder 'eigenes' (Bild aus LD Flow). */
  product: LoonaProductKey | 'eigenes';
  /** Eigenes Logo (bei 'eigenes'). */
  src?: string;
  alt?: string;
  /** Optionaler Text neben dem Zeichen, z. B. „LD Buddy“. */
  name?: string;
}

const PRODUCTS = new Set(['flow', 'nova', 'buddy', 'ivy']);

/**
 * Eigene Marke einer Story-Seite (Projekt-Felder „brand“, „brandLogo“, „brandName“, neu — nicht im Prototyp):
 * Auf /projekte/<id> bzw. /labs/<id> mit Layout „Story“ ersetzt sie im Menü das LD-Logo; sonst null.
 */
export function useStoryBrand(): StoryBrand | null {
  const pathname = canonicalPath(usePathname());
  const { projects } = useContent();
  const m = /^\/(projekte|labs)\/([^/]+)\/?$/.exec(pathname);
  if (!m) return null;
  const p = projects.find((x) => x.id === m[2]);
  if (!p || p.layout !== 'story' || !p.brand || p.brand === 'ld') return null;
  if (p.brand === 'eigenes')
    return p.brandLogo?.src ? { product: 'eigenes', src: p.brandLogo.src, alt: p.brandLogo.alt, name: p.brandName } : null;
  return PRODUCTS.has(p.brand) ? { product: p.brand as LoonaProductKey, name: p.brandName } : null;
}
