import { NextRequest, NextResponse } from "next/server";
import { createToken, verifyToken } from "@/lib/auth";
import { checkRateLimit, auditLog, getClientIp, validatePassword } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getSystemConfig, setSystemConfig } from "@/lib/config-store";

// GET /api/access - Checks whether visitor access is enabled
export async function GET() {
  const config = getSystemConfig();
  return NextResponse.json({ enabled: config.enabled });
}

// POST /api/access - Handles login, logout, password change, and visitor access toggles
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const { action, password, ownerPassword, currentPassword, newPassword, enabled } = rawBody;
    const clientIp = getClientIp(req);

    // Apply Rate Limiting for Login/Sensitive actions to prevent brute forcing
    if (action === "login" || action === "owner-login" || action === "change-password") {
      const limitKey = `rate_limit_${action}_${clientIp}`;
      const limit = checkRateLimit(limitKey, 5, 15 * 60 * 1000); // 5 attempts per 15 minutes
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

    // --- Action: Visitor/Observer Login ---
    if (action === "login") {
      // Check if visitor access is globally disabled
      const systemConfig = getSystemConfig();
      if (!systemConfig.enabled) {
        return NextResponse.json(
          { success: false, message: "الدخول معطل حالياً من قبل المالك" },
          { status: 403 }
        );
      }

      // Query default observer user
      const user = await prisma.user.findUnique({
        where: { username: "observer" },
      });

      if (!user || !password) {
        return NextResponse.json(
          { success: false, message: "فشل تسجيل الدخول - مستخدم غير موجود" },
          { status: 400 }
        );
      }

      // Verify password
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

      // Create Session JWT
      const token = await createToken({
        userId: user.id,
        username: user.username,
        role: user.role,
        isOwner: false,
      });

      // Write Audit Log
      await auditLog({
        userId: user.id,
        username: user.username,
        action: "LOGIN",
        details: { success: true },
        ipAddress: clientIp,
      });

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
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }

    // --- Action: Owner/Admin Login ---
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

      // Verify password
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

      // Create Session JWT
      const token = await createToken({
        userId: user.id,
        username: user.username,
        role: user.role,
        isOwner: true,
      });

      // Write Audit Log
      await auditLog({
        userId: user.id,
        username: user.username,
        action: "LOGIN",
        details: { success: true },
        ipAddress: clientIp,
      });

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
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }

    // --- Action: Logout ---
    if (action === "logout") {
      const response = NextResponse.json({ success: true });
      response.cookies.set("election_auth", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(0),
      });
      return response;
    }

    // --- Protect ADMIN operations for toggle-access and change-password ---
    const tokenCookie = req.cookies.get("election_auth");
    if (!tokenCookie) {
      return NextResponse.json({ error: "غير مصرح - يرجى تسجيل الدخول" }, { status: 401 });
    }

    const payload = await verifyToken(tokenCookie.value);
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح - الصلاحيات غير كافية" }, { status: 403 });
    }

    // --- Action: Toggle Visitor Access ---
    if (action === "toggle-access") {
      if (enabled === undefined) {
        return NextResponse.json({ success: false, message: "حقل enabled مطلوب" }, { status: 400 });
      }

      setSystemConfig({ enabled: Boolean(enabled) });

      await auditLog({
        userId: payload.userId,
        username: payload.username,
        action: "TOGGLE_ACCESS",
        details: { enabled: Boolean(enabled) },
        ipAddress: clientIp,
      });

      return NextResponse.json({ success: true, enabled: Boolean(enabled) });
    }

    // --- Action: Owner/Admin Change Password ---
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
        return NextResponse.json({ success: false, message: "المستخدم غير موجود" }, { status: 404 });
      }

      // Check current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json({ success: false, message: "كلمة المرور الحالية غير صحيحة" }, { status: 400 });
      }

      // Validate new password policy
      const validation = validatePassword(newPassword);
      if (!validation.valid) {
        return NextResponse.json({ success: false, message: validation.errors.join("، ") }, { status: 400 });
      }

      // Hash and update password
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          mustChangePwd: false,
        },
      });

      // Write Audit Log
      await auditLog({
        userId: user.id,
        username: user.username,
        action: "CHANGE_PASSWORD",
        ipAddress: clientIp,
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "طلب غير معروف" }, { status: 400 });
  } catch (error) {
    console.error("[access-api] failed:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ داخلي في الخادم" }, { status: 500 });
  }
}
