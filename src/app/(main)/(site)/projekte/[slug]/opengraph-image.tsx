import { getSiteContent } from '@/cms/content';
import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from '@/site/og/renderOg';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'Vorschaubild';
// Beim Build erzeugt (auch für den statischen Export); nach dem Veröffentlichen neu (revalidatePath).
export const dynamic = 'force-static';
// Der statische Export verlangt die Parameter hier noch einmal (wie in page.tsx).
export const generateStaticParams = () =>
  getSiteContent()
    .projects.filter((p) => p.kind !== 'labs')
    .map((p) => ({ slug: p.id }));

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getSiteContent().projects.find((x) => x.id === slug);
  return renderOg({ kicker: p ? `${p.tag} · ${p.datum}` : 'Projekt', title: p?.name ?? 'Loona! Designs', sub: p?.desc, accent: p?.color });
}
