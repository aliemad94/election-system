// ====================================================================
// POST /api/auth/owner-login — تسجيل دخول المالك بصلاحيات كاملة
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createToken } from "@/lib/auth";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 دقيقة
const BLOCK_DURATION_MS = 30 * 60 * 1000; // 30 دقيقة

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { password } = body;
    const username = "admin"; // المالك دائماً هو المشرف admin

    if (!password) {
      return NextResponse.json(
        { error: "كلمة المرور مطلوبة لتسجيل دخول المالك" },
        { status: 400 }
      );
    }

    // Rate Limiting
    const rawIp = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for") || "127.0.0.1";
    const ip = rawIp.split(",")[0].trim();
    const rateLimitKey = `owner_login:${ip}`;

    const rateLimit = await prisma.rateLimit.findUnique({
      where: { key: rateLimitKey },
    });

    if (rateLimit) {
      if (rateLimit.blockedUntil && rateLimit.blockedUntil > new Date()) {
        const remainingMs = rateLimit.blockedUntil.getTime() - Date.now();
        const remainingMin = Math.ceil(remainingMs / 60000);
        return NextResponse.json(
          {
            error: `الوصول مقفل للمالك. حاول مرة أخرى بعد ${remainingMin} دقيقة`,
            blockedUntil: rateLimit.blockedUntil.toISOString(),
          },
          { status: 429 }
        );
      }

      const windowStart = new Date(Date.now() - WINDOW_MS);
      if (rateLimit.lastAttemptAt > windowStart && rateLimit.count >= MAX_ATTEMPTS) {
        await prisma.rateLimit.update({
          where: { key: rateLimitKey },
          data: {
            blockedUntil: new Date(Date.now() + BLOCK_DURATION_MS),
          },
        });
        return NextResponse.json(
          {
            error: `تم تجاوز محاولات دخول المالك المسموحة (${MAX_ATTEMPTS}). الحساب مقفل لمدة 30 دقيقة`,
          },
          { status: 429 }
        );
      }
    }

    // البحث عن مستخدم المالك (admin)
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || user.role !== "ADMIN") {
      await upsertRateLimit(rateLimitKey);
      return NextResponse.json(
        { error: "حساب المالك غير مهيأ بشكل صحيح في النظام" },
        { status: 500 }
      );
    }

    // مقارنة كلمة المرور
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      await upsertRateLimit(rateLimitKey);
      
      // تسجيل المحاولة الفاشلة في سجل التدقيق
      await prisma.auditLog.create({
        data: {
          username: "admin",
          action: "LOGIN",
          entity: "OwnerLogin",
          details: JSON.stringify({ success: false, error: "Incorrect password attempt" }),
          ipAddress: ip,
        },
      });

      return NextResponse.json(
        { error: "كلمة مرور المالك غير صحيحة" },
        { status: 401 }
      );
    }

    // دخول ناجح — تنظيف محاولات الفشل
    await prisma.rateLimit.deleteMany({
      where: { key: rateLimitKey },
    });

    // تحديث تاريخ تسجيل الدخول
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() },
    });

    // إنشاء JWT مع تعيين دور ADMIN و isOwner=true
    const token = await createToken({
      userId: user.id,
      username: user.username,
      role: "ADMIN",
      isOwner: true,
    });

    // تسجيل دخول المالك الناجح
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        username: user.username,
        action: "LOGIN",
        entity: "OwnerLogin",
        details: JSON.stringify({ success: true, isOwner: true }),
        ipAddress: ip,
      },
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: "ADMIN",
        isOwner: true,
        mustChangePwd: user.mustChangePwd,
      },
    });

    response.cookies.set("election_auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 8 * 60 * 60, // 8 ساعات
    });

    return response;
  } catch (error) {
    console.error("Owner Login error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}

async function upsertRateLimit(key: string) {
  const existing = await prisma.rateLimit.findUnique({ where: { key } });
  const windowStart = new Date(Date.now() - WINDOW_MS);

  if (existing && existing.lastAttemptAt > windowStart) {
    await prisma.rateLimit.update({
      where: { key },
      data: {
        count: existing.count + 1,
        lastAttemptAt: new Date(),
      },
    });
  } else {
    await prisma.rateLimit.upsert({
      where: { key },
      update: {
        count: 1,
        lastAttemptAt: new Date(),
        blockedUntil: null,
      },
      create: {
        key,
        count: 1,
        lastAttemptAt: new Date(),
      },
    });
  }
}
