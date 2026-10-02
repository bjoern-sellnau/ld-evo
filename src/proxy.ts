import { NextResponse, type NextRequest } from 'next/server';
import { flowCsp } from './cms/csp';

/**
 * LD Flow + Vorschau (deutsch /flow-preview, englisch /en/flow-preview):
 * 1. Strenge Content-Security-Policy mit frischem Nonce je Request (src/cms/csp.ts). Next liest den Nonce aus dem
 *    CSP-Header der Anfrage und setzt ihn an seine Skripte (Next-Doku „Content Security Policy“).
 * 2. Optimistische Prüfung: ohne Session-Cookie direkt zur Anmeldung. Die echte Prüfung (Session in der DB, Rolle)
 *    passiert in jeder Seite und jeder Server Action — der Proxy ist nur eine Abkürzung.
 */
export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = flowCsp(nonce, { preview: pathname.startsWith('/flow-preview') || pathname.startsWith('/en/flow-preview') });
  const pass = () => {
    const headers = new Headers(req.headers);
    headers.set('x-nonce', nonce);
    headers.set('content-security-policy', csp);
    const res = NextResponse.next({ request: { headers } });
    res.headers.set('content-security-policy', csp);
    return res;
  };
  if (['/flow/login', '/flow/login/2fa', '/flow/setup', '/flow/forgot', '/flow/reset'].includes(pathname)) return pass();
  // Produktion: `__Host-ldflow_session` (siehe auth.ts), lokal ohne TLS: `ldflow_session`.
  if (!req.cookies.has('__Host-ldflow_session') && !req.cookies.has('ldflow_session')) {
    const url = req.nextUrl.clone();
    url.pathname = '/flow/login';
    url.search = pathname.startsWith('/flow') && pathname !== '/flow' ? `?next=${encodeURIComponent(pathname + search)}` : '';
    return NextResponse.redirect(url);
  }
  return pass();
}

export const config = { matcher: ['/flow/:path*', '/flow', '/flow-preview/:path*', '/en/flow-preview/:path*'] };
