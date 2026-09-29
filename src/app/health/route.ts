import { db } from '@/cms/db';

export const dynamic = 'force-dynamic';

/**
 * Lebenszeichen für Monitoring, Uptime-Checks und den Docker-HEALTHCHECK: 200, wenn der Server antwortet und die
 * Datenbank lesbar ist, sonst 503. Bewusst ohne Details (keine Versionen, Pfade oder Fehlermeldungen nach außen).
 */
export function GET() {
  const headers = { 'cache-control': 'no-store' };
  try {
    db().prepare('SELECT 1').get();
    return Response.json({ status: 'ok' }, { headers });
  } catch (e) {
    console.error('[health] Datenbank nicht erreichbar:', e instanceof Error ? e.message : e);
    return Response.json({ status: 'error' }, { status: 503, headers });
  }
}
