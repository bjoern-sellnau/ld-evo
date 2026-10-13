import { describe, expect, it } from 'vitest';
import { issueOf } from '@/site/pages/TechPage';

describe('.Tech-Magazin: Ausgabe', () => {
  it('nimmt das neueste Datum, nicht das des ersten (gepinnten) Artikels', () => {
    expect(issueOf([{ datum: '03/2019' }, { datum: '06/2026' }, { datum: '12/2025' }])).toBe('06/2026');
  });
  it('fällt auf den ersten Artikel zurück, wenn kein Datum passt', () => {
    expect(issueOf([{ datum: 'bald' }, { datum: 'später' }])).toBe('bald');
    expect(issueOf([])).toBe('');
  });
});

describe('.Tech-Blog: Lesezeit', () => {
  const w = (n: number) => Array.from({ length: n }, () => 'wort').join(' ');
  it('rund 200 Wörter pro Minute, mindestens 1', async () => {
    const { readMinutes } = await import('@/site/pages/TechPage');
    expect(readMinutes({ teaser: 'kurz', body: [] })).toBe(1);
    expect(readMinutes({ teaser: w(100), body: [w(300), w(200)] })).toBe(3);
  });
});
