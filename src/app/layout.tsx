import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { spaceGrotesk } from '@/lib/fonts';
import { siteIcons } from '@/lib/site-icons';
import { LOONA_NEUTRALS } from '@/components/brand';
import '@/styles/globals.css';

const { ogImage, ...icons } = siteIcons();

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'Loona! Designs — Bjoern Sellnau',
  applicationName: 'Loona! Designs',
  ...icons,
  openGraph: {
    title: 'Loona! Designs — Bjoern Sellnau',
    siteName: 'Loona! Designs',
    locale: 'de_DE',
    type: 'website',
    ...(ogImage && { images: [{ url: ogImage, width: 1200, height: 630 }] }),
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: LOONA_NEUTRALS.ink,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de" className={spaceGrotesk.variable}>
      <body>{children}</body>
    </html>
  );
}
