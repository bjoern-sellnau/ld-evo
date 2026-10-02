'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface NavItem {
  href: string;
  label: string;
  badge?: string;
}

export function FlowNav({ groups }: { groups: { label: string; items: NavItem[] }[] }) {
  const path = usePathname();
  return (
    <nav className="f-nav" aria-label="LD Flow">
      {groups.map((g) => (
        <div key={g.label}>
          <div className="f-nav-label">{g.label}</div>
          {g.items.map((it) => {
            const on = it.href === '/flow' ? path === '/flow' : path === it.href || path.startsWith(it.href + '/');
            return (
              <Link key={it.href} href={it.href} aria-current={on ? 'page' : undefined}>
                <span>{it.label}</span>
                {it.badge && <span className="f-badge draft">{it.badge}</span>}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
