import { articleRoute } from '@/site/routes';

// .Tech-Artikel. Inhalte aus LD Flow; neue Einträge werden bei Bedarf gerendert.
const r = articleRoute('en');
export const generateStaticParams = r.generateStaticParams;
export const generateMetadata = r.generateMetadata;
export default r.Page;
