import type { Metadata } from 'next';
import { absUrl } from '@/site/seo/seo';
import { CatalogPage } from '@/site/pages/CatalogPage';

export const metadata: Metadata = { alternates: { canonical: absUrl('/labs') } };

export default function Page() {
  return <CatalogPage kind="labs" />;
}
