import { welcomeRoute } from '@/site/routes';

const r = welcomeRoute('de');
export const generateMetadata = r.generateMetadata;
export default r.Page;
