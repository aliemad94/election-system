// ====================================================================
// POST /api/electoral-keys/[id]/evaluate — تشغيل نموذج التقييم المتخصص
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { calculateAll, type ElectoralKeyData } from "@/lib/electoral-calculations";

async function postHandler(
  request: NextRequest,
  { params, user }: { params: { id: string }; user: any }
) {
  try {
    const { id } = params;

    const key = await prisma.electionKey.findUnique({
      where: { id },
    });

    if (!key) {
      return NextResponse.json(
        { error: "المفتاح الانتخابي غير موجود" },
        { status: 404 }
      );
    }

    // إعداد بيانات الحساب
    const data: ElectoralKeyData = {
      supportedVotes: key.supportedVotes,
      neutralVotes: key.neutralVotes,
      weakVotes: key.weakVotes,
      totalVotes: key.totalVotes,
      loyaltyScore: key.loyaltyScore,
      influenceLevel: key.influenceLevel,
      mobilizationCap: key.mobilizationCap,
      voteProtection: key.voteProtection,
      supportReason: key.supportReason,
      needsLevel: key.needsLevel,
      politicalNote: key.politicalNote,
      organizationalNote: key.organizationalNote,
      generalNote: key.generalNote,
    };

    // حساب جميع المعادلات
    const result = calculateAll(data);

    // حساب تكلفة الصوت
    const costPerVote = result.netVotes > 0
      ? Math.round((key.totalInvestment / result.netVotes) * 100) / 100
      : 0;

    // تحديث المفتاح بالقيم المحسوبة
    const updated = await prisma.electionKey.update({
      where: { id },
      data: {
        netVotes: Math.round(result.netVotes),
        totalVotes: result.totalVotes,
        weightedScore: result.weightedScore,
        classification: result.classification,
        costPerVote,
      },
    });

    // تسجيل في سجل التدقيق
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        username: user.username,
        action: "UPDATE",
        entity: "ElectionKey",
        entityId: id,
        details: JSON.stringify({ action: "EVALUATE", result: { score: result.weightedScore, class: result.classification } }),
      },
    });

    return NextResponse.json({
      success: true,
      key: updated,
      calculations: {
        ...result,
        costPerVote,
      },
    });
  } catch (error) {
    console.error("Error evaluating key:", error);
    return NextResponse.json(
      { error: "حدث خطأ في تقييم المفتاح الانتخابي" },
      { status: 500 }
    );
  }
}

export const POST = withAuth(postHandler, {
  POST: ["ADMIN", "KEY_USER"],
});
