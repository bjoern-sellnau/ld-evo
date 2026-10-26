import { afterEach, describe, expect, it } from 'vitest';
import { FAVICONS, applyFavicon, faviconChoice } from '@/site/settings/favicon';

/** Minimaler <link>-Ersatz (Vitest läuft hier ohne DOM). */
const fakeLink = (href: string, type: string) => {
  const attrs: Record<string, string> = { href, type };
  return {
    dataset: {} as Record<string, string | undefined>,
    getAttribute: (k: string) => attrs[k] ?? null,
    setAttribute: (k: string, v: string) => void (attrs[k] = v),
    removeAttribute: (k: string) => void delete attrs[k],
  };
};

const g = globalThis as unknown as { document?: unknown };
afterEach(() => delete g.document);

describe('Favicon-Auswahl', () => {
  it('stellt alle Icon-Links um und wieder zurück (inkl. Typ)', () => {
    const links = [fakeLink('/favicon.svg', 'image/svg+xml'), fakeLink('/favicon-32.png', 'image/png')];
    g.document = { querySelectorAll: () => links };
    applyFavicon('color');
    links.forEach((l) => expect(l.getAttribute('href')).toMatch(/^data:image\/svg\+xml,/));
    expect(links[1].getAttribute('type')).toBe('image/svg+xml');
    applyFavicon('default');
    expect(links[0].getAttribute('href')).toBe('/favicon.svg');
    expect(links[1].getAttribute('href')).toBe('/favicon-32.png');
    expect(links[1].getAttribute('type')).toBe('image/png');
  });
  it('fünf Varianten, jede ein vollständiges SVG', () => {
    expect(FAVICONS).toHaveLength(5);
    FAVICONS.forEach((f) => expect(f.svg).toMatch(/^<svg [^>]*viewBox=.*<\/svg>$/));
  });
  it('Standard = Zeichen (wie public/favicon.svg), Kacheln mit Badge-Geometrie; alter Schlüssel „neg“ → Standard', () => {
    expect(faviconChoice('default')?.svg).toContain('viewBox="6 9 32 28"');
    expect(faviconChoice('ink')?.svg).toContain('translate(9.6 8.6) scale(1.018)');
    expect(faviconChoice('neg')?.key).toBe('default');
    expect(faviconChoice('gibtsnicht')).toBeUndefined();
  });
});
