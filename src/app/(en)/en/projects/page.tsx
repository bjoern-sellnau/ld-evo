import { catalogRoute } from '@/site/routes';

const r = catalogRoute('projekte', 'en');
export const generateMetadata = r.generateMetadata;
export default r.Page;
