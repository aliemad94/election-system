// ====================================================================
// /api/electoral-keys/[id] — تحديث وحذف مفتاح انتخابي
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError, auditLog } from "@/lib/security";
import { invalidateComprehensiveIndicatorsCache } from "@/lib/comprehensive-indicators-cache";
import { updateElectionKeySchema, formatZodError } from "@/lib/validators";
import { calculateAll } from "@/lib/electoral-calculations";

// PUT /api/electoral-keys/[id]
async function putHandler(
  req: NextRequest,
  { params, user }: { params: Record<string, any>; user: any }
) {
  try {
    const body = await req.json();
    const parsed = updateElectionKeySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const existing = await prisma.electionKey.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "المفتاح الانتخابي غير موجود" },
        { status: 404 }
      );
    }

    // KEY_USER يمكنه تعديل مفتاحه فقط
    if (user.role === "KEY_USER" && existing.phone !== user.username) {
      return NextResponse.json(
        { error: "غير مصرح - يمكنك تعديل مفتاحك فقط" },
        { status: 403 }
      );
    }

    const d = parsed.data;

    const merged = {
      supportedVotes: d.supportedVotes !== undefined ? d.supportedVotes : existing.supportedVotes,
      neutralVotes: d.neutralVotes !== undefined ? d.neutralVotes : existing.neutralVotes,
      weakVotes: d.weakVotes !== undefined ? d.weakVotes : existing.weakVotes,
      totalVotes: d.totalVotes !== undefined ? d.totalVotes : existing.totalVotes,
      loyaltyScore: d.loyaltyScore !== undefined ? d.loyaltyScore : existing.loyaltyScore,
      influenceLevel: d.influenceLevel !== undefined ? d.influenceLevel : existing.influenceLevel,
      mobilizationCap: d.mobilizationCap !== undefined ? d.mobilizationCap : existing.mobilizationCap,
      voteProtection: d.voteProtection !== undefined ? d.voteProtection : existing.voteProtection,
      supportReason: d.supportReason !== undefined ? d.supportReason : existing.supportReason,
      needsLevel: d.needsLevel !== undefined ? d.needsLevel : existing.needsLevel,
      politicalNote: d.politicalNote !== undefined ? d.politicalNote : existing.politicalNote,
      organizationalNote: d.organizationalNote !== undefined ? d.organizationalNote : existing.organizationalNote,
      generalNote: d.generalNote !== undefined ? d.generalNote : existing.generalNote,
    };

    if (d.totalVotes === undefined && (d.supportedVotes !== undefined || d.neutralVotes !== undefined || d.weakVotes !== undefined)) {
      merged.totalVotes = merged.supportedVotes + merged.neutralVotes + merged.weakVotes;
    }

    const calcResult = calculateAll(merged);

    const data: Record<string, unknown> = {
      ...d,
      totalVotes: merged.totalVotes,
      netVotes: Math.round(calcResult.netVotes),
      weightedScore: calcResult.weightedScore,
      classification: calcResult.classification,
    };

    if (d.dateOfBirth) {
      data.birthDate = new Date(d.dateOfBirth);
      delete data.dateOfBirth;
    }
    if (d.firstContactDate) {
      data.firstContactDate = new Date(d.firstContactDate);
    }
    if (d.lastContactDate) {
      data.lastContactDate = new Date(d.lastContactDate);
    }
    if (d.lastSpentDate) {
      data.lastSpentDate = new Date(d.lastSpentDate);
    }

    const updated = await prisma.electionKey.update({
      where: { id: params.id },
      data,
    });

    await auditLog({
      userId: user.userId,
      username: user.username,
      action: "UPDATE",
      entity: "ElectionKey",
      entityId: params.id,
      details: { fields: Object.keys(parsed.data).join(', ') },
    });

    invalidateComprehensiveIndicatorsCache();

    return NextResponse.json({ ...updated, code: updated.keyCode });
  } catch (error) {
    return handleApiError(error, "electoral-keys-put");
  }
}

// DELETE /api/electoral-keys/[id]
async function deleteHandler(
  _req: NextRequest,
  { params, user }: { params: Record<string, any>; user: any }
) {
  try {
    const existing = await prisma.electionKey.findUnique({
      where: { id: params.id },
      select: { id: true, firstName: true, keyCode: true, phone: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "المفتاح الانتخابي غير موجود" },
        { status: 404 }
      );
    }

    // حذف المفتاح يضمن حذف الناخبين المرتبطين (cascade عبر Prisma)
    await prisma.electionKey.delete({ where: { id: params.id } });

    await auditLog({
      userId: user.userId,
      username: user.username,
      action: "DELETE",
      entity: "ElectionKey",
      entityId: params.id,
      details: { keyCode: existing.keyCode, name: existing.firstName },
    });

    invalidateComprehensiveIndicatorsCache();

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, "electoral-keys-delete");
  }
}

export const PUT = withAuth(putHandler, { PUT: ["ADMIN", "KEY_USER"] });
export const DELETE = withAuth(deleteHandler, { DELETE: ["ADMIN"] });

