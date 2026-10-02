import { imprintRoute } from '@/site/routes';

const r = imprintRoute('en');
export const generateMetadata = r.generateMetadata;
export default r.Page;
