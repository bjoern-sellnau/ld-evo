import { listErrors } from '@/cms/repo';
import { Errors } from '@/cms/ui/Errors';

export const metadata = { title: 'Fehler' };

export default async function Page() {
  return (
    <>
      <div className="f-head">
        <div>
          <div className="f-kicker">Eingang · Serverfehler</div>
          <h1>Fehler</h1>
        </div>
      </div>
      <Errors items={await listErrors()} />
    </>
  );
}
