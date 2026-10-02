import { describe, expect, it } from 'vitest';
import { ARTICLES } from '@content/articles';
import { buildFeed } from '@/site/seo/feed';

describe('RSS-Feed (.Tech)', () => {
  const pub = (id: string, datum: string, titel: string) => ({ ...ARTICLES[0], id, datum, titel, draft: false });

  it('nur veröffentlichte Artikel, neueste zuerst, mit Datum und Link', () => {
    const xml = buildFeed([pub('alt', '03/2024', 'Alt'), { ...ARTICLES[1], draft: true }, pub('neu', '06/2026', 'Neu & <frisch>')]);
    const titles = [...xml.matchAll(/<item><title>([^<]*)<\/title>/g)].map((m) => m[1]);
    expect(titles).toEqual(['Neu &amp; &lt;frisch&gt;', 'Alt']);
    expect(xml).toContain('<pubDate>Mon, 01 Jun 2026 00:00:00 GMT</pubDate>');
    expect(xml).toContain('/tech/neu</link>');
    expect(xml).toContain('<rss version="2.0"');
  });

  it('Startinhalte sind alle Entwürfe → leerer, aber gültiger Kanal', () => {
    const xml = buildFeed(ARTICLES);
    expect(xml).not.toContain('<item>');
    expect(xml).toContain('<channel>');
  });
});
