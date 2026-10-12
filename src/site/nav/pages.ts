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

/** Standard-Innenabstand der Menüleiste (Prototyp: Top-Pille 7px 8px). */
export const NAV_PAD_DEFAULT = 7;
export const NAV_PAD_MIN = 0;
export const NAV_PAD_MAX = 20;

/**
 * Menü-Abstand der aktuellen Seite (Einstellung „Menü-Abstand“, ld-navpad, neu): Wert je Hauptseite,
 * Detailseiten erben den ihrer Liste. Ungültige Werte → Standard, sonst auf den Reglerbereich begrenzt.
 */
export function navPadFor(navPad: Record<string, number> | undefined, pathname: string): number {
  const id = pageForPath(pathname);
  const v = id ? navPad?.[id] : undefined;
  if (typeof v !== 'number' || !Number.isFinite(v)) return NAV_PAD_DEFAULT;
  return Math.min(NAV_PAD_MAX, Math.max(NAV_PAD_MIN, Math.round(v)));
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

/**
 * Englische Startwerte (Übersetzungsentwurf). Adressen bleiben KANONISCH (deutsch) — die Site übersetzt sie beim
 * Rendern über die Routentabelle (src/site/i18n/locale.ts), z. B. '/ueber-mich' → '/en/about'.
 */
export const DEFAULT_NAV_EN: NavItem[] = [
  { label: 'Hello', href: '/' },
  { label: 'Projects', href: '/projekte' },
  { label: 'About', href: '/ueber-mich' },
  { label: 'Labs', href: '/labs' },
  { label: 'My Journey', href: '/reise', menuLabel: 'My Journey — 18 years on the web', inMenu: true },
  { label: '.Tech', href: '/tech', menuLabel: '.Tech — the blog', inMenu: true },
  { label: 'Legal notice', href: '/impressum', inMenu: true },
];

/** Ist ein Menüpunkt für den Pfad aktiv? (Detailseiten gehören zu ihrer Liste.) */
export function isActiveHref(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  if (!href.startsWith('/')) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}
