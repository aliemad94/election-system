// ====================================================================
// /api/voters/checkin — تسجيل حضور الناخب (IDEMPOTENT صارم)
// ====================================================================
// القاعدة 6 من CLAUDE.md: تسجيل حضور الناخب idempotent بشكل صارم
// لمنع تكرار علامات التصويت عند إعادة محاولة الشبكة.
//
// الآلية: نستخدم updateMany مع where { id, votedOnDay: false }.
// - إذا result.count === 1 → تم التسجيل الآن (checked_in)
// - إذا result.count === 0 + الناخب موجود + votedOnDay=true → سبق التسجيل (already_checked_in)
// - إذا الناخب غير موجود → 404
// أي إعادة محاولة لنفس الناخب تُرجع already_checked_in دون إنشاء سجل مكرر.
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import type { AuthenticatedUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError, auditLog } from "@/lib/security";
import { checkinSchema, formatZodError } from "@/lib/validators";
import { invalidateIndicatorsCache } from "@/lib/indicators-cache";
import { invalidateComprehensiveIndicatorsCache } from "@/lib/comprehensive-indicators-cache";

async function checkinHandler(req: NextRequest, { user }: { user: AuthenticatedUser }) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "جسم الطلب غير صالح" },
      { status: 400 }
    );
  }

  const parsed = checkinSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: formatZodError(parsed.error) },
      { status: 400 }
    );
  }

  const { voterId } = parsed.data;

  try {
    // ===== العملية الذرية idempotent =====
    // updateMany يُرجع count = عدد الصفوف المُحدّثة فعلياً.
    // شرط votedOnDay: false يضمن أن التحديث يحدث مرة واحدة فقط.
    const result = await prisma.voter.updateMany({
      where: { id: voterId, votedOnDay: false },
      data: {
        votedOnDay: true,
        lastContactDate: new Date(),
        contactResult: "حضر للتصويت",
      },
    });

    if (result.count === 0) {
      // لم يُحدّث شيء — إما الناخب غير موجود أو سبق التسجيل
      const voter = await prisma.voter.findUnique({
        where: { id: voterId },
        select: { id: true, votedOnDay: true, firstName: true },
      });

      if (!voter) {
        return NextResponse.json(
          { error: "الناخب غير موجود", status: "not_found" },
          { status: 404 }
        );
      }

      // سبق التسجيل — idempotent: نُرجع نجاحاً دون تكرار
      return NextResponse.json({
        status: "already_checked_in",
        voterId,
        message: "الناخب سبق تسجيل حضوره",
      });
    }

    // تم التسجيل الآن
    await auditLog({
      userId: user.userId,
      username: user.username,
      action: "UPDATE",
      entity: "Voter",
      entityId: voterId,
      details: { action: "checkin", votedOnDay: true },
    });

    // إبطال ذاكرة المؤشرات لأن نسبة الحضور تغيّرت
    invalidateIndicatorsCache();
    invalidateComprehensiveIndicatorsCache();

    return NextResponse.json({
      status: "checked_in",
      voterId,
      message: "تم تسجيل الحضور بنجاح",
    });
  } catch (error) {
    return handleApiError(error, "voters-checkin");
  }
}

export const POST = withAuth(checkinHandler, {
  POST: ["ADMIN", "KEY_USER"],
});

