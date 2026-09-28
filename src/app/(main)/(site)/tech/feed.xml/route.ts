import { getSiteContent } from '@/cms/content';
import { buildFeed } from '@/site/seo/feed';

// Beim Build erzeugt und nach dem Veröffentlichen neu (revalidatePath('/', 'layout')); auch im statischen Export.
export const dynamic = 'force-static';

export function GET() {
  return new Response(buildFeed(getSiteContent().articles), { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
