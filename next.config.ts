import type { NextConfig } from 'next';

/**
 * STATIC_EXPORT=1: statische Vorschau der Website (GitHub Pages). Server-Teile (LD Flow, Medien-Route, Proxy)
 * entfernt vorher scripts/prepare-static-export.mjs — das CMS braucht einen Node-Server.
 */
const staticExport = process.env.STATIC_EXPORT === '1';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Im statischen Export gibt es keine API — der Besucherzähler bleibt dann aus (src/site/stats/useHitCounter.ts).
  env: { NEXT_PUBLIC_STATIC_EXPORT: staticExport ? '1' : '' },
  ...(staticExport && { output: 'export', basePath, trailingSlash: true, images: { unoptimized: true } }),
  // LD Flow: Medien-Uploads bis 10 MB über Server Actions (+ verkleinerte WebP-Varianten, siehe src/cms/media.ts).
  experimental: { serverActions: { bodySizeLimit: '24mb' } },
  // Header setzt beim statischen Export der Webserver (GitHub Pages) — Next unterstützt sie dort nicht.
  ...(staticExport ? {} : { headers }),
};

/**
 * Grundpolicy der öffentlichen Site. Statisch vorgerendert → keine Nonces möglich (sonst kein Static/ISR); daher
 * 'unsafe-inline' für Next-Inline-Skripte und den Theme-Boot, aber keine fremden Skriptquellen, kein <object>,
 * <base> und Formulare nur zur eigenen Seite. LD Flow + Vorschau bekommen die strenge Nonce-Policy im Proxy
 * (src/cms/csp.ts) und sind hier ausgenommen.
 */
const dev = process.env.NODE_ENV === 'development';
const SITE_CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // Nur die eigene Seite darf die Site einbetten (LD-Flow-Vorschau), sonst Clickjacking-Schutz.
  "frame-ancestors 'self'",
].join('; ');

async function headers() {
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        // HTTPS erzwingen (Schutz vor Downgrade/Man-in-the-Middle). Browser beachten es nur über HTTPS.
        // Bewusst ohne includeSubDomains/preload: andere Subdomains der Domain könnten (noch) HTTP nutzen.
        ...(process.env.NODE_ENV === 'production' ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000' }] : []),
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      ],
    },
    // CSP der Site: alles außer LD Flow (/flow, /flow/…), Vorschau (/flow-preview/…, /en/flow-preview/…) und Medien.
    { source: '/((?!flow$|flow/|flow-preview/|en/flow-preview/|media/).*)', headers: [{ key: 'Content-Security-Policy', value: SITE_CSP }] },
    {
      source: '/flow/:path*',
      headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
    },
    { source: '/flow-preview/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
    { source: '/en/flow-preview/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
    // Hochgeladene Medien: nie als Dokument mit Skripten ausführen (Inline-Styles nur für die Bildansicht des Browsers).
    {
      source: '/media/:path*',
      headers: [{ key: 'Content-Security-Policy', value: "default-src 'none'; style-src 'unsafe-inline'; sandbox" }],
    },
  ];
}

export default nextConfig;
