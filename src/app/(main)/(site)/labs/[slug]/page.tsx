import { projectRoute } from '@/site/routes';

// Labs. Inhalte aus LD Flow; neue Einträge werden bei Bedarf gerendert.
const r = projectRoute('labs', 'de');
export const generateStaticParams = r.generateStaticParams;
export const generateMetadata = r.generateMetadata;
export default r.Page;
