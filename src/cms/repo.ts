import 'server-only';
import { randomBytes } from 'node:crypto';
import { requireUser, type User, createUser, passwordProblem, hashPassword, type Role } from './auth';
import { db, tx } from './db';
import { COLLECTIONS, RESERVED_SLUGS, SLUG_RE, emptyDoc, validateDoc, type Errors } from './schema';

/**
 * LD Flow. — Datenzugriff (Data Access Layer). Jede schreibende Funktion prüft Anmeldung/Rolle selbst;
 * Server Actions bleiben dünne Hüllen darum (Next-Empfehlung: „Using a Data Access Layer for mutations“).
 */

export interface DocRow {
  collection: string;
  id: string;
  position: number;
  published: Record<string, unknown> | null;
  draft: Record<string, unknown> | null;
  updatedAt: number;
  updatedBy: string | null;
  publishedAt: number | null;
}

interface RawRow {
  collection: string;
  id: string;
  position: number;
  published: string | null;
  draft: string | null;
  updated_at: number;
  updated_by: string | null;
  published_at: number | null;
}

const parse = (s: string | null) => (s ? (JSON.parse(s) as Record<string, unknown>) : null);
const toRow = (r: RawRow): DocRow => ({
  collection: r.collection,
  id: r.id,
  position: r.position,
  published: parse(r.published),
  draft: parse(r.draft),
  updatedAt: r.updated_at,
  updatedBy: r.updated_by,
  publishedAt: r.published_at,
});

function assertCollection(c: string) {
  if (!COLLECTIONS[c]) throw new Error('Unbekannte Collection');
}

// ---------------------------------------------------------------------------------------------------------------
// Öffentliche Lesezugriffe (nur veröffentlichte Fassungen) — für die Site
// ---------------------------------------------------------------------------------------------------------------

export function publishedDocs(collection: string): (Record<string, unknown> & { id: string })[] {
  assertCollection(collection);
  const rows = db()
    .prepare('SELECT id, published FROM docs WHERE collection = ? AND published IS NOT NULL ORDER BY position, id')
    .all(collection) as { id: string; published: string }[];
  return rows.map((r) => ({ ...JSON.parse(r.published), id: r.id }));
}

export function publishedDoc(collection: string, id: string): (Record<string, unknown> & { id: string }) | null {
  assertCollection(collection);
  const r = db().prepare('SELECT published FROM docs WHERE collection = ? AND id = ? AND published IS NOT NULL').get(collection, id) as
    { published: string } | undefined;
  return r ? { ...JSON.parse(r.published), id } : null;
}

// ---------------------------------------------------------------------------------------------------------------
// Redaktion
// ---------------------------------------------------------------------------------------------------------------

export async function listDocs(collection: string): Promise<DocRow[]> {
  await requireUser();
  assertCollection(collection);
  const rows = db().prepare('SELECT * FROM docs WHERE collection = ? ORDER BY position, id').all(collection) as unknown as RawRow[];
  return rows.map(toRow);
}

export async function getDoc(collection: string, id: string): Promise<DocRow | null> {
  await requireUser();
  assertCollection(collection);
  const r = db().prepare('SELECT * FROM docs WHERE collection = ? AND id = ?').get(collection, id) as RawRow | undefined;
  return r ? toRow(r) : null;
}

/** Arbeitskopie = Entwurf, sonst die veröffentlichte Fassung. */
export function workingCopy(row: DocRow): Record<string, unknown> {
  return row.draft ?? row.published ?? {};
}

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string; errors?: Errors };

export async function createDoc(collection: string, idRaw: string, template?: string): Promise<Result<{ id: string }>> {
  const user = await requireUser();
  const def = COLLECTIONS[collection];
  if (!def) return { ok: false, error: 'Unbekannte Collection' };
  if (!def.creatable) return { ok: false, error: 'Hier können keine Einträge angelegt werden.' };
  const id = idRaw.trim().toLowerCase();
  if (!SLUG_RE.test(id)) return { ok: false, error: 'Kennung: nur a–z, 0–9 und Bindestrich (max. 64 Zeichen).' };
  if (collection === 'pages' && RESERVED_SLUGS.has(id))
    return { ok: false, error: 'Diese Kennung ist für eine bestehende Seite reserviert.' };
  const exists = db().prepare('SELECT 1 FROM docs WHERE collection = ? AND id = ?').get(collection, id);
  if (exists) return { ok: false, error: 'Diese Kennung ist schon vergeben.' };
  const now = Date.now();
  const pos = (db().prepare('SELECT COALESCE(MAX(position), -1) + 1 AS p FROM docs WHERE collection = ?').get(collection) as { p: number })
    .p;
  const data = emptyDoc(collection, template);
  db()
    .prepare(
      'INSERT INTO docs (collection, id, position, published, draft, created_at, updated_at, updated_by) VALUES (?, ?, ?, NULL, ?, ?, ?, ?)',
    )
    .run(collection, id, pos, JSON.stringify(data), now, now, user.email);
  return { ok: true, id };
}

/** Entwurf speichern (validiert, aber noch nicht live). */
export async function saveDraft(collection: string, id: string, input: unknown): Promise<Result> {
  const user = await requireUser();
  assertCollection(collection);
  const { value, errors } = validateDoc(collection, input);
  // Entwürfe dürfen unvollständig sein — nur Formatfehler blockieren; Pflichtfelder prüft erst das Veröffentlichen.
  const blocking = Object.fromEntries(Object.entries(errors).filter(([, m]) => m !== 'Pflichtfeld'));
  if (Object.keys(blocking).length) return { ok: false, error: 'Bitte die markierten Felder prüfen.', errors: blocking };
  const res = db()
    .prepare('UPDATE docs SET draft = ?, updated_at = ?, updated_by = ? WHERE collection = ? AND id = ?')
    .run(JSON.stringify(value), Date.now(), user.email, collection, id);
  if (!res.changes) return { ok: false, error: 'Eintrag nicht gefunden.' };
  return { ok: true };
}

/** Entwurf (bzw. übergebene Daten) veröffentlichen; alte Live-Fassung wandert in die Versionen. */
export async function publishDoc(collection: string, id: string, input?: unknown): Promise<Result> {
  const user = await requireUser();
  assertCollection(collection);
  const row = await getDoc(collection, id);
  if (!row) return { ok: false, error: 'Eintrag nicht gefunden.' };
  const { value, errors } = validateDoc(collection, input ?? workingCopy(row));
  if (Object.keys(errors).length) return { ok: false, error: 'Bitte die markierten Felder prüfen.', errors };
  const now = Date.now();
  tx(() => {
    if (row.published)
      db()
        .prepare('INSERT INTO revisions (collection, doc_id, data, created_at, created_by) VALUES (?, ?, ?, ?, ?)')
        .run(collection, id, JSON.stringify(row.published), now, user.email);
    db()
      .prepare(
        'UPDATE docs SET published = ?, draft = NULL, updated_at = ?, updated_by = ?, published_at = ? WHERE collection = ? AND id = ?',
      )
      .run(JSON.stringify(value), now, user.email, now, collection, id);
    // Höchstens 30 Versionen je Dokument aufheben.
    db()
      .prepare(
        `DELETE FROM revisions WHERE collection = ? AND doc_id = ? AND rid NOT IN
         (SELECT rid FROM revisions WHERE collection = ? AND doc_id = ? ORDER BY rid DESC LIMIT 30)`,
      )
      .run(collection, id, collection, id);
  });
  return { ok: true };
}

export async function discardDraft(collection: string, id: string): Promise<Result> {
  await requireUser();
  assertCollection(collection);
  const r = db().prepare('UPDATE docs SET draft = NULL WHERE collection = ? AND id = ? AND published IS NOT NULL').run(collection, id);
  return r.changes ? { ok: true } : { ok: false, error: 'Nichts zu verwerfen (noch nie veröffentlicht).' };
}

/** Von der Site nehmen, Inhalt bleibt als Entwurf erhalten. */
export async function unpublishDoc(collection: string, id: string): Promise<Result> {
  const user = await requireUser();
  const def = COLLECTIONS[collection];
  if (!def || def.kind === 'singleton') return { ok: false, error: 'Singletons bleiben immer online.' };
  const r = db()
    .prepare(
      'UPDATE docs SET draft = COALESCE(draft, published), published = NULL, updated_at = ?, updated_by = ? WHERE collection = ? AND id = ?',
    )
    .run(Date.now(), user.email, collection, id);
  return r.changes ? { ok: true } : { ok: false, error: 'Eintrag nicht gefunden.' };
}

export async function deleteDoc(collection: string, id: string): Promise<Result> {
  await requireUser('admin');
  const def = COLLECTIONS[collection];
  if (!def || def.kind === 'singleton') return { ok: false, error: 'Kann nicht gelöscht werden.' };
  tx(() => {
    db().prepare('DELETE FROM docs WHERE collection = ? AND id = ?').run(collection, id);
    db().prepare('DELETE FROM revisions WHERE collection = ? AND doc_id = ?').run(collection, id);
  });
  return { ok: true };
}

export async function moveDoc(collection: string, id: string, dir: -1 | 1): Promise<Result> {
  await requireUser();
  const rows = await listDocs(collection);
  const i = rows.findIndex((r) => r.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= rows.length) return { ok: true };
  tx(() => {
    const upd = db().prepare('UPDATE docs SET position = ? WHERE collection = ? AND id = ?');
    rows.forEach((r, k) => upd.run(k === i ? j : k === j ? i : k, collection, r.id));
  });
  return { ok: true };
}

export async function listRevisions(collection: string, id: string) {
  await requireUser();
  return db()
    .prepare(
      'SELECT rid, created_at AS createdAt, created_by AS createdBy FROM revisions WHERE collection = ? AND doc_id = ? ORDER BY rid DESC',
    )
    .all(collection, id) as { rid: number; createdAt: number; createdBy: string | null }[];
}

/** Version als Entwurf zurückholen (zum Prüfen, danach veröffentlichen). */
export async function restoreRevision(collection: string, id: string, rid: number): Promise<Result> {
  const user = await requireUser();
  const r = db().prepare('SELECT data FROM revisions WHERE rid = ? AND collection = ? AND doc_id = ?').get(rid, collection, id) as
    { data: string } | undefined;
  if (!r) return { ok: false, error: 'Version nicht gefunden.' };
  db()
    .prepare('UPDATE docs SET draft = ?, updated_at = ?, updated_by = ? WHERE collection = ? AND id = ?')
    .run(r.data, Date.now(), user.email, collection, id);
  return { ok: true };
}

export async function counts() {
  await requireUser();
  const rows = db()
    .prepare(
      `SELECT collection, COUNT(*) AS n, SUM(draft IS NOT NULL) AS drafts, SUM(published IS NULL) AS offline FROM docs GROUP BY collection`,
    )
    .all() as { collection: string; n: number; drafts: number; offline: number }[];
  return Object.fromEntries(rows.map((r) => [r.collection, r]));
}

// ---------------------------------------------------------------------------------------------------------------
// Medien — Bytes in der DB (eine Datei = ein Backup). Typ wird an den Magic Bytes erkannt, SVG ist nicht erlaubt.
// ---------------------------------------------------------------------------------------------------------------

export const MAX_UPLOAD = 10 * 1024 * 1024;

export function sniffImage(buf: Uint8Array): string | null {
  const b = (i: number) => buf[i];
  if (buf.length < 12) return null;
  if (b(0) === 0x89 && b(1) === 0x50 && b(2) === 0x4e && b(3) === 0x47) return 'image/png';
  if (b(0) === 0xff && b(1) === 0xd8 && b(2) === 0xff) return 'image/jpeg';
  if (b(0) === 0x47 && b(1) === 0x49 && b(2) === 0x46 && b(3) === 0x38) return 'image/gif';
  const ascii = (s: number, e: number) => String.fromCharCode(...buf.slice(s, e));
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'image/webp';
  if (ascii(4, 8) === 'ftyp' && /^(avif|avis)$/.test(ascii(8, 12))) return 'image/avif';
  if (ascii(4, 8) === 'ftyp' && /^(mp41|mp42|isom|iso2|avc1|M4V )$/.test(ascii(8, 12))) return 'video/mp4';
  if (b(0) === 0x1a && b(1) === 0x45 && b(2) === 0xdf && b(3) === 0xa3) return 'video/webm';
  return null;
}

export async function uploadMedia(file: File, alt: string): Promise<Result<{ id: string; src: string }>> {
  const user = await requireUser();
  if (file.size > MAX_UPLOAD) return { ok: false, error: 'Datei ist größer als 10 MB.' };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mime = sniffImage(bytes);
  if (!mime) return { ok: false, error: 'Nur PNG, JPEG, GIF, WebP, AVIF, MP4 oder WebM.' };
  const id = randomBytes(12).toString('base64url');
  const name = file.name.replace(/[^\w.\- ]+/g, '_').slice(0, 120) || 'datei';
  db()
    .prepare('INSERT INTO media (id, filename, mime, size, alt, bytes, created_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, name, mime, bytes.length, alt.slice(0, 300), bytes, Date.now(), user.email);
  return { ok: true, id, src: `/media/${id}` };
}

export async function listMedia() {
  await requireUser();
  return db().prepare('SELECT id, filename, mime, size, alt, created_at AS createdAt FROM media ORDER BY created_at DESC').all() as {
    id: string;
    filename: string;
    mime: string;
    size: number;
    alt: string;
    createdAt: number;
  }[];
}

export async function updateMediaAlt(id: string, alt: string): Promise<Result> {
  await requireUser();
  db().prepare('UPDATE media SET alt = ? WHERE id = ?').run(alt.slice(0, 300), id);
  return { ok: true };
}

export async function deleteMedia(id: string): Promise<Result> {
  await requireUser();
  db().prepare('DELETE FROM media WHERE id = ?').run(id);
  return { ok: true };
}

/** Öffentlich (von /media/[id]): Medien sind wie Dateien in public/ frei abrufbar, IDs sind nicht erratbar. */
export function readMedia(id: string): { mime: string; bytes: Uint8Array } | null {
  if (!/^[\w-]{8,32}$/.test(id)) return null;
  const r = db().prepare('SELECT mime, bytes FROM media WHERE id = ?').get(id) as { mime: string; bytes: Uint8Array } | undefined;
  return r ?? null;
}

// ---------------------------------------------------------------------------------------------------------------
// Nutzerverwaltung (nur Admins)
// ---------------------------------------------------------------------------------------------------------------

export async function listUsers() {
  await requireUser('admin');
  return db().prepare('SELECT id, email, name, role, disabled, created_at AS createdAt FROM users ORDER BY created_at').all() as {
    id: string;
    email: string;
    name: string;
    role: Role;
    disabled: number;
    createdAt: number;
  }[];
}

export async function adminCreateUser(input: { email: string; name: string; password: string; role: Role }) {
  await requireUser('admin');
  return createUser(input);
}

function otherActiveAdmins(me: User) {
  return (db().prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'admin' AND disabled = 0 AND id != ?").get(me.id) as { n: number }).n;
}

export async function adminUpdateUser(id: string, patch: { role?: Role; disabled?: boolean; password?: string }): Promise<Result> {
  const me = await requireUser('admin');
  if (id === me.id && (patch.role === 'editor' || patch.disabled) && otherActiveAdmins(me) === 0)
    return { ok: false, error: 'Der letzte aktive Admin kann sich nicht selbst herabstufen oder sperren.' };
  if (patch.role) db().prepare('UPDATE users SET role = ?, updated_at = ? WHERE id = ?').run(patch.role, Date.now(), id);
  if (patch.disabled !== undefined) {
    db()
      .prepare('UPDATE users SET disabled = ?, updated_at = ? WHERE id = ?')
      .run(patch.disabled ? 1 : 0, Date.now(), id);
    if (patch.disabled) db().prepare('DELETE FROM sessions WHERE user_id = ?').run(id);
  }
  if (patch.password !== undefined) {
    const p = passwordProblem(patch.password);
    if (p) return { ok: false, error: `Passwort: ${p}.` };
    db()
      .prepare('UPDATE users SET pass_hash = ?, updated_at = ? WHERE id = ?')
      .run(await hashPassword(patch.password), Date.now(), id);
    db().prepare('DELETE FROM sessions WHERE user_id = ?').run(id);
  }
  return { ok: true };
}

export async function adminDeleteUser(id: string): Promise<Result> {
  const me = await requireUser('admin');
  if (id === me.id) return { ok: false, error: 'Das eigene Konto kann nicht gelöscht werden.' };
  db().prepare('DELETE FROM users WHERE id = ?').run(id);
  return { ok: true };
}
