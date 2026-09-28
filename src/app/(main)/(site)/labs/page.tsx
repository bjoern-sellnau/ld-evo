import type { Metadata } from 'next';
import { alternatesFor } from '@/site/seo/seo';
import { CatalogPage } from '@/site/pages/CatalogPage';

export const metadata: Metadata = { alternates: alternatesFor('/labs') };

export default function Page() {
  return <CatalogPage kind="labs" />;
}
