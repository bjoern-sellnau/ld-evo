import type { Metadata } from 'next';

/**
 * Suchmaschinen-Helfer: absolute URLs, Metadaten je Seite, strukturierte Daten (JSON-LD, schema.org).
 * Basis-URL wie im Site-Layout: NEXT_PUBLIC_SITE_URL (+ Basispfad beim statischen Export).
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const absUrl = (path: string) => `${SITE_URL}${BASE}${path === '/' ? '' : path}` || SITE_URL;

/**
 * Canonical-URL plus RSS-Hinweis. Next ersetzt `alternates` je Seite komplett — ohne die `types` hier verlöre jede Seite
 * mit eigener Canonical-URL den Feed-Link aus dem Layout.
 */
export const alternatesFor = (path: string) => ({
  canonical: absUrl(path),
  types: { 'application/rss+xml': [{ url: `${BASE}/tech/feed.xml`, title: '.Tech — der Blog' }] },
});

/** Personendaten nur aus vorhandenen Quellen: content/home.ts (Name), Footer/Kontakt-Panel (Profile), Impressum (Ort). */
export const PERSON = {
  '@type': 'Person',
  name: 'Björn Sellnau',
  jobTitle: 'Senior Full-Stack / Software Engineer',
  address: { '@type': 'PostalAddress', addressLocality: 'Berlin', addressCountry: 'DE' },
  sameAs: ['https://www.linkedin.com/in/bjoern-sellnau/', 'https://github.com/bjoern-sellnau/'],
} as const;

/** „06/2026“ → „2026-06“ (ISO 8601, Jahr-Monat). Unbekannte Formate → undefined. */
export function isoMonth(datum: string): string | undefined {
  const m = /^(\d{2})\/(\d{4})$/.exec(datum.trim());
  return m ? `${m[2]}-${m[1]}` : /^\d{4}$/.test(datum.trim()) ? datum.trim() : undefined;
}

/**
 * Metadaten je Seite. Open Graph wird in Next pro Seite komplett ersetzt (nicht zusammengeführt) — daher siteName/
 * locale hier wiederholen; das Bild kommt aus opengraph-image.tsx bzw. dem Layout.
 */
export function pageMeta(o: {
  title: string;
  description?: string;
  path: string;
  type?: 'website' | 'article';
  noindex?: boolean;
}): Metadata {
  return {
    title: o.title,
    description: o.description,
    alternates: alternatesFor(o.path),
    openGraph: {
      title: o.title,
      description: o.description,
      url: absUrl(o.path),
      siteName: 'Loona! Designs',
      locale: 'de_DE',
      type: o.type ?? 'website',
    },
    ...(o.noindex ? { robots: { index: false } } : {}),
  };
}

/** JSON-LD sicher serialisieren (Next-Doku „JSON-LD“): `<` escapen, damit CMS-Text nie ein </script> bilden kann. */
export const serializeJsonLd = (data: object) => JSON.stringify(data).replace(/</g, '\\u003c');
