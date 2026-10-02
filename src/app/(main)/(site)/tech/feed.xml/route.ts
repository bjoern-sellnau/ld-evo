import { feedRoute } from '@/site/routes';

// Beim Build erzeugt und nach dem Veröffentlichen neu (revalidatePath('/', 'layout')); auch im statischen Export.
export const dynamic = 'force-static';
export const GET = feedRoute('de');
