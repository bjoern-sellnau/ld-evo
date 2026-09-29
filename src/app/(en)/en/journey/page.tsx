import { journeyRoute } from '@/site/routes';

const r = journeyRoute('en');
export const generateMetadata = r.generateMetadata;
export default r.Page;
