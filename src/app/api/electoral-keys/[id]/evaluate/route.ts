// ====================================================================
// POST /api/electoral-keys/[id]/evaluate — تشغيل نموذج التقييم المتخصص
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { evaluateKeyDoubleFilter, generateDoubleFilterReport, type RatingDataV2 } from "@/lib/electoral-calculations";

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

    // إعداد بيانات الحساب — النظام الجديد: 11 حقلاً
    const votes = {
      supportedVotes: key.supportedVotes,
      neutralVotes: key.neutralVotes,
      weakVotes: key.weakVotes,
      totalVotes: key.totalVotes,
    };

    const ratings: RatingDataV2 = {
      loyaltyScore: key.loyaltyScore,
      influenceLevel: key.influenceLevel,
      mobilizationCap: key.mobilizationCap,
      voteProtection: key.voteProtection,
      supportReason: key.supportReason,
      needsLevel: key.needsLevel,
      politicalNote: key.politicalNote,
      organizationalNote: key.organizationalNote,
      generalNote: key.generalNote,
      dataAccuracy: (key as any).dataAccuracy ? parseInt((key as any).dataAccuracy) || 3 : 3,
      trainingReadiness: (key as any).trainingStatus === 'مكتمل' ? 5 : (key as any).trainingStatus === 'جاري' ? 3 : 1,
    };

    const fullName = [key.firstName, key.fatherName, key.grandfatherName]
      .filter(Boolean).join(' ') || key.keyCode;

    // الفلترة الثنائية الكاملة
    const result = evaluateKeyDoubleFilter(fullName, votes, ratings);
    const report = generateDoubleFilterReport(fullName, result);

    // تحديث المفتاح بالقيم المحسوبة
    const updated = await prisma.electionKey.update({
      where: { id },
      data: {
        netVotes: Math.round(result.netVoters),
        weightedScore: result.efficiencyCoefficient,
        classification: result.classification,
        lastEvaluationAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        username: user.username,
        action: "UPDATE",
        entity: "ElectionKey",
        entityId: id,
        details: JSON.stringify({ action: "EVALUATE_V2", class: result.classification, actualBallots: result.actualBallots }),
      },
    });

    return NextResponse.json({
      success: true,
      key: { ...updated, code: updated.keyCode },
      report,
      result,
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
