import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/cms/auth';
import { getDoc, workingCopy } from '@/cms/repo';
import { COLLECTIONS } from '@/cms/schema';
import { PreviewClient } from '@/site/cms/PreviewClient';

export const metadata = { robots: { index: false, follow: false } };

/** Entwurfsvorschau für LD Flow — nur für angemeldete Redakteur:innen, sonst 404. */
export default async function Page({ params }: { params: Promise<{ collection: string; id: string }> }) {
  const { collection, id } = await params;
  if (!COLLECTIONS[collection] || !(await getCurrentUser())) notFound();
  const row = await getDoc(collection, id);
  if (!row) notFound();
  return <PreviewClient collection={collection} initial={{ ...workingCopy(row), id }} />;
}
