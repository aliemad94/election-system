import { NextRequest, NextResponse } from 'next/server';

export interface AuthenticatedUser {
  userId: string;
  role: string;
  username: string;
}

export type AuthenticatedHandler = (
  req: NextRequest,
  context: { params: any; user: AuthenticatedUser }
) => Promise<NextResponse> | Promise<Response>;

export function withAuth(
  handler: AuthenticatedHandler,
  roleConfig: Record<string, string[]>
) {
  return async function (req: NextRequest, context?: any) {
    const method = req.method;
    const allowedRoles = roleConfig[method];
    if (!allowedRoles) {
      return NextResponse.json(
        { error: 'طريقة الطلب غير مسموح بها' },
        { status: 405 }
      );
    }

    const userId = req.headers.get('x-user-id');
    const role = req.headers.get('x-user-role');
    const username = req.headers.get('x-user-name');

    if (!userId || !role || !username) {
      return NextResponse.json(
        { error: 'غير مصرح - يرجى تسجيل الدخول أولاً' },
        { status: 401 }
      );
    }

    // Normalizing role comparisons to uppercase
    const normalizedRole = role.toUpperCase(); // e.g. "ADMIN", "KEY_USER", "OBSERVER"
    
    const allowed = allowedRoles.map(r => {
      const u = r.toUpperCase();
      if (u === 'VIEWER') return 'OBSERVER'; // map viewer to observer
      return u;
    });

    if (!allowed.includes(normalizedRole)) {
      return NextResponse.json(
        { error: 'غير مصرح - صلاحيات غير كافية' },
        { status: 403 }
      );
    }

    const user: AuthenticatedUser = {
      userId,
      role: normalizedRole,
      username
    };

    // Await params if it is a promise (Next.js 15+ compatible)
    let resolvedParams = {};
    if (context && context.params) {
      resolvedParams = context.params instanceof Promise ? await context.params : context.params;
    }

    return handler(req, { ...context, params: resolvedParams, user });
  };
}
