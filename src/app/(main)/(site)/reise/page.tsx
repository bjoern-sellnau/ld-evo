import type { Metadata } from 'next';
import { ReisePage } from '@/site/pages/ReisePage';
import { pageMeta } from '@/site/seo/seo';

export const metadata: Metadata = pageMeta({
  title: 'Meine Reise — Loona! Designs',
  description: 'Eine Reise durch 18 Jahre im Web — vom ersten <div> bis heute.',
  path: '/reise',
});

export default function Page() {
  return <ReisePage />;
}
