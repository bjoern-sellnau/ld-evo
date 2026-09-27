/** Sicherheitsprüfungen ohne Abhängigkeiten (von Schema, Editor und Widgets gemeinsam genutzt). */

/** Erlaubte Link-Ziele: http(s), mailto, tel, relative Pfade und Anker — kein javascript:, data:, //host. */
export function isSafeHref(href: string): boolean {
  if (/^(https?:\/\/|mailto:|tel:)/i.test(href)) return true;
  if (href.startsWith('/') && !href.startsWith('//')) return true;
  return href.startsWith('#');
}

/** Bildquellen: eigene Medien (/media/…), Dateien aus public/ oder https. */
export function isSafeMediaSrc(src: string): boolean {
  if (/^https:\/\//i.test(src)) return true;
  return src.startsWith('/') && !src.startsWith('//') && !src.includes('..');
}
