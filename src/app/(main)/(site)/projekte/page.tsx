import { catalogRoute } from '@/site/routes';

const r = catalogRoute('projekte', 'de');
export const generateMetadata = r.generateMetadata;
export default r.Page;
