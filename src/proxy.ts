import { NextResponse, type NextRequest } from 'next/server';

/**
 * Optimistische Prüfung für LD Flow: ohne Session-Cookie direkt zur Anmeldung. Die echte Prüfung (Session in der
 * DB, Rolle) passiert in jeder Seite und jeder Server Action — der Proxy ist nur eine Abkürzung.
 */
export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (['/flow/login', '/flow/setup', '/flow/forgot', '/flow/reset'].includes(pathname)) return NextResponse.next();
  if (!req.cookies.has('ldflow_session')) {
    const url = req.nextUrl.clone();
    url.pathname = '/flow/login';
    url.search = pathname.startsWith('/flow') && pathname !== '/flow' ? `?next=${encodeURIComponent(pathname + search)}` : '';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/flow/:path*', '/flow', '/flow-preview/:path*'] };
