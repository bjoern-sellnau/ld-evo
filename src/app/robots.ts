import type { MetadataRoute } from 'next';
import { absUrl } from '@/site/seo/seo';

export const dynamic = 'force-static';

/** LD Flow, Vorschau, Kontakt- und Zeitplan-Endpunkte nie crawlen (zusätzlich X-Robots-Tag/noindex dort). */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/flow', '/flow-preview/', '/api/', '/flow-cron'] },
    sitemap: absUrl('/sitemap.xml'),
  };
}
