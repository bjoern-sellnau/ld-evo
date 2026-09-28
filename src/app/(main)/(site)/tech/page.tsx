import type { Metadata } from 'next';
import { absUrl } from '@/site/seo/seo';
import { TechPage } from '@/site/pages/TechPage';

export const metadata: Metadata = { alternates: { canonical: absUrl('/tech') } };

export default function Page() {
  return <TechPage />;
}
