import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/cms/auth';
import { getDoc, workingCopy } from '@/cms/repo';
import { COLLECTIONS } from '@/cms/schema';
import type { Locale } from '@/site/i18n/locale';
import { PreviewClient } from './PreviewClient';

type Params = { params: Promise<{ collection: string; id: string }> };

/**
 * Entwurfsvorschau für LD Flow — nur für angemeldete Redakteur:innen, sonst 404. Deutsch unter /flow-preview,
 * Englisch unter /en/flow-preview (englisches Site-Gerüst, <html lang="en">). Gibt es noch keine englische Fassung,
 * zeigt die Vorschau die deutsche Arbeitskopie als Ausgangspunkt (wie der Editor).
 */
export function previewRoute(locale: Locale) {
  return async function Page({ params }: Params) {
    const { collection, id } = await params;
    if (!COLLECTIONS[collection] || !(await getCurrentUser())) notFound();
    const row = (await getDoc(collection, id, locale)) ?? (locale === 'de' ? null : await getDoc(collection, id, 'de'));
    if (!row) notFound();
    const own = locale === 'de' || row.draft || row.published ? row : await getDoc(collection, id, 'de');
    return <PreviewClient collection={collection} initial={{ ...workingCopy(own ?? row), id }} />;
  };
}
