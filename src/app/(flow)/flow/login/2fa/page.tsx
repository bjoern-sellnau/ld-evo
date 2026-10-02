import { redirect } from 'next/navigation';
import { getCurrentUser, pendingChallenge } from '@/cms/auth';
import { SecondFactorForm } from '@/cms/ui/AuthForms';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Bestätigungscode' };

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getCurrentUser()) redirect('/flow');
  if (!(await pendingChallenge())) redirect('/flow/login?expired=1');
  const next = (await searchParams).next;
  return (
    <main className="f-auth">
      <SecondFactorForm next={typeof next === 'string' && next.startsWith('/flow') && !next.startsWith('//') ? next : '/flow'} />
    </main>
  );
}
