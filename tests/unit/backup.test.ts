import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { afterEach, describe, expect, it } from 'vitest';

const SCRIPT = path.resolve(import.meta.dirname, '../../scripts/backup-db.mjs');
let dir = '';
afterEach(() => rmSync(dir, { recursive: true, force: true }));

function run(env: Record<string, string>) {
  return execFileSync(process.execPath, ['--no-warnings', SCRIPT], { env: { ...process.env, ...env }, encoding: 'utf8' });
}

describe('Datenbank-Sicherung (scripts/backup-db.mjs)', () => {
  it('sichert im laufenden Betrieb inkl. WAL, prüft und hält nur die neuesten Stände', () => {
    dir = mkdtempSync(path.join(tmpdir(), 'ldbackup-'));
    const file = path.join(dir, 'flow.db');
    // Offene Verbindung im WAL-Modus wie beim laufenden Server — Daten liegen noch in flow.db-wal.
    const live = new DatabaseSync(file);
    live.exec(
      "PRAGMA journal_mode = WAL; CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT); INSERT INTO meta VALUES ('schema_version', '6');",
    );
    live.exec("CREATE TABLE docs (id TEXT); INSERT INTO docs VALUES ('a'), ('b');");
    const out = path.join(dir, 'backups');
    mkdirSync(out);
    // Zwei alte Stände und eine fremde Datei (bleibt unberührt).
    writeFileSync(path.join(out, 'flow-2020-01-01T00-00-00Z.db'), '');
    writeFileSync(path.join(out, 'flow-2020-01-02T00-00-00Z.db'), '');
    writeFileSync(path.join(out, 'notiz.txt'), '');

    const log = run({ LDFLOW_DB: file, LDFLOW_BACKUP_DIR: out, LDFLOW_BACKUP_KEEP: '2' });
    live.close();
    expect(log).toContain('Schema v6');
    const files = readdirSync(out).sort();
    expect(files).toHaveLength(3);
    expect(files).toContain('flow-2020-01-02T00-00-00Z.db');
    expect(files).toContain('notiz.txt');
    const fresh = files.find((f) => f.startsWith('flow-2') && !f.startsWith('flow-2020'))!;
    const copy = new DatabaseSync(path.join(out, fresh), { readOnly: true });
    expect(copy.prepare('SELECT COUNT(*) AS n FROM docs').get()).toEqual({ n: 2 });
    copy.close();
  });

  it('bricht ohne Datenbank ab und legt den Schlüssel nur getrennt ab', () => {
    dir = mkdtempSync(path.join(tmpdir(), 'ldbackup-'));
    expect(() => run({ LDFLOW_DB: path.join(dir, 'fehlt.db'), LDFLOW_BACKUP_DIR: path.join(dir, 'b') })).toThrow();

    const file = path.join(dir, 'flow.db');
    const db = new DatabaseSync(file);
    db.exec("CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT); INSERT INTO meta VALUES ('schema_version', '6');");
    db.close();
    writeFileSync(path.join(dir, 'flow-secret.key'), 'k'.repeat(32));
    const out = path.join(dir, 'b');
    expect(() => run({ LDFLOW_DB: file, LDFLOW_BACKUP_DIR: out, LDFLOW_BACKUP_KEY_DIR: out })).toThrow();
    expect(existsSync(out)).toBe(false); // Abbruch vor der Sicherung
    run({ LDFLOW_DB: file, LDFLOW_BACKUP_DIR: out, LDFLOW_BACKUP_KEY_DIR: path.join(dir, 'keys') });
    expect(existsSync(path.join(dir, 'keys', 'flow-secret.key'))).toBe(true);
    expect(readdirSync(out).some((f) => f.endsWith('.key'))).toBe(false);
  });
});
