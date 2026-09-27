import type { Metadata } from 'next';
import { ImprintPage } from '@/site/pages/ImprintPage';

export const metadata: Metadata = { title: 'Impressum & Datenschutz — Loona! Designs' };

export default function Page() {
  return <ImprintPage />;
}
