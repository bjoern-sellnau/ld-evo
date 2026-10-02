import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const dir = mkdtempSync(path.join(tmpdir(), 'ldmaint-'));
process.env.LDFLOW_DB = path.join(dir, 'flow.db');
let m: typeof import('@/cms/maintenance');
let db: typeof import('@/cms/db').db;

beforeAll(async () => {
  m = await import('@/cms/maintenance');
  db = (await import('@/cms/db')).db;
});
afterAll(() => {
  db().close();
  rmSync(dir, { recursive: true, force: true });
});

const HOUR = 60 * 60 * 1000;
const count = (t: string) => (db().prepare(`SELECT COUNT(*) AS n FROM ${t}`).get() as { n: number }).n;

describe('Aufräumen (src/cms/maintenance.ts)', () => {
  it('entfernt nur Abgelaufenes und Verwaistes und läuft höchstens stündlich', () => {
    const now = 1_000 * HOUR;
    const d = db();
    d.prepare(
      "INSERT INTO users (id, email, name, role, pass_hash, created_at, updated_at) VALUES ('u', 'a@b.de', 'A', 'admin', 'x', 0, 0)",
    ).run();
    const s = d.prepare('INSERT INTO sessions (id_hash, user_id, created_at, expires_at) VALUES (?, ?, 0, ?)');
    s.run('alt', 'u', now - 1);
    s.run('gueltig', 'u', now + HOUR);
    d.prepare('INSERT INTO login_attempts (key, count, first_at) VALUES (?, 3, ?)').run('ip:alt', now - 25 * HOUR);
    d.prepare('INSERT INTO login_attempts (key, count, first_at) VALUES (?, 3, ?)').run('ip:neu', now - HOUR);
    d.prepare("INSERT INTO media_variants (media_id, width, mime, bytes) VALUES ('weg', 640, 'image/webp', x'00')").run();
    const e = d.prepare("INSERT INTO errors (fp, message, count, first_at, last_at) VALUES (?, 'x', 1, 0, ?)");
    e.run('uralt', now - 91 * 24 * HOUR);
    for (let i = 0; i < 205; i++) e.run(`f${i}`, now - i);
    d.prepare("INSERT INTO messages (id, created_at, name, email, message) VALUES ('m', 0, 'A', 'a@b.de', 'Hallo Welt!')").run();

    expect(m.maintenanceDue(now)).toBe(true);
    const res = m.runMaintenance(now);
    expect(res).toMatchObject({ sessions: 1, loginAttempts: 1, mediaVariants: 1, errors: 6 });
    expect(count('sessions')).toBe(1);
    expect(count('login_attempts')).toBe(1);
    expect(count('errors')).toBe(200);
    expect(d.prepare("SELECT fp FROM errors WHERE fp = 'f0'").get()).toBeTruthy(); // neueste bleiben
    expect(count('messages')).toBe(1); // Inhalte/Nachrichten nie
    expect(count('docs')).toBeGreaterThan(0);
    expect(m.maintenanceDue(now + HOUR - 1)).toBe(false);
    expect(m.maintenanceDue(now + HOUR)).toBe(true);
  });
});
