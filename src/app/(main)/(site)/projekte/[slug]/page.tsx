import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PROJECTS } from '@content/projects';
import { CaseStudyPage } from '@/site/pages/CaseStudyPage';

// Labs unter /labs, Projekte und Archiv unter /projekte (src/site/lib/routes.ts).
const ITEMS = PROJECTS.filter((p) => p.kind !== 'labs');

export const dynamicParams = false;
export const generateStaticParams = () => ITEMS.map((p) => ({ slug: p.id }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = ITEMS.find((x) => x.id === slug);
  return p ? { title: `${p.name} — Loona! Designs`, description: p.desc } : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = ITEMS.find((x) => x.id === slug);
  if (!p) notFound();
  return <CaseStudyPage key={p.id} p={p} />;
}
