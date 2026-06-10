import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /api/ routes EXCEPT /api/access
  if (pathname.startsWith('/api') && !pathname.startsWith('/api/access')) {
    const tokenCookie = request.cookies.get('election_auth');
    if (!tokenCookie) {
      return NextResponse.json(
        { error: 'غير مصرح - يرجى تسجيل الدخول أولاً' },
        { status: 401 }
      );
    }

    try {
      const token = tokenCookie.value;
      // Use standard web API atob() instead of Node's Buffer for edge compatibility
      const decoded = atob(token);
      
      // Decoded token format is "username:timestamp" or "owner:username:timestamp"
      const parts = decoded.split(':');
      
      let username = '';
      if (parts[0] === 'owner') {
        username = parts[1];
      } else {
        username = parts[0];
      }

      const validUsernames = ['admin', 'observer', 'key_user'];
      if (!username || !validUsernames.includes(username)) {
        return NextResponse.json(
          { error: 'غير مصرح - توكن غير صالح' },
          { status: 401 }
        );
      }

      // Check if session timestamp is older than 7 days
      const timestampStr = parts[parts.length - 1];
      const timestamp = parseInt(timestampStr, 10);
      if (isNaN(timestamp) || Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000) {
        return NextResponse.json(
          { error: 'غير مصرح - انتهت صلاحية الجلسة' },
          { status: 401 }
        );
      }
    } catch (e) {
      return NextResponse.json(
        { error: 'غير مصرح - توكن تالف أو غير صالح' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
