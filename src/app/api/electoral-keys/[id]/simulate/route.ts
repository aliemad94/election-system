// ====================================================================
// POST /api/electoral-keys/[id]/simulate — محاكاة سيناريو بدون حفظ
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { simulateScenario, type ElectoralKeyData } from "@/lib/electoral-calculations";

async function postHandler(
  request: NextRequest,
  { params }: { params: { id: string }; user: any }
) {
  try {
    const { id } = params;
    const overrides = await request.json().catch(() => ({}));

    const key = await prisma.electionKey.findUnique({
      where: { id },
    });

    if (!key) {
      return NextResponse.json(
        { error: "المفتاح الانتخابي غير موجود" },
        { status: 404 }
      );
    }

    // البيانات الحالية
    const currentData: ElectoralKeyData = {
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

    // محاكاة بالقيم المعدّلة
    const simulated = simulateScenario(currentData, overrides);

    // المقارنة مع الحالة الحالية
    const currentNetVotes = key.netVotes;
    const currentWeightedScore = key.weightedScore;
    const currentClassification = key.classification;

    return NextResponse.json({
      success: true,
      current: {
        netVotes: currentNetVotes,
        weightedScore: currentWeightedScore,
        classification: currentClassification,
      },
      simulated: {
        netVotes: simulated.netVotes,
        weightedScore: simulated.weightedScore,
        classification: simulated.classification,
        rawScore: simulated.rawScore,
      },
      delta: {
        netVotes: Math.round((simulated.netVotes - currentNetVotes) * 100) / 100,
        weightedScore: Math.round((simulated.weightedScore - currentWeightedScore) * 100) / 100,
        classificationChanged: simulated.classification !== currentClassification,
      },
    });
  } catch (error) {
    console.error("Error simulating scenario:", error);
    return NextResponse.json(
      { error: "حدث خطأ في محاكاة السيناريو" },
      { status: 500 }
    );
  }
}

export const POST = withAuth(postHandler, {
  POST: ["ADMIN", "KEY_USER"],
});
