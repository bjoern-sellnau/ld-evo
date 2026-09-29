import type { ReactNode } from 'react';
import { SiteShell } from '@/site/SiteShell';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteShell locale="de">{children}</SiteShell>;
}
