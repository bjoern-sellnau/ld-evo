import 'server-only';
import type { Article } from '@content/articles';
import type { HomeContent } from '@content/home';
import type { JourneyStation } from '@content/journey';
import type { Project } from '@content/projects';
import { publishedDoc, publishedDocs } from './repo';
import type { MediaRef } from './schema';
import { seedDocs } from './seed';
import type { AboutContent, CmsPage, SiteContent } from './types';

/**
 * Veröffentlichte Inhalte für die Site. Fällt die Datenbank aus (z. B. Node ohne node:sqlite), liefert die Site
 * die Startinhalte aus content/*.ts — sie bleibt also immer darstellbar.
 */

function fromSeed(collection: string) {
  return seedDocs()
    .filter((d) => d.collection === collection)
    .sort((a, b) => a.position - b.position)
    .map((d) => ({ ...d.data, id: d.id }));
}

function read(collection: string): (Record<string, unknown> & { id: string })[] {
  try {
    return publishedDocs(collection);
  } catch (e) {
    console.error(`[LD Flow] ${collection}: Datenbank nicht lesbar, nutze Startinhalte.`, e);
    return fromSeed(collection);
  }
}

export function getSiteContent(): SiteContent {
  const home = (read('home')[0] ?? fromSeed('home')[0]) as unknown as HomeContent;
  const about = (read('about')[0] ?? fromSeed('about')[0]) as unknown as AboutContent;
  const journey = read('journey') as unknown as (JourneyStation & { id: string; shot?: MediaRef; insights?: (MediaRef | null)[] })[];
  return {
    home,
    about,
    projects: read('projects') as unknown as Project[],
    articles: read('articles') as unknown as Article[],
    journey: [...journey].sort((a, b) => a.year - b.year),
    pages: (read('pages') as unknown as CmsPage[]).map((p) => ({ id: p.id, title: p.title })),
    patterns: read('patterns') as unknown as SiteContent['patterns'],
  };
}

export function getPage(slug: string): CmsPage | null {
  try {
    return publishedDoc('pages', slug) as unknown as CmsPage | null;
  } catch {
    return null;
  }
}

export function getPageSlugs(): string[] {
  return read('pages').map((p) => p.id);
}
