import { catalogRoute } from '@/site/routes';

const r = catalogRoute('labs', 'de');
export const generateMetadata = r.generateMetadata;
export default r.Page;
