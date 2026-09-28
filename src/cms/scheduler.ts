import 'server-only';
import { timingSafeEqual, randomBytes, createHash } from 'node:crypto';
import { db } from './db';
import { commitPublish } from './publish';
import { validateDoc } from './schema';

/**
 * Geplantes Veröffentlichen — Systemjob ohne Nutzer. Erreichbar nur über POST /flow-cron mit dem geheimen Header
 * `x-ldflow-cron` (siehe src/app/(flow)/flow-cron/route.ts). Den Takt gibt src/instrumentation.ts vor (jede Minute
 * im laufenden Server); alternativ ruft ein externer Cron die Route mit LDFLOW_CRON_SECRET auf.
 */

const G = globalThis as { __ldflowCronSecret?: string };

/** Geheimnis für den Cron-Aufruf: LDFLOW_CRON_SECRET, sonst zufällig pro Serverprozess. */
export function cronSecret(): string {
  return (G.__ldflowCronSecret ??= process.env.LDFLOW_CRON_SECRET || randomBytes(32).toString('base64url'));
}

export function checkCronSecret(given: string | null): boolean {
  if (!given) return false;
  // Über Hashes vergleichen → gleiche Länge, konstante Laufzeit.
  const h = (s: string) => createHash('sha256').update(s).digest();
  return timingSafeEqual(h(given), h(cronSecret()));
}

/**
 * Fällige Entwürfe veröffentlichen. Ungültige Entwürfe (Pflichtfelder fehlen inzwischen) bleiben Entwurf, der
 * Zeitplan wird aufgehoben — LD Flow zeigt dann „nicht veröffentlicht“ statt still Kaputtes live zu stellen.
 */
export function runDuePublications(now = Date.now()): { published: string[]; failed: string[] } {
  const rows = db()
    .prepare('SELECT collection, id, draft, publish_by FROM docs WHERE publish_at IS NOT NULL AND publish_at <= ? ORDER BY publish_at')
    .all(now) as { collection: string; id: string; draft: string | null; publish_by: string | null }[];
  const published: string[] = [];
  const failed: string[] = [];
  for (const r of rows) {
    const key = `${r.collection}/${r.id}`;
    const { value, errors } = r.draft ? validateDoc(r.collection, JSON.parse(r.draft)) : { value: null, errors: { _: 'leer' } };
    if (!value || Object.keys(errors).length) {
      db().prepare('UPDATE docs SET publish_at = NULL, publish_by = NULL WHERE collection = ? AND id = ?').run(r.collection, r.id);
      failed.push(key);
      continue;
    }
    commitPublish(r.collection, r.id, value, `Zeitplan (${r.publish_by ?? 'LD Flow'})`);
    published.push(key);
  }
  return { published, failed };
}
