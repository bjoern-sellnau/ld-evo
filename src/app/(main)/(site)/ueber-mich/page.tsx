import type { Metadata } from 'next';
import { AboutPage } from '@/site/pages/AboutPage';

export const metadata: Metadata = { title: 'Über mich — Loona! Designs' };

export default function Page() {
  return <AboutPage />;
}
