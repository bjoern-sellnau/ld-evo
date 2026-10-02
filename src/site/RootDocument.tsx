import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { spaceGrotesk } from '@/lib/fonts';
import { siteIcons } from '@/lib/site-icons';
import { instrumentSans, jetbrainsMono } from '@/site/fonts';
import { translate } from '@/site/i18n/dict';
import { htmlLang, ogLocale, type Locale } from '@/site/i18n/locale';
import { feedAlternate, metadataBase } from '@/site/seo/seo';
import { BRAND_THEME_COLOR, THEME_BOOT_SCRIPT } from '@/site/settings/applyBody';
import '@/styles/globals.css';
import '@/site/styles/site.css';

/**
 * Root-Dokument der Site je Sprache: Deutsch = src/app/(main)/layout.tsx, Englisch = src/app/(en)/layout.tsx.
 * Zwei Root-Layouts, damit <html lang> schon im Server-HTML stimmt (Screenreader, Suchmaschinen, Silbentrennung).
 */

const { ogImage, ...icons } = siteIcons();

// Titel/Beschreibung aus dem <helmet> des Site-Prototyps (englisch: Übersetzungsentwurf).
export function rootMetadata(locale: Locale): Metadata {
  const t = (k: Parameters<typeof translate>[1]) => translate(locale, k);
  return {
    metadataBase: metadataBase(),
    title: t('seo.siteTitle'),
    description: t('seo.siteDescription'),
    applicationName: 'Loona! Designs',
    ...icons,
    openGraph: {
      title: t('seo.ogTitle'),
      description: t('seo.ogDescription'),
      siteName: 'Loona! Designs',
      locale: ogLocale(locale),
      type: 'website',
      ...(ogImage && { images: [{ url: ogImage, width: 1200, height: 630 }] }),
    },
    twitter: { card: 'summary_large_image' },
    // RSS des .Tech-Blogs — Browser und Feed-Reader finden ihn über das <link rel="alternate">.
    alternates: { types: feedAlternate(locale) },
  };
}

// Default Marken-Ink; per Einstellung „Browser-Farbe“ (ld-themecolor) auf den Seitenhintergrund umschaltbar.
export const rootViewport: Viewport = {
  themeColor: BRAND_THEME_COLOR,
};

export function RootDocument({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <html lang={htmlLang(locale)} className={`${spaceGrotesk.variable} ${instrumentSans.variable} ${jetbrainsMono.variable}`}>
      {/* Body-Klassen (light, still, …) setzen Boot-Script und SiteProvider — daher suppressHydrationWarning. */}
      <body suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        {/* Ohne JavaScript nie verstecken (CLS-Schutz in site.css wartet sonst auf den Browser-Teil) */}
        <noscript>
          <style>{'[data-ld-vp]{visibility:visible!important}'}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
