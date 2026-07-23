// ====================================================================
// حارس المصادقة لـ Route Handlers
// يقرأ ويتحقق من التوكن الحقيقي مباشرة من الكوكيز
// ويقوم بفحص قاعدة البيانات للتأكد من وجود المستخدم ومستواه وصلاحياته
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export interface AuthenticatedUser {
  userId: string;
  role: string; // ADMIN | KEY_USER | OBSERVER
  username: string;
}

export type AuthenticatedHandler = (
  req: NextRequest,
  context: { params: any; user: AuthenticatedUser }
) => Promise<NextResponse> | Promise<Response>;

type CurrentUser = {
  id: string;
  username: string;
  role: string;
  isActive: boolean;
  mustChangePwd: boolean;
  tokenIssuedBefore: Date | null;
};

/**
 * غلاف يفرض التحكم بالوصول حسب الدور لكل طريقة HTTP.
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

    if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
      const origin = req.headers.get("origin");
      const fetchSite = req.headers.get("sec-fetch-site");
      if ((origin && origin !== req.nextUrl.origin) || fetchSite === "cross-site") {
        return NextResponse.json({ error: "Cross-site request rejected" }, { status: 403 });
      }
    }

    // 1. التحقق من التوكن مباشرة من الكوكيز لمنع هجمات التجاوز
    const token = req.cookies.get("election_auth")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "غير مصرح - يرجى تسجيل الدخول أولاً" },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "غير مصرح - جلسة غير صالحة أو منتهية" },
        { status: 401 }
      );
    }

    const { userId, role } = payload;
    const normalizedRole = role.toUpperCase();

    // 2. Verify the current account on every request. This makes disablement,
    // role changes, and token revocation effective immediately.
    let dbUser: CurrentUser | null;
    try {
      dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true, role: true, isActive: true, mustChangePwd: true, tokenIssuedBefore: true }
      }) as CurrentUser | null;
    } catch (dbError) {
        console.error("Database check failed during auth:", dbError);
        return NextResponse.json(
          { error: "الخدمة غير متوفرة حالياً — فشل التحقق من الحساب" },
          { status: 500 }
        );
      }

    if (!dbUser) {
      return NextResponse.json(
        { error: "غير مصرح - الحساب لم يعد موجوداً" },
        { status: 401 }
      );
    }

    if (dbUser.isActive === false) {
      return NextResponse.json({ error: "غير مصرح - الحساب معطّل" }, { status: 403 });
    }

    if (normalizedRole === "OBSERVER" && prisma.systemConfig) {
      const access = await prisma.systemConfig.findUnique({ where: { id: "observer_access" } });
      if (access && !access.enabled) {
        return NextResponse.json({ error: "غير مصرح - وصول المراقب معطّل" }, { status: 403 });
      }
    }

    if (dbUser.role.toUpperCase() !== normalizedRole) {
      return NextResponse.json(
        { error: "غير مصرح - تم تعديل صلاحيات الحساب" },
        { status: 403 }
      );
    }

    // 3. فحص إبطال الجلسة (tokenIssuedBefore)
    if (dbUser.tokenIssuedBefore && payload.iat) {
      // JWT iat هو Unix timestamp بالثواني
      const tokenIssuedAt = new Date(payload.iat * 1000);
      if (tokenIssuedAt < dbUser.tokenIssuedBefore) {
        return NextResponse.json(
          { error: "غير مصرح - تم إبطال الجلسة بسبب تغيير كلمة المرور. يرجى إعادة تسجيل الدخول" },
          { status: 401 }
        );
      }
    }

    // 4. فرض تغيير كلمة المرور عند أول دخول
    if (dbUser.mustChangePwd) {
      return NextResponse.json(
        { error: "يجب تغيير كلمة المرور قبل استخدام النظام" },
        { status: 403 }
      );
    }

    const allowed = allowedRoles.map((r) => {
      const u = r.toUpperCase();
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
      username: dbUser.username,
    };

    // انتظار params إن كانت Promise (Next.js 15+)
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
 * استخراج بيانات المستخدم بشكل آمن وغير متزامن عبر الكوكيز
 */
export async function getUserFromRequest(req: NextRequest): Promise<AuthenticatedUser | null> {
  const token = req.cookies.get("election_auth")?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;
  return {
    userId: payload.userId,
    role: payload.role.toUpperCase(),
    username: payload.username,
  };
}
