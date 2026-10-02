import { readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { WIDGETS, newBlock, validateDoc } from '@/cms/schema';

const page = (blocks: unknown[]) => validateDoc('pages', { title: 'T', template: 'standard', blocks });

describe('LD Flow — Widgets', () => {
  it('Registry enthält jede Datei aus src/widgets (Generator ist aktuell)', () => {
    const files = readdirSync(path.resolve('src/widgets')).filter((f) => f.endsWith('.tsx'));
    expect(Object.keys(WIDGETS).length).toBe(files.length);
    for (const w of Object.values(WIDGETS)) {
      expect(w.label).toBeTruthy();
      expect(w.icon).toBeTruthy();
      expect(typeof w.render).toBe('function');
    }
  });

  it('bestehende Block-Typen sind weiterhin gültig (keine Migration nötig)', () => {
    for (const t of ['text', 'chapter', 'image', 'gallery', 'quote', 'cta', 'projects', 'stats']) expect(WIDGETS[t], t).toBeDefined();
    const { errors } = page([{ type: 'quote', _id: 'abcdef12', text: 'Hallo', by: 'X' }]);
    expect(errors).toEqual({});
  });

  it('neue Widgets bekommen Control-Standardwerte und leere Slots', () => {
    const b = newBlock('columns') as { controls: Record<string, unknown>; slots: Record<string, unknown[]> };
    expect(b.controls).toEqual({ ratio: '1-1', gap: 'normal' });
    expect(b.slots).toEqual({ links: [], mitte: [], rechts: [] });
  });

  it('Controls akzeptieren nur vorgegebene Varianten', () => {
    const ok = page([{ ...newBlock('pricing-card'), controls: { variant: 'dunkel', highlight: true } }]);
    expect(ok.errors).toEqual({});
    const bad = page([{ ...newBlock('pricing-card'), controls: { variant: 'lila; background:url(x)', highlight: true } }]);
    expect(bad.errors['blocks.0.controls.variant']).toBeTruthy();
  });

  it('Slots werden rekursiv validiert, fremde Felder verworfen', () => {
    const inner = { ...newBlock('quote'), text: 'Innen', evil: '<script>' };
    const { value, errors } = page([
      { ...newBlock('section'), slots: { inhalt: [{ ...newBlock('columns'), slots: { links: [inner], mitte: [], rechts: [] } }] } },
    ]);
    expect(errors).toEqual({});
    const q = (value.blocks as any)[0].slots.inhalt[0].slots.links[0];
    expect(q.text).toBe('Innen');
    expect(q).not.toHaveProperty('evil');
  });

  it('unbekannte Widgets und zu tiefe Verschachtelung werden abgelehnt', () => {
    expect(page([{ type: 'iframe', _id: 'abcdef12' }]).errors['blocks.0']).toBeTruthy();
    let deep: any = newBlock('quote');
    for (let i = 0; i < 9; i++) deep = { ...newBlock('section'), slots: { inhalt: [deep] } };
    const { errors } = page([deep]);
    expect(Object.values(errors)).toContain('Zu tief verschachtelt');
  });
});
