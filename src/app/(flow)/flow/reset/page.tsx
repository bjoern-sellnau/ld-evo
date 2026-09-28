import { resetTokenValid } from '@/cms/auth';
import { ResetForm } from '@/cms/ui/AuthForms';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Neues Passwort', referrer: 'no-referrer' };

export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const token = (await searchParams).token;
  const valid = typeof token === 'string' && resetTokenValid(token);
  return (
    <main className="f-auth">
      <ResetForm token={valid ? token : null} />
    </main>
  );
}
