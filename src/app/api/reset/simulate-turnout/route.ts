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
    // إجراء تدميري على مستوى المحافظة: يتطلب تأكيداً مزدوجاً نصياً (مثل /api/reset).
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

      const result = await prisma.voter.updateMany({
        data: {
          votedOnDay: false,
          checkedIn: false,
          checkedInAt: null,
        },
      });

      invalidateComprehensiveIndicatorsCache();

      // تسجيل العملية التدميرية في سجل التدقيق (مثل /api/reset)
      const user = context?.user;
      if (user?.userId) {
        await prisma.auditLog.create({
          data: {
            userId: user.userId,
            username: user.username || "unknown",
            action: "RESET_TURNOUT",
            ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || null,
          },
        });
      }

      return NextResponse.json({
        success: true,
        checkedInCount: 0,
        affectedVoters: result.count,
        message: "تم بنجاح تصفير وإعادة تعيين حضور الناخبين ليوم الاقتراع.",
      });
    }

    // 2. محاكاة زيادة الحضور
    const countParam = searchParams.get("count") || "25";
    const targetCount = parseInt(countParam, 10) || 25;

    // جلب عينة عشوائية من الناخبين الذين لم يصوتوا بعد
    const unvotedVoters = await prisma.voter.findMany({
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
      return NextResponse.json({
        success: true,
        checkedInCount: 0,
        message: "تم تصويت جميع الناخبين في قاعدة البيانات بالكامل!",
      });
    }

    const voterIds = unvotedVoters.map((v) => v.id);

    // تحديث حالتهم إلى "صوّت" وتحديد تاريخ التصويت
    const now = new Date();
    await prisma.voter.updateMany({
      where: {
        id: { in: voterIds },
      },
      data: {
        votedOnDay: true,
        checkedIn: true,
        checkedInAt: now,
      },
    });

    // مسح كاش المؤشرات لضمان انعكاس التغييرات فوراً في لوحة التحكم
    invalidateComprehensiveIndicatorsCache();

    // حساب الإحصائيات الجديدة
    const totalVoters = await prisma.voter.count({ where: { deletedAt: null } });
    const checkedInCount = await prisma.voter.count({
      where: { votedOnDay: true, deletedAt: null },
    });
    const newPercentage = totalVoters > 0 ? Math.round((checkedInCount / totalVoters) * 100) : 0;

    return NextResponse.json({
      success: true,
      checkedInCount: voterIds.length,
      newPercentage,
      totalVoters,
      totalVoted: checkedInCount,
      message: `تم تسجيل تصويت ${voterIds.length} ناخب بنجاح في قاعدة البيانات.`,
    });
  } catch (error) {
    return handleApiError(error, "simulate-turnout-post");
  }
}

// الإعادة (reset) تدميرية على مستوى المحافظة → تُقتصر على ADMIN فقط.
// المحاكاة (simulate) غير تدميرية → يُسمح بها لـ KEY_USER أيضاً.
// أزلنا ربط GET بالإجراء التدميري لمنع التشغيل العرضي (prefetch/CSRF-like).
async function getHandler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  if (action === "reset") {
    return NextResponse.json(
      { error: "استخدم POST مع تأكيد confirm=CONFIRM_RESET_TURNOUT لإعادة التعيين." },
      { status: 405 }
    );
  }
  return postHandler(req);
}

export const POST = withAuth(postHandler, {
  POST: ["ADMIN"],
});
export const GET = withAuth(getHandler, {
  GET: ["ADMIN", "KEY_USER"],
});
