/**
 * Sprachen der Site und ihre Adressen — die EINE Routentabelle für Links, Navigation, hreflang, Sitemap und den
 * Sprachumschalter. Deutsch liegt an der Wurzel (/projekte), Englisch unter /en mit englischen Abschnittsnamen
 * (/en/projects). Einzelseiten behalten ihren Kurznamen (/projekte/corefall ↔ /en/projects/corefall).
 *
 * Konvention: Daten und Code speichern Pfade immer KANONISCH (deutsch, z. B. '/ueber-mich'); erst beim Rendern macht
 * localizePath() daraus die Adresse der aktuellen Sprache. Reine Funktionen — laufen auf Server und Client.
 */

export const LOCALES = ['de', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'de';

export const isLocale = (v: unknown): v is Locale => v === 'de' || v === 'en';

/** Abschnitte mit eigenem englischem Namen (erstes Pfadsegment). labs und tech heißen in beiden Sprachen gleich. */
const EN_SEGMENT: Record<string, string> = {
  projekte: 'projects',
  'ueber-mich': 'about',
  reise: 'journey',
  impressum: 'imprint',
};
const DE_SEGMENT = Object.fromEntries(Object.entries(EN_SEGMENT).map(([de, en]) => [en, de]));

/** Englische Abschnittsnamen + Sprachpräfix: als Slug freier LD-Flow-Seiten gesperrt (sonst doppelte Adressen). */
export const LOCALE_RESERVED_SLUGS = ['en', ...Object.values(EN_SEGMENT)];

/** Bereiche außerhalb der mehrsprachigen Site (bleiben unverändert). */
const NOT_LOCALIZED = new Set(['brand', 'orbit', 'flow', 'flow-preview', 'flow-cron', 'media', 'api', 'health', '_next']);

const EN_PREFIX = '/en';

function split(path: string): { pathname: string; rest: string } {
  const i = path.search(/[?#]/);
  return i < 0 ? { pathname: path, rest: '' } : { pathname: path.slice(0, i), rest: path.slice(i) };
}

/** Sprache einer Adresse (/en, /en/… → en; alles andere → de). */
export function pathLocale(pathname: string): Locale {
  const p = split(pathname).pathname;
  return p === EN_PREFIX || p.startsWith(`${EN_PREFIX}/`) ? 'en' : 'de';
}

/** Kanonischer (deutscher) Pfad zu einer Adresse beliebiger Sprache; Query/Anker bleiben erhalten. */
export function canonicalPath(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  const { pathname, rest } = split(path);
  if (pathLocale(pathname) !== 'en') return path;
  const inner = pathname.slice(EN_PREFIX.length) || '/';
  const [, first = '', ...more] = inner.split('/');
  const seg = DE_SEGMENT[first] ?? first;
  return (seg ? `/${[seg, ...more].join('/')}` : '/') + rest;
}

/** Adresse eines (kanonischen oder bereits lokalisierten) internen Pfads in der gewünschten Sprache. */
export function localizePath(path: string, locale: Locale): string {
  // Externe Links, Anker, mailto: … bleiben, wie sie sind.
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  const canon = canonicalPath(path);
  if (locale === 'de') return canon;
  const { pathname, rest } = split(canon);
  const [, first = '', ...more] = pathname.split('/');
  if (NOT_LOCALIZED.has(first) || /\.[a-z0-9]+$/i.test(first)) return canon;
  const seg = EN_SEGMENT[first] ?? first;
  const tail = seg ? `/${[seg, ...more].join('/')}` : '';
  return `${EN_PREFIX}${tail}` + rest;
}

/** Dieselbe Seite in der anderen Sprache (für Sprachumschalter und hreflang). */
export const switchLocalePath = (pathname: string, to: Locale) => localizePath(pathname, to);

/** BCP-47 für <html lang>, Intl und JSON-LD; og:locale-Form. */
export const htmlLang = (l: Locale) => l;
export const ogLocale = (l: Locale) => (l === 'en' ? 'en_US' : 'de_DE');
/** Datums-/Zahlenformat. */
export const intlLocale = (l: Locale) => (l === 'en' ? 'en-US' : 'de-DE');
