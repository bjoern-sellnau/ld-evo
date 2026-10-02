import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { WIDGETS, validateDoc } from '@/cms/schema';

/** Widget wie auf der Site rendern (ohne Editor-Kontext). */
const render = (id: string, values: Record<string, unknown>, controls: Record<string, unknown> = {}) =>
  renderToStaticMarkup(createElement(WIDGETS[id].render, { ...values, controls, slots: {}, path: 'blocks.0', accent: 'var(--accent)' }));

describe('LD Flow — neue Widgets', () => {
  it('Tabs: WAI-ARIA-Struktur, nur der erste Reiter sichtbar und per Tab erreichbar', () => {
    const html = render('tabs', {
      items: [
        { label: 'Eins', text: 'Erster Inhalt' },
        { label: 'Zwei', text: 'Zweiter Inhalt' },
      ],
    });
    expect(html).toContain('role="tablist"');
    expect(html.match(/role="tab"/g)).toHaveLength(2);
    expect(html).toMatch(/aria-selected="true"[^>]*tabindex="0"/);
    expect(html).toMatch(/aria-selected="false"[^>]*tabindex="-1"/);
    expect(html.match(/role="tabpanel"[^>]*hidden=""/g)).toHaveLength(1);
  });

  it('Zeitleiste ist eine geordnete Liste', () => {
    const html = render('timeline', {
      items: [
        { date: '2004', title: 'Start', text: 'Erste Pixel' },
        { date: '2026', title: 'Heute' },
      ],
    });
    expect(html.startsWith('<ol')).toBe(true);
    expect(html.match(/<li/g)).toHaveLength(2);
    expect(html).toContain('Erste Pixel');
  });

  it('Kundenstimme: figure mit Zitat und Person, Foto mit srcset', () => {
    const html = render(
      'testimonial',
      { quote: 'Top!', name: 'Ada', role: 'CTO', photo: { src: '/media/abcdEFGH1234', alt: 'Ada' } },
      { layout: 'karte' },
    );
    expect(html).toContain('<figure');
    expect(html).toContain('<blockquote');
    expect(html).toContain('srcSet="/media/abcdEFGH1234?w=640 640w');
  });

  it('Kontaktformular: beschriftete Felder, Honeypot außerhalb des Vorlesebaums', () => {
    const html = render('contact', {});
    for (const n of ['name', 'email', 'message']) expect(html).toContain(`name="${n}"`);
    expect(html.match(/<label/g)!.length).toBeGreaterThanOrEqual(4);
    expect(html).toMatch(/aria-hidden="true"[^>]*><label>Website <input[^>]*tabindex="-1"[^>]*name="website"/);
    expect(html).toContain('Nachricht senden');
  });

  it('neue Widgets bestehen die Schema-Prüfung', () => {
    const { errors } = validateDoc('pages', {
      title: 'T',
      template: 'standard',
      blocks: [
        { type: 'tabs', _id: 'aaaaaaa1', items: [{ label: 'A', text: 'B' }] },
        { type: 'timeline', _id: 'aaaaaaa2', items: [{ date: '2020', title: 'X', text: 'Y' }] },
        { type: 'testimonial', _id: 'aaaaaaa3', quote: 'Q', name: 'N', role: 'R', controls: { layout: 'zentriert' } },
        { type: 'contact', _id: 'aaaaaaa4', submitLabel: 'Los' },
      ],
    });
    expect(errors).toEqual({});
  });
});
