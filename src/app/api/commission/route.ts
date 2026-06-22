// ====================================================================
// /api/commission — بيانات المفوضية (GET + POST)
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError, auditLog } from "@/lib/security";

async function getHandler(_req: NextRequest) {
  try {
    let list = await prisma.commissionData.findMany({
      orderBy: { district: "asc" },
    });

    // لا توجد بيانات افتراضية — المستخدم يدخل البيانات الحقيقية بنفسه

    return NextResponse.json(list);
  } catch (error) {
    return handleApiError(error, "commission-get");
  }
}

async function postHandler(req: NextRequest, { user }: any) {
  try {
    const body = await req.json();
    const {
      province,
      district,
      subDistrict,
      pollingCenter,
      ballotStation,
      registeredVoters,
      historicalTurnout,
      expectedTurnout,
    } = body;

    if (!district || !pollingCenter || !ballotStation) {
      return NextResponse.json(
        { error: "القضاء، مركز الاقتراع، والمحطة حقول مطلوبة" },
        { status: 400 }
      );
    }

    const created = await prisma.commissionData.create({
      data: {
        province: province || "ذي قار",
        district,
        subDistrict: subDistrict || "المركز",
        pollingCenter,
        ballotStation,
        registeredVoters: parseInt(registeredVoters) || 0,
        historicalTurnout: parseFloat(historicalTurnout) || 0.0,
        expectedTurnout: expectedTurnout ? parseFloat(expectedTurnout) : null,
      },
    });

    await auditLog({
      userId: user.userId,
      username: user.username,
      action: "CREATE",
      entity: "CommissionData",
      entityId: created.id,
      details: { district, pollingCenter },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return handleApiError(error, "commission-post");
  }
}

export const GET = withAuth(getHandler, {
  GET: ["ADMIN", "KEY_USER", "OBSERVER"],
});
export const POST = withAuth(postHandler, { POST: ["ADMIN", "KEY_USER"] });

