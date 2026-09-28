import type { Metadata } from 'next';
import { alternatesFor } from '@/site/seo/seo';
import { CatalogPage } from '@/site/pages/CatalogPage';

export const metadata: Metadata = { alternates: alternatesFor('/projekte') };

export default function Page() {
  return <CatalogPage kind="projekte" />;
}
