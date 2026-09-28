import 'server-only';
import { chmodSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { COLLECTIONS } from './schema';
import { seedDocs } from './seed';

/**
 * LD Flow. — Speicher: eine SQLite-Datei über das in Node eingebaute node:sqlite (keine nativen Abhängigkeiten).
 * Pfad: LDFLOW_DB oder ./data/flow.db. Das Verzeichnis muss beim Hosting persistent sein (Volume).
 * Dokumente liegen als JSON: `published` = Live-Fassung, `draft` = Arbeitskopie (null = keine offenen Änderungen).
 */

const SCHEMA_VERSION = 2;

const MIGRATIONS: string[] = [
  `CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS users (
     id TEXT PRIMARY KEY,
     email TEXT NOT NULL UNIQUE COLLATE NOCASE,
     name TEXT NOT NULL,
     role TEXT NOT NULL CHECK (role IN ('admin','editor')),
     pass_hash TEXT NOT NULL,
     disabled INTEGER NOT NULL DEFAULT 0,
     created_at INTEGER NOT NULL,
     updated_at INTEGER NOT NULL
   );
   CREATE TABLE IF NOT EXISTS sessions (
     id_hash TEXT PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     created_at INTEGER NOT NULL,
     expires_at INTEGER NOT NULL,
     user_agent TEXT
   );
   CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);
   CREATE TABLE IF NOT EXISTS docs (
     collection TEXT NOT NULL,
     id TEXT NOT NULL,
     position INTEGER NOT NULL DEFAULT 0,
     published TEXT,
     draft TEXT,
     created_at INTEGER NOT NULL,
     updated_at INTEGER NOT NULL,
     updated_by TEXT,
     published_at INTEGER,
     PRIMARY KEY (collection, id)
   );
   CREATE TABLE IF NOT EXISTS revisions (
     rid INTEGER PRIMARY KEY AUTOINCREMENT,
     collection TEXT NOT NULL,
     doc_id TEXT NOT NULL,
     data TEXT NOT NULL,
     created_at INTEGER NOT NULL,
     created_by TEXT
   );
   CREATE INDEX IF NOT EXISTS revisions_doc ON revisions(collection, doc_id, rid);
   CREATE TABLE IF NOT EXISTS media (
     id TEXT PRIMARY KEY,
     filename TEXT NOT NULL,
     mime TEXT NOT NULL,
     size INTEGER NOT NULL,
     alt TEXT NOT NULL DEFAULT '',
     bytes BLOB NOT NULL,
     created_at INTEGER NOT NULL,
     created_by TEXT
   );
   CREATE TABLE IF NOT EXISTS login_attempts (
     key TEXT PRIMARY KEY,
     count INTEGER NOT NULL,
     first_at INTEGER NOT NULL
   );`,
  // 2: verkleinerte WebP-Varianten hochgeladener Bilder (src/cms/media.ts)
  `CREATE TABLE IF NOT EXISTS media_variants (
     media_id TEXT NOT NULL,
     width INTEGER NOT NULL,
     mime TEXT NOT NULL,
     bytes BLOB NOT NULL,
     PRIMARY KEY (media_id, width)
   );`,
];

type G = typeof globalThis & { __ldflowDb?: DatabaseSync };

export function dataDir(): string {
  const file = process.env.LDFLOW_DB;
  return file ? path.dirname(path.resolve(file)) : path.join(process.cwd(), 'data');
}

function open(): DatabaseSync {
  const file = process.env.LDFLOW_DB ? path.resolve(process.env.LDFLOW_DB) : path.join(dataDir(), 'flow.db');
  mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec('PRAGMA busy_timeout = 10000;');
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  migrate(db);
  return db;
}

function migrate(db: DatabaseSync) {
  // Mehrere Prozesse (z. B. parallele Build-Worker) können gleichzeitig öffnen: Schreibsperre holen und den Stand
  // innerhalb der Transaktion erneut lesen.
  db.exec('BEGIN IMMEDIATE');
  try {
    db.exec('CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);');
    const row = db.prepare("SELECT value FROM meta WHERE key = 'schema_version'").get() as { value: string } | undefined;
    let v = row ? Number(row.value) : 0;
    while (v < SCHEMA_VERSION) {
      db.exec(MIGRATIONS[v]);
      v++;
      db.prepare("INSERT INTO meta (key, value) VALUES ('schema_version', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(
        String(v),
      );
    }
    seedIfEmpty(db);
    backfillSingletons(db);
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
  ensureSetupToken(db);
}

/** Erststart: die Inhalte aus content/*.ts (1:1 aus dem Prototyp) werden als veröffentlichte Fassung übernommen. */
function seedIfEmpty(db: DatabaseSync) {
  const n = (db.prepare('SELECT COUNT(*) AS n FROM docs').get() as { n: number }).n;
  if (n > 0) return;
  const now = Date.now();
  const ins = db.prepare(
    'INSERT OR IGNORE INTO docs (collection, id, position, published, draft, created_at, updated_at, published_at) VALUES (?, ?, ?, ?, NULL, ?, ?, ?)',
  );
  for (const d of seedDocs()) ins.run(d.collection, d.id, d.position, JSON.stringify(d.data), now, now, now);
}

/**
 * Neue Singletons (z. B. Navigation, Impressum) und neue Felder bestehender Singletons (z. B. Über mich → Stationen)
 * aus den Startinhalten ergänzen — additiv: vorhandene Werte werden nie überschrieben. So bekommen auch bereits
 * laufende Installationen neue Bereiche, ohne dass jemand etwas migrieren muss.
 */
function backfillSingletons(db: DatabaseSync) {
  const now = Date.now();
  for (const d of seedDocs()) {
    if (COLLECTIONS[d.collection]?.kind !== 'singleton') continue;
    const row = db.prepare('SELECT published, draft FROM docs WHERE collection = ? AND id = ?').get(d.collection, d.id) as
      { published: string | null; draft: string | null } | undefined;
    if (!row) {
      db.prepare(
        'INSERT INTO docs (collection, id, position, published, draft, created_at, updated_at, published_at) VALUES (?, ?, 0, ?, NULL, ?, ?, ?)',
      ).run(d.collection, d.id, JSON.stringify(d.data), now, now, now);
      continue;
    }
    const fill = (json: string | null) => {
      if (!json) return null;
      const cur = JSON.parse(json) as Record<string, unknown>;
      const missing = Object.keys(d.data).filter((k) => !(k in cur));
      if (!missing.length) return null;
      for (const k of missing) cur[k] = d.data[k];
      return JSON.stringify(cur);
    };
    const pub = fill(row.published);
    const dr = fill(row.draft);
    if (pub) db.prepare('UPDATE docs SET published = ? WHERE collection = ? AND id = ?').run(pub, d.collection, d.id);
    if (dr) db.prepare('UPDATE docs SET draft = ? WHERE collection = ? AND id = ?').run(dr, d.collection, d.id);
  }
}

/**
 * Einrichtung: Solange kein Nutzer existiert, darf nur anlegen, wer das Setup-Token kennt (LDFLOW_SETUP_TOKEN
 * oder die Datei data/flow-setup-token.txt, nur für den Server-Betreiber lesbar). Verhindert, dass Fremde eine
 * frisch deployte Instanz übernehmen.
 */
function ensureSetupToken(db: DatabaseSync) {
  const users = (db.prepare('SELECT COUNT(*) AS n FROM users').get() as { n: number }).n;
  if (users > 0 || process.env.LDFLOW_SETUP_TOKEN) return;
  const file = setupTokenFile();
  if (existsSync(file)) return;
  try {
    // 'wx': nie ein bestehendes Token überschreiben (parallele Prozesse).
    writeFileSync(file, randomBytes(18).toString('base64url') + '\n', { mode: 0o600, flag: 'wx' });
  } catch {
    return;
  }
  try {
    chmodSync(file, 0o600);
  } catch {
    // Dateisystem ohne Rechteverwaltung
  }
}

export function setupTokenFile(): string {
  return path.join(dataDir(), 'flow-setup-token.txt');
}

export function db(): DatabaseSync {
  const g = globalThis as G;
  if (!g.__ldflowDb) g.__ldflowDb = open();
  return g.__ldflowDb;
}

/** Führt fn in einer Transaktion aus. */
export function tx<T>(fn: () => T): T {
  const d = db();
  d.exec('BEGIN IMMEDIATE');
  try {
    const r = fn();
    d.exec('COMMIT');
    return r;
  } catch (e) {
    d.exec('ROLLBACK');
    throw e;
  }
}
