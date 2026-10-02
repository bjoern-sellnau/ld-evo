import { submitContact } from '@/cms/contact';

export const dynamic = 'force-dynamic';

/**
 * Kontaktformular-Widget → hier. Nur JSON, nur von der eigenen Site (Origin-Prüfung), höchstens 20 KB.
 * Liegt in der (flow)-Gruppe, damit der statische Export (GitHub Pages) die Route mit entfernt.
 */
export async function POST(req: Request) {
  const origin = req.headers.get('origin');
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
  const sameSite = (() => {
    try {
      return new URL(origin!).host === host;
    } catch {
      return false; // z. B. „Origin: null“
    }
  })();
  if (origin && !sameSite) return Response.json({ ok: false, error: 'Ungültige Herkunft.' }, { status: 403 });
  if (!(req.headers.get('content-type') ?? '').startsWith('application/json'))
    return Response.json({ ok: false, error: 'Ungültige Anfrage.' }, { status: 415 });
  const raw = await req.text();
  if (raw.length > 20_000) return Response.json({ ok: false, error: 'Nachricht zu lang.' }, { status: 413 });
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return Response.json({ ok: false, error: 'Ungültige Anfrage.' }, { status: 400 });
  }
  const res = await submitContact((body && typeof body === 'object' ? body : {}) as Record<string, unknown>);
  return Response.json(res, { status: res.ok ? 200 : 400 });
}
