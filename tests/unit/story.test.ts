import { describe, expect, it } from 'vitest';
import { validateDoc } from '@/cms/schema';
import { seedDocs } from '@/cms/seed';
import { numberOf, parseDisplayNumber, parseRows } from '@/site/story/MockScreen';

/** Story-Seiten (Layout „Story“): Beispiel LD Buddy und Hilfsfunktionen der nachgebauten App-Screens. */
describe('Story-Seiten', () => {
  const buddy = seedDocs('de').find((d) => d.collection === 'projects' && d.id === 'ldbuddy')!;

  it('LD Buddy ist eine Story und übersteht die Validierung vollständig (inkl. verschachtelter Szenen)', () => {
    expect(buddy.data.layout).toBe('story');
    // eigene Marke im Menü: Zeichen „b“ (Loona-Produkt „buddy“, src/components/brand) + einzeiliger Text; Weg nach Hause
    expect(buddy.data.brand).toBe('buddy');
    expect(buddy.data.brandName).toBe('LD Buddy.');
    expect(buddy.data.homeLabel).toBe('Loona! Designs');
    const { value, errors } = validateDoc('projects', buddy.data);
    expect(errors).toEqual({});
    // Validierung ergänzt höchstens leere Listen (z. B. „Zeilen“ ohne Einträge) — sonst bleibt alles erhalten
    const norm = (x: unknown): unknown =>
      Array.isArray(x)
        ? x.map(norm)
        : x && typeof x === 'object'
          ? Object.fromEntries(
              Object.entries(x)
                .filter(([, v]) => !(Array.isArray(v) && !v.length))
                .map(([k, v]) => [k, norm(v)]),
            )
          : x;
    expect(norm(value.story)).toEqual(norm(buddy.data.story));
  });

  it('beginnt mit dem Auftakt (h1) und nutzt alle Story-Widgets', () => {
    const story = buddy.data.story as { type: string; slots?: Record<string, { type: string }[]> }[];
    expect(story[0].type).toBe('story-hero');
    const types = new Set<string>();
    const walk = (bs: { type: string; slots?: Record<string, { type: string }[]> }[]) =>
      bs.forEach((b) => {
        types.add(b.type);
        Object.values(b.slots ?? {}).forEach((s) => walk(s));
      });
    walk(story);
    for (const t of [
      'story-hero',
      'story-scene',
      'story-steps',
      'story-bento',
      'story-words',
      'story-ticker',
      'story-horizontal',
      'story-numbers',
      'story-app',
    ])
      expect(types, t).toContain(t);
  });

  it('unbekannte Werte in Story-Controls werden abgelehnt', () => {
    const { errors } = validateDoc('projects', {
      ...buddy.data,
      story: [{ type: 'story-scene', _id: 'abcdef12', controls: { bg: 'url(evil)' }, slots: { inhalt: [] } }],
    });
    expect(Object.keys(errors).some((k) => k.startsWith('story.0.controls'))).toBe(true);
  });

  it('Zeilen „Beschriftung | Wert | Zusatz“ und Zahlen aus Anzeige-Werten', () => {
    expect(parseRows(['Miete | -950,00 € | ⌂', '', 'Brot'])).toEqual([
      { label: 'Miete', value: '-950,00 €', extra: '⌂' },
      { label: 'Brot', value: '', extra: '' },
    ]);
    expect(numberOf('-1.250,50 €')).toBe(-1250.5);
    expect(numberOf('€2,481.20')).toBeCloseTo(2481.2);
    expect(numberOf('12.500')).toBe(12500);
    expect(numberOf('12,500+')).toBe(12500);
    expect(numberOf('2,4 s')).toBe(2.4);
    expect(numberOf('2.4 s')).toBe(2.4);
    expect(parseDisplayNumber('99,9 %')).toEqual({ value: 99.9, decimals: 1, grouped: false, de: true });
    expect(Number.isNaN(numberOf('heute'))).toBe(true);
  });
});
