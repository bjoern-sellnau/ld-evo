import { getCurrentUser, listMySessions, totpStatus } from '@/cms/auth';
import { Sessions, TwoFactor } from '@/cms/ui/Account';
import { PasswordForm } from '@/cms/ui/Users';

export const metadata = { title: 'Mein Konto' };

export default async function Page({ searchParams }: { searchParams: Promise<{ pflicht?: string }> }) {
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
      {(await searchParams).pflicht && !tfa.enabled && (
        <p className="f-msg error" role="alert">
          Für dieses LD Flow ist die Zwei-Faktor-Anmeldung Pflicht. Bitte unten einrichten — danach ist alles wieder erreichbar.
        </p>
      )}
      <PasswordForm />
      <TwoFactor enabled={tfa.enabled} recoveryLeft={tfa.recoveryLeft} />
      <Sessions items={await listMySessions()} />
    </>
  );
}
