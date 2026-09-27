import type { ReactNode } from 'react';
import { ScrollChrome } from '@/site/chrome/ScrollChrome';
import { MobileMenu } from '@/site/nav/MobileMenu';
import { CookieBanner } from '@/site/overlays/CookieBanner';
import { KontaktPanel } from '@/site/overlays/KontaktPanel';
import { SearchOverlay } from '@/site/overlays/SearchOverlay';
import { SettingsPanel } from '@/site/overlays/SettingsPanel';
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
      <ScrollChrome />
      <CookieBanner />
      <SearchOverlay />
      <KontaktPanel />
      <SettingsPanel />
    </SiteProvider>
  );
}
