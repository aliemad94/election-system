// ====================================================================
// /api/commission/[id] — حذف سجل مفوضية لقضاء
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError, auditLog } from "@/lib/security";

async function deleteHandler(
  _req: NextRequest,
  { params, user }: { params: Promise<{ id: string }>; user: any }
) {
  try {
    const { id } = await params;
    const existing = await prisma.commissionData.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "السجل غير موجود" }, { status: 404 });
    }

    await prisma.commissionData.delete({ where: { id } });

    await auditLog({
      userId: user.userId,
      username: user.username,
      action: "DELETE",
      entity: "CommissionData",
      entityId: id,
      details: { district: existing.district },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, "commission-delete");
  }
}

export const DELETE = withAuth(deleteHandler, {
  DELETE: ["ADMIN", "KEY_USER"],
});
