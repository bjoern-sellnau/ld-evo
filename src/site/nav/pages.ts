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

/** Menüpunkt der Hauptnavigation (pflegbar in LD Flow → Navigation). */
export interface NavItem {
  label: string;
  href: string;
  /** Beschriftung im mobilen Vollbild-Menü (falls abweichend). */
  menuLabel?: string;
  /** Zusätzlich im mobilen Menü (die Tab-Leiste deckt Projekte/Über mich/Labs/Home ab). */
  inMenu?: boolean;
}

/** Startwerte = Prototyp (Desktop-Nav + menuSheetItems). */
export const DEFAULT_NAV: NavItem[] = [
  { label: 'Hallo', href: '/' },
  { label: 'Projekte', href: '/projekte' },
  { label: 'Über mich', href: '/ueber-mich' },
  { label: 'Labs', href: '/labs' },
  { label: 'Meine Reise', href: '/reise', menuLabel: 'Meine Reise — 18 Jahre im Web', inMenu: true },
  { label: '.Tech', href: '/tech', menuLabel: '.Tech — der Blog', inMenu: true },
  { label: 'Impressum', href: '/impressum', inMenu: true },
];

/** Ist ein Menüpunkt für den Pfad aktiv? (Detailseiten gehören zu ihrer Liste.) */
export function isActiveHref(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  if (!href.startsWith('/')) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}
