// ====================================================================
// POST /api/reset — إعادة تعيين البيانات (مقيّد بالمالك فقط)
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";

async function postHandler(
  request: NextRequest,
  { user }: { user: any }
) {
  try {
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "هذه العملية مقيّدة بالمالك فقط" },
        { status: 403 }
      );
    }

    // التحقق من التأكيد المزدوج
    const body = await request.json().catch(() => ({}));
    const { confirmReset } = body;
    if (confirmReset !== "CONFIRM_RESET_ALL_DATA") {
      return NextResponse.json(
        { error: "يجب تأكيد الإعادة بإرسال: CONFIRM_RESET_ALL_DATA" },
        { status: 400 }
      );
    }

    // حذف جميع البيانات مع الاحتفاظ بالمستخدمين فقط
    await prisma.$transaction([
      prisma.confidenceLog.deleteMany(),
      prisma.earlyWarning.deleteMany(),
      prisma.dynamicIndicator.deleteMany(),
      prisma.compositeIndicator.deleteMany(),
      prisma.sMSCampaign.deleteMany(),
      prisma.alert.deleteMany(),
      prisma.service.deleteMany(),
      prisma.task.deleteMany(),
      prisma.sentimentTrend.deleteMany(),
      prisma.voter.deleteMany(),
      prisma.electionKey.deleteMany(),
      prisma.electionResult.deleteMany(),
      prisma.tribe.deleteMany(),
      prisma.subTribe.deleteMany(),
      prisma.commissionData.deleteMany(),
      prisma.competitor.deleteMany(),
      prisma.volunteer.deleteMany(),
    ]);

    // تسجيل العملية
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        username: user.username,
        action: "DELETE",
        entity: "System",
        details: JSON.stringify({ type: "FULL_RESET" }),
        ipAddress: ip,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم إعادة تعيين جميع البيانات بالكامل بنجاح - القبائل والمفوضية والمفاتيح والناخبين",
    });
  } catch (error) {
    console.error("Error resetting data:", error);
    return NextResponse.json(
      { error: "حدث خطأ في إعادة تعيين البيانات" },
      { status: 500 }
    );
  }
}

export const POST = withAuth(postHandler, {
  POST: ["ADMIN"],
});
