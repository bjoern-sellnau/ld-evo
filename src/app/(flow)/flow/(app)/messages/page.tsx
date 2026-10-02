import { listMessages } from '@/cms/repo';
import { Messages } from '@/cms/ui/Messages';

export const metadata = { title: 'Nachrichten' };

export default async function Page() {
  return (
    <>
      <div className="f-head">
        <div>
          <div className="f-kicker">Eingang · Kontaktformular</div>
          <h1>Nachrichten</h1>
        </div>
      </div>
      <Messages items={await listMessages()} />
    </>
  );
}
