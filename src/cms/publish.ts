import 'server-only';
import { db, tx } from './db';

/**
 * Kern des Veröffentlichens — ohne eigene Anmeldeprüfung. Aufrufer: `publishDoc` in repo.ts (prüft requireUser())
 * und der Zeitplan in scheduler.ts (Systemjob, nur über den geheimen Cron-Aufruf erreichbar). Nirgends sonst
 * verwenden; `value` muss bereits von validateDoc geprüft sein.
 */
export function commitPublish(collection: string, id: string, value: Record<string, unknown>, by: string) {
  const now = Date.now();
  tx(() => {
    const cur = db().prepare('SELECT published FROM docs WHERE collection = ? AND id = ?').get(collection, id) as
      { published: string | null } | undefined;
    if (cur?.published)
      db()
        .prepare('INSERT INTO revisions (collection, doc_id, data, created_at, created_by) VALUES (?, ?, ?, ?, ?)')
        .run(collection, id, cur.published, now, by);
    db()
      .prepare(
        `UPDATE docs SET published = ?, draft = NULL, updated_at = ?, updated_by = ?, published_at = ?,
         publish_at = NULL, publish_by = NULL WHERE collection = ? AND id = ?`,
      )
      .run(JSON.stringify(value), now, by, now, collection, id);
    // Höchstens 30 Versionen je Dokument aufheben.
    db()
      .prepare(
        `DELETE FROM revisions WHERE collection = ? AND doc_id = ? AND rid NOT IN
         (SELECT rid FROM revisions WHERE collection = ? AND doc_id = ? ORDER BY rid DESC LIMIT 30)`,
      )
      .run(collection, id, collection, id);
  });
}
