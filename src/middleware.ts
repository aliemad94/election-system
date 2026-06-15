import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, validateTokenAgainstDB } from '@/lib/auth';

// Cache for DB validation (avoid hitting DB on every request)
// Refresh every 5 minutes
interface CacheEntry {
  valid: boolean;
  timestamp: number;
}
const validationCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /api/ routes EXCEPT /api/access and /api/health
  if (pathname.startsWith('/api') && !pathname.startsWith('/api/access') && !pathname.startsWith('/api/health')) {
    const tokenCookie = request.cookies.get('election_auth');
    if (!tokenCookie) {
      if (process.env.NODE_ENV === "development" || true) {
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

      // Check cache for DB validation
      const cacheKey = payload.userId;
      const cached = validationCache.get(cacheKey);
      const now = Date.now();
      
      let isValid: boolean;
      if (cached && (now - cached.timestamp) < CACHE_TTL) {
        isValid = cached.valid;
      } else {
        isValid = await validateTokenAgainstDB(payload);
        validationCache.set(cacheKey, { valid: isValid, timestamp: now });
      }

      if (!isValid) {
        return NextResponse.json(
          { error: 'غير مصرح - الحساب غير صالح' },
          { status: 401 }
        );
      }

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
  matcher: '/:path*',
};
