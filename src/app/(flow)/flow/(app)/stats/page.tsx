import { siteStats } from '@/cms/repo';
import { StatsView } from '@/cms/ui/Stats';

export const metadata = { title: 'Statistik' };

export default async function Page() {
  return (
    <>
      <div className="f-head">
        <div>
          <div className="f-kicker">Übersicht · cookiefrei</div>
          <h1>Statistik</h1>
        </div>
      </div>
      <StatsView stats={await siteStats(30)} />
    </>
  );
}
