import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import '@/orbit/orbit.css';

// Eigenes Root-Layout: Die Wallpaper-Styles setzen html/body global (overflow hidden, schwarz) und dürfen die Site nicht berühren.
const inter = Inter({ subsets: ['latin'], weight: ['200', '300', '400', '500', '900'], variable: '--orbit-inter', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400'], variable: '--orbit-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'ORBIT OS · Wallpapers',
  description: 'Dreizehn interaktive GPU-Shader-Wallpapers, die auf Cursor und Klicks reagieren.',
  icons: { icon: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/favicon.svg` },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#000000' };

export default function OrbitLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
