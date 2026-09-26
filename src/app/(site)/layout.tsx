import type { ReactNode } from 'react';
import { SiteNav } from '@/site/nav/SiteNav';
import { SitePage } from '@/site/SitePage';
import { SiteProvider } from '@/site/settings/SiteProvider';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <SiteProvider>
      <SiteNav />
      <SitePage>{children}</SitePage>
    </SiteProvider>
  );
}
