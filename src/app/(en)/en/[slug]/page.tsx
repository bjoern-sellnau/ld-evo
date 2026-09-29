import { cmsPageRoute } from '@/site/routes';

// Frei angelegte LD-Flow-Seiten. Feste Routen haben Vorrang; Inhalte aus LD Flow; neue Einträge werden bei Bedarf gerendert.
const r = cmsPageRoute('en');
export const generateStaticParams = r.generateStaticParams;
export const generateMetadata = r.generateMetadata;
export default r.Page;
