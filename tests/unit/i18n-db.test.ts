import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/**
 * Mehrsprachigkeit in der Datenbank: Eine bestehende Installation (Schema 7, ein Dokument je Eintrag) wird auf
 * Sprache je Dokument umgestellt, ohne Inhalte zu verlieren; englische Startinhalte kommen als ENTWURF dazu.
 */
const dir = mkdtempSync(path.join(tmpdir(), 'ldi18n-'));
const file = path.join(dir, 'flow.db');
process.env.LDFLOW_DB = file;

// Minimaler Stand „Schema 7“: vorhandener, bearbeiteter deutscher Inhalt + eine Version.
{
  const d = new DatabaseSync(file);
  d.exec(`CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    INSERT INTO meta VALUES ('schema_version', '7');
    CREATE TABLE users (id TEXT PRIMARY KEY);
    CREATE TABLE docs (collection TEXT NOT NULL, id TEXT NOT NULL, position INTEGER NOT NULL DEFAULT 0, published TEXT, draft TEXT,
      created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, updated_by TEXT, published_at INTEGER, publish_at INTEGER, publish_by TEXT,
      PRIMARY KEY (collection, id));
    CREATE TABLE revisions (rid INTEGER PRIMARY KEY AUTOINCREMENT, collection TEXT NOT NULL, doc_id TEXT NOT NULL, data TEXT NOT NULL,
      created_at INTEGER NOT NULL, created_by TEXT);
    CREATE INDEX revisions_doc ON revisions(collection, doc_id, rid);`);
  const ins = d.prepare(
    'INSERT INTO docs (collection, id, position, published, created_at, updated_at, published_at) VALUES (?, ?, ?, ?, 1, 1, 1)',
  );
  ins.run('projects', 'corefall', 0, JSON.stringify({ name: 'Corefall', desc: 'Bearbeitet auf Deutsch' }));
  ins.run('projects', 'eigenes', 1, JSON.stringify({ name: 'Eigenes', desc: 'Nur in dieser Installation' }));
  d.prepare("INSERT INTO revisions (collection, doc_id, data, created_at) VALUES ('projects', 'corefall', '{}', 1)").run();
  d.close();
}

let repo: typeof import('@/cms/repo');
let db: typeof import('@/cms/db').db;
let commitPublish: typeof import('@/cms/publish').commitPublish;

beforeAll(async () => {
  repo = await import('@/cms/repo');
  db = (await import('@/cms/db')).db;
  commitPublish = (await import('@/cms/publish')).commitPublish;
});
afterAll(() => {
  db().close();
  rmSync(dir, { recursive: true, force: true });
});

describe('Mehrsprachigkeit in der Datenbank', () => {
  it('migriert bestehende Dokumente als Deutsch und legt englische Entwürfe nur zu vorhandenen Dokumenten an', () => {
    const rows = db()
      .prepare(
        "SELECT id, locale, published IS NOT NULL AS live, draft IS NOT NULL AS draft FROM docs WHERE collection = 'projects' ORDER BY id, locale",
      )
      .all();
    expect(rows.map((r) => ({ ...r }))).toEqual([
      { id: 'corefall', locale: 'de', live: 1, draft: 0 },
      { id: 'corefall', locale: 'en', live: 0, draft: 1 }, // Übersetzungsentwurf aus content/en
      { id: 'eigenes', locale: 'de', live: 1, draft: 0 }, // kein Startinhalt → keine Übersetzung
    ]);
    expect(db().prepare('SELECT locale FROM revisions').get()).toEqual(expect.objectContaining({ locale: 'de' }));
    expect(db().prepare("SELECT value FROM meta WHERE key = 'schema_version'").get()).toEqual(expect.objectContaining({ value: '8' }));
    // Ausnahme Navigation: englische Menü-Beschriftungen sind sofort live
    expect(repo.publishedDoc('navigation', 'navigation', 'en')?._lang).toBeUndefined();
  });

  it('englische Site: deutscher Rückfall, bis die Übersetzung veröffentlicht ist', () => {
    const before = repo.publishedDocs('projects', 'en');
    expect(before.map((p) => [p.id, p.desc, p._lang])).toEqual([
      ['corefall', 'Bearbeitet auf Deutsch', 'de'],
      ['eigenes', 'Nur in dieser Installation', 'de'],
    ]);
    commitPublish('projects', 'corefall', { name: 'Corefall', desc: 'Edited in English' }, 'test', 'en');
    const after = repo.publishedDocs('projects', 'en');
    expect(after[0]).toMatchObject({ id: 'corefall', desc: 'Edited in English' });
    expect(after[0]._lang).toBeUndefined();
    expect(repo.publishedDoc('projects', 'eigenes', 'en')?._lang).toBe('de');
    // Deutsche Site unverändert, Versionen getrennt je Sprache
    expect(repo.publishedDocs('projects', 'de')[0].desc).toBe('Bearbeitet auf Deutsch');
    commitPublish('projects', 'corefall', { name: 'Corefall', desc: 'Second' }, 'test', 'en');
    expect(db().prepare("SELECT COUNT(*) AS n FROM revisions WHERE locale = 'en'").get()).toEqual({ n: 1 });
  });
});
