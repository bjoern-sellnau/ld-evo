import type { ReactNode } from 'react';
import { getSiteContent } from '@/cms/content';
import { ContentProvider } from '@/site/content/ContentProvider';
import { GlassDriver } from '@/site/glass/GlassDriver';
import { PhoneFrame } from '@/site/chrome/PhoneFrame';
import { ScrollChrome } from '@/site/chrome/ScrollChrome';
import { LocaleProvider } from '@/site/i18n/LocaleProvider';
import type { Locale } from '@/site/i18n/locale';
import { MobileMenu } from '@/site/nav/MobileMenu';
import { CookieBanner } from '@/site/overlays/CookieBanner';
import { KontaktPanel } from '@/site/overlays/KontaktPanel';
import { SearchOverlay } from '@/site/overlays/SearchOverlay';
import { SettingsPanel } from '@/site/overlays/SettingsPanel';
import { MobileTabBar } from '@/site/nav/MobileTabBar';
import { MobileChrome2 } from '@/site/nav/MobileChrome2';
import { SiteNav } from '@/site/nav/SiteNav';
import { SitePage } from '@/site/SitePage';
import { SiteProvider } from '@/site/settings/SiteProvider';
import { Splash } from '@/site/splash/Splash';

/** Gerüst der Site (Navigation, Overlays, Inhalte aus LD Flow) — für jede Sprache gleich, Inhalte je Sprache. */
export function SiteShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  const content = getSiteContent(locale);
  return (
    <LocaleProvider locale={locale}>
      <ContentProvider value={content}>
        <SiteProvider>
          <Splash />
          {/* data-ld-vp: auf schmalen Bildschirmen erst sichtbar, wenn das Layout zur Breite passt (CLS-Schutz, site.css) */}
          <div data-ld-vp style={{ display: 'contents' }}>
            <SiteNav />
            <SitePage>{children}</SitePage>
            <MobileMenu />
            <MobileTabBar />
            <MobileChrome2 />
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
    </LocaleProvider>
  );
}
