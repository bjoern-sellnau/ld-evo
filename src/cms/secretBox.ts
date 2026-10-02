import 'server-only';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { dataDir } from './db';

/**
 * Verschlüsselung kleiner Geheimnisse in der DB (z. B. TOTP-Schlüssel) mit AES-256-GCM. Der Schlüssel liegt NICHT in
 * der Datenbank: `LDFLOW_SECRET_KEY` (beliebiger langer Wert) oder die Datei `flow-secret.key` neben der DB (0600,
 * beim ersten Bedarf erzeugt). Ein geleaktes DB-Backup allein verrät so keine 2FA-Schlüssel.
 * Wichtig: Backups der Schlüsseldatei getrennt von der DB aufbewahren — ohne sie ist 2FA neu einzurichten.
 */
let cached: Buffer | undefined;

function key(): Buffer {
  if (cached) return cached;
  const env = process.env.LDFLOW_SECRET_KEY;
  if (env) return (cached = createHash('sha256').update(env).digest());
  const file = path.join(dataDir(), 'flow-secret.key');
  try {
    writeFileSync(file, randomBytes(32).toString('base64') + '\n', { mode: 0o600, flag: 'wx' });
  } catch {
    // existiert schon (oder paralleler Prozess war schneller) → lesen
  }
  const raw = Buffer.from(readFileSync(file, 'utf8').trim(), 'base64');
  if (raw.length !== 32) throw new Error('flow-secret.key ist beschädigt');
  return (cached = raw);
}

export function seal(plain: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', key(), iv);
  const ct = Buffer.concat([c.update(plain, 'utf8'), c.final()]);
  return 'v1:' + Buffer.concat([iv, c.getAuthTag(), ct]).toString('base64url');
}

export function open(sealed: string): string | null {
  if (!sealed.startsWith('v1:')) return null;
  const b = Buffer.from(sealed.slice(3), 'base64url');
  if (b.length < 29) return null;
  try {
    const d = createDecipheriv('aes-256-gcm', key(), b.subarray(0, 12));
    d.setAuthTag(b.subarray(12, 28));
    return Buffer.concat([d.update(b.subarray(28)), d.final()]).toString('utf8');
  } catch {
    return null;
  }
}
