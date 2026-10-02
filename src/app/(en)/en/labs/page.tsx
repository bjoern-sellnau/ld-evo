import { catalogRoute } from '@/site/routes';

const r = catalogRoute('labs', 'en');
export const generateMetadata = r.generateMetadata;
export default r.Page;
