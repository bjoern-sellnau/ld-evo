import { listMedia } from '@/cms/repo';
import { MediaLibrary } from '@/cms/ui/Media';

export const metadata = { title: 'Medien' };

export default async function Page() {
  const items = await listMedia();
  return (
    <>
      <div className="f-head">
        <div>
          <div className="f-kicker">Verwaltung</div>
          <h1>Medien</h1>
        </div>
      </div>
      <MediaLibrary initial={items} />
    </>
  );
}
