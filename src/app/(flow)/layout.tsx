import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { spaceGrotesk } from '@/lib/fonts';
import { instrumentSans, jetbrainsMono } from '@/site/fonts';
import '@/cms/ui/flow.css';

// Eigenes Root-Layout für das CMS: keine Site-Styles/-Chrome, nie indexieren.
export const metadata: Metadata = {
  title: { default: 'LD Flow.', template: '%s · LD Flow.' },
  robots: { index: false, follow: false },
  icons: { icon: '/brand/flow/favicon.svg' },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0F0C16' };

export default function FlowLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de" className={`${instrumentSans.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable}`}>
      <body>{children}</body>
    </html>
  );
}
