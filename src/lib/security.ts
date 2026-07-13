// ====================================================================
// مكتبة الأمان — RBAC، تنقية المدخلات، سجل التدقيق، تحديد المعدل، CSRF
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { invalidateComprehensiveIndicatorsCache } from "@/lib/comprehensive-indicators-cache";
import { prisma as db } from "./prisma";
import { ZodError } from "zod";

// ==================== RBAC ====================

export type Role = "ADMIN" | "KEY_USER" | "OBSERVER";

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  ADMIN: [
    "read",
    "write",
    "delete",
    "manage_users",
    "change_password",
    "toggle_access",
    "manage_system",
  ],
  KEY_USER: ["read", "write", "manage_own_keys"],
  OBSERVER: ["read"],
};

export function hasPermission(role: string, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role as Role];
  return perms ? perms.includes(permission) : false;
}

// ==================== تنقية المدخلات ====================

/**
 * تنقية نص لمنع وسوم HTML الضارة (XSS)
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/<[^>]*>/g, "") // إزالة وسوم HTML بالكامل
    .trim()
    .slice(0, 1000); // حد الطول لسلامة الذاكرة
}

/**
 * التحقق من صحة CUID
 */
export function isValidCuid(id: unknown): boolean {
  if (typeof id !== "string") return false;
  return /^c[a-z0-9]{20,}$/.test(id);
}

/**
 * التحقق من رقم الهاتف العراقي
 */
export function isValidPhone(phone: unknown): boolean {
  if (typeof phone !== "string") return false;
  return /^07[3-9]\d{8}$/.test(phone.replace(/\s/g, ""));
}

// ==================== سجل التدقيق ====================

export type AuditAction =
  | "LOGIN"
  | "LOGOUT"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "CHANGE_PASSWORD"
  | "TOGGLE_ACCESS";

export interface AuditLogParams {
  userId?: string;
  username: string;
  action: AuditAction;
  entity?: string;
  entityId?: string;
  details?: Record<string, string | number | boolean | null>;
  ipAddress?: string;
}

/**
 * كتابة سجل تدقيق في قاعدة البيانات
 * (لا ترمي خطأ — فقط يسجّله في الـ console عند الفشل)
 */
export async function auditLog(params: AuditLogParams): Promise<void> {
  // تشغيل مهمة الكتابة في الخلفية دون تعطيل لطلب العميل الأساسي
  const logTask = async () => {
    try {
      const writePromise = db.auditLog.create({
        data: {
          userId: params.userId || null,
          username: params.username,
          action: params.action,
          entity: params.entity || null,
          entityId: params.entityId || null,
          details: params.details ? JSON.stringify(params.details) : null,
          ipAddress: params.ipAddress || null,
        },
      });

      // مهلة زمنية 500ms لحماية الطلبات عند بطء الاستجابة
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database timeout (500ms)")), 500)
      );

      await Promise.race([writePromise, timeoutPromise]);

      // إبطال الكاش عند العمليات الكتابية على البيانات الأساسية
      const writeActions = ["CREATE", "UPDATE", "DELETE", "TOGGLE_ACCESS"];
      const cacheEntities = ["Voter", "ElectionKey", "Tribe", "Service", "CommissionData", "Competitor", "Volunteer"];
      if (writeActions.includes(params.action) && cacheEntities.includes(params.entity || "")) {
        try {
          invalidateComprehensiveIndicatorsCache();
        } catch { /* silent - cache invalidation should never break the main flow */ }
      }
    } catch (error) {
      console.error("Failed to save audit log (Fallback to Stdout):", {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
        params,
      });
    }
  };

  // تشغيل الخلفية فوراً
  logTask();
}

// ==================== تحديد المعدل (DB-backed — متعدد المثيلات) ====================

/**
 * فحص حد المعدل من قاعدة البيانات — يعمل عبر مثيلات متعددة ويصمد لإعادة التشغيل.
 */
export async function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000
): Promise<{ allowed: boolean; remainingAttempts: number; retryAfterMs: number }> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);

  try {
    const entry = await db.rateLimit.findUnique({ where: { key } });

    if (!entry || entry.lastAttemptAt < windowStart) {
      // أول محاولة أو انتهت النافذة — إعادة ضبط
      await db.rateLimit.upsert({
        where: { key },
        update: { count: 1, lastAttemptAt: now, blockedUntil: null },
        create: { key, count: 1, lastAttemptAt: now },
      });
      return { allowed: true, remainingAttempts: maxAttempts - 1, retryAfterMs: 0 };
    }

    // ما زال محظوراً؟
    if (entry.blockedUntil && entry.blockedUntil > now) {
      return {
        allowed: false,
        remainingAttempts: 0,
        retryAfterMs: entry.blockedUntil.getTime() - now.getTime(),
      };
    }

    if (entry.count >= maxAttempts) {
      const blockedUntil = new Date(entry.lastAttemptAt.getTime() + windowMs);
      await db.rateLimit.update({ where: { key }, data: { blockedUntil } });
      return {
        allowed: false,
        remainingAttempts: 0,
        retryAfterMs: blockedUntil.getTime() - now.getTime(),
      };
    }

    await db.rateLimit.update({
      where: { key },
      data: { count: { increment: 1 }, lastAttemptAt: now },
    });

    return {
      allowed: true,
      remainingAttempts: maxAttempts - (entry.count + 1),
      retryAfterMs: 0,
    };
  } catch (error) {
    // إذا تعذّر الوصول لقاعدة البيانات، اسمح بالطلب بدل قفل الجميع
    console.error("Rate limit DB check failed, allowing request:", error);
    return { allowed: true, remainingAttempts: maxAttempts, retryAfterMs: 0 };
  }
}

/**
 * إعادة ضبط حد المعدل بعد نجاح المصادقة
 */
export async function resetRateLimit(key: string): Promise<void> {
  try {
    await db.rateLimit.deleteMany({ where: { key } });
  } catch {
    // غير حرج
  }
}

// ==================== معالج الأخطاء الآمن ====================

/**
 * معالجة الخطأ دون تسريب تفاصيل داخلية للعميل
 */
export function handleApiError(error: unknown, context?: string): NextResponse {
  try {
    console.error(`API Error${context ? ` (${context})` : ""}:`, error);

    // التحقق من أخطاء Zod
    if (error instanceof ZodError) {
      const first = error.issues[0];
      const msg = first?.message || "بيانات غير صالحة";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    // أخطاء Prisma المعروفة
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as {
        code: string;
        meta?: { target?: string[] };
      };

      // أخطاء انقطاع الاتصال بقاعدة البيانات
      const dbOutageCodes = ["P1001", "P1002", "P1008", "P1017"];
      if (dbOutageCodes.includes(prismaError.code)) {
        return NextResponse.json(
          { error: "الخدمة غير متوفرة مؤقتاً بسبب انقطاع الاتصال بقاعدة البيانات. يرجى المحاولة لاحقاً." },
          {
            status: 503,
            headers: {
              "Retry-After": "5",
            },
          }
        );
      }

      switch (prismaError.code) {
        case "P2002":
          return NextResponse.json(
            { error: "البيانات موجودة مسبقاً - تكرار في حقل فريد" },
            { status: 409 }
          );
        case "P2025":
          return NextResponse.json(
            { error: "السجل غير موجود" },
            { status: 404 }
          );
        case "P2003":
          return NextResponse.json(
            { error: "مرجع غير صالح - السجل المرتبط غير موجود" },
            { status: 400 }
          );
        default:
          break;
      }
    }

    // خطأ عام — لا نكشف stack traces
    return NextResponse.json(
      { error: "حدث خطأ في النظام. يرجى المحاولة لاحقاً" },
      { status: 500 }
    );
  } catch (fallbackError) {
    console.error("FATAL: handleApiError failed internally:", fallbackError);
    return new NextResponse(
      JSON.stringify({ error: "حدث خطأ غير متوقع في النظام." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    ) as any;
  }
}

// ==================== سياسة كلمات المرور ====================

export interface PasswordValidation {
  valid: boolean;
  errors: string[];
}

/**
 * التحقق من قوة كلمة المرور وفق سياسة النظام
 */
export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
  }
  if (password.length > 128) {
    errors.push("كلمة المرور يجب ألا تتجاوز 128 حرف");
  }
  if (!/[a-zA-Z]/.test(password)) {
    errors.push("كلمة المرور يجب أن تحتوي على أحرف إنجليزية");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("كلمة المرور يجب أن تحتوي على أرقام");
  }

  // كلمات مرور شائعة ضعيفة
  const weakPasswords = [
    "password",
    "12345678",
    "qwerty12",
    "abc12345",
    "admin2024",
    "election2024",
    "admin123",
    "password1",
  ];
  if (weakPasswords.some((wp) => password.toLowerCase().includes(wp))) {
    errors.push("كلمة المرور ضعيفة جداً - يرجى اختيار كلمة مرور أكثر تعقيداً");
  }

  return { valid: errors.length === 0, errors };
}

// ==================== عنوان IP للعميل ====================

/**
 * استخراج عنوان IP للعميل من الطلب
 */
export function getClientIp(request: NextRequest): string {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  return "unknown";
}

