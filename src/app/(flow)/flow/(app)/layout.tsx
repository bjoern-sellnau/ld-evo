import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getCurrentUser } from '@/cms/auth';
import { logoutAction } from '@/cms/actions';
import { counts } from '@/cms/repo';
import { COLLECTIONS } from '@/cms/schema';
import { FlowNav } from '@/cms/ui/Nav';
import { LoonaLockup } from '@/components/brand';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/flow/login');
  const c = await counts();
  const col = (id: string) => ({
    href: `/flow/c/${id}`,
    label: COLLECTIONS[id].label,
    badge: c[id]?.drafts ? `${c[id].drafts} Entwurf` : undefined,
  });
  const groups = [
    { label: 'Übersicht', items: [{ href: '/flow', label: 'Dashboard' }] },
    { label: 'Seiten', items: [col('home'), col('about'), col('pages')] },
    { label: 'Inhalte', items: [col('projects'), col('articles'), col('journey')] },
    {
      label: 'Verwaltung',
      items: [
        { href: '/flow/media', label: 'Medien' },
        ...(user.role === 'admin' ? [{ href: '/flow/users', label: 'Nutzer' }] : []),
        { href: '/flow/account', label: 'Mein Konto' },
      ],
    },
  ];
  return (
    <div className="f-shell">
      <aside className="f-side">
        <Link href="/flow" className="f-brand" aria-label="LD Flow — Dashboard">
          <LoonaLockup product="flow" markSize={28} />
        </Link>
        <FlowNav groups={groups} />
        <div className="f-side-foot">
          <div style={{ color: 'var(--f-ink)', fontWeight: 600 }}>{user.name}</div>
          <div style={{ marginBottom: 10 }}>
            {user.email} · {user.role === 'admin' ? 'Admin' : 'Redaktion'}
          </div>
          <div className="f-row">
            <a className="f-btn sm" href="/" target="_blank" rel="noopener">
              Site ↗
            </a>
            <form action={logoutAction}>
              <button className="f-btn sm ghost" type="submit">
                Abmelden
              </button>
            </form>
          </div>
        </div>
      </aside>
      <main className="f-main" id="inhalt">
        {children}
      </main>
    </div>
  );
}
