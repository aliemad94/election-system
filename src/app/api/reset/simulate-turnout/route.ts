// ====================================================================
// /api/reset/simulate-turnout — محاكاة وإعادة تعيين إقبال الناخبين
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/security";
import { invalidateComprehensiveIndicatorsCache } from "@/lib/comprehensive-indicators-cache";

async function postHandler(req: NextRequest, context?: any) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const confirmReset = searchParams.get("confirm");

    // 1. إجراء إعادة التعيين ليوم التصويت (تصفير حضور الناخبين)
    // إجراء تدميري على مستوى المحافظة: يتطلب تأكيداً مزدوجاً نصياً
    if (action === "reset") {
      if (confirmReset !== "CONFIRM_RESET_TURNOUT") {
        return NextResponse.json(
          {
            error:
              "تأكيد مطلوب: مرّر confirm=CONFIRM_RESET_TURNOUT لتأكيد تصفير حضور جميع الناخبين.",
          },
          { status: 400 }
        );
      }

      // تنفيذ التغييرات وسجل التدقيق داخل transaction
      const affectedVoters = await prisma.$transaction(async (tx) => {
        const result = await tx.voter.updateMany({
          data: {
            votedOnDay: false,
            checkedIn: false,
            checkedInAt: null,
          },
        });

        const user = context?.user;
        if (user?.userId) {
          await tx.auditLog.create({
            data: {
              userId: user.userId,
              username: user.username || "unknown",
              action: "RESET_TURNOUT",
              ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || null,
            },
          });
        }

        return result.count;
      });

      invalidateComprehensiveIndicatorsCache();

      return NextResponse.json({
        success: true,
        checkedInCount: 0,
        affectedVoters,
        message: "تم بنجاح تصفير وإعادة تعيين حضور الناخبين ليوم الاقتراع.",
      });
    }

    // 2. محاكاة زيادة الحضور (ممنوع في الإنتاج تماماً دون أي استثناء)
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "عملية المحاكاة محظورة تماماً في بيئة الإنتاج." },
        { status: 403 }
      );
    }

    const countParam = searchParams.get("count") || "25";
    const targetCount = parseInt(countParam, 10);

    if (isNaN(targetCount) || targetCount <= 0 || targetCount > 500) {
      return NextResponse.json(
        { error: "العدد المدخل غير صالح. يجب أن يكون عدداً صحيحاً موجباً بين 1 و 500." },
        { status: 400 }
      );
    }

    // تنفيذ التحديثات وسجل التدقيق داخل transaction
    const resultData = await prisma.$transaction(async (tx) => {
      // جلب عينة عشوائية من الناخبين الذين لم يصوتوا بعد
      const unvotedVoters = await tx.voter.findMany({
        where: {
          votedOnDay: false,
          deletedAt: null,
        },
        take: targetCount,
        select: {
          id: true,
        },
      });

      if (unvotedVoters.length === 0) {
        return {
          checkedInCount: 0,
        };
      }

      const voterIds = unvotedVoters.map((v) => v.id);
      const now = new Date();

      await tx.voter.updateMany({
        where: {
          id: { in: voterIds },
        },
        data: {
          votedOnDay: true,
          checkedIn: true,
          checkedInAt: now,
        },
      });

      const user = context?.user;
      if (user?.userId) {
        await tx.auditLog.create({
          data: {
            userId: user.userId,
            username: user.username || "unknown",
            action: "SIMULATE_TURNOUT",
            details: JSON.stringify({ count: voterIds.length }),
            ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || null,
          },
        });
      }

      return {
        checkedInCount: voterIds.length,
      };
    });

    if (resultData.checkedInCount === 0) {
      return NextResponse.json({
        success: true,
        checkedInCount: 0,
        message: "تم حضور جميع الناخبين في قاعدة البيانات بالكامل!",
      });
    }

    // مسح كاش المؤشرات لضمان انعكاس التغييرات فوراً في لوحة التحكم
    invalidateComprehensiveIndicatorsCache();

    // حساب الإحصائيات الجديدة للواجهة
    const totalVoters = await prisma.voter.count({ where: { deletedAt: null } });
    const checkedInCount = await prisma.voter.count({
      where: { votedOnDay: true, deletedAt: null },
    });
    const newPercentage = totalVoters > 0 ? Math.round((checkedInCount / totalVoters) * 100) : 0;

    return NextResponse.json({
      success: true,
      checkedInCount: resultData.checkedInCount,
      newPercentage,
      totalVoters,
      totalVoted: checkedInCount,
      message: `تم تسجيل حضور محاكاة لـ ${resultData.checkedInCount} ناخب بنجاح في قاعدة البيانات.`,
    });
  } catch (error) {
    return handleApiError(error, "simulate-turnout-post");
  }
}

// الإعادة والمحاكاة مسارات كتابة تدميرية/تغييرية → مسموح بها لـ ADMIN فقط.
export const POST = withAuth(postHandler, {
  POST: ["ADMIN"],
});

