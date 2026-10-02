import { projectRoute } from '@/site/routes';

// Projekte und Archiv. Inhalte aus LD Flow; neue Einträge werden bei Bedarf gerendert.
const r = projectRoute('projekte', 'de');
export const generateStaticParams = r.generateStaticParams;
export const generateMetadata = r.generateMetadata;
export default r.Page;
