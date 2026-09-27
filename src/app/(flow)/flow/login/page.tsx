import { redirect } from 'next/navigation';
import { getCurrentUser, userCount } from '@/cms/auth';
import { LoginForm } from '@/cms/ui/AuthForms';

// Hängt vom Nutzerstand in der DB ab — nie zur Build-Zeit vorrendern.
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Anmelden' };

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (userCount() === 0) redirect('/flow/setup');
  if (await getCurrentUser()) redirect('/flow');
  const next = (await searchParams).next ?? '/flow';
  return (
    <main className="f-auth">
      <LoginForm next={typeof next === 'string' && next.startsWith('/flow') ? next : '/flow'} />
    </main>
  );
}
