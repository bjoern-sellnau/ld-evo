import { describe, expect, it } from 'vitest';
import { ABOUT_CAPTIONS, ABOUT_IMAGE_FOR, ABOUT_RAIL, IMPRINT_RAIL } from '@content/about';
import { PRIVACY_SECTIONS } from '@content/imprint';
import type { AboutContent, ImprintContent } from '@/cms/types';
import { seedDocs } from '@/cms/seed';
import { buildAbout } from '@/site/lib/aboutModel';
import { toImprintBlock } from '@/site/lib/imprintModel';
import { DEFAULT_NAV, isActiveHref } from '@/site/nav/pages';

const seed = (c: string) => seedDocs().find((d) => d.collection === c)!.data;

describe('Inhalte aus LD Flow ergeben exakt den Prototyp', () => {
  it('Über mich: Rail, Bildzuordnung und Bildzeilen aus den Stationen', () => {
    const m = buildAbout(seed('about') as unknown as AboutContent);
    expect(m.rail).toEqual(ABOUT_RAIL);
    expect(m.imageFor).toEqual(ABOUT_IMAGE_FOR);
    expect(m.captions).toEqual(ABOUT_CAPTIONS);
  });

  it('Impressum: CMS-Form → Darstellung ist verlustfrei, Rail stimmt', () => {
    const imp = seed('imprint') as unknown as ImprintContent;
    expect(imp.sections.map((s) => ({ id: s.id, blocks: s.blocks.map(toImprintBlock) }))).toEqual(PRIVACY_SECTIONS);
    expect([
      { id: 'i-impressum', label: 'Impressum' },
      ...imp.sections.map((s) => ({ id: s.id, label: s.rail, ...(s.sub ? { sub: true } : {}) })),
    ]).toEqual(IMPRINT_RAIL);
  });

  it('Impressum: unsichere Links im Text werden nicht verlinkt', () => {
    expect(toImprintBlock({ kind: 'p', text: 'a [x](javascript:alert(1)) b' })).toEqual({ p: 'a [x](javascript:alert(1)) b' });
  });

  it('Navigation: Aktiv-Logik', () => {
    expect(isActiveHref('/', '/')).toBe(true);
    expect(isActiveHref('/projekte/x', '/projekte')).toBe(true);
    expect(isActiveHref('/projekte', '/')).toBe(false);
    expect(isActiveHref('/tech', 'https://x.de/tech')).toBe(false);
    expect(DEFAULT_NAV.filter((n) => n.inMenu).map((n) => n.href)).toEqual(['/reise', '/tech', '/impressum']);
  });
});
