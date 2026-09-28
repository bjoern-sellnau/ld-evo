import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSiteContent } from '@/cms/content';
import { ArticlePage } from '@/site/pages/ArticlePage';
import { PERSON, absUrl, isoMonth, pageMeta } from '@/site/seo/seo';
import { JsonLd } from '@/site/seo/JsonLd';

const byId = (id: string) => getSiteContent().articles.find((a) => a.id === id);

export const generateStaticParams = () => getSiteContent().articles.map((a) => ({ slug: a.id }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const a = byId((await params).slug);
  // Entwürfe mit Platzhaltertext nicht indexieren.
  return a
    ? pageMeta({ title: `${a.titel} — .Tech`, description: a.teaser, path: `/tech/${a.id}`, type: 'article', noindex: a.draft })
    : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const a = byId((await params).slug);
  if (!a) notFound();
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: a.titel,
          description: a.teaser,
          url: absUrl(`/tech/${a.id}`),
          datePublished: isoMonth(a.datum),
          articleSection: a.kat,
          inLanguage: 'de',
          author: PERSON,
        }}
      />
      <ArticlePage key={a.id} a={a} />
    </>
  );
}
