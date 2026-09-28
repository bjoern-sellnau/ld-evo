import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';

/**
 * Vorschaubild (Open Graph, 1200×630) je Projekt/Artikel — abgeleitet vom Handoff-Bild `og-image.png`
 * (design/design_handoff_loona_site, README §171): Farben per Pixel daraus übernommen, LD-Zeichen aus
 * src/components/brand/glyphs.tsx, Schrift Instrument Sans (Site-Schrift, lokal aus @fontsource, OFL).
 */
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

const C = { bg: '#171310', orange: '#ff7816', ink: '#f7f2ea', kicker: '#b3a78f' };

const font = (w: 400 | 700) =>
  readFile(
    path.join(
      /* turbopackIgnore: true */ process.cwd(),
      'node_modules/@fontsource/instrument-sans/files',
      `instrument-sans-latin-${w}-normal.woff`,
    ),
  );

export async function renderOg({ kicker, title, sub, accent }: { kicker: string; title: string; sub?: string; accent?: string }) {
  const [regular, bold] = await Promise.all([font(400), font(700)]);
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: C.bg, padding: '72px 88px' }}>
      {/* Farbband in der Cover-Farbe des Eintrags (wie Karte/Detail-Hero) */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 18, background: accent ?? C.orange }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
        <svg width={60} height={63} viewBox="0 0 44 46">
          <path d="M0 3H8V35H19L22 43H0Z" fill={C.orange} />
          <path d="M11 3H24A20 20 0 0 1 24 43H25L19 27H16V11H11ZM21 11H24A12 12 0 0 1 24 35L21 27Z" fill={C.orange} fillRule="evenodd" />
        </svg>
        <div style={{ display: 'flex', fontSize: 34, fontWeight: 700, color: C.ink }}>
          loona<span style={{ color: C.orange }}>!</span>&nbsp;designs
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto' }}>
        <div style={{ fontSize: 26, letterSpacing: 4, color: C.kicker, textTransform: 'uppercase' }}>{kicker}</div>
        <div style={{ fontSize: title.length > 48 ? 58 : 72, fontWeight: 700, color: C.ink, lineHeight: 1.08, marginTop: 14 }}>{title}</div>
        {sub && (
          <div style={{ fontSize: 28, color: C.kicker, marginTop: 20, lineHeight: 1.35 }}>
            {sub.length > 140 ? `${sub.slice(0, 137)}…` : sub}
          </div>
        )}
      </div>
    </div>,
    {
      ...OG_SIZE,
      fonts: [
        { name: 'Instrument Sans', data: regular, weight: 400, style: 'normal' },
        { name: 'Instrument Sans', data: bold, weight: 700, style: 'normal' },
      ],
    },
  );
}
