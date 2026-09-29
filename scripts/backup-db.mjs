/**
 * Sicherung der LD-Flow-Datenbank — im laufenden Betrieb, ohne den Server anzuhalten.
 *   npm run backup
 *   LDFLOW_DB=/srv/ldflow/flow.db LDFLOW_BACKUP_DIR=/mnt/backup/ldflow LDFLOW_BACKUP_KEEP=14 npm run backup
 *
 * Ablauf:
 *  1. `VACUUM INTO` schreibt eine konsistente, kompakte Kopie (SQLite liest dafür einen Schnappschuss; der Server
 *     schreibt währenddessen weiter in die WAL-Datei). Erst nach Prüfung wird die Datei unter ihrem Namen abgelegt.
 *  2. Prüfung der Kopie: `PRAGMA integrity_check` = ok und Schema-Version lesbar — sonst Abbruch mit Fehlercode.
 *  3. Aufbewahrung: die neuesten LDFLOW_BACKUP_KEEP Stände (Standard 14) bleiben, ältere `flow-*.db` werden gelöscht.
 *  4. Schlüsseldatei `flow-secret.key` (2FA-Geheimnisse, siehe src/cms/secretBox.ts): Sie gehört NICHT neben die
 *     Datenbank-Sicherung — wer beides hat, kann die 2FA-Geheimnisse entschlüsseln. Mit LDFLOW_BACKUP_KEY_DIR wird sie
 *     in ein getrenntes Verzeichnis kopiert (nur bei Änderung); ohne die Angabe erinnert das Skript daran.
 *     Nutzt der Server LDFLOW_SECRET_KEY, liegt der Schlüssel in der Umgebung und muss dort gesichert sein.
 *
 * Wiederherstellen: Server stoppen, Sicherung als flow.db ablegen, flow.db-wal/flow.db-shm entfernen, Server starten.
 * Regelmäßig ausführen per cron oder systemd-Timer (Beispiele: docs/LD-FLOW.md, Abschnitt „Sicherung“).
 */
import { chmodSync, copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const dbFile = path.resolve(process.env.LDFLOW_DB ?? path.join('data', 'flow.db'));
const dataDir = path.dirname(dbFile);
const outDir = path.resolve(process.env.LDFLOW_BACKUP_DIR ?? path.join(dataDir, 'backups'));
const keep = Math.max(1, Number(process.env.LDFLOW_BACKUP_KEEP ?? 14) || 14);
const keyDir = process.env.LDFLOW_BACKUP_KEY_DIR ? path.resolve(process.env.LDFLOW_BACKUP_KEY_DIR) : null;

const fail = (msg) => {
  console.error(`✗ ${msg}`);
  process.exit(1);
};

if (!existsSync(dbFile)) fail(`Datenbank nicht gefunden: ${dbFile} (LDFLOW_DB setzen)`);
if (outDir === dataDir) fail('LDFLOW_BACKUP_DIR darf nicht der Datenordner selbst sein');
if (keyDir && (keyDir === outDir || keyDir === dataDir))
  fail('LDFLOW_BACKUP_KEY_DIR muss ein eigenes Verzeichnis sein (nicht neben DB oder Sicherungen)');
mkdirSync(outDir, { recursive: true, mode: 0o700 });

// Zeitstempel in UTC, sortierbar und dateinamentauglich: flow-2026-09-29T03-15-00Z.db
const stamp = new Date()
  .toISOString()
  .replace(/\.\d+Z$/, 'Z')
  .replace(/:/g, '-');
const target = path.join(outDir, `flow-${stamp}.db`);
const tmp = `${target}.part`;
rmSync(tmp, { force: true });

// 1. Konsistente Kopie (Pfad als gebundener Parameter, nicht im SQL-Text).
const src = new DatabaseSync(dbFile, { readOnly: true });
try {
  src.exec('PRAGMA busy_timeout = 10000;');
  src.prepare('VACUUM INTO ?').run(tmp);
} finally {
  src.close();
}

// 2. Prüfen.
const copy = new DatabaseSync(tmp, { readOnly: true });
let version = '?';
try {
  const check = copy.prepare('PRAGMA integrity_check').get();
  if (check?.integrity_check !== 'ok') throw new Error(`integrity_check: ${JSON.stringify(check)}`);
  version = copy.prepare("SELECT value FROM meta WHERE key = 'schema_version'").get()?.value ?? '?';
} catch (e) {
  copy.close();
  rmSync(tmp, { force: true });
  fail(`Sicherung ist unbrauchbar und wurde verworfen — ${e instanceof Error ? e.message : e}`);
}
copy.close();
chmodSync(tmp, 0o600);
renameSync(tmp, target);

// 3. Aufbewahrung (Namen sind zeitlich sortierbar).
const all = readdirSync(outDir)
  .filter((f) => /^flow-\d{4}-\d{2}-\d{2}T[\d-]+Z\.db$/.test(f))
  .sort();
const expired = all.slice(0, Math.max(0, all.length - keep));
for (const f of expired) rmSync(path.join(outDir, f), { force: true });

const mb = (statSync(target).size / 1024 / 1024).toFixed(1);
console.log(`✓ ${target} (${mb} MB, Schema v${version}) — ${all.length - expired.length} Stände, ${expired.length} gelöscht`);

// 4. Schlüsseldatei getrennt sichern.
const keyFile = path.join(dataDir, 'flow-secret.key');
if (existsSync(keyFile)) {
  if (keyDir) {
    mkdirSync(keyDir, { recursive: true, mode: 0o700 });
    const dest = path.join(keyDir, 'flow-secret.key');
    const same = existsSync(dest) && readFileSync(dest).equals(readFileSync(keyFile));
    if (!same) {
      copyFileSync(keyFile, dest);
      chmodSync(dest, 0o600);
      console.log(`✓ Schlüssel gesichert: ${dest}`);
    }
  } else {
    console.log(
      'ℹ flow-secret.key nicht mitgesichert — getrennt aufbewahren (LDFLOW_BACKUP_KEY_DIR), sonst ist 2FA nach einer Wiederherstellung neu einzurichten.',
    );
  }
}
