import { createHash } from 'node:crypto';
import { THEME_BOOT_SCRIPT } from '@/site/settings/applyBody';

/**
 * Content-Security-Policy in zwei Stufen (Begründung: Next-Doku „Content Security Policy“, node_modules/next/dist/docs):
 * - LD Flow + Vorschau (hier): streng mit Nonce je Request und 'strict-dynamic' — nur Skripte, die Next mit dem
 *   Nonce ausliefert, laufen. Geht, weil diese Seiten ohnehin pro Request gerendert werden (Login-Cookie).
 * - Öffentliche Site (SITE_CSP in next.config.ts): statisch vorgerendert → Nonces würden Static/ISR abschalten; dort eine
 *   Grundpolicy ohne fremde Skriptquellen, aber mit 'unsafe-inline' (Next-Inline-Skripte, Theme-Boot).
 */

const dev = process.env.NODE_ENV === 'development';

/** Hash des Theme-Boot-Skripts im Site-Layout — die Vorschau rendert dieses Layout mit. */
const THEME_BOOT_HASH = `'sha256-${createHash('sha256').update(THEME_BOOT_SCRIPT).digest('base64')}'`;

export function flowCsp(nonce: string, { preview }: { preview: boolean }): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${THEME_BOOT_HASH}${dev ? " 'unsafe-eval'" : ''}`,
    // React setzt Inline-Styles (style-Attribute) — ohne 'unsafe-inline' fiele das ganze Layout aus.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    `frame-ancestors ${preview ? "'self'" : "'none'"}`,
  ].join('; ');
}
