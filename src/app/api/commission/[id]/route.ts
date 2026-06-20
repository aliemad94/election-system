// ====================================================================
// /api/commission/[id] — تحديث وحذف سجل مفوضية
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError, auditLog, isValidCuid } from "@/lib/security";

async function putHandler(
  req: NextRequest,
  { params, user }: { params: Record<string, any>; user: any }
) {
  try {
    if (!isValidCuid(params.id)) {
      return NextResponse.json(
        { error: "معرف سجل المفوضية غير صالح" },
        { status: 400 }
      );
    }
    const body = await req.json();
    const updateData: Record<string, unknown> = {};

    if (body.province !== undefined) updateData.province = body.province;
    if (body.district !== undefined) updateData.district = body.district;
    if (body.subDistrict !== undefined) updateData.subDistrict = body.subDistrict;
    if (body.pollingCenter !== undefined) updateData.pollingCenter = body.pollingCenter;
    if (body.ballotStation !== undefined) updateData.ballotStation = body.ballotStation;
    if (body.registeredVoters !== undefined)
      updateData.registeredVoters = parseInt(body.registeredVoters) || 0;
    if (body.historicalTurnout !== undefined)
      updateData.historicalTurnout = parseFloat(body.historicalTurnout) || 0.0;
    if (body.expectedTurnout !== undefined)
      updateData.expectedTurnout = body.expectedTurnout
        ? parseFloat(body.expectedTurnout)
        : null;

    const updated = await prisma.commissionData.update({
      where: { id: params.id },
      data: updateData,
    });

    await auditLog({
      userId: user.userId,
      username: user.username,
      action: "UPDATE",
      entity: "CommissionData",
      entityId: params.id,
      details: { fields: Object.keys(updateData).join(', ') },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error, "commission-put");
  }
}

async function deleteHandler(
  _req: NextRequest,
  { params, user }: { params: Record<string, any>; user: any }
) {
  try {
    if (!isValidCuid(params.id)) {
      return NextResponse.json(
        { error: "معرف سجل المفوضية غير صالح" },
        { status: 400 }
      );
    }
    await prisma.commissionData.delete({ where: { id: params.id } });

    await auditLog({
      userId: user.userId,
      username: user.username,
      action: "DELETE",
      entity: "CommissionData",
      entityId: params.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, "commission-delete");
  }
}

export const PUT = withAuth(putHandler, { PUT: ["ADMIN", "KEY_USER"] });
export const DELETE = withAuth(deleteHandler, { DELETE: ["ADMIN"] });

