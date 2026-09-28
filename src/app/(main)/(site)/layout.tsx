import type { ReactNode } from 'react';
import { getSiteContent } from '@/cms/content';
import { ContentProvider } from '@/site/content/ContentProvider';
import { GlassDriver } from '@/site/glass/GlassDriver';
import { PhoneFrame } from '@/site/chrome/PhoneFrame';
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
import { Splash } from '@/site/splash/Splash';

export default function SiteLayout({ children }: { children: ReactNode }) {
  const content = getSiteContent();
  return (
    <ContentProvider value={content}>
      <SiteProvider>
        <Splash />
        {/* data-ld-vp: auf schmalen Bildschirmen erst sichtbar, wenn das Layout zur Breite passt (CLS-Schutz, site.css) */}
        <div data-ld-vp style={{ display: 'contents' }}>
          <SiteNav />
          <SitePage>{children}</SitePage>
          <MobileMenu />
          <MobileTabBar />
          <ScrollChrome />
        </div>
        <PhoneFrame />
        <CookieBanner />
        <SearchOverlay />
        <KontaktPanel />
        <SettingsPanel />
        <GlassDriver />
      </SiteProvider>
    </ContentProvider>
  );
}
