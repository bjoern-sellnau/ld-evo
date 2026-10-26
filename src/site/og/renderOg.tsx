import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { LOONA_ZEICHEN } from '@/components/brand/products';

/**
 * Vorschaubild (Open Graph, 1200×630) je Projekt/Artikel — abgeleitet vom Handoff-Bild `og-image.png`
 * (design/design_handoff_loona_site, README §171): Farben per Pixel daraus übernommen, Schrift Instrument Sans
 * (Site-Schrift, lokal aus @fontsource, OFL). Kopf: Zeichen + Wortmarke des Brand-Systems 2026-10
 * (LOONA_ZEICHEN; „loona! designs“ in Manrope 800/500, −0,035 em, einfarbig — lokal aus @fontsource, OFL).
 */
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

const C = { bg: '#171310', orange: '#ff7816', ink: '#f7f2ea', kicker: '#b3a78f' };

const font = (family: 'instrument-sans' | 'manrope', w: 400 | 500 | 700 | 800) =>
  readFile(
    path.join(/* turbopackIgnore: true */ process.cwd(), `node_modules/@fontsource/${family}/files`, `${family}-latin-${w}-normal.woff`),
  );

export async function renderOg({ kicker, title, sub, accent }: { kicker: string; title: string; sub?: string; accent?: string }) {
  const [regular, bold, word5, word8] = await Promise.all([
    font('instrument-sans', 400),
    font('instrument-sans', 700),
    font('manrope', 500),
    font('manrope', 800),
  ]);
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: C.bg, padding: '72px 88px' }}>
      {/* Farbband in der Cover-Farbe des Eintrags (wie Karte/Detail-Hero) */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 18, background: accent ?? C.orange }} />
      {/* Lockup wie Brand Guide S. 07: Zeichen-Kontur = 69/64 der Schriftgröße, Abstand 0.46 · Zeichenhöhe */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 17 }}>
        <svg width={43} height={37} viewBox={`${LOONA_ZEICHEN.box.x} ${LOONA_ZEICHEN.box.y} ${LOONA_ZEICHEN.box.w} ${LOONA_ZEICHEN.box.h}`}>
          <path d={LOONA_ZEICHEN.l} fill={C.orange} />
          <path d={LOONA_ZEICHEN.moon} fill={C.orange} />
        </svg>
        <div style={{ display: 'flex', fontFamily: 'Manrope', fontSize: 34, fontWeight: 800, letterSpacing: '-0.035em', color: C.ink }}>
          loona!&nbsp;<span style={{ fontWeight: 500 }}>designs</span>
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
        { name: 'Manrope', data: word5, weight: 500, style: 'normal' },
        { name: 'Manrope', data: word8, weight: 800, style: 'normal' },
      ],
    },
  );
}
