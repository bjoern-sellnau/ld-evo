import { getSiteContent } from '@/cms/content';
import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from '@/site/og/renderOg';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'Vorschaubild';
// Beim Build erzeugt (auch für den statischen Export); nach dem Veröffentlichen neu (revalidatePath).
export const dynamic = 'force-static';
// Der statische Export verlangt die Parameter hier noch einmal (wie in page.tsx).
export const generateStaticParams = () => getSiteContent().articles.map((a) => ({ slug: a.id }));

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = getSiteContent().articles.find((x) => x.id === slug);
  return renderOg({ kicker: a ? `.Tech · ${a.kat} · ${a.datum}` : '.Tech', title: a?.titel ?? '.Tech', sub: a?.teaser, accent: a?.color });
}
