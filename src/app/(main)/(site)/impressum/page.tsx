import { imprintRoute } from '@/site/routes';

const r = imprintRoute('de');
export const generateMetadata = r.generateMetadata;
export default r.Page;
