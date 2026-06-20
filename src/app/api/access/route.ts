// ====================================================================
// /api/access — بوابة المصادقة المركزية
// الإجراءات: login | owner-login | logout | toggle-access | change-password
// محمي بـ rate limiting + audit logging
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { createToken, verifyToken } from "@/lib/auth";
import {
  checkRateLimit,
  resetRateLimit,
  auditLog,
  getClientIp,
  validatePassword,
} from "@/lib/security";
import { prisma } from "@/lib/prisma";
import { getSystemConfig, setSystemConfig } from "@/lib/config-store";
import bcrypt from "bcryptjs";

// GET /api/access — هل وصول الزوار مفعّل؟
export async function GET() {
  const config = await getSystemConfig();
  return NextResponse.json({ enabled: config.enabled });
}

// POST /api/access — معالجة كل إجراءات المصادقة
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const {
      action,
      password,
      ownerPassword,
      currentPassword,
      newPassword,
      enabled,
    } = rawBody;
    const clientIp = getClientIp(req);

    // ===== تحديد المعدل للإجراءات الحساسة =====
    let limitKey = "";
    if (
      action === "login" ||
      action === "owner-login" ||
      action === "change-password"
    ) {
      limitKey = `rate_limit_${action}_${clientIp}`;
      const limit = await checkRateLimit(limitKey, 5, 15 * 60 * 1000); // 5 محاولات / 15 دقيقة
      if (!limit.allowed) {
        return NextResponse.json(
          {
            success: false,
            message: `لقد تجاوزت الحد المسموح به للمحاولات. يرجى المحاولة بعد ${Math.ceil(
              limit.retryAfterMs / 1000 / 60
            )} دقيقة`,
          },
          { status: 429 }
        );
      }
    }

    // ===== إجراء: دخول الزائر (OBSERVER) =====
    if (action === "login") {
      const systemConfig = await getSystemConfig();
      if (!systemConfig.enabled) {
        return NextResponse.json(
          { success: false, message: "الدخول معطل حالياً من قبل المالك" },
          { status: 403 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { username: "observer" },
      });

      if (!user || !password) {
        return NextResponse.json(
          { success: false, message: "فشل تسجيل الدخول - مستخدم غير موجود" },
          { status: 400 }
        );
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        await auditLog({
          username: "observer",
          action: "LOGIN",
          details: { success: false, error: "كلمة مرور خاطئة للزائر" },
          ipAddress: clientIp,
        });
        return NextResponse.json(
          { success: false, message: "كلمة المرور غير صحيحة" },
          { status: 401 }
        );
      }

      const token = await createToken({
        userId: user.id,
        username: user.username,
        role: user.role,
        isOwner: false,
      });

      await auditLog({
        userId: user.id,
        username: user.username,
        action: "LOGIN",
        details: { success: true },
        ipAddress: clientIp,
      });

      if (limitKey) {
        await resetRateLimit(limitKey);
      }

      const response = NextResponse.json({
        success: true,
        role: user.role,
        mustChangePwd: user.mustChangePwd,
      });

      response.cookies.set("election_auth", token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 7 أيام
      });

      return response;
    }

    // ===== إجراء: دخول المالك (ADMIN) =====
    if (action === "owner-login") {
      const user = await prisma.user.findUnique({
        where: { username: "admin" },
      });

      if (!user || !ownerPassword) {
        return NextResponse.json(
          { success: false, message: "فشل تسجيل الدخول - مستخدم غير موجود" },
          { status: 400 }
        );
      }

      const isMatch = await bcrypt.compare(ownerPassword, user.password);
      if (!isMatch) {
        await auditLog({
          username: "admin",
          action: "LOGIN",
          details: { success: false, error: "كلمة مرور خاطئة للمالك" },
          ipAddress: clientIp,
        });
        return NextResponse.json(
          { success: false, message: "كلمة المرور غير صحيحة" },
          { status: 401 }
        );
      }

      const token = await createToken({
        userId: user.id,
        username: user.username,
        role: user.role,
        isOwner: true,
      });

      await auditLog({
        userId: user.id,
        username: user.username,
        action: "LOGIN",
        details: { success: true },
        ipAddress: clientIp,
      });

      if (limitKey) {
        await resetRateLimit(limitKey);
      }

      const response = NextResponse.json({
        success: true,
        role: user.role,
        mustChangePwd: user.mustChangePwd,
      });

      response.cookies.set("election_auth", token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    // ===== إجراء: تسجيل الخروج =====
    if (action === "logout") {
      // محاولة تسجيل من قام بالخروج
      const tokenCookie = req.cookies.get("election_auth");
      if (tokenCookie) {
        const payload = await verifyToken(tokenCookie.value);
        if (payload) {
          await auditLog({
            userId: payload.userId,
            username: payload.username,
            action: "LOGOUT",
            ipAddress: clientIp,
          });
        }
      }

      const response = NextResponse.json({ success: true });
      response.cookies.set("election_auth", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(0),
      });
      return response;
    }

    // ===== حماية إجراءات ADMIN: toggle-access و change-password =====
    const tokenCookie = req.cookies.get("election_auth");
    if (!tokenCookie) {
      return NextResponse.json(
        { error: "غير مصرح - يرجى تسجيل الدخول" },
        { status: 401 }
      );
    }

    const payload = await verifyToken(tokenCookie.value);
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json(
        { error: "غير مصرح - الصلاحيات غير كافية" },
        { status: 403 }
      );
    }

    // ===== إجراء: تفعيل/تعطيل وصول الزوار =====
    if (action === "toggle-access") {
      if (enabled === undefined) {
        return NextResponse.json(
          { success: false, message: "حقل enabled مطلوب" },
          { status: 400 }
        );
      }

      await setSystemConfig({ enabled: Boolean(enabled) });

      await auditLog({
        userId: payload.userId,
        username: payload.username,
        action: "TOGGLE_ACCESS",
        details: { enabled: Boolean(enabled) },
        ipAddress: clientIp,
      });

      return NextResponse.json({ success: true, enabled: Boolean(enabled) });
    }

    // ===== إجراء: تغيير كلمة المرور =====
    if (action === "change-password") {
      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { success: false, message: "كلمة المرور الحالية والجديدة مطلوبة" },
          { status: 400 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        return NextResponse.json(
          { success: false, message: "المستخدم غير موجود" },
          { status: 404 }
        );
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json(
          { success: false, message: "كلمة المرور الحالية غير صحيحة" },
          { status: 400 }
        );
      }

      // التحقق من سياسة كلمات المرور
      const validation = validatePassword(newPassword);
      if (!validation.valid) {
        return NextResponse.json(
          { success: false, message: validation.errors.join("، ") },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          mustChangePwd: false,
        },
      });

      await auditLog({
        userId: user.id,
        username: user.username,
        action: "CHANGE_PASSWORD",
        ipAddress: clientIp,
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: "طلب غير معروف" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[access-api] failed:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ داخلي في الخادم" },
      { status: 500 }
    );
  }
}

