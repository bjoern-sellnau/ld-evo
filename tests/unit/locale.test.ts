import { describe, expect, it } from 'vitest';
import { canonicalPath, localizePath, pathLocale, switchLocalePath } from '@/site/i18n/locale';

describe('Routentabelle (src/site/i18n/locale.ts)', () => {
  it('bildet deutsche Pfade auf englische Adressen ab — und zurück', () => {
    const pairs: [string, string][] = [
      ['/', '/en'],
      ['/projekte', '/en/projects'],
      ['/projekte/corefall', '/en/projects/corefall'],
      ['/labs/corefall', '/en/labs/corefall'],
      ['/tech/a1', '/en/tech/a1'],
      ['/ueber-mich', '/en/about'],
      ['/reise', '/en/journey'],
      ['/impressum#i-datenschutz', '/en/imprint#i-datenschutz'],
      ['/meine-seite?x=1', '/en/meine-seite?x=1'],
      ['/tech/feed.xml', '/en/tech/feed.xml'],
    ];
    for (const [de, en] of pairs) {
      expect(localizePath(de, 'en')).toBe(en);
      expect(canonicalPath(en)).toBe(de);
      expect(localizePath(en, 'de')).toBe(de);
      expect(localizePath(en, 'en')).toBe(en); // idempotent
      expect(pathLocale(en)).toBe('en');
      expect(pathLocale(de)).toBe('de');
    }
  });

  it('lässt externe Links, Anker und Nicht-Site-Bereiche unverändert', () => {
    for (const p of [
      'https://loona-designs.de',
      'mailto:info@loona-designs.de',
      '#top',
      '//cdn.example',
      '/brand',
      '/flow/login',
      '/media/abc123XY',
      '/favicon.svg',
    ])
      expect(localizePath(p, 'en')).toBe(p);
    expect(pathLocale('/entwurf')).toBe('de'); // nur /en bzw. /en/… ist Englisch
    expect(switchLocalePath('/en/about', 'de')).toBe('/ueber-mich');
  });
});
