import { revalidatePath } from 'next/cache';
import { maintenanceDue, runMaintenance } from '@/cms/maintenance';
import { checkCronSecret, runDuePublications } from '@/cms/scheduler';

export const dynamic = 'force-dynamic';

const G = globalThis as { __ldflowFreshStart?: boolean };

/**
 * Zeitplan-Takt: veröffentlicht fällige Entwürfe und erneuert danach die Site; stündlich zusätzlich Aufräumen
 * (src/cms/maintenance.ts). Nur mit geheimem Header (`x-ldflow-cron`) — ohne passenden Wert 404, damit die Route
 * von außen nicht auffällt.
 */
export async function POST(req: Request) {
  if (!checkCronSecret(req.headers.get('x-ldflow-cron'))) return new Response('Not found', { status: 404 });
  const res = runDuePublications();
  // Erster Takt nach dem Start: Die Seiten wurden beim Build vorgerendert — womöglich mit einer anderen Datenbank
  // (z. B. Docker-Build ohne Produktionsdaten). Einmal alles erneuern, damit die Site sicher den aktuellen Stand zeigt.
  const fresh = !G.__ldflowFreshStart;
  G.__ldflowFreshStart = true;
  if (fresh || res.published.length) revalidatePath('/', 'layout');
  const cleaned = maintenanceDue() ? runMaintenance() : null;
  return Response.json({ ...res, cleaned });
}

/** Auch GET unauffällig beantworten (sonst verriete 405, dass es die Route gibt). */
export function GET() {
  return new Response('Not found', { status: 404 });
}
