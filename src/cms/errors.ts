import 'server-only';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { db } from './db';
import { mailConfigured, publicUrl, sendMail } from './mail';

/**
 * Fehler-Eingang: Serverfehler aus Seiten, Route-Handlern und Server Actions (Next `onRequestError`, siehe
 * src/instrumentation.ts) landen gebündelt in der Tabelle `errors` — gleicher Fehler an gleicher Route = eine Zeile
 * mit Zähler. Admins sehen sie unter LD Flow → Fehler. Systemfunktion ohne Login (wie stats.ts); schreibt nur, liest
 * nichts nach außen.
 *
 * Datenschutz/Sicherheit: Pfad ohne Query (dort können Einmal-Token stehen), keine Header, keine IP. Meldung und
 * Stack werden gekürzt. Optional Mail an LDFLOW_ALERT_TO — je Fehler höchstens einmal am Tag, insgesamt höchstens
 * MAIL_PER_HOUR Mails pro Stunde, damit eine Fehlerschleife kein Postfach flutet.
 */

const MAX_MESSAGE = 500;
const MAX_STACK_LINES = 12;
export const MAX_ROWS = 200;
const MAIL_PER_HOUR = 10;
const DAY = 24 * 60 * 60 * 1000;

export interface ErrorInfo {
  path: string;
  method?: string;
  route?: string;
  kind?: string;
}

/** Steuerfluss von Next (redirect, notFound, dynamische Darstellung) ist kein Fehler. */
function isControlFlow(err: unknown): boolean {
  const digest = (err as { digest?: unknown })?.digest;
  return typeof digest === 'string' && /^(NEXT_|DYNAMIC_SERVER_USAGE|BAILOUT_TO_CLIENT_SIDE_RENDERING)/.test(digest);
}

const cwd = process.cwd() + path.sep;

export function describeError(err: unknown): { name: string; message: string; stack: string; digest: string | null } {
  const e = err instanceof Error ? err : new Error(typeof err === 'string' ? err : (JSON.stringify(err) ?? String(err)));
  const stack = (e.stack ?? '')
    .split('\n')
    .slice(1, 1 + MAX_STACK_LINES)
    .map((l) => l.trim().split(cwd).join(''))
    .join('\n');
  const digest = (err as { digest?: unknown })?.digest;
  return { name: e.name || 'Error', message: e.message.slice(0, MAX_MESSAGE), stack, digest: typeof digest === 'string' ? digest : null };
}

/** Gleicher Fehler = gleicher Typ, gleiche Meldung (Zahlen neutralisiert, z. B. IDs/Zeiten) und gleiche Route. */
export function fingerprint(name: string, message: string, route: string): string {
  return createHash('sha256')
    .update(`${name}\n${message.replace(/\d+/g, '#')}\n${route}`)
    .digest('hex')
    .slice(0, 24);
}

const G = globalThis as { __ldflowAlertTimes?: number[] };

/** Nimmt einen Fehler auf. Wirft nie — ein kaputter Fehler-Eingang darf keinen weiteren Fehler auslösen. */
export function recordError(err: unknown, info: ErrorInfo, now = Date.now()): string | null {
  try {
    if (isControlFlow(err)) return null;
    const d = describeError(err);
    const cleanPath = info.path.split(/[?#]/)[0].slice(0, 300);
    const route = (info.route || cleanPath).slice(0, 300);
    const fp = fingerprint(d.name, d.message, route);
    const message = `${d.name}: ${d.message}`;
    const kind = [info.method, info.kind].filter(Boolean).join(' ').slice(0, 40);
    const row = db()
      .prepare(
        `INSERT INTO errors (fp, message, stack, path, route, kind, digest, count, first_at, last_at) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
         ON CONFLICT(fp) DO UPDATE SET count = count + 1, last_at = excluded.last_at, path = excluded.path,
           stack = excluded.stack, digest = excluded.digest
         RETURNING count, notified_at AS notifiedAt`,
      )
      .get(fp, message, d.stack, cleanPath, route, kind, d.digest, now, now) as { count: number; notifiedAt: number | null };
    maybeAlert(fp, message, cleanPath, row, now);
    return fp;
  } catch (e) {
    console.error('[LD Flow] Fehler-Eingang fehlgeschlagen:', e instanceof Error ? e.message : e);
    return null;
  }
}

function maybeAlert(fp: string, message: string, where: string, row: { count: number; notifiedAt: number | null }, now: number) {
  const to = process.env.LDFLOW_ALERT_TO;
  if (!to || !mailConfigured()) return;
  if (row.notifiedAt && now - row.notifiedAt < DAY) return;
  const recent = (G.__ldflowAlertTimes ?? []).filter((t) => now - t < 60 * 60 * 1000);
  if (recent.length >= MAIL_PER_HOUR) return;
  G.__ldflowAlertTimes = [...recent, now];
  db().prepare('UPDATE errors SET notified_at = ? WHERE fp = ?').run(now, fp);
  void sendMail(
    to,
    `LD Flow: Serverfehler auf ${where}`,
    `${message}\n\nPfad: ${where}\nBisher ${row.count}× aufgetreten.\n\n— ${publicUrl('/flow/errors')}`,
  ).catch((e) => console.error('[LD Flow] Fehler-Mail fehlgeschlagen:', e instanceof Error ? e.message : e));
}
