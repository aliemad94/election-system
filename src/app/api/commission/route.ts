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

    // بيانات افتراضية إن كانت فارغة
    if (list.length === 0) {
      const defaultData = [
        {
          province: "ذي قار",
          district: "ذي قار (كلي)",
          subDistrict: "جميع النواحي",
          pollingCenter: "مراكز ذي قار",
          ballotStation: "كلي",
          registeredVoters: 1099438,
          historicalTurnout: 48.97,
          expectedTurnout: 48.97,
        },
        {
          province: "ذي قار",
          district: "الناصرية",
          subDistrict: "المركز",
          pollingCenter: "مراكز الناصرية",
          ballotStation: "عام",
          registeredVoters: 450000,
          historicalTurnout: 45.2,
          expectedTurnout: 45.2,
        },
        {
          province: "ذي قار",
          district: "الشطرة",
          subDistrict: "الشطرة",
          pollingCenter: "مراكز الشطرة",
          ballotStation: "عام",
          registeredVoters: 210000,
          historicalTurnout: 50.1,
          expectedTurnout: 50.1,
        },
      ];

      for (const item of defaultData) {
        await prisma.commissionData.create({ data: item });
      }
      list = await prisma.commissionData.findMany({
        orderBy: { district: "asc" },
      });
    }

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

