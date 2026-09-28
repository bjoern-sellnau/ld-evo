import type { Metadata } from 'next';
import { AboutPage } from '@/site/pages/AboutPage';
import { pageMeta } from '@/site/seo/seo';

export const metadata: Metadata = pageMeta({ title: 'Über mich — Loona! Designs', path: '/ueber-mich' });

export default function Page() {
  return <AboutPage />;
}
