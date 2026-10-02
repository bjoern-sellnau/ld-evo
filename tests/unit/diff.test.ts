import { describe, expect, it } from 'vitest';
import { diffDocs, flatten, wordDiff } from '@/cms/diff';

describe('Versionsvergleich', () => {
  it('findet geänderte, neue und entfernte Felder (ohne interne _id)', () => {
    const a = { title: 'Alt', tags: ['a', 'b'], blocks: [{ _id: 'x1', type: 'quote', text: 'Hallo' }] };
    const b = { title: 'Neu', tags: ['a'], blocks: [{ _id: 'x2', type: 'quote', text: 'Hallo' }], kicker: 'K' };
    expect(diffDocs(a, b)).toEqual([
      { path: 'title', kind: 'changed', before: 'Alt', after: 'Neu' },
      { path: 'kicker', kind: 'added', after: 'K' },
      { path: 'tags.1', kind: 'removed', before: 'b' },
    ]);
  });

  it('Rich Text wird als Klartext verglichen', () => {
    const rt = [
      { type: 'p', c: [{ t: 'Hallo ' }, { t: 'Welt', b: true }] },
      { type: 'ul', items: [[{ t: 'eins' }]] },
    ];
    expect(flatten({ body: rt }).get('body')).toBe('Hallo Welt\n• eins');
  });

  it('wortweiser Vergleich', () => {
    expect(wordDiff('das alte Web', 'das neue Web')).toEqual([
      { op: '=', t: 'das ' },
      { op: '-', t: 'alte' },
      { op: '+', t: 'neue' },
      { op: '=', t: ' Web' },
    ]);
  });
});
