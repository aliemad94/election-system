import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { invalidateComprehensiveIndicatorsCache } from "@/lib/comprehensive-indicators-cache";

async function postHandler(request: NextRequest, context: any) {
  const user = context.user;
  try {
    console.log(`Clean demo data triggered by user ${user.username}`);

    // يحذف فقط المؤشرات والتحذيرات التلقائية والمحاكاة
    await prisma.$transaction([
      prisma.confidenceLog.deleteMany(),
      prisma.earlyWarning.deleteMany(),
      prisma.dynamicIndicator.deleteMany(),
      prisma.compositeIndicator.deleteMany(),
      prisma.sentimentTrend.deleteMany(),
    ]);

    invalidateComprehensiveIndicatorsCache();

    // تسجيل في سجل التدقيق
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        username: user.username,
        action: "DELETE",
        entity: "System",
        details: JSON.stringify({ type: "CLEAN_DEMO_DATA" }),
        ipAddress: ip,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم تنظيف بيانات المحاكاة والمؤشرات التلقائية بنجاح دون المساس بالبيانات الحقيقية",
    });
  } catch (error) {
    console.error("Error cleaning demo data:", error);
    return NextResponse.json(
      { error: "حدث خطأ في تنظيف البيانات" },
      { status: 500 }
    );
  }
}

export const POST = withAuth(postHandler, {
  POST: ["ADMIN"],
});
