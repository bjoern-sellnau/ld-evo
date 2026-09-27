import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ARTICLES, articleById } from '@content/articles';
import { ArticlePage } from '@/site/pages/ArticlePage';

export const dynamicParams = false;
export const generateStaticParams = () => ARTICLES.map((a) => ({ slug: a.id }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const a = articleById((await params).slug);
  // Entwürfe mit Platzhaltertext nicht indexieren.
  return a ? { title: `${a.titel} — .Tech`, description: a.teaser, robots: a.draft ? { index: false } : undefined } : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const a = articleById((await params).slug);
  if (!a) notFound();
  return <ArticlePage key={a.id} a={a} />;
}
