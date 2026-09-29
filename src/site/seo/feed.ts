import type { Article } from '@content/articles';
import { absUrl, isoMonth } from './seo';
import { translate } from '../i18n/dict';
import { intlLocale, localizePath, type Locale } from '../i18n/locale';

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
export function buildFeed(articles: Article[], locale: Locale = 'de'): string {
  const items = articles
    // Englisch: nur übersetzte Artikel (deutsche Rückfälle gehören in den deutschen Feed).
    .filter((a) => !a.draft && !(locale !== 'de' && (a as { _lang?: string })._lang))
    .map((a) => ({ a, key: isoMonth(a.datum) ?? '' }))
    .sort((x, y) => y.key.localeCompare(x.key))
    .map(({ a }) => {
      const url = absUrl(localizePath(`/tech/${a.id}`, locale));
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
    `<title>${esc(translate(locale, 'seo.feedChannel'))}</title>`,
    `<link>${esc(absUrl(localizePath('/tech', locale)))}</link>`,
    `<atom:link href="${esc(absUrl(localizePath('/tech/feed.xml', locale)))}" rel="self" type="application/rss+xml"/>`,
    `<description>${esc(translate(locale, 'tech.lead'))}</description>`,
    `<language>${intlLocale(locale)}</language>`,
    ...items,
    '</channel>',
    '</rss>',
  ].join('\n');
  return xml;
}
