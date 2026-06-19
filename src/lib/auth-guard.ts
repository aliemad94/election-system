import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './prisma';

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

    // Verify the user still exists in DB with matching role/username.
    // This catches: deleted users, role changes, and revoked access — all
    // scenarios the JWT alone cannot detect.
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { username: true, role: true },
      });

      if (!dbUser || dbUser.username !== username || dbUser.role !== role.toUpperCase()) {
        return NextResponse.json(
          { error: 'غير مصرح - جلسة منتهية أو صلاحيات تغيرت، يرجى تسجيل الدخول مجدداً' },
          { status: 401 }
        );
      }
    } catch {
      // If DB is temporarily unreachable, fall through — the JWT was already
      // verified cryptographically by middleware. Log the miss for visibility.
      console.warn('[auth-guard] DB user validation skipped (DB unreachable)');
    }

    const normalizedRole = role.toUpperCase();

    const allowed = allowedRoles.map(r => {
      const u = r.toUpperCase();
      if (u === 'VIEWER') return 'OBSERVER';
      if (u === 'OPERATOR') return 'KEY_USER';
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
      username,
    };

    let resolvedParams = {};
    if (context && context.params) {
      resolvedParams = context.params instanceof Promise ? await context.params : context.params;
    }

    return handler(req, { ...context, params: resolvedParams, user });
  };
}
