import { welcomeRoute } from '@/site/routes';

const r = welcomeRoute('en');
export const generateMetadata = r.generateMetadata;
export default r.Page;
