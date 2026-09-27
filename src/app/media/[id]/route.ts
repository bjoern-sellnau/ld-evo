import { readMedia } from '@/cms/repo';

/** Hochgeladene Medien aus LD Flow. IDs sind zufällig (96 Bit); Inhalte ändern sich nie → unbegrenzt cachebar. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const m = readMedia((await params).id);
  if (!m) return new Response('Not found', { status: 404 });
  return new Response(Buffer.from(m.bytes), {
    headers: {
      'Content-Type': m.mime,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
    },
  });
}
