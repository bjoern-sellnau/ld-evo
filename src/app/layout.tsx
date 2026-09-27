import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { spaceGrotesk } from '@/lib/fonts';
import { siteIcons } from '@/lib/site-icons';
import { instrumentSans, jetbrainsMono } from '@/site/fonts';
import { BRAND_THEME_COLOR, THEME_BOOT_SCRIPT } from '@/site/settings/applyBody';
import '@/styles/globals.css';
import '@/site/styles/site.css';

const { ogImage, ...icons } = siteIcons();

// Titel/Beschreibung aus dem <helmet> des Site-Prototyps.
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'Loona! Designs — Björn Sellnau · Senior Full-Stack Engineer',
  description:
    'Das Web. Meine Leidenschaft. Björn Sellnau — Senior Full-Stack / Software Engineer (React, TypeScript, Web & Mobile) aus Berlin. Projekte, Labs & .Tech-Blog.',
  applicationName: 'Loona! Designs',
  ...icons,
  openGraph: {
    title: 'Loona! Designs — Björn Sellnau',
    description: 'Senior Full-Stack Engineer — React, TypeScript, Web & Mobile. Projekte, Labs und der .Tech-Blog.',
    siteName: 'Loona! Designs',
    locale: 'de_DE',
    type: 'website',
    ...(ogImage && { images: [{ url: ogImage, width: 1200, height: 630 }] }),
  },
  twitter: { card: 'summary_large_image' },
};

// Default Marken-Ink; per Einstellung „Browser-Farbe“ (ld-themecolor) auf den Seitenhintergrund umschaltbar.
export const viewport: Viewport = {
  themeColor: BRAND_THEME_COLOR,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de" className={`${spaceGrotesk.variable} ${instrumentSans.variable} ${jetbrainsMono.variable}`}>
      {/* Body-Klassen (light, still, …) setzen Boot-Script und SiteProvider — daher suppressHydrationWarning. */}
      <body suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        {children}
      </body>
    </html>
  );
}
