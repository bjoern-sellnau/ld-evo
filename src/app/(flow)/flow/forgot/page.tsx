import { ForgotForm } from '@/cms/ui/AuthForms';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Passwort vergessen' };

export default function Page() {
  return (
    <main className="f-auth">
      <ForgotForm />
    </main>
  );
}
