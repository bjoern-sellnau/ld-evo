import { getCurrentUser, listMySessions, totpStatus } from '@/cms/auth';
import { Sessions, TwoFactor } from '@/cms/ui/Account';
import { PasswordForm } from '@/cms/ui/Users';

export const metadata = { title: 'Mein Konto' };

export default async function Page() {
  const me = await getCurrentUser();
  const tfa = await totpStatus();
  return (
    <>
      <div className="f-head">
        <div>
          <div className="f-kicker">Verwaltung</div>
          <h1>Mein Konto</h1>
        </div>
      </div>
      <p style={{ color: 'var(--f-muted)', marginTop: 0 }}>
        {me?.name} · {me?.email} · {me?.role === 'admin' ? 'Admin' : 'Redaktion'}
      </p>
      <PasswordForm />
      <TwoFactor enabled={tfa.enabled} recoveryLeft={tfa.recoveryLeft} />
      <Sessions items={await listMySessions()} />
    </>
  );
}
