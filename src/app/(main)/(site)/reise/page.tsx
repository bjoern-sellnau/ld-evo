import { journeyRoute } from '@/site/routes';

const r = journeyRoute('de');
export const generateMetadata = r.generateMetadata;
export default r.Page;
