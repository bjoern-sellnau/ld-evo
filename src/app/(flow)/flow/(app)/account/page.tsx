import { getCurrentUser } from '@/cms/auth';
import { PasswordForm } from '@/cms/ui/Users';

export const metadata = { title: 'Mein Konto' };

export default async function Page() {
  const me = await getCurrentUser();
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
    </>
  );
}
