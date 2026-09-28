import { revalidatePath } from 'next/cache';
import { checkCronSecret, runDuePublications } from '@/cms/scheduler';

export const dynamic = 'force-dynamic';

/**
 * Zeitplan-Takt: veröffentlicht fällige Entwürfe und erneuert danach die Site. Nur mit geheimem Header
 * (`x-ldflow-cron`) — ohne passenden Wert 404, damit die Route von außen nicht auffällt.
 */
export async function POST(req: Request) {
  if (!checkCronSecret(req.headers.get('x-ldflow-cron'))) return new Response('Not found', { status: 404 });
  const res = runDuePublications();
  if (res.published.length) revalidatePath('/', 'layout');
  return Response.json(res);
}

/** Auch GET unauffällig beantworten (sonst verriete 405, dass es die Route gibt). */
export function GET() {
  return new Response('Not found', { status: 404 });
}
