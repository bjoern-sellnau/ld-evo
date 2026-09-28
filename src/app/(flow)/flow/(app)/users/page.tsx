import { notFound } from 'next/navigation';
import { getCurrentUser, twoFactorRequired } from '@/cms/auth';
import { listUsers } from '@/cms/repo';
import { UsersAdmin } from '@/cms/ui/Users';

export const metadata = { title: 'Nutzer' };

export default async function Page() {
  const me = await getCurrentUser();
  if (!me || me.role !== 'admin') notFound();
  return (
    <>
      <div className="f-head">
        <div>
          <div className="f-kicker">Verwaltung</div>
          <h1>Nutzer</h1>
        </div>
      </div>
      <UsersAdmin users={await listUsers()} meId={me.id} require2fa={twoFactorRequired()} />
    </>
  );
}
