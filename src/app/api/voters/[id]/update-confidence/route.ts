// ====================================================================
// POST /api/voters/[id]/update-confidence — تحديث درجة الثقة للناخب مع تسجيل السبب
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import type { AuthenticatedUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";

async function postHandler(
  request: NextRequest,
  { params, user }: { params: Promise<{ id: string }>; user: AuthenticatedUser }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { newScore, reason } = body;

    if (newScore === undefined || newScore < 0 || newScore > 100) {
      return NextResponse.json(
        { error: "درجة الثقة يجب أن تكون بين 0 و 100" },
        { status: 400 }
      );
    }

    // الحصول على الدرجة الحالية للناخب
    const voter = await prisma.voter.findUnique({
      where: { id },
      select: { confidenceScore: true },
    });

    if (!voter) {
      return NextResponse.json(
        { error: "الناخب غير موجود" },
        { status: 404 }
      );
    }

    const oldScore = voter.confidenceScore;
    const change = newScore - oldScore;
    const changedBy = user.username || "system";

    // تحديث درجة الثقة وإنشاء سجل في معاملة واحدة
    const [updatedVoter, log] = await prisma.$transaction([
      prisma.voter.update({
        where: { id },
        data: { confidenceScore: newScore },
      }),
      prisma.confidenceLog.create({
        data: {
          voterId: id,
          oldScore,
          newScore,
          change,
          reason: reason || "تحديث يدوي لدرجة الثقة",
          changedBy,
        },
      }),
    ]);

    // تسجيل في سجل التدقيق العام
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        username: user.username,
        action: "UPDATE",
        entity: "VoterConfidence",
        entityId: id,
        details: JSON.stringify({ oldScore, newScore, reason }),
      },
    });

    return NextResponse.json({
      success: true,
      voter: updatedVoter,
      log,
    });
  } catch (error) {
    console.error("Error in update-confidence API:", error);
    return NextResponse.json(
      { error: "حدث خطأ في تحديث درجة الثقة للناخب" },
      { status: 500 }
    );
  }
}

// قصر التعديل على ADMIN و KEY_USER
export const POST = withAuth(postHandler, {
  POST: ["ADMIN", "KEY_USER"],
});
