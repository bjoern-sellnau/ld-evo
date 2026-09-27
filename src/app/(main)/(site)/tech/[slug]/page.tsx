import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSiteContent } from '@/cms/content';
import { ArticlePage } from '@/site/pages/ArticlePage';

const byId = (id: string) => getSiteContent().articles.find((a) => a.id === id);

export const generateStaticParams = () => getSiteContent().articles.map((a) => ({ slug: a.id }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const a = byId((await params).slug);
  // Entwürfe mit Platzhaltertext nicht indexieren.
  return a ? { title: `${a.titel} — .Tech`, description: a.teaser, robots: a.draft ? { index: false } : undefined } : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const a = byId((await params).slug);
  if (!a) notFound();
  return <ArticlePage key={a.id} a={a} />;
}
