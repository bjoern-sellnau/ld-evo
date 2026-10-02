import { redirect } from 'next/navigation';
import { getCurrentUser, userCount } from '@/cms/auth';
import { LoginForm } from '@/cms/ui/AuthForms';

// Hängt vom Nutzerstand in der DB ab — nie zur Build-Zeit vorrendern.
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Anmelden' };

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string; expired?: string; reset?: string }> }) {
  if (userCount() === 0) redirect('/flow/setup');
  if (await getCurrentUser()) redirect('/flow');
  const sp = await searchParams;
  const next = sp.next ?? '/flow';
  const notice = sp.reset
    ? 'Passwort geändert. Bitte jetzt anmelden.'
    : sp.expired
      ? 'Die Anmeldung ist abgelaufen. Bitte erneut anmelden.'
      : undefined;
  return (
    <main className="f-auth">
      <LoginForm next={typeof next === 'string' && next.startsWith('/flow') ? next : '/flow'} notice={notice} />
    </main>
  );
}
