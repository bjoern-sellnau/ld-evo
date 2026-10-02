/**
 * Läuft einmal beim Serverstart (Next.js Instrumentation). Startet den Takt für geplantes Veröffentlichen und Aufräumen:
 * jede Minute ein POST auf /flow-cron im eigenen Prozess — dort laufen Veröffentlichen und revalidatePath im
 * normalen Request-Kontext. Abschalten mit LDFLOW_SCHEDULER=0 (z. B. wenn ein externer Cron die Route aufruft).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.LDFLOW_SCHEDULER === '0') return;
  const { cronSecret } = await import('./cms/scheduler');
  const every = Math.max(1000, Number(process.env.LDFLOW_SCHEDULER_INTERVAL_MS) || 60_000);
  const tick = async () => {
    // Port setzt `next start`/`next dev` erst nach dem Start → bei jedem Takt neu lesen.
    const base = process.env.LDFLOW_CRON_URL ?? `http://127.0.0.1:${process.env.PORT ?? 3000}`;
    try {
      await fetch(`${base}/flow-cron`, { method: 'POST', headers: { 'x-ldflow-cron': cronSecret() }, cache: 'no-store' });
    } catch {
      // Server noch nicht bereit oder kurz weg — nächster Takt versucht es erneut.
    }
  };
  setInterval(() => void tick(), every).unref();
  // Erster Takt kurz nach dem Start (erneuert u. a. die beim Build vorgerenderten Seiten, siehe /flow-cron).
  setTimeout(() => void tick(), 3000).unref();
}

/**
 * Serverfehler (Seiten, Route-Handler, Server Actions) in den Fehler-Eingang von LD Flow schreiben
 * (src/cms/errors.ts). Next protokolliert sie weiterhin selbst.
 */
export async function onRequestError(
  error: unknown,
  request: Readonly<{ path: string; method: string }>,
  context: Readonly<{ routePath: string; routeType: string }>,
) {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  const { recordError } = await import('./cms/errors');
  recordError(error, { path: request.path, method: request.method, route: context.routePath, kind: context.routeType });
}
