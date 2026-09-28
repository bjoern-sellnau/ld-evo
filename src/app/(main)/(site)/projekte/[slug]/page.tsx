import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSiteContent } from '@/cms/content';
import { CaseStudyPage } from '@/site/pages/CaseStudyPage';
import { PERSON, absUrl, isoMonth, pageMeta } from '@/site/seo/seo';
import { JsonLd } from '@/site/seo/JsonLd';

// Projekte und Archiv unter /projekte (src/site/lib/routes.ts). Inhalte aus LD Flow; neue Einträge werden bei Bedarf gerendert.
const items = () => getSiteContent().projects.filter((p) => p.kind !== 'labs');

export const generateStaticParams = () => items().map((p) => ({ slug: p.id }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = items().find((x) => x.id === slug);
  return p ? pageMeta({ title: `${p.name} — Loona! Designs`, description: p.desc, path: `/projekte/${p.id}`, type: 'article' }) : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = items().find((x) => x.id === slug);
  if (!p) notFound();
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CreativeWork',
          name: p.name,
          description: p.desc,
          url: absUrl(`/projekte/${p.id}`),
          genre: p.kat,
          dateCreated: isoMonth(p.datum),
          keywords: p.stack.join(', '),
          creator: PERSON,
        }}
      />
      <CaseStudyPage key={p.id} p={p} />
    </>
  );
}
