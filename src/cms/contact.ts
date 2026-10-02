import 'server-only';
import { randomBytes } from 'node:crypto';
import { clientIp, EMAIL_RE, rateLimited } from './auth';
import { db } from './db';
import { mailConfigured, publicUrl, sendMail } from './mail';

/**
 * Kontaktformular (Widget „Kontakt“) — der einzige öffentliche Schreibzugriff, deshalb bewusst außerhalb von
 * repo.ts (dort prüft jede Funktion requireUser()). Schutz: Längen/Format prüfen, Honeypot-Feld, Mindest-
 * Ausfülldauer, 5 Nachrichten je IP in 15 min. Gespeichert wird nur, was die Person eingibt — keine IP.
 * Optional Benachrichtigung per Mail an LDFLOW_CONTACT_TO (braucht den Mailversand aus mail.ts).
 */

export interface ContactInput {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  page?: unknown;
  /** Honeypot: für Menschen unsichtbar, Bots füllen es aus. */
  website?: unknown;
  /** Zeitpunkt, zu dem das Formular angezeigt wurde (ms). */
  shownAt?: unknown;
}

const s = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export async function submitContact(input: ContactInput): Promise<{ ok: true } | { ok: false; error: string; field?: string }> {
  const name = s(input.name, 120);
  const email = s(input.email, 200).toLowerCase();
  const message = s(input.message, 5000);
  const page = s(input.page, 200);
  if (!name) return { ok: false, error: 'Bitte deinen Namen angeben.', field: 'name' };
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'Bitte eine gültige E-Mail-Adresse angeben.', field: 'email' };
  if (message.length < 10) return { ok: false, error: 'Die Nachricht ist zu kurz.', field: 'message' };
  // Bots: Honeypot gefüllt oder in unter 3 s abgeschickt → so tun, als sei alles gut, aber nichts speichern.
  const shownAt = typeof input.shownAt === 'number' ? input.shownAt : 0;
  if (s(input.website, 200) || !shownAt || Date.now() - shownAt < 3000) return { ok: true };
  if (rateLimited(`contact:${await clientIp()}`, 5)) return { ok: false, error: 'Zu viele Nachrichten. Bitte später erneut versuchen.' };
  const id = randomBytes(9).toString('base64url');
  db()
    .prepare('INSERT INTO messages (id, created_at, name, email, message, page) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, Date.now(), name, email, message, page.startsWith('/') ? page : '');
  const to = process.env.LDFLOW_CONTACT_TO;
  if (to && mailConfigured())
    void sendMail(
      to,
      `Neue Nachricht über loona-designs: ${name}`,
      `${name} <${email}>\n\n${message}\n\n— ${publicUrl('/flow/messages')}`,
    ).catch((e) => console.error('[LD Flow] Benachrichtigung fehlgeschlagen:', e instanceof Error ? e.message : e));
  return { ok: true };
}
