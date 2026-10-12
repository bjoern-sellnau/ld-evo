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
