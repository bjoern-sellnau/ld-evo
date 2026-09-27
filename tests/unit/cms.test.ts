import { describe, expect, it } from 'vitest';
import { hashPassword, passwordProblem, verifyPassword } from '@/cms/auth';
import { sniffImage } from '@/cms/repo';
import { COLLECTIONS, emptyDoc, isSafeHref, isSafeMediaSrc, validateDoc, validateRichText } from '@/cms/schema';
import { seedDocs } from '@/cms/seed';

describe('LD Flow — Schema', () => {
  it('alle Startinhalte aus den Prototypen bestehen die Validierung unverändert', () => {
    for (const d of seedDocs()) {
      const { value, errors } = validateDoc(d.collection, d.data);
      expect(errors, `${d.collection}/${d.id}`).toEqual({});
      // Validierung darf nichts verlieren (ausgenommen leere optionale Werte).
      for (const [k, v] of Object.entries(d.data)) {
        if (v === undefined || (Array.isArray(v) && v.every((x) => x === null))) continue;
        expect(value, `${d.collection}/${d.id}.${k}`).toHaveProperty(k);
      }
    }
  });

  it('jede Collection hat Titel-Feld und leere Dokumente sind (bis auf Pflichtfelder) gültig', () => {
    for (const def of Object.values(COLLECTIONS)) {
      expect(def.fields.some((f) => f.key === def.titleField)).toBe(true);
      const { errors } = validateDoc(def.id, emptyDoc(def.id));
      expect(Object.values(errors).every((m) => m === 'Pflichtfeld' || m.startsWith('Farbe'))).toBe(true);
    }
  });

  it('lehnt unsichere Links und Farben ab', () => {
    expect(isSafeHref('javascript:alert(1)')).toBe(false);
    expect(isSafeHref('//evil.example')).toBe(false);
    expect(isSafeHref('data:text/html,x')).toBe(false);
    expect(isSafeHref('https://loona-designs.tech')).toBe(true);
    expect(isSafeHref('/projekte')).toBe(true);
    expect(isSafeMediaSrc('/media/abc')).toBe(true);
    expect(isSafeMediaSrc('/../etc/passwd')).toBe(false);
    expect(isSafeMediaSrc('http://insecure.example/x.png')).toBe(false);
    const { errors } = validateDoc('projects', { ...seedDocs().find((d) => d.collection === 'projects')!.data, color: 'red', link: 'javascript:x' });
    expect(errors.color).toBeTruthy();
    expect(errors.link).toBeTruthy();
  });

  it('Rich Text: nur erlaubte Struktur, keine unsicheren Links, keine Zusatzattribute', () => {
    expect(validateRichText([{ type: 'p', c: [{ t: 'Hallo', b: true, onclick: 'x' }] }])).toEqual([{ type: 'p', c: [{ t: 'Hallo', b: true }] }]);
    expect(validateRichText([{ type: 'p', c: [{ t: 'x', href: 'javascript:alert(1)' }] }])).toBeNull();
    expect(validateRichText([{ type: 'script', c: [] }])).toBeNull();
    expect(validateRichText([{ type: 'ul', items: [[{ t: 'a' }], [{ t: 'b', i: true }]] }])).toEqual([
      { type: 'ul', items: [[{ t: 'a' }], [{ t: 'b', i: true }]] },
    ]);
  });

  it('Seiten: Template-Felder und Blöcke werden validiert, unbekannte Blöcke abgelehnt', () => {
    const ok = validateDoc('pages', { title: 'T', template: 'standard', blocks: [{ type: 'quote', text: 'Hi', _id: 'abcdef12' }] });
    expect(ok.errors).toEqual({});
    expect((ok.value.blocks as { type: string }[])[0].type).toBe('quote');
    const bad = validateDoc('pages', { title: 'T', template: 'standard', blocks: [{ type: 'iframe', src: 'x' }] });
    expect(bad.errors['blocks.0']).toBeTruthy();
    const cover = validateDoc('pages', { title: 'T', template: 'cover' });
    expect(cover.errors.color).toBe('Pflichtfeld');
  });
});

describe('LD Flow — Auth', () => {
  it('scrypt-Hash verifiziert nur das richtige Passwort, Salt ist zufällig', async () => {
    const h1 = await hashPassword('korrekt-pferd-batterie');
    const h2 = await hashPassword('korrekt-pferd-batterie');
    expect(h1).toMatch(/^scrypt\$16384\$8\$1\$/);
    expect(h1).not.toBe(h2);
    expect(await verifyPassword('korrekt-pferd-batterie', h1)).toBe(true);
    expect(await verifyPassword('falsch', h1)).toBe(false);
    expect(await verifyPassword('x', 'kaputt')).toBe(false);
  });

  it('Passwortregeln', () => {
    expect(passwordProblem('kurz')).toBeTruthy();
    expect(passwordProblem('lang-genug-123')).toBeNull();
  });
});

describe('LD Flow — Upload-Typprüfung', () => {
  it('erkennt Bilder an den Magic Bytes, lehnt SVG/HTML ab', () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
    const jpg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const svg = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
    const html = new TextEncoder().encode('<!doctype html><script>alert(1)</script>');
    expect(sniffImage(png)).toBe('image/png');
    expect(sniffImage(jpg)).toBe('image/jpeg');
    expect(sniffImage(svg)).toBeNull();
    expect(sniffImage(html)).toBeNull();
  });
});
