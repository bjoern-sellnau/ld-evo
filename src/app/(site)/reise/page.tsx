import type { Metadata } from 'next';
import { ReisePage } from '@/site/pages/ReisePage';

export const metadata: Metadata = {
  title: 'Meine Reise — Loona! Designs',
  description: 'Eine Reise durch 18 Jahre im Web — vom ersten <div> bis heute.',
};

export default function Page() {
  return <ReisePage />;
}
