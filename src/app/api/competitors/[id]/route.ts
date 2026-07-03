// ====================================================================
// /api/competitors/[id] — تحديث وحذف منافس
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import type { AuthenticatedUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError, auditLog } from "@/lib/security";

async function putHandler(
  req: NextRequest,
  { params, user }: { params: Promise<{ id: string }>; user: AuthenticatedUser }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { candidateName, partyOrList, strengthLevel, district, primaryArea, estimatedVotesBase, keyStrengths, keyWeaknesses, counterStrategy } = body;

    const existing = await prisma.competitor.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "المنافس غير موجود" },
        { status: 404 }
      );
    }

    const updated = await prisma.competitor.update({
      where: { id },
      data: {
        name: candidateName !== undefined ? candidateName : existing.name,
        party: partyOrList !== undefined ? partyOrList : existing.party,
        strengthLevel: strengthLevel !== undefined ? Number(strengthLevel) : existing.strengthLevel,
        baseDistrict: district !== undefined ? district : existing.baseDistrict,
        primaryArea: primaryArea !== undefined ? primaryArea : existing.primaryArea,
        estimatedVotes: estimatedVotesBase !== undefined ? Number(estimatedVotesBase) : existing.estimatedVotes,
        keyStrengths: keyStrengths !== undefined ? keyStrengths : existing.keyStrengths,
        keyWeaknesses: keyWeaknesses !== undefined ? keyWeaknesses : existing.keyWeaknesses,
        counterStrategy: counterStrategy !== undefined ? counterStrategy : existing.counterStrategy,
      },
    });

    await auditLog({
      userId: user.userId,
      username: user.username,
      action: "UPDATE",
      entity: "Competitor",
      entityId: id,
      details: { name: updated.name },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error, "competitors-put");
  }
}

async function deleteHandler(
  _req: NextRequest,
  { params, user }: { params: Promise<{ id: string }>; user: AuthenticatedUser }
) {
  try {
    const { id } = await params;
    const existing = await prisma.competitor.findUnique({
      where: { id },
      select: { id: true, name: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "المنافس غير موجود" },
        { status: 404 }
      );
    }

    await prisma.competitor.delete({ where: { id } });

    await auditLog({
      userId: user.userId,
      username: user.username,
      action: "DELETE",
      entity: "Competitor",
      entityId: id,
      details: { name: existing.name },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, "competitors-delete");
  }
}

export const PUT = withAuth(putHandler, { PUT: ["ADMIN", "KEY_USER"] });
export const DELETE = withAuth(deleteHandler, { DELETE: ["ADMIN"] });
