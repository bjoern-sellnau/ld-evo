import type { Metadata } from 'next';
import { translate } from '../i18n/dict';
import { localizePath, ogLocale, type Locale } from '../i18n/locale';

/**
 * Suchmaschinen-Helfer: absolute URLs, Metadaten je Seite, strukturierte Daten (JSON-LD, schema.org).
 * Basis-URL wie im Site-Layout: NEXT_PUBLIC_SITE_URL (+ Basispfad beim statischen Export).
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const absUrl = (path: string) => `${SITE_URL}${BASE}${path === '/' ? '' : path}` || SITE_URL;

/** RSS des .Tech-Blogs je Sprache (/tech/feed.xml bzw. /en/tech/feed.xml). */
export const feedAlternate = (locale: Locale) => ({
  'application/rss+xml': [{ url: `${BASE}${localizePath('/tech/feed.xml', locale)}`, title: translate(locale, 'seo.feedTitle') }],
});

/**
 * Canonical-URL, Sprachversionen (hreflang) und RSS-Hinweis. `path` ist kanonisch (deutsch). Next ersetzt `alternates`
 * je Seite komplett — ohne die `types` hier verlöre jede Seite mit eigener Canonical-URL den Feed-Link aus dem Layout.
 * `translated` = es gibt eine echte englische Fassung; sonst verweist die deutsche Seite nicht auf Englisch (die
 * englische zeigt dann nur den deutschen Rückfall und ist noindex, siehe pageMeta).
 */
export const alternatesFor = (path: string, locale: Locale = 'de', translated = true) => ({
  canonical: absUrl(localizePath(path, locale)),
  ...(translated
    ? {
        languages: {
          de: absUrl(localizePath(path, 'de')),
          en: absUrl(localizePath(path, 'en')),
          'x-default': absUrl(localizePath(path, 'de')),
        },
      }
    : {}),
  types: feedAlternate(locale),
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
  title?: string;
  description?: string;
  /** Kanonischer (deutscher) Pfad. */
  path: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  locale?: Locale;
  /** Englische Fassung vorhanden? (Standard: ja) — englische Seiten ohne Übersetzung sind noindex. */
  translated?: boolean;
}): Metadata {
  const locale = o.locale ?? 'de';
  const translated = o.translated ?? true;
  const noindex = o.noindex || (locale !== 'de' && !translated);
  return {
    ...(o.title ? { title: o.title } : {}),
    ...(o.description ? { description: o.description } : {}),
    alternates: alternatesFor(o.path, locale, translated),
    openGraph: {
      ...(o.title ? { title: o.title } : {}),
      ...(o.description ? { description: o.description } : {}),
      url: absUrl(localizePath(o.path, locale)),
      siteName: 'Loona! Designs',
      locale: ogLocale(locale),
      ...(translated ? { alternateLocale: [ogLocale(locale === 'de' ? 'en' : 'de')] } : {}),
      type: o.type ?? 'website',
    },
    ...(noindex ? { robots: { index: false } } : {}),
  };
}

/** JSON-LD sicher serialisieren (Next-Doku „JSON-LD“): `<` escapen, damit CMS-Text nie ein </script> bilden kann. */
export const serializeJsonLd = (data: object) => JSON.stringify(data).replace(/</g, '\\u003c');
