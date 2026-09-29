import type { ReactNode } from 'react';
import { RootDocument, rootMetadata, rootViewport } from '@/site/RootDocument';

// Deutsche Site (Wurzel). Englisch: src/app/(en)/layout.tsx — gemeinsamer Aufbau in src/site/RootDocument.tsx.
export const metadata = rootMetadata('de');
export const viewport = rootViewport;

export default function RootLayout({ children }: { children: ReactNode }) {
  return <RootDocument locale="de">{children}</RootDocument>;
}
