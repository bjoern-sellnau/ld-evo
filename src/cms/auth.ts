import 'server-only';
import { createHash, randomBytes, randomUUID, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { readFileSync, rmSync } from 'node:fs';
import { cache } from 'react';
import { cookies, headers } from 'next/headers';
import { db, setupTokenFile } from './db';
import { mailConfigured, publicUrl, sendMail } from './mail';

/**
 * LD Flow. — Anmeldung.
 * - Passwörter: scrypt (N=16384, r=8, p=1, 64 Byte, 16 Byte Salt), Vergleich in konstanter Zeit.
 * - Sessions: zufälliges 256-Bit-Token im HttpOnly-Cookie; in der DB liegt nur dessen SHA-256 → ein DB-Leak
 *   verrät keine gültigen Sessions. Serverseitig widerrufbar (Logout, Passwortwechsel, Nutzer deaktiviert).
 * - Brute-Force-Schutz: 5 Fehlversuche je E-Mail+IP bzw. 20 je IP in 15 min sperren.
 * - Rollen: admin (alles inkl. Nutzerverwaltung), editor (Inhalte + Medien).
 * - Passwort vergessen: Einmal-Link (256 Bit, 1 h gültig, in der DB nur als SHA-256), Antwort immer gleich —
 *   verrät also nicht, ob es ein Konto gibt. Nach dem Zurücksetzen werden alle Sessions des Kontos beendet.
 */

export type Role = 'admin' | 'editor';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export const SESSION_COOKIE = 'ldflow_session';
const SESSION_TTL = 7 * 24 * 3600 * 1000;
const SCRYPT = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const KEYLEN = 64;
export const MIN_PASSWORD = 10;

function scrypt(password: string, salt: Buffer, opts = SCRYPT): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scryptCb(password.normalize('NFKC'), salt, KEYLEN, opts, (err, key) => (err ? reject(err) : resolve(key))),
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt);
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString('base64')}$${key.toString('base64')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const [, n, r, p, saltB64, keyB64] = parts;
  const expected = Buffer.from(keyB64, 'base64');
  const key = await scrypt(password, Buffer.from(saltB64, 'base64'), { N: Number(n), r: Number(r), p: Number(p), maxmem: SCRYPT.maxmem });
  return key.length === expected.length && timingSafeEqual(key, expected);
}

// Für unbekannte E-Mails wird trotzdem ein Hash geprüft → gleiche Antwortzeit, keine Nutzer-Enumeration.
let dummyHash: Promise<string> | null = null;
const getDummy = () => (dummyHash ??= hashPassword(randomBytes(16).toString('hex')));

export function passwordProblem(pw: string): string | null {
  if (pw.length < MIN_PASSWORD) return `Mindestens ${MIN_PASSWORD} Zeichen`;
  if (pw.length > 200) return 'Höchstens 200 Zeichen';
  return null;
}

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

// ---------------------------------------------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------------------------------------------

const WINDOW = 15 * 60 * 1000;

function attempts(key: string): number {
  const row = db().prepare('SELECT count, first_at FROM login_attempts WHERE key = ?').get(key) as
    { count: number; first_at: number } | undefined;
  if (!row) return 0;
  if (Date.now() - row.first_at > WINDOW) {
    db().prepare('DELETE FROM login_attempts WHERE key = ?').run(key);
    return 0;
  }
  return row.count;
}

function bump(key: string) {
  const now = Date.now();
  db()
    .prepare(
      `INSERT INTO login_attempts (key, count, first_at) VALUES (?, 1, ?)
       ON CONFLICT(key) DO UPDATE SET
         count = CASE WHEN ? - first_at > ? THEN 1 ELSE count + 1 END,
         first_at = CASE WHEN ? - first_at > ? THEN ? ELSE first_at END`,
    )
    .run(key, now, now, WINDOW, now, WINDOW, now);
}

/** Zählt einen Versuch für `key` und meldet, ob das Limit im 15-Minuten-Fenster überschritten ist. */
export function rateLimited(key: string, max: number): boolean {
  if (attempts(key) >= max) return true;
  bump(key);
  return false;
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  // Hinter einem Reverse-Proxy setzt dieser X-Forwarded-For; ohne Proxy fällt alles auf „local“.
  return (h.get('x-forwarded-for')?.split(',')[0] ?? h.get('x-real-ip') ?? 'local').trim().slice(0, 64);
}

// ---------------------------------------------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------------------------------------------

function secureCookies(): boolean {
  return process.env.NODE_ENV === 'production' && process.env.LDFLOW_INSECURE_COOKIES !== '1';
}

async function createSession(userId: string) {
  const token = randomBytes(32).toString('base64url');
  const now = Date.now();
  const h = await headers();
  db()
    .prepare('INSERT INTO sessions (id_hash, user_id, created_at, expires_at, user_agent) VALUES (?, ?, ?, ?, ?)')
    .run(sha256(token), userId, now, now + SESSION_TTL, (h.get('user-agent') ?? '').slice(0, 200));
  db().prepare('DELETE FROM sessions WHERE expires_at < ?').run(now);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: secureCookies(),
    path: '/',
    maxAge: SESSION_TTL / 1000,
  });
}

/** Aktueller Nutzer (einmal pro Request ausgewertet). */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;
  const row = db()
    .prepare(
      `SELECT u.id, u.email, u.name, u.role, s.expires_at, s.id_hash FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.id_hash = ? AND u.disabled = 0`,
    )
    .get(sha256(token)) as (User & { expires_at: number; id_hash: string }) | undefined;
  if (!row) return null;
  const now = Date.now();
  if (row.expires_at < now) {
    db().prepare('DELETE FROM sessions WHERE id_hash = ?').run(row.id_hash);
    return null;
  }
  // Gleitende Verlängerung, sobald die Hälfte der Laufzeit verbraucht ist (Cookie-Laufzeit bleibt 7 Tage ab Login).
  if (row.expires_at - now < SESSION_TTL / 2)
    db()
      .prepare('UPDATE sessions SET expires_at = ? WHERE id_hash = ?')
      .run(now + SESSION_TTL, row.id_hash);
  return { id: row.id, email: row.email, name: row.name, role: row.role };
});

export class AuthError extends Error {}

/** Für Server Actions und den DAL: wirft, wenn nicht angemeldet bzw. Rolle fehlt. */
export async function requireUser(role?: Role): Promise<User> {
  const u = await getCurrentUser();
  if (!u) throw new AuthError('Nicht angemeldet');
  if (role === 'admin' && u.role !== 'admin') throw new AuthError('Keine Berechtigung');
  return u;
}

// ---------------------------------------------------------------------------------------------------------------
// Login / Logout / Setup
// ---------------------------------------------------------------------------------------------------------------

export async function login(emailRaw: string, password: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const email = emailRaw.trim().toLowerCase().slice(0, 200);
  const ip = await clientIp();
  const kUser = `u:${email}|${ip}`;
  const kIp = `ip:${ip}`;
  if (attempts(kUser) >= 5 || attempts(kIp) >= 20)
    return { ok: false, error: 'Zu viele Fehlversuche. Bitte in 15 Minuten erneut versuchen.' };
  const row = db().prepare('SELECT id, pass_hash, disabled FROM users WHERE email = ?').get(email) as
    { id: string; pass_hash: string; disabled: number } | undefined;
  const ok = await verifyPassword(password, row?.pass_hash ?? (await getDummy()));
  if (!row || !ok || row.disabled) {
    bump(kUser);
    bump(kIp);
    return { ok: false, error: 'E-Mail oder Passwort falsch.' };
  }
  db().prepare('DELETE FROM login_attempts WHERE key = ?').run(kUser);
  await createSession(row.id);
  return { ok: true };
}

export async function logout() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) db().prepare('DELETE FROM sessions WHERE id_hash = ?').run(sha256(token));
  jar.delete(SESSION_COOKIE);
}

export function userCount(): number {
  return (db().prepare('SELECT COUNT(*) AS n FROM users').get() as { n: number }).n;
}

function expectedSetupToken(): string | null {
  if (process.env.LDFLOW_SETUP_TOKEN) return process.env.LDFLOW_SETUP_TOKEN;
  try {
    return readFileSync(setupTokenFile(), 'utf8').trim();
  } catch {
    return null;
  }
}

export function checkSetupToken(given: string): boolean {
  const exp = expectedSetupToken();
  if (!exp) return false;
  const a = Buffer.from(sha256(given));
  const b = Buffer.from(sha256(exp));
  return timingSafeEqual(a, b);
}

/** Legt den ersten Admin an — nur solange es keinen Nutzer gibt und mit gültigem Setup-Token. */
export async function setupFirstAdmin(input: { token: string; email: string; name: string; password: string }) {
  const ip = await clientIp();
  if (attempts(`setup:${ip}`) >= 10) return { ok: false as const, error: 'Zu viele Versuche.' };
  if (userCount() > 0) return { ok: false as const, error: 'LD Flow ist bereits eingerichtet.' };
  if (!checkSetupToken(input.token)) {
    bump(`setup:${ip}`);
    return { ok: false as const, error: 'Setup-Token ungültig.' };
  }
  const res = await createUser({ email: input.email, name: input.name, password: input.password, role: 'admin' });
  if (!res.ok) return res;
  try {
    rmSync(setupTokenFile(), { force: true });
  } catch {
    // nicht kritisch: ohne Nutzer-0-Zustand ist das Token wirkungslos
  }
  await createSession(res.id);
  return { ok: true as const };
}

export const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;

export async function createUser(input: { email: string; name: string; password: string; role: Role }) {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim().slice(0, 80);
  if (!EMAIL_RE.test(email)) return { ok: false as const, error: 'Ungültige E-Mail-Adresse.' };
  if (!name) return { ok: false as const, error: 'Name fehlt.' };
  const pw = passwordProblem(input.password);
  if (pw) return { ok: false as const, error: `Passwort: ${pw}.` };
  if (db().prepare('SELECT 1 FROM users WHERE email = ?').get(email)) return { ok: false as const, error: 'E-Mail ist bereits vergeben.' };
  const id = randomUUID();
  const now = Date.now();
  db()
    .prepare('INSERT INTO users (id, email, name, role, pass_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, email, name, input.role, await hashPassword(input.password), now, now);
  return { ok: true as const, id };
}

/** Passwort ändern: altes Passwort prüfen, danach alle anderen Sessions beenden. */
export async function changeOwnPassword(current: string, next: string) {
  const me = await requireUser();
  const row = db().prepare('SELECT pass_hash FROM users WHERE id = ?').get(me.id) as { pass_hash: string };
  if (!(await verifyPassword(current, row.pass_hash))) return { ok: false as const, error: 'Aktuelles Passwort ist falsch.' };
  const pw = passwordProblem(next);
  if (pw) return { ok: false as const, error: `Neues Passwort: ${pw}.` };
  db()
    .prepare('UPDATE users SET pass_hash = ?, updated_at = ? WHERE id = ?')
    .run(await hashPassword(next), Date.now(), me.id);
  db().prepare('DELETE FROM sessions WHERE user_id = ?').run(me.id);
  await createSession(me.id);
  return { ok: true as const };
}

// ---------------------------------------------------------------------------------------------------------------
// Passwort vergessen
// ---------------------------------------------------------------------------------------------------------------

const RESET_TTL = 60 * 60 * 1000;

/**
 * Neues Reset-Token für ein Konto (ältere verfallen). Liefert den relativen Link — nur für requestPasswordReset
 * und die Admin-Funktion in repo.ts (die requireUser('admin') prüft) gedacht.
 */
export function issueResetToken(userId: string): string {
  const token = randomBytes(32).toString('base64url');
  const now = Date.now();
  db().prepare('DELETE FROM password_resets WHERE user_id = ? OR expires_at < ?').run(userId, now);
  db()
    .prepare('INSERT INTO password_resets (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)')
    .run(sha256(token), userId, now, now + RESET_TTL);
  return `/flow/reset?token=${token}`;
}

/** Immer dieselbe Antwort (kein Konto-Orakel); Mail nur, wenn SMTP konfiguriert ist. */
export async function requestPasswordReset(emailRaw: string): Promise<{ ok: true; message: string } | { ok: false; error: string }> {
  const email = emailRaw.trim().toLowerCase().slice(0, 200);
  const ip = await clientIp();
  if (attempts(`reset:${ip}`) >= 5 || attempts(`reset:${email}`) >= 3)
    return { ok: false, error: 'Zu viele Anfragen. Bitte in 15 Minuten erneut versuchen.' };
  bump(`reset:${ip}`);
  bump(`reset:${email}`);
  const message = 'Falls es ein Konto mit dieser Adresse gibt, ist ein Link zum Zurücksetzen unterwegs (1 Stunde gültig).';
  const row = db().prepare('SELECT id, name FROM users WHERE email = ? AND disabled = 0').get(email) as
    { id: string; name: string } | undefined;
  if (!row) return { ok: true, message };
  if (!mailConfigured()) {
    console.warn(
      '[LD Flow] Passwort-Reset angefragt, aber kein Mailversand konfiguriert (LDFLOW_SMTP_URL …). Ein Admin kann in „Nutzer“ einen Link erzeugen.',
    );
    return { ok: true, message };
  }
  const link = publicUrl(issueResetToken(row.id));
  // Nicht abwarten: sonst verriete die längere Antwortzeit, dass es das Konto gibt.
  void sendMail(
    email,
    'LD Flow — Passwort zurücksetzen',
    `Hallo ${row.name},\n\nüber diesen Link setzt du dein Passwort für LD Flow zurück (1 Stunde gültig, nur einmal):\n${link}\n\nDu hast das nicht angefordert? Dann ignoriere diese Mail — dein Passwort bleibt unverändert.\n`,
  ).catch((e) => console.error('[LD Flow] Mailversand fehlgeschlagen:', e instanceof Error ? e.message : e));
  return { ok: true, message };
}

/** Prüft, ob ein Reset-Link (noch) gültig ist — für die Reset-Seite. */
export function resetTokenValid(token: string): boolean {
  if (!token || token.length > 100) return false;
  const r = db().prepare('SELECT expires_at FROM password_resets WHERE token_hash = ?').get(sha256(token)) as
    { expires_at: number } | undefined;
  return !!r && r.expires_at > Date.now();
}

/** Neues Passwort mit Einmal-Link setzen; beendet alle Sessions und meldet danach neu an. */
export async function resetPassword(token: string, password: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const ip = await clientIp();
  if (attempts(`reset-use:${ip}`) >= 10) return { ok: false, error: 'Zu viele Versuche. Bitte später erneut versuchen.' };
  const invalid = { ok: false as const, error: 'Der Link ist ungültig oder abgelaufen. Bitte einen neuen anfordern.' };
  if (!token || token.length > 100) return invalid;
  const row = db()
    .prepare(
      `SELECT r.user_id FROM password_resets r JOIN users u ON u.id = r.user_id
       WHERE r.token_hash = ? AND r.expires_at > ? AND u.disabled = 0`,
    )
    .get(sha256(token), Date.now()) as { user_id: string } | undefined;
  if (!row) {
    bump(`reset-use:${ip}`);
    return invalid;
  }
  const pw = passwordProblem(password);
  if (pw) return { ok: false, error: `Neues Passwort: ${pw}.` };
  const hash = await hashPassword(password);
  db().prepare('UPDATE users SET pass_hash = ?, updated_at = ? WHERE id = ?').run(hash, Date.now(), row.user_id);
  db().prepare('DELETE FROM password_resets WHERE user_id = ?').run(row.user_id);
  db().prepare('DELETE FROM sessions WHERE user_id = ?').run(row.user_id);
  await createSession(row.user_id);
  return { ok: true };
}
