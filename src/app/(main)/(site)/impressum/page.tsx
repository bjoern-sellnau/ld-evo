import type { Metadata } from 'next';
import { ImprintPage } from '@/site/pages/ImprintPage';
import { pageMeta } from '@/site/seo/seo';

export const metadata: Metadata = pageMeta({ title: 'Impressum & Datenschutz — Loona! Designs', path: '/impressum' });

export default function Page() {
  return <ImprintPage />;
}
