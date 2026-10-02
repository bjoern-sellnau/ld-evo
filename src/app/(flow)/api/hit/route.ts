import { recordHit } from '@/cms/stats';

export const dynamic = 'force-dynamic';

/**
 * Seitenaufruf zählen (navigator.sendBeacon aus src/site/stats/useHitCounter.ts). Nur von der eigenen Site
 * (Origin), höchstens 1 KB. Antwort immer 204 — der Browser erfährt nichts über die Zählung.
 */
export async function POST(req: Request) {
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
  const origin = req.headers.get('origin');
  try {
    if (origin && new URL(origin).host !== host) return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 204 });
  }
  const raw = (await req.text()).slice(0, 1024);
  try {
    recordHit(JSON.parse(raw) as { path?: unknown; ref?: unknown }, req.headers.get('user-agent') ?? '', host);
  } catch {
    // ungültiger Inhalt → still ignorieren
  }
  return new Response(null, { status: 204 });
}
