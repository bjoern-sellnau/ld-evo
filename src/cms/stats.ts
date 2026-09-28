import 'server-only';
import { db } from './db';

/**
 * Cookiefreie Besucherstatistik (Eingang: POST /api/hit). Öffentlicher Schreibzugriff, deshalb wie contact.ts
 * außerhalb von repo.ts. Gespeichert werden nur Summen: Aufrufe je Tag und Seite sowie je Tag und externer
 * Herkunfts-Domain — keine IP-Adresse, keine Cookies, keine Kennungen, kein Fingerprinting.
 */

const PATH_RE = /^\/[a-z0-9\-/]{0,120}$/;
const BOT_RE = /bot|crawl|spider|slurp|headless|lighthouse|preview|fetch|curl|wget|python|java\//i;

/** Tag in Berliner Zeit (sonst fielen Aufrufe nach Mitternacht auf den Vortag). */
export const dayOf = (ms = Date.now()) =>
  new Intl.DateTimeFormat('sv-SE', { timeZone: process.env.LDFLOW_TZ ?? 'Europe/Berlin' }).format(ms);

/** Prüft und zählt einen Aufruf. Liefert, ob gezählt wurde (für Tests/Logs, nie an den Browser). */
export function recordHit(input: { path?: unknown; ref?: unknown }, userAgent: string, ownHost: string | null): boolean {
  if (BOT_RE.test(userAgent)) return false;
  const path = typeof input.path === 'string' ? input.path.split(/[?#]/)[0].toLowerCase().replace(/\/+$/, '') || '/' : '';
  if (!PATH_RE.test(path) || /^\/(flow|api|media)(\/|$)/.test(path)) return false;
  const day = dayOf();
  db()
    .prepare('INSERT INTO page_views (day, path, views) VALUES (?, ?, 1) ON CONFLICT(day, path) DO UPDATE SET views = views + 1')
    .run(day, path);
  // Herkunft nur als Domain und nur von außen (eigene Seite = Navigation innerhalb der Site).
  let host = '';
  try {
    host = typeof input.ref === 'string' && input.ref ? new URL(input.ref).hostname.replace(/^www\./, '').slice(0, 100) : '';
  } catch {
    host = '';
  }
  if (host && host !== ownHost?.split(':')[0].replace(/^www\./, ''))
    db()
      .prepare('INSERT INTO referrers (day, host, views) VALUES (?, ?, 1) ON CONFLICT(day, host) DO UPDATE SET views = views + 1')
      .run(day, host);
  return true;
}
