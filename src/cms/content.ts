import 'server-only';
import type { Article } from '@content/articles';
import type { HomeContent } from '@content/home';
import type { Project } from '@content/projects';
import { publishedDoc, publishedDocs } from './repo';
import { seedDocs } from './seed';
import { DEFAULT_NAV, type NavItem } from '@/site/nav/pages';
import type { AboutContent, CmsPage, ImprintContent, JourneyEntry, SiteContent } from './types';
import type { Locale } from '@/site/i18n/locale';

/**
 * Veröffentlichte Inhalte für die Site, je Sprache. Englisch: je Dokument die veröffentlichte Übersetzung, sonst die
 * deutsche Fassung (gekennzeichnet mit `_lang: 'de'`, siehe repo.ts). Fällt die Datenbank aus (z. B. Node ohne
 * node:sqlite), liefert die Site die deutschen Startinhalte aus content/*.ts — sie bleibt also immer darstellbar.
 */

function fromSeed(collection: string) {
  return seedDocs()
    .filter((d) => d.collection === collection)
    .sort((a, b) => a.position - b.position)
    .map((d) => ({ ...d.data, id: d.id }));
}

function read(collection: string, locale: Locale): (Record<string, unknown> & { id: string })[] {
  try {
    return publishedDocs(collection, locale);
  } catch (e) {
    console.error(`[LD Flow] ${collection}: Datenbank nicht lesbar, nutze Startinhalte.`, e);
    return fromSeed(collection);
  }
}

export function getSiteContent(locale: Locale = 'de'): SiteContent {
  const r = (c: string) => read(c, locale);
  const home = (r('home')[0] ?? fromSeed('home')[0]) as unknown as HomeContent;
  const about = (r('about')[0] ?? fromSeed('about')[0]) as unknown as AboutContent;
  const journey = r('journey') as unknown as JourneyEntry[];
  return {
    home,
    about,
    projects: r('projects') as unknown as Project[],
    articles: r('articles') as unknown as Article[],
    journey: [...journey].sort((a, b) => a.year - b.year),
    pages: (r('pages') as unknown as CmsPage[]).map((p) => ({ id: p.id, title: p.title })),
    patterns: r('patterns') as unknown as SiteContent['patterns'],
    navigation: ((r('navigation')[0] ?? fromSeed('navigation')[0]) as unknown as { items?: NavItem[] }).items ?? DEFAULT_NAV,
    imprint: (r('imprint')[0] ?? fromSeed('imprint')[0]) as unknown as ImprintContent,
  };
}

export function getPage(slug: string, locale: Locale = 'de'): CmsPage | null {
  try {
    return publishedDoc('pages', slug, locale) as unknown as CmsPage | null;
  } catch {
    return null;
  }
}

export function getPageSlugs(): string[] {
  return read('pages', 'de').map((p) => p.id);
}

/** Ist ein Inhalt ein Rückfall auf die deutsche Fassung (auf der englischen Site)? */
export const isFallback = (doc: unknown) => !!doc && typeof doc === 'object' && (doc as Record<string, unknown>)._lang === 'de';
