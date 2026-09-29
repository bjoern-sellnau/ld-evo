import { homeRoute } from '@/site/routes';

const r = homeRoute('de');
export const generateMetadata = r.generateMetadata;
export default r.Page;
