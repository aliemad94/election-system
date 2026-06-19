import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Content-Security-Policy: tight ruleset for an internal SPA.
// Inline styles/scripts are needed by Next.js hydration — use nonces
// in the future when the CSP is tightened further.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  // 'unsafe-eval' required by Next.js dev; tighten in future
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('Content-Security-Policy', CSP);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  return response;
}

function applyNoCacheHeaders(response: NextResponse): NextResponse {
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /api/ routes EXCEPT /api/access and /api/health
  if (pathname.startsWith('/api') && !pathname.startsWith('/api/access') && !pathname.startsWith('/api/health')) {
    const tokenCookie = request.cookies.get('election_auth');

    if (!tokenCookie) {
      if (process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true') {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', 'dummy-admin-id');
        requestHeaders.set('x-user-role', 'ADMIN');
        requestHeaders.set('x-user-name', 'admin');

        const response = NextResponse.next({ request: { headers: requestHeaders } });
        applySecurityHeaders(response);
        applyNoCacheHeaders(response);
        return response;
      }

      return NextResponse.json(
        { error: 'غير مصرح - يرجى تسجيل الدخول أولاً' },
        { status: 401 }
      );
    }

    try {
      const token = tokenCookie.value;
      const payload = await verifyToken(token);

      if (!payload) {
        return NextResponse.json(
          { error: 'غير مصرح - جلسة غير صالحة أو منتهية' },
          { status: 401 }
        );
      }

      // Note: DB user validation is deferred to each route handler via withAuth()
      // because the Edge Runtime cannot open TCP connections directly to PostgreSQL.
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId);
      requestHeaders.set('x-user-role', payload.role);
      requestHeaders.set('x-user-name', payload.username);

      const response = NextResponse.next({ request: { headers: requestHeaders } });
      applySecurityHeaders(response);
      applyNoCacheHeaders(response);
      return response;
    } catch {
      return NextResponse.json(
        { error: 'غير مصرح - توكن تالف أو غير صالح' },
        { status: 401 }
      );
    }
  }

  // For non-API routes, apply security headers only
  const response = NextResponse.next();
  applySecurityHeaders(response);
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
