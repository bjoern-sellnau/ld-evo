import { aboutRoute } from '@/site/routes';

const r = aboutRoute('de');
export const generateMetadata = r.generateMetadata;
export default r.Page;
