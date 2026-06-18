import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';



export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /api/ routes EXCEPT /api/access and /api/health
  if (pathname.startsWith('/api') && !pathname.startsWith('/api/access') && !pathname.startsWith('/api/health')) {
    const tokenCookie = request.cookies.get('election_auth');
    if (!tokenCookie) {
      if (process.env.NODE_ENV === "development" && process.env.BYPASS_AUTH === "true") {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', 'dummy-admin-id');
        requestHeaders.set('x-user-role', 'ADMIN');
        requestHeaders.set('x-user-name', 'admin');

        const response = NextResponse.next({
          request: { headers: requestHeaders },
        });

        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('X-Frame-Options', 'DENY');
        response.headers.set('X-XSS-Protection', '1; mode=block');
        response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
        response.headers.set('Pragma', 'no-cache');

        return response;
      }
      return NextResponse.json(
        { error: 'غير مصرح - يرجى تسجيل الدخول أولاً' },
        { status: 401 }
      );
    }

    try {
      const token = tokenCookie.value;
      
      // Verify JWT signature and expiration
      const payload = await verifyToken(token);
      if (!payload) {
        return NextResponse.json(
          { error: 'غير مصرح - جلسة غير صالحة أو منتهية' },
          { status: 401 }
        );
      }

      // Skip database query in Next.js middleware because it runs in the Edge Runtime
      // where TCP/direct database connections via standard Prisma Client are not supported.
      // The token signature has already been verified successfully via verifyToken.
      const isValid = true;

      // Add user info to request headers for downstream use
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId);
      requestHeaders.set('x-user-role', payload.role);
      requestHeaders.set('x-user-name', payload.username);

      const response = NextResponse.next({
        request: { headers: requestHeaders },
      });

      // Add security headers to all API responses
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-XSS-Protection', '1; mode=block');
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      response.headers.set('Pragma', 'no-cache');

      return response;
    } catch {
      return NextResponse.json(
        { error: 'غير مصرح - توكن تالف أو غير صالح' },
        { status: 401 }
      );
    }
  }

  // For non-API routes, add security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
};
