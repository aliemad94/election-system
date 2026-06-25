// ====================================================================
// /api/reset/simulate-turnout — محاكاة وإعادة تعيين إقبال الناخبين
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/security";
import { invalidateComprehensiveIndicatorsCache } from "@/lib/comprehensive-indicators-cache";

async function postHandler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    // 1. إجراء إعادة التعيين ليوم التصويت (تصفير حضور الناخبين)
    if (action === "reset") {
      await prisma.voter.updateMany({
        data: {
          votedOnDay: false,
          checkedIn: false,
          checkedInAt: null,
        },
      });

      invalidateComprehensiveIndicatorsCache();

      return NextResponse.json({
        success: true,
        checkedInCount: 0,
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

export const POST = withAuth(postHandler, {
  POST: ["ADMIN", "KEY_USER"],
});
export const GET = withAuth(postHandler, {
  GET: ["ADMIN", "KEY_USER"],
}); // Allow GET for quick manual browser triggers as well
