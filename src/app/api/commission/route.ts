// ====================================================================
// /api/commission — بيانات المفوضية (مرجعية المحافظة + إدخال الأقضية)
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError, auditLog } from "@/lib/security";

async function getHandler(_req: NextRequest) {
  try {
    const [list, reference] = await Promise.all([
      prisma.commissionData.findMany({
        orderBy: { district: "asc" },
      }),
      prisma.provinceReference.findFirst({
        where: { province: "ذي قار" },
      }),
    ]);

    // حساب نسبة المشاركة تلقائياً لكل قضاء
    const enriched = list.map((d) => ({
      ...d,
      turnout: d.registeredVoters > 0
        ? parseFloat(((d.actualVoters / d.registeredVoters) * 100).toFixed(2))
        : 0,
    }));

    return NextResponse.json({ list: enriched, reference });
  } catch (error) {
    return handleApiError(error, "commission-get");
  }
}

async function postHandler(req: NextRequest, { user }: any) {
  try {
    const body = await req.json();
    const {
      district,
      registeredVoters,
      actualVoters,
      maleVoters,
      femaleVoters,
      pollingCenters,
      ballotStations,
    } = body;

    if (!district) {
      return NextResponse.json(
        { error: "القضاء حقل مطلوب" },
        { status: 400 }
      );
    }

    // الحقل السابع (نسبة المشاركة) يُحسب تلقائياً بمعادلة:
    // (عدد المصوتين الكلي ÷ عدد الناخبين الكلي) × 100
    // يحسب في الـ GET handler، لا يُخزّن

    const created = await prisma.commissionData.upsert({
      where: { district },
      update: {
        registeredVoters: registeredVoters || 0,
        actualVoters: actualVoters || 0,
        maleVoters: maleVoters || 0,
        femaleVoters: femaleVoters || 0,
        pollingCenters: pollingCenters || 0,
        ballotStations: ballotStations || 0,
      },
      create: {
        province: "ذي قار",
        district,
        registeredVoters: registeredVoters || 0,
        actualVoters: actualVoters || 0,
        maleVoters: maleVoters || 0,
        femaleVoters: femaleVoters || 0,
        pollingCenters: pollingCenters || 0,
        ballotStations: ballotStations || 0,
      },
    });

    const turnout = created.registeredVoters > 0
      ? parseFloat(((created.actualVoters / created.registeredVoters) * 100).toFixed(2))
      : 0;

    await auditLog({
      userId: user.userId,
      username: user.username,
      action: "CREATE",
      entity: "CommissionData",
      entityId: created.id,
      details: { district, registeredVoters, actualVoters, turnout },
    });

    return NextResponse.json({ ...created, turnout }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "commission-post");
  }
}

export const GET = withAuth(getHandler, {
  GET: ["ADMIN", "KEY_USER", "OBSERVER"],
});
export const POST = withAuth(postHandler, {
  POST: ["ADMIN", "KEY_USER"],
});
