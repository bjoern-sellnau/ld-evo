import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // LD Flow: Medien-Uploads bis 10 MB über Server Actions.
  experimental: { serverActions: { bodySizeLimit: '11mb' } },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Nur die eigene Seite darf die Site einbetten (LD-Flow-Vorschau), sonst Clickjacking-Schutz.
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
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
  },
};

export default nextConfig;
