import type { MetadataRoute } from 'next';
import { getSiteContent } from '@/cms/content';
import { absUrl, isoMonth } from '@/site/seo/seo';

// Wird beim Build erzeugt und nach dem Veröffentlichen (revalidatePath('/', 'layout')) neu gebaut.
export const dynamic = 'force-static';

/** Alle öffentlichen Seiten aus den veröffentlichten Inhalten. Entwürfe (.Tech „draft“) bleiben draußen. */
export default function sitemap(): MetadataRoute.Sitemap {
  const c = getSiteContent();
  const month = (d: string) => {
    const m = isoMonth(d);
    return m ? new Date(`${m.length === 4 ? `${m}-01` : m}-01T00:00:00Z`) : undefined;
  };
  const fixed = ['/', '/projekte', '/labs', '/tech', '/reise', '/ueber-mich', '/impressum'];
  return [
    ...fixed.map((p) => ({ url: absUrl(p), changeFrequency: 'monthly' as const, priority: p === '/' ? 1 : 0.7 })),
    ...c.projects.map((p) => ({
      url: absUrl(`/${p.kind === 'labs' ? 'labs' : 'projekte'}/${p.id}`),
      lastModified: month(p.datum),
      priority: 0.6,
    })),
    ...c.articles.filter((a) => !a.draft).map((a) => ({ url: absUrl(`/tech/${a.id}`), lastModified: month(a.datum), priority: 0.6 })),
    // Frei angelegte Seiten gibt es nur im Server-Betrieb (der statische Export entfernt /[slug]).
    ...(process.env.STATIC_EXPORT ? [] : c.pages.map((p) => ({ url: absUrl(`/${p.id}`), priority: 0.5 }))),
  ];
}
