import { redirect } from 'next/navigation';
import { userCount } from '@/cms/auth';
import { SetupForm } from '@/cms/ui/AuthForms';

// Hängt vom Nutzerstand in der DB ab — nie zur Build-Zeit vorrendern.
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Einrichten' };

export default function Page() {
  if (userCount() > 0) redirect('/flow/login');
  const hint = process.env.LDFLOW_SETUP_TOKEN
    ? 'es steht in der Umgebungsvariable LDFLOW_SETUP_TOKEN.'
    : 'es steht auf dem Server in data/flow-setup-token.txt (bzw. neben der Datenbank aus LDFLOW_DB).';
  return (
    <main className="f-auth">
      <SetupForm tokenHint={hint} />
    </main>
  );
}
