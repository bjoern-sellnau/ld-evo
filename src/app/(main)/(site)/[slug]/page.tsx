import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPage, getPageSlugs } from '@/cms/content';
import { PageRenderer } from '@/site/cms/PageRenderer';
import { pageMeta } from '@/site/seo/seo';

// Frei angelegte LD-Flow-Seiten. Feste Routen (projekte, labs, …) haben Vorrang; neue Seiten rendern bei Bedarf.
export const generateStaticParams = () => getPageSlugs().map((slug) => ({ slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getPage((await params).slug);
  return p ? pageMeta({ title: `${p.title} — Loona! Designs`, description: p.description || undefined, path: `/${p.id}` }) : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const p = getPage((await params).slug);
  if (!p) notFound();
  return <PageRenderer key={p.id} page={p} />;
}
