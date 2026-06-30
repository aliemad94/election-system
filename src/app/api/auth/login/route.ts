// ====================================================================
// POST /api/auth/login — تسجيل الدخول الموحد مع Rate Limiting
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
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "اسم المستخدم وكلمة المرور مطلوبان" },
        { status: 400 }
      );
    }

    // Rate Limiting — التحقق من عدد المحاولات
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const rateLimitKey = `login:${ip}:${username}`;

    const rateLimit = await prisma.rateLimit.findUnique({
      where: { key: rateLimitKey },
    });

    if (rateLimit) {
      // هل الحساب مقفل؟
      if (rateLimit.blockedUntil && rateLimit.blockedUntil > new Date()) {
        const remainingMs = rateLimit.blockedUntil.getTime() - Date.now();
        const remainingMin = Math.ceil(remainingMs / 60000);
        return NextResponse.json(
          {
            error: `الحساب مقفل. حاول مرة أخرى بعد ${remainingMin} دقيقة`,
            blockedUntil: rateLimit.blockedUntil.toISOString(),
          },
          { status: 429 }
        );
      }

      // هل تجاوز عدد المحاولات في النافذة الزمنية؟
      const windowStart = new Date(Date.now() - WINDOW_MS);
      if (rateLimit.lastAttemptAt > windowStart && rateLimit.count >= MAX_ATTEMPTS) {
        // قفل الحساب
        await prisma.rateLimit.update({
          where: { key: rateLimitKey },
          data: {
            blockedUntil: new Date(Date.now() + BLOCK_DURATION_MS),
          },
        });
        return NextResponse.json(
          {
            error: `تم تجاوز عدد المحاولات المسموح (${MAX_ATTEMPTS}). الحساب مقفل لمدة 30 دقيقة`,
          },
          { status: 429 }
        );
      }
    }

    // البحث عن المستخدم
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      // تسجيل المحاولة الفاشلة
      await upsertRateLimit(rateLimitKey);
      return NextResponse.json(
        { error: "اسم المستخدم أو كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }

    // مقارنة كلمة المرور
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      await upsertRateLimit(rateLimitKey);
      return NextResponse.json(
        { error: "اسم المستخدم أو كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }

    // تسجيل دخول ناجح — إعادة تعيين Rate Limit
    await prisma.rateLimit.deleteMany({
      where: { key: rateLimitKey },
    });

    // تحديث آخر تسجيل دخول
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() },
    });

    // إنشاء JWT
    const isOwner = user.role === "ADMIN";
    const token = await createToken({
      userId: user.id,
      username: user.username,
      role: user.role,
      isOwner,
    });

    // تسجيل في سجل التدقيق
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        username: user.username,
        action: "LOGIN",
        ipAddress: ip,
      },
    });

    // إعداد الاستجابة مع httpOnly cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        isOwner,
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
    console.error("Login error:", error);
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
