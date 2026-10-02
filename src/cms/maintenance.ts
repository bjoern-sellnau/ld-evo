import 'server-only';
import type { StatementSync } from 'node:sqlite';
import { db } from './db';
import { MAX_ROWS } from './errors';

/**
 * Aufräumen — Systemjob ohne Nutzer, läuft über den Takt von /flow-cron (höchstens einmal pro Stunde, Zeitpunkt in
 * `meta.maintenance_at`). Entfernt nur Abgelaufenes und Verwaistes, nie Inhalte, Nachrichten oder Statistik:
 *  - Sitzungen, Reset-Links und 2FA-Zwischenschritte nach Ablauf
 *  - Einträge der Login-Sperre, die älter als ein Tag sind (das Sperrfenster beträgt 15 Minuten, siehe auth.ts)
 *  - Bildvarianten ohne Original
 *  - Fehler-Eingang: Einträge ohne Wiederholung seit 90 Tagen und alles über MAX_ROWS hinaus (älteste zuerst)
 * Danach `PRAGMA optimize` (SQLite aktualisiert bei Bedarf seine Statistiken).
 */

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export type MaintenanceResult = Record<string, number>;

export function runMaintenance(now = Date.now()): MaintenanceResult {
  const d = db();
  const n = (st: StatementSync, ...args: (string | number)[]) => Number(st.run(...args).changes);
  const res: MaintenanceResult = {
    sessions: n(d.prepare('DELETE FROM sessions WHERE expires_at < ?'), now),
    passwordResets: n(d.prepare('DELETE FROM password_resets WHERE expires_at < ?'), now),
    loginChallenges: n(d.prepare('DELETE FROM login_challenges WHERE expires_at < ?'), now),
    loginAttempts: n(d.prepare('DELETE FROM login_attempts WHERE first_at < ?'), now - DAY),
    mediaVariants: n(d.prepare('DELETE FROM media_variants WHERE media_id NOT IN (SELECT id FROM media)')),
    errors:
      n(d.prepare('DELETE FROM errors WHERE last_at < ?'), now - 90 * DAY) +
      n(d.prepare('DELETE FROM errors WHERE fp NOT IN (SELECT fp FROM errors ORDER BY last_at DESC LIMIT ?)'), MAX_ROWS),
  };
  d.exec('PRAGMA optimize;');
  d.prepare("INSERT INTO meta (key, value) VALUES ('maintenance_at', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(
    String(now),
  );
  return res;
}

/** Aus dem Minutentakt: nur ausführen, wenn der letzte Lauf mindestens eine Stunde her ist. */
export function maintenanceDue(now = Date.now()): boolean {
  const row = db().prepare("SELECT value FROM meta WHERE key = 'maintenance_at'").get() as { value: string } | undefined;
  return !row || now - Number(row.value) >= HOUR;
}
