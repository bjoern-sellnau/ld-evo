import type { NextConfig } from 'next';

/**
 * STATIC_EXPORT=1: statische Vorschau der Website (GitHub Pages). Server-Teile (LD Flow, Medien-Route, Proxy)
 * entfernt vorher scripts/prepare-static-export.mjs — das CMS braucht einen Node-Server.
 */
const staticExport = process.env.STATIC_EXPORT === '1';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(staticExport && { output: 'export', basePath, trailingSlash: true, images: { unoptimized: true } }),
  // LD Flow: Medien-Uploads bis 10 MB über Server Actions (+ verkleinerte WebP-Varianten, siehe src/cms/media.ts).
  experimental: { serverActions: { bodySizeLimit: '24mb' } },
  // Header setzt beim statischen Export der Webserver (GitHub Pages) — Next unterstützt sie dort nicht.
  ...(staticExport ? {} : { headers }),
};

async function headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Nur die eigene Seite darf die Site einbetten (LD-Flow-Vorschau), sonst Clickjacking-Schutz.
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // HTTPS erzwingen (Schutz vor Downgrade/Man-in-the-Middle). Browser beachten es nur über HTTPS.
          // Bewusst ohne includeSubDomains/preload: andere Subdomains der Domain könnten (noch) HTTP nutzen.
          ...(process.env.NODE_ENV === 'production' ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000' }] : []),
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
      {
        source: '/flow/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
        ],
      },
      { source: '/flow-preview/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
      // Hochgeladene Medien: nie als Dokument mit Skripten ausführen (letzte Regel gewinnt bei gleichem Header).
      { source: '/media/:path*', headers: [{ key: 'Content-Security-Policy', value: "default-src 'none'; sandbox" }] },
    ];
}

export default nextConfig;
