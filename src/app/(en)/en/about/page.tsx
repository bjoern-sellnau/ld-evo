import { aboutRoute } from '@/site/routes';

const r = aboutRoute('en');
export const generateMetadata = r.generateMetadata;
export default r.Page;
