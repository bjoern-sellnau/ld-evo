import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { WIDGETS, validateDoc } from '@/cms/schema';
import { seedDocs } from '@/cms/seed';

// Skills fragt „Bewegung erlaubt?“ über useSite() ab — hier ohne SiteProvider: Server-Zustand (noch nicht hydratisiert)
vi.mock(import('@/site/settings/SiteProvider'), async (orig) => ({
  ...(await orig()),
  useSite: () => ({ settings: { anim: true }, hydrated: false, mob: false }) as never,
}));

/** Widget wie auf der Site rendern (ohne Editor-Kontext). */
const render = (id: string, values: Record<string, unknown>, controls: Record<string, unknown> = {}) =>
  renderToStaticMarkup(
    createElement(WIDGETS[id].render, {
      ...values,
      controls: { ...defaults(id), ...controls },
      slots: {},
      path: 'blocks.0',
      accent: '#F2C14E',
    }),
  );
const defaults = (id: string) => Object.fromEntries(Object.entries(WIDGETS[id].controls).map(([k, c]) => [k, c.default]));
const img = (n: number) => ({ src: `/media/abcdEFGH123${n}`, alt: `Bild ${n}` });

/** Widgets für die Detailseiten (Wunsch 07.11.2026): Medien, Daten, Design & Technik, Struktur. */
describe('Detailseiten-Widgets', () => {
  it('alle 16 sind in ihren Gruppen registriert', () => {
    const groups: Record<string, string[]> = {
      Medien: ['compare', 'hotspots', 'mockup', 'split'],
      Daten: ['chart', 'kpi', 'facts', 'skills'],
      'Design & Technik': ['palette', 'code', 'techstack', 'changelog'],
      Struktur: ['callout', 'link-cards', 'team', 'divider'],
    };
    for (const [g, ids] of Object.entries(groups)) for (const id of ids) expect(WIDGETS[id]?.group, id).toBe(g);
  });

  it('Vorher/Nachher: echter Schieberegler mit Namen, beide Bilder, Standard-Beschriftungen', () => {
    const html = render('compare', { before: img(1), after: img(2) });
    expect(html).toMatch(/<input[^>]*type="range"/);
    expect(html).toContain('aria-label="Vorher/Nachher vergleichen"');
    expect(html.match(/<img/g)).toHaveLength(2);
    expect(html).toContain('Vorher');
    expect(html).toContain('Nachher');
  });

  it('Markierungen: nummerierte Knöpfe (zu) und dieselben Einträge als Liste', () => {
    const html = render('hotspots', {
      image: img(1),
      items: [
        { x: 10, y: 20, title: 'Logo', text: 'oben links' },
        { x: 150, y: -5, title: 'Menü' },
      ],
    });
    expect(html.match(/aria-expanded="false"/g)).toHaveLength(2);
    expect(html).toContain('<ol');
    expect(html).toContain('oben links');
    // Positionen werden auf 0–100 % begrenzt
    expect(html).not.toMatch(/left:\s*150%/);
  });

  it('Mockup: alle Rahmen rendern, Browser zeigt die Adresse', () => {
    for (const frame of ['browser', 'laptop', 'tablet', 'phone'])
      expect(render('mockup', { image: img(1), url: 'loona-designs.de' }, { frame })).toContain('<img');
    expect(render('mockup', { image: img(1), url: 'loona-designs.de' }, { frame: 'browser' })).toContain('loona-designs.de');
  });

  it('Split-Screen: jeder Schritt mit Titel und Bild', () => {
    const html = render('split', {
      items: [
        { kicker: '1', title: 'Skizze', text: 'Papier', image: img(1) },
        { kicker: '2', title: 'Code', image: img(2) },
      ],
    });
    expect(html).toContain('Skizze');
    expect(html).toContain('Code');
    expect(html.match(/<img/g)!.length).toBeGreaterThanOrEqual(2);
  });

  it('Diagramm: zugänglicher Name mit allen Werten, Tabellenansicht, alle Arten ohne NaN', () => {
    const items = [
      { label: '2006', value: 2400 },
      { label: '2026', value: 420 },
    ];
    for (const kind of ['balken', 'saeulen', 'linie']) {
      const html = render('chart', { title: 'Ladezeit', unit: 'ms', items }, { kind });
      expect(html, kind).toMatch(/<svg[^>]*role="img"[^>]*aria-label="Ladezeit: 2006 2\.400\sms, 2026 420\sms"/);
      expect(html, kind).toContain('<details');
      expect(html.match(/<tr>/g), kind).toHaveLength(3);
      expect(html, kind).not.toContain('NaN');
    }
    // leer oder mit kaputten Werten: kein Absturz, keine NaN-Koordinaten
    expect(render('chart', { items: [] })).not.toContain('NaN');
    expect(render('chart', { items: [{ label: 'x', value: 'abc' }] }, { kind: 'linie' })).not.toContain('NaN');
  });

  it('KPI-Vergleich: Richtung steht als Wort da (nicht nur Farbe)', () => {
    const html = render('kpi', {
      items: [
        { label: 'Ladezeit', before: 2400, after: 420, unit: 'ms', better: 'niedrig' },
        { label: 'Fehler', before: 2, after: 5, better: 'niedrig' },
        { label: 'Score', before: 54, after: 98, better: 'hoch' },
      ],
    });
    expect(html.match(/besser/g)).toHaveLength(2);
    expect(html).toContain('schlechter');
  });

  it('Steckbrief: dl, unsichere Links werden nicht verlinkt', () => {
    const html = render('facts', {
      items: [
        { label: 'Kunde', value: 'Eigenes Projekt' },
        { label: 'Link', value: 'böse', href: 'javascript:alert(1)' },
      ],
    });
    expect(html.startsWith('<div')).toBe(true);
    expect(html).toContain('<dl');
    expect(html).not.toContain('javascript:');
  });

  it('Skills: role="meter", Werte auf 0–100 begrenzt', () => {
    const html = render('skills', {
      items: [
        { label: 'Code', value: 150 },
        { label: 'Text', value: -3 },
      ],
    });
    expect(html.match(/role="meter"/g)).toHaveLength(2);
    expect(html).toContain('aria-valuenow="100"');
    expect(html).toContain('aria-valuenow="0"');
  });

  it('Farbpalette: Kontrast gegen Weiß/Schwarz nach WCAG, ungültige Farbe fällt zurück', () => {
    const html = render('palette', {
      items: [
        { name: 'Tinte', hex: '#141210' },
        { name: 'Kaputt', hex: 'red;}' },
      ],
    });
    expect(html).toContain('18.7:1');
    expect(html).toContain('AAA');
    expect(html).not.toContain('red;}');
  });

  it('Code: Hervorhebung nur als Text-Spans — Markup im Code bleibt Text', () => {
    const html = render('code', { lang: 'html', code: '<script>alert(1)</script>\nconst a = 1;', filename: 'x.html' });
    expect(html).not.toContain('<script');
    expect(html).toContain('&lt;script');
    expect(html).toContain('aria-label');
    expect(html).toContain('Code kopieren');
  });

  it('Tech-Stack und Changelog: Gruppen, Version und Art als Wort', () => {
    const stack = render('techstack', { items: [{ category: 'Frontend', items: ['Next.js', 'React'] }] });
    expect(stack).toContain('Next.js');
    expect(stack.match(/<li/g)!.length).toBeGreaterThanOrEqual(2);
    const log = render('changelog', { items: [{ version: '2.0', date: '11/2026', kind: 'beta', items: ['Neu'] }] });
    expect(log).toContain('2.0');
    expect(log).toContain('Beta');
    expect(log.startsWith('<ol')).toBe(true);
  });

  it('Hinweis: Art steht als Wort da', () => {
    expect(render('callout', { title: 'T', text: 'X' }, { kind: 'warnung' })).toContain('Achtung');
  });

  it('Link-Karten: extern mit neuem Tab + Hinweis, unsichere Links nicht klickbar', () => {
    const html = render('link-cards', {
      items: [
        { title: 'Demo', href: 'https://example.org', kind: 'demo' },
        { title: 'Böse', href: 'javascript:alert(1)' },
      ],
    });
    expect(html).toMatch(/target="_blank" rel="noopener noreferrer"/);
    expect(html).toContain('(öffnet in neuem Tab)');
    expect(html).not.toContain('javascript:');
    expect(html.match(/<a /g)).toHaveLength(1);
    // Dateien: normales <a> mit download (kein next/link-Routing)
    expect(render('link-cards', { items: [{ title: 'PDF', href: '/media/abcdEFGH1234', kind: 'download' }] })).toMatch(
      /<a href="\/media\/abcdEFGH1234" download=""/,
    );
  });

  it('Team: ohne Foto Initialen (dekorativ), Name als Text', () => {
    const html = render('team', { items: [{ name: 'Ada Lovelace', role: 'Code' }] });
    expect(html).toMatch(/aria-hidden="true"[^>]*>AL</);
    expect(html).toContain('Ada Lovelace');
  });

  it('Trenner ist rein dekorativ', () => {
    for (const look of ['linie', 'punkte', 'slash', 'zeichen', 'leer'])
      expect(render('divider', {}, { look }).startsWith('<div aria-hidden="true"')).toBe(true);
  });

  it('Case Study: Feld „weitere Inhalte“ nimmt die neuen Widgets auf, fremde Control-Werte werden abgelehnt', () => {
    const p = seedDocs('de').find((d) => d.collection === 'projects' && d.id === 'ld2006')!;
    const blocks = [
      { type: 'compare', _id: 'aaaaaab1', before: img(1), after: img(2), controls: { ratio: '4-3' } },
      { type: 'chart', _id: 'aaaaaab2', title: 'T', items: [{ label: 'A', value: 1 }], controls: { kind: 'linie' } },
      { type: 'palette', _id: 'aaaaaab3', items: [{ name: 'A', hex: '#112233' }] },
      { type: 'code', _id: 'aaaaaab4', lang: 'ts', code: 'const a = 1;', controls: { numbers: false } },
      { type: 'link-cards', _id: 'aaaaaab5', items: [{ title: 'X', href: 'https://example.org', kind: 'code' }] },
      { type: 'divider', _id: 'aaaaaab6', controls: { look: 'zeichen', size: 'l' } },
    ];
    expect(validateDoc('projects', { ...p.data, blocks }).errors).toEqual({});
    const bad = validateDoc('projects', { ...p.data, blocks: [{ type: 'divider', _id: 'aaaaaab7', controls: { look: 'url(evil)' } }] });
    expect(Object.keys(bad.errors).some((k) => k.startsWith('blocks.0.controls'))).toBe(true);
    const badHref = validateDoc('projects', {
      ...p.data,
      blocks: [{ type: 'link-cards', _id: 'aaaaaab8', items: [{ href: 'javascript:x' }] }],
    });
    expect(Object.keys(badHref.errors).some((k) => k.startsWith('blocks.0.items.0.href'))).toBe(true);
  });
});
