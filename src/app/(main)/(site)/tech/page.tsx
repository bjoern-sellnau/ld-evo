import type { Metadata } from 'next';
import { alternatesFor } from '@/site/seo/seo';
import { TechPage } from '@/site/pages/TechPage';

export const metadata: Metadata = { alternates: alternatesFor('/tech') };

export default function Page() {
  return <TechPage />;
}
