import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// Eigene Wegwerf-Datenbank — muss vor dem ersten Import von src/cms/db gesetzt sein.
const dir = mkdtempSync(path.join(tmpdir(), 'lderr-'));
process.env.LDFLOW_DB = path.join(dir, 'flow.db');
let errors: typeof import('@/cms/errors');
let db: typeof import('@/cms/db').db;

beforeAll(async () => {
  errors = await import('@/cms/errors');
  db = (await import('@/cms/db')).db;
});
afterAll(() => {
  db().close();
  rmSync(dir, { recursive: true, force: true });
});

const rows = () =>
  db().prepare('SELECT fp, message, path, route, kind, count FROM errors ORDER BY first_at').all() as Record<string, unknown>[];

describe('Fehler-Eingang (src/cms/errors.ts)', () => {
  it('bündelt gleiche Fehler je Route (Zahlen neutralisiert) und speichert den Pfad ohne Query', () => {
    const at = { path: '/flow/reset?token=GEHEIM', method: 'GET', route: '/flow/reset', kind: 'render' };
    const a = errors.recordError(new TypeError('Dokument 17 fehlt'), at, 1000);
    const b = errors.recordError(new TypeError('Dokument 42 fehlt'), at, 2000);
    expect(a).toBe(b);
    errors.recordError(new TypeError('Dokument 42 fehlt'), { ...at, route: '/tech/[slug]' }, 3000);
    const r = rows();
    expect(r).toHaveLength(2);
    expect(r[0]).toMatchObject({ message: 'TypeError: Dokument 17 fehlt', path: '/flow/reset', kind: 'GET render', count: 2 });
    expect(JSON.stringify(r)).not.toContain('GEHEIM');
  });

  it('ignoriert Steuerfluss von Next (redirect/notFound) und wirft selbst nie', () => {
    const before = rows().length;
    expect(
      errors.recordError(Object.assign(new Error('NEXT_REDIRECT'), { digest: 'NEXT_REDIRECT;replace;/x;307;' }), { path: '/' }),
    ).toBeNull();
    expect(errors.recordError(Object.assign(new Error('x'), { digest: 'NEXT_HTTP_ERROR_FALLBACK;404' }), { path: '/' })).toBeNull();
    expect(rows().length).toBe(before);
    // Auch Nicht-Error-Werte werden aufgenommen, statt den Handler zu sprengen.
    expect(errors.recordError('nur ein String', { path: '/api/x' })).toMatch(/^[0-9a-f]{24}$/);
  });

  it('kürzt Meldung und Stack und entfernt den Projektpfad', () => {
    const e = new Error('x'.repeat(2000));
    e.stack = `Error: x\n${Array.from({ length: 30 }, (_, i) => `    at f${i} (${process.cwd()}${path.sep}src/a.ts:${i}:1)`).join('\n')}`;
    const d = errors.describeError(e);
    expect(d.message.length).toBe(500);
    expect(d.stack.split('\n')).toHaveLength(12);
    expect(d.stack).not.toContain(process.cwd());
    expect(d.stack.split('\n')[0]).toBe('at f0 (src/a.ts:0:1)');
  });
});
