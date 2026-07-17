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

interface CachedSession {
  user: { id: string; role: string; mustChangePwd: boolean; tokenIssuedBefore: Date | null } | null;
  expiresAt: number;
}

const sessionCache = new Map<string, CachedSession>();
const CACHE_TTL_MS = 20 * 1000; // كاش الجلسات مدته 20 ثانية لتقليل عبء قاعدة البيانات

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

    const { userId, role, username } = payload;
    const normalizedRole = role.toUpperCase();

    // 2. التحقق من قاعدة البيانات مع نظام كاش وصمود
    let dbUser: { id: string; role: string; mustChangePwd: boolean; tokenIssuedBefore: Date | null } | null = null;
    let databaseFailed = false;

    const cached = sessionCache.get(userId);
    const now = Date.now();
    if (cached && cached.expiresAt > now) {
      dbUser = cached.user;
    } else {
      try {
        dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, role: true, mustChangePwd: true, tokenIssuedBefore: true }
        });
        sessionCache.set(userId, { user: dbUser, expiresAt: now + CACHE_TTL_MS });
      } catch (dbError) {
        console.error("Database check failed during auth, entering Grace Mode:", dbError);
        databaseFailed = true;
      }
    }

    if (databaseFailed) {
      // وضع الصمود: قاعدة البيانات معطلة — نسمح بالقراءة فقط (GET)
      const isReadOnly = method === "GET";
      if (!isReadOnly) {
        console.warn(`AUTH WARNING: Database offline. Blocking write operation (${method}) for user '${username}'.`);
        return NextResponse.json(
          { error: "الخدمة غير متوفرة مؤقتاً — لا يمكن إجراء عمليات كتابة أثناء انقطاع قاعدة البيانات" },
          { status: 503 }
        );
      }
      console.warn(`AUTH WARNING: Database offline. Authorizing read-only for user '${username}' with role '${normalizedRole}' from JWT signature.`);
    } else {
      if (!dbUser) {
        return NextResponse.json(
          { error: "غير مصرح - الحساب لم يعد موجوداً" },
          { status: 401 }
        );
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
      username,
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
