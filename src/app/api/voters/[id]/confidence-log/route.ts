// ====================================================================
// GET /api/voters/[id]/confidence-log — سجل تغيّرات الثقة لناخب
// POST /api/voters/[id]/confidence-log — إضافة سجل ثقة جديد
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";

async function getHandler(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const logs = await prisma.confidenceLog.findMany({
      where: { voterId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Error fetching confidence logs:", error);
    return NextResponse.json(
      { error: "حدث خطأ في استرجاع سجل الثقة" },
      { status: 500 }
    );
  }
}

async function postHandler(
  request: NextRequest,
  { params, user }: { params: Promise<{ id: string }>; user: any }
) {
  try {
    const { id } = await params;
    const { newScore, reason } = await request.json();
    const changedBy = user.username;

    if (newScore === undefined || newScore < 0 || newScore > 100) {
      return NextResponse.json(
        { error: "درجة الثقة يجب أن تكون بين 0 و 100" },
        { status: 400 }
      );
    }

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
          reason,
          changedBy,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      voter: updatedVoter,
      log,
    });
  } catch (error) {
    console.error("Error updating confidence:", error);
    return NextResponse.json(
      { error: "حدث خطأ في تحديث درجة الثقة" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getHandler, {
  GET: ["ADMIN", "KEY_USER", "OBSERVER"],
});
export const POST = withAuth(postHandler, {
  POST: ["ADMIN", "KEY_USER"],
});
