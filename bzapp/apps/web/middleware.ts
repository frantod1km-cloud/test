import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Edge middleware — runs on every request.
 * Lightweight: only checks for cookie presence, doesn't verify JWT (that happens in route handlers/RSC).
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes — no auth needed
  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/api/v1/auth') ||
    pathname.startsWith('/api/health') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon');

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Protected routes — check for access token cookie
  const hasToken = req.cookies.has('bzapp_at');
  if (!hasToken && !pathname.startsWith('/api/')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // API routes without token get 401
  if (!hasToken && pathname.startsWith('/api/')) {
    return NextResponse.json(
      { type: 'unauthorized', title: 'Not authenticated', status: 401 },
      { status: 401 },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
