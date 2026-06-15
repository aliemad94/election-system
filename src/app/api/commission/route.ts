import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedUser } from "@/lib/auth-guard";

// GET /api/commission - Returns all commission statistics grouped by district
async function getHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    let list = await prisma.commissionData.findMany({
      orderBy: { district: "asc" }
    });

    // Seed default Governorate totals if empty
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
        {
          province: "ذي قار",
          district: "الرفاعي",
          subDistrict: "الرفاعي",
          pollingCenter: "مراكز الرفاعي",
          ballotStation: "عام",
          registeredVoters: 130000,
          historicalTurnout: 52.4,
          expectedTurnout: 52.4,
        },
        {
          province: "ذي قار",
          district: "الدواية",
          subDistrict: "الدواية",
          pollingCenter: "مراكز الدواية",
          ballotStation: "عام",
          registeredVoters: 850000,
          historicalTurnout: 49.8,
          expectedTurnout: 49.8,
        }
      ];

      for (const item of defaultData) {
        await prisma.commissionData.create({
          data: item
        });
      }

      list = await prisma.commissionData.findMany({
        orderBy: { district: "asc" }
      });
    }

    return NextResponse.json(list);
  } catch (error) {
    console.error("[commission-get] failed:", error);
    return NextResponse.json({ error: "Failed to retrieve commission data" }, { status: 500 });
  }
}

// POST /api/commission - Creates new district commission data
async function postHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const body = await request.json();
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
      return NextResponse.json({ error: "القضاء، مركز الاقتراع، والمحطة حقول مطلوبة" }, { status: 400 });
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
      }
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error("[commission-post] failed:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "هذه المحطة ومركز الاقتراع مسجلان مسبقاً" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create commission data" }, { status: 500 });
  }
}

export const GET = withAuth(getHandler, { GET: ["admin", "viewer", "operator", "key_user"] });
export const POST = withAuth(postHandler, { POST: ["admin", "operator"] });
