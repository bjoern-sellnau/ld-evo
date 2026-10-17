/**
 * Wetter Berlin für die Hero-Animation „Wetter Berlin“ (src/site/hero/extra/renderers2.ts). Der SERVER fragt
 * Open-Meteo (frei, ohne Schlüssel) — Besucher sprechen nur mit dieser Site, ihre Daten gehen nicht an Dritte.
 * Zwischengespeichert 30 Minuten; bei Fehlern { ok: false } (die Animation zeigt dann ruhige Wolken ohne Werte).
 * Im statischen Export (GitHub Pages) gibt es die Route nicht — gleiches Verhalten wie bei einem Fehler.
 */
export const revalidate = 1800;

const URL_BERLIN =
  'https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.405&current=temperature_2m,weather_code,is_day,wind_speed_10m&timezone=Europe%2FBerlin';

export async function GET() {
  try {
    const r = await fetch(URL_BERLIN, { next: { revalidate: 1800 }, signal: AbortSignal.timeout(4000) });
    if (!r.ok) throw new Error(String(r.status));
    const d = (await r.json()) as {
      current?: { temperature_2m?: number; weather_code?: number; is_day?: number; wind_speed_10m?: number };
    };
    const c = d.current ?? {};
    if (typeof c.temperature_2m !== 'number' || typeof c.weather_code !== 'number') throw new Error('Format');
    return Response.json(
      { ok: true, t: c.temperature_2m, code: c.weather_code, day: c.is_day === 1, wind: c.wind_speed_10m ?? 0 },
      { headers: { 'Cache-Control': 'public, max-age=900' } },
    );
  } catch {
    return Response.json({ ok: false }, { headers: { 'Cache-Control': 'public, max-age=300' } });
  }
}
