import type { ReactNode } from 'react';
import { RootDocument, rootMetadata, rootViewport } from '@/site/RootDocument';

// Englische Site unter /en — eigenes Root-Layout für <html lang="en"> (Aufbau in src/site/RootDocument.tsx).
export const metadata = rootMetadata('en');
export const viewport = rootViewport;

export default function RootLayout({ children }: { children: ReactNode }) {
  return <RootDocument locale="en">{children}</RootDocument>;
}
