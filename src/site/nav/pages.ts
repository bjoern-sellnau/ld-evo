/** Hauptnavigation (Prototyp: renderVals → pages; „Reise“ heißt seit 2026-07-20 „Meine Reise“). */
export const SITE_PAGES = [
  { id: 'hallo', label: 'Hallo', href: '/' },
  { id: 'projekte', label: 'Projekte', href: '/projekte' },
  { id: 'ueber', label: 'Über mich', href: '/ueber-mich' },
  { id: 'labs', label: 'Labs', href: '/labs' },
  { id: 'reise', label: 'Meine Reise', href: '/reise' },
  { id: 'tech', label: '.Tech', href: '/tech' },
  { id: 'impressum', label: 'Impressum', href: '/impressum' },
] as const;

export type SitePageId = (typeof SITE_PAGES)[number]['id'];

/** Aktive Hauptseite zu einem Pfad (Detailseiten gehören zu ihrer Liste). */
export function pageForPath(pathname: string): SitePageId | null {
  if (pathname === '/') return 'hallo';
  const hit = SITE_PAGES.find((p) => p.href !== '/' && (pathname === p.href || pathname.startsWith(`${p.href}/`)));
  return hit?.id ?? null;
}
