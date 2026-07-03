// ====================================================================
// /api/election-results/historical/[id] — حذف سجل نتائج انتخابية
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import type { AuthenticatedUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError, auditLog } from "@/lib/security";

async function deleteHandler(
  _req: NextRequest,
  { params, user }: { params: Promise<{ id: string }>; user: AuthenticatedUser }
) {
  try {
    const { id } = await params;
    const existing = await prisma.electionResult.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "سجل نتائج الانتخابات غير موجود" }, { status: 404 });
    }

    await prisma.electionResult.delete({ where: { id } });

    await auditLog({
      userId: user.userId,
      username: user.username,
      action: "DELETE",
      entity: "ElectionResult",
      entityId: id,
      details: { year: existing.year, scope: existing.scope, electionType: existing.electionType },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, "election-results-historical-delete");
  }
}

export const DELETE = withAuth(deleteHandler, {
  DELETE: ["ADMIN"],
});
