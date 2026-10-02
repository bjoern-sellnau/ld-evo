import { OG, projectRoute } from '@/site/routes';

export const size = OG.size;
export const contentType = OG.contentType;
export const alt = 'Loona! Designs';
// Beim Build erzeugt (auch für den statischen Export); nach dem Veröffentlichen neu (revalidatePath).
export const dynamic = 'force-static';
const r = projectRoute('labs', 'de');
// Der statische Export verlangt die Parameter hier noch einmal (wie in page.tsx).
export const generateStaticParams = r.generateStaticParams;
export default r.ogImage;
