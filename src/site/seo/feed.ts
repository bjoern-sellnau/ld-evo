import type { Article } from '@content/articles';
import { absUrl, isoMonth } from './seo';

export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** „06/2026“ → Datum für RSS (RFC 822), erster des Monats; ohne erkennbares Datum kein pubDate. */
function rfc822(datum: string): string | undefined {
  const m = isoMonth(datum);
  return m ? new Date(`${m.length === 4 ? `${m}-01` : m}-01T00:00:00Z`).toUTCString() : undefined;
}

/**
 * RSS 2.0 des .Tech-Blogs: veröffentlichte Artikel ohne Entwürfe, neueste zuerst. Titel/Beschreibung des Kanals aus
 * der .Tech-Seite („.Tech — der Blog“, Untertitel). Volltext (alle Absätze) im Element description.
 */
export function buildFeed(articles: Article[]): string {
  const items = articles
    .filter((a) => !a.draft)
    .map((a) => ({ a, key: isoMonth(a.datum) ?? '' }))
    .sort((x, y) => y.key.localeCompare(x.key))
    .map(({ a }) => {
      const url = absUrl(`/tech/${a.id}`);
      const date = rfc822(a.datum);
      const body = [a.teaser, ...a.body].map((p) => `<p>${esc(p)}</p>`).join('');
      return [
        '<item>',
        `<title>${esc(a.titel)}</title>`,
        `<link>${esc(url)}</link>`,
        `<guid isPermaLink="true">${esc(url)}</guid>`,
        `<category>${esc(a.kat)}</category>`,
        date ? `<pubDate>${date}</pubDate>` : '',
        `<description>${esc(body)}</description>`,
        '</item>',
      ].join('');
    });
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '<channel>',
    '<title>.Tech — der Blog · Loona! Designs</title>',
    `<link>${esc(absUrl('/tech'))}</link>`,
    `<atom:link href="${esc(absUrl('/tech/feed.xml'))}" rel="self" type="application/rss+xml"/>`,
    '<description>Notizen aus 18 Jahren Webentwicklung — gepinnt, was gerade zählt.</description>',
    '<language>de-DE</language>',
    ...items,
    '</channel>',
    '</rss>',
  ].join('\n');
  return xml;
}
