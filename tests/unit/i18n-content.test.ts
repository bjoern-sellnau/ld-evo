import { describe, expect, it } from 'vitest';
import { seedDocs } from '@/cms/seed';
import { validateDoc } from '@/cms/schema';

/**
 * Englische Startinhalte (content/en/*.ts) sind Übersetzungen — gleiche Dokumente, gleiche Struktur, gleiche
 * nicht-sprachliche Werte (IDs, Farben, Links, Bilder, Zahlen). Übersetzt sind nur Texte.
 */
const de = seedDocs('de');
const en = seedDocs('en');

/** Nicht übersetzbare Schlüssel: müssen in beiden Sprachen identisch sein. */
const INVARIANT = new Set([
  'id',
  'kind',
  'color',
  'link',
  'href',
  'src',
  'anchor',
  'year',
  'featured',
  'pinned',
  'draft',
  'slot',
  'image',
  'shot',
  'insights',
  'email',
  'mono',
  'sub',
  'partner',
  'global',
]);

function shape(a: unknown, b: unknown, path: string, out: string[]) {
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) out.push(`${path}: Länge ${Array.isArray(b) ? b.length : typeof b} statt ${a.length}`);
    else a.forEach((x, i) => shape(x, b[i], `${path}[${i}]`, out));
    return;
  }
  if (a && typeof a === 'object') {
    if (!b || typeof b !== 'object') return void out.push(`${path}: fehlt`);
    const ka = Object.keys(a).sort().join(',');
    const kb = Object.keys(b).sort().join(',');
    if (ka !== kb) out.push(`${path}: Schlüssel ${kb} statt ${ka}`);
    for (const [k, v] of Object.entries(a)) {
      const w = (b as Record<string, unknown>)[k];
      if (INVARIANT.has(k) && JSON.stringify(v) !== JSON.stringify(w))
        out.push(`${path}.${k}: ${JSON.stringify(w)} statt ${JSON.stringify(v)}`);
      else shape(v, w, `${path}.${k}`, out);
    }
    return;
  }
  if (typeof a !== typeof b) out.push(`${path}: Typ ${typeof b} statt ${typeof a}`);
}

describe('Englische Startinhalte', () => {
  it('haben dieselben Dokumente in derselben Reihenfolge', () => {
    expect(en.map((d) => `${d.collection}/${d.id}@${d.position}`)).toEqual(de.map((d) => `${d.collection}/${d.id}@${d.position}`));
  });

  it('haben dieselbe Struktur und identische nicht-sprachliche Werte', () => {
    const problems: string[] = [];
    de.forEach((d, i) => shape(d.data, en[i].data, `${d.collection}/${d.id}`, problems));
    expect(problems).toEqual([]);
  });

  it('bestehen das Schema (Pflichtfelder, Längen)', () => {
    for (const d of en) expect(validateDoc(d.collection, d.data).errors, `${d.collection}/${d.id}`).toEqual({});
  });

  it('sind tatsächlich übersetzt (Stichproben)', () => {
    const pick = (docs: typeof de, c: string, id: string) => docs.find((d) => d.collection === c && d.id === id)!.data;
    expect(pick(en, 'home', 'home').titleLine2).not.toBe(pick(de, 'home', 'home').titleLine2);
    expect(pick(en, 'projects', 'corefall').desc).not.toBe(pick(de, 'projects', 'corefall').desc);
    expect(pick(en, 'imprint', 'imprint').title).not.toBe(pick(de, 'imprint', 'imprint').title);
  });
});
