import { describe, expect, it } from 'vitest';
import { fold, search, type SearchDoc } from '@/site/lib/search';

const DOCS: SearchDoc[] = [
  {
    label: 'Corefall',
    kind: 'LAB',
    href: '/labs/corefall',
    fields: [
      { text: 'Corefall', w: 10 },
      { text: '6D-Shooter à la Descent', w: 4 },
    ],
  },
  {
    label: 'Sieben Experimente',
    kind: 'ARTIKEL',
    href: '/tech/a1',
    fields: [
      { text: 'Sieben Experimente', w: 10 },
      { text: 'Das wichtigste Learning: KI ersetzt keine Architektur. Wer kein Zielbild hat, bekommt schnellen Code.', w: 1 },
    ],
  },
  {
    label: 'Über mich',
    kind: 'SEITE',
    href: '/ueber-mich',
    fields: [
      { text: 'Über mich', w: 10 },
      { text: 'Straßenbahn Größe', w: 1 },
    ],
  },
];

describe('Volltextsuche', () => {
  it('faltet Groß-/Kleinschreibung, Akzente und ß', () => {
    expect(fold('À la Straße')).toBe('a la strasse');
  });

  it('findet Wörter im Fließtext und zeigt die Fundstelle', () => {
    const [hit] = search(DOCS, 'architektur');
    expect(hit.href).toBe('/tech/a1');
    expect(hit.snippet?.match).toBe('Architektur');
    expect(hit.snippet?.before).toContain('KI ersetzt keine');
  });

  it('alle Wörter müssen vorkommen; Titeltreffer zuerst', () => {
    expect(search(DOCS, 'ki zielbild').map((h) => h.href)).toEqual(['/tech/a1']);
    expect(search(DOCS, 'ki nirgendwo')).toEqual([]);
    expect(search(DOCS, 'core')[0].href).toBe('/labs/corefall');
  });

  it('Akzente und ß egal: „a la“, „strasse“, „uber“', () => {
    expect(search(DOCS, 'a la descent')[0].href).toBe('/labs/corefall');
    expect(search(DOCS, 'strasse')[0].snippet?.match).toBe('Straße');
    expect(search(DOCS, 'uber')[0].href).toBe('/ueber-mich');
  });

  it('leere Suche listet wie bisher', () => {
    expect(search(DOCS, '  ').map((h) => h.label)).toEqual(['Corefall', 'Sieben Experimente', 'Über mich']);
  });
});
