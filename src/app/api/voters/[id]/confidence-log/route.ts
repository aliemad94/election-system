// ====================================================================
// GET /api/voters/[id]/confidence-log — سجل تغيّرات الثقة لناخب
// POST /api/voters/[id]/confidence-log — إضافة سجل ثقة جديد
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { newScore, reason, changedBy } = await request.json();

    if (newScore === undefined || newScore < 0 || newScore > 100) {
      return NextResponse.json(
        { error: "درجة الثقة يجب أن تكون بين 0 و 100" },
        { status: 400 }
      );
    }

    // الحصول على الدرجة الحالية
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
