import type { ReactNode } from 'react';
import { MobileMenu } from '@/site/nav/MobileMenu';
import { MobileTabBar } from '@/site/nav/MobileTabBar';
import { SiteNav } from '@/site/nav/SiteNav';
import { SitePage } from '@/site/SitePage';
import { SiteProvider } from '@/site/settings/SiteProvider';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <SiteProvider>
      <SiteNav />
      <SitePage>{children}</SitePage>
      <MobileMenu />
      <MobileTabBar />
    </SiteProvider>
  );
}
