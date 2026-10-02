import { homeRoute } from '@/site/routes';

const r = homeRoute('en');
export const generateMetadata = r.generateMetadata;
export default r.Page;
