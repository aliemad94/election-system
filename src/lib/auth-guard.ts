// ====================================================================
// حارس المصادقة لـ Route Handlers
// يقرأ معلومات المستخدم من headers التي حقنها الـ middleware
// ويفرض RBAC صريح لكل طريقة HTTP
// ====================================================================

import { NextRequest, NextResponse } from "next/server";

export interface AuthenticatedUser {
  userId: string;
  role: string; // ADMIN | KEY_USER | OBSERVER
  username: string;
}

export type AuthenticatedHandler = (
  req: NextRequest,
  context: { params: Record<string, string | string[]>; user: AuthenticatedUser }
) => Promise<NextResponse> | Promise<Response>;

/**
 * غلاف يفرض التحكم بالوصول حسب الدور لكل طريقة HTTP.
 *
 * مثال:
 *   export const POST = withAuth(createVoter, { POST: ["ADMIN", "KEY_USER"] });
 *   export const GET  = withAuth(listVoters, { GET: ["ADMIN", "KEY_USER", "OBSERVER"] });
 */
export function withAuth(
  handler: AuthenticatedHandler,
  roleConfig: Record<string, string[]>
) {
  return async function (req: NextRequest, context?: any) {
    const method = req.method;
    const allowedRoles = roleConfig[method];
    if (!allowedRoles) {
      return NextResponse.json(
        { error: "طريقة الطلب غير مسموح بها" },
        { status: 405 }
      );
    }

    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");
    const username = req.headers.get("x-user-name");

    if (!userId || !role || !username) {
      return NextResponse.json(
        { error: "غير مصرح - يرجى تسجيل الدخول أولاً" },
        { status: 401 }
      );
    }

    // تطبيع الأدوار لمقارنة موحّدة (حروف كبيرة)
    const normalizedRole = role.toUpperCase();

    const allowed = allowedRoles.map((r) => {
      const u = r.toUpperCase();
      // توافق: VIEWER → OBSERVER
      if (u === "VIEWER") return "OBSERVER";
      return u;
    });

    if (!allowed.includes(normalizedRole)) {
      return NextResponse.json(
        { error: "غير مصرح - صلاحيات غير كافية" },
        { status: 403 }
      );
    }

    const user: AuthenticatedUser = {
      userId,
      role: normalizedRole,
      username,
    };

    // انتظار params إن كانت Promise (متوافق مع Next.js 15+)
    let resolvedParams: Record<string, string | string[]> = {};
    if (context && context.params) {
      resolvedParams =
        context.params instanceof Promise
          ? await context.params
          : context.params;
    }

    return handler(req, { ...context, params: resolvedParams, user });
  };
}

/**
 * استخراج بيانات المستخدم من headers (دون فرض RBAC)
 */
export function getUserFromRequest(req: NextRequest): AuthenticatedUser | null {
  const userId = req.headers.get("x-user-id");
  const role = req.headers.get("x-user-role");
  const username = req.headers.get("x-user-name");
  if (!userId || !role || !username) return null;
  return { userId, role: role.toUpperCase(), username };
}

