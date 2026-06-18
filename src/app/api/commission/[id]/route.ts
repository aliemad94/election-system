import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedUser } from "@/lib/auth-guard";
import { isValidCuid } from "@/lib/security";

// PUT /api/commission/[id] - Updates a commission data record
async function putHandler(
  request: NextRequest,
  { params, user }: { params: { id: string }; user: AuthenticatedUser }
) {
  try {
    const commissionId = params.id;
    if (!isValidCuid(commissionId)) {
      return NextResponse.json({ error: "معرف سجل المفوضية غير صالح" }, { status: 400 });
    }
    const body = await request.json();

    const updateData: Record<string, any> = {};

    if (body.province !== undefined) updateData.province = body.province;
    if (body.district !== undefined) updateData.district = body.district;
    if (body.subDistrict !== undefined) updateData.subDistrict = body.subDistrict;
    if (body.pollingCenter !== undefined) updateData.pollingCenter = body.pollingCenter;
    if (body.ballotStation !== undefined) updateData.ballotStation = body.ballotStation;
    
    if (body.registeredVoters !== undefined) {
      updateData.registeredVoters = parseInt(body.registeredVoters) || 0;
    }
    if (body.historicalTurnout !== undefined) {
      updateData.historicalTurnout = parseFloat(body.historicalTurnout) || 0.0;
    }
    if (body.expectedTurnout !== undefined) {
      updateData.expectedTurnout = body.expectedTurnout ? parseFloat(body.expectedTurnout) : null;
    }

    const updated = await prisma.commissionData.update({
      where: { id: commissionId },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[commission-put] failed:", error);
    return NextResponse.json({ error: "Failed to update commission record" }, { status: 500 });
  }
}

// DELETE /api/commission/[id] - Deletes a commission data record
async function deleteHandler(
  request: NextRequest,
  { params, user }: { params: { id: string }; user: AuthenticatedUser }
) {
  try {
    const commissionId = params.id;
    if (!isValidCuid(commissionId)) {
      return NextResponse.json({ error: "معرف سجل المفوضية غير صالح" }, { status: 400 });
    }
    await prisma.commissionData.delete({ where: { id: commissionId } });
    return NextResponse.json({ success: true, message: "Commission record deleted successfully" });
  } catch (error) {
    console.error("[commission-delete] failed:", error);
    return NextResponse.json({ error: "Failed to delete commission record" }, { status: 500 });
  }
}

export const PUT = withAuth(putHandler, { PUT: ["admin", "operator"] });
export const DELETE = withAuth(deleteHandler, { DELETE: ["admin"] });
