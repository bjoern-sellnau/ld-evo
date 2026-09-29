import type { MetadataRoute } from 'next';
import { getSiteContent, isFallback } from '@/cms/content';
import { localizePath } from '@/site/i18n/locale';
import { absUrl, isoMonth } from '@/site/seo/seo';

// Wird beim Build erzeugt und nach dem Veröffentlichen (revalidatePath('/', 'layout')) neu gebaut.
export const dynamic = 'force-static';

/**
 * Alle öffentlichen Seiten aus den veröffentlichten Inhalten. Entwürfe (.Tech „draft“) bleiben draußen.
 * Mehrsprachig: Deutsch immer; Englisch nur, wo es eine echte Übersetzung gibt (sonst wäre /en ein deutscher
 * Rückfall mit noindex) — dann gegenseitig verknüpft (hreflang, Google „Sitemap mit alternate“).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const de = getSiteContent('de');
  const en = getSiteContent('en');
  const month = (d: string) => {
    const m = isoMonth(d);
    return m ? new Date(`${m.length === 4 ? `${m}-01` : m}-01T00:00:00Z`) : undefined;
  };
  const entries: { path: string; translated: boolean; lastModified?: Date; priority: number; changeFrequency?: 'monthly' }[] = [];
  const all = (docs: unknown[]) => !docs.some(isFallback);
  const enProject = (id: string) => en.projects.find((p) => p.id === id);
  const enArticle = (id: string) => en.articles.find((a) => a.id === id);
  entries.push(
    { path: '/', translated: all([en.home]), priority: 1, changeFrequency: 'monthly' },
    { path: '/projekte', translated: all(en.projects.filter((p) => p.kind !== 'labs')), priority: 0.7, changeFrequency: 'monthly' },
    { path: '/labs', translated: all(en.projects.filter((p) => p.kind === 'labs')), priority: 0.7, changeFrequency: 'monthly' },
    { path: '/tech', translated: all(en.articles), priority: 0.7, changeFrequency: 'monthly' },
    { path: '/reise', translated: all(en.journey), priority: 0.7, changeFrequency: 'monthly' },
    { path: '/ueber-mich', translated: all([en.about]), priority: 0.7, changeFrequency: 'monthly' },
    { path: '/impressum', translated: all([en.imprint]), priority: 0.7, changeFrequency: 'monthly' },
    ...de.projects.map((p) => ({
      path: `/${p.kind === 'labs' ? 'labs' : 'projekte'}/${p.id}`,
      translated: !!enProject(p.id) && !isFallback(enProject(p.id)),
      lastModified: month(p.datum),
      priority: 0.6,
    })),
    ...de.articles
      .filter((a) => !a.draft)
      .map((a) => ({
        path: `/tech/${a.id}`,
        translated: !!enArticle(a.id) && !isFallback(enArticle(a.id)),
        lastModified: month(a.datum),
        priority: 0.6,
      })),
    // Frei angelegte Seiten gibt es nur im Server-Betrieb (der statische Export entfernt /[slug]).
    ...(process.env.STATIC_EXPORT ? [] : de.pages.map((p) => ({ path: `/${p.id}`, translated: false, priority: 0.5 }))),
  );
  return entries.flatMap(({ path, translated, ...rest }) => {
    const deUrl = absUrl(path);
    const enUrl = absUrl(localizePath(path, 'en'));
    const alternates = translated ? { alternates: { languages: { de: deUrl, en: enUrl } } } : {};
    return [{ url: deUrl, ...rest, ...alternates }, ...(translated ? [{ url: enUrl, ...rest, ...alternates }] : [])];
  });
}
