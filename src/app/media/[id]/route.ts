import { readMedia } from '@/cms/repo';

/** Hochgeladene Medien aus LD Flow. IDs sind zufällig (96 Bit); Inhalte ändern sich nie → unbegrenzt cachebar. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  // ?w=<breite>: verkleinerte WebP-Variante (siehe src/cms/media.ts); unbekannt/ungültig → Original.
  const w = Number(new URL(req.url).searchParams.get('w'));
  const m = readMedia((await params).id, Number.isInteger(w) && w > 0 && w <= 10000 ? w : undefined);
  if (!m) return new Response('Not found', { status: 404 });
  return new Response(Buffer.from(m.bytes), {
    headers: {
      'Content-Type': m.mime,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    },
  });
}
