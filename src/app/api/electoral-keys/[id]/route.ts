// ====================================================================
// /api/electoral-keys/[id] — تحديث وحذف مفتاح انتخابي
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import type { AuthenticatedUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError, auditLog } from "@/lib/security";
import { invalidateComprehensiveIndicatorsCache } from "@/lib/comprehensive-indicators-cache";
import { updateElectionKeySchema, formatZodError } from "@/lib/validators";
import { calculateAll } from "@/lib/electoral-calculations";

// PUT /api/electoral-keys/[id]
async function putHandler(
  req: NextRequest,
  { params, user }: { params: Promise<{ id: string }>; user: AuthenticatedUser }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateElectionKeySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const existing = await prisma.electionKey.findUnique({
      where: { id },
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
    }
    delete data.dateOfBirth;

    const dateFields = ["firstContactDate", "lastContactDate", "lastSpentDate"];
    for (const field of dateFields) {
      const val = d[field as keyof typeof d];
      if (val === undefined) {
        delete data[field];
      } else if (val === null || val === "") {
        data[field] = null;
      } else {
        data[field] = new Date(val as string);
      }
    }

    if (data.tribeId === "" || data.tribeId === null) {
      data.tribeId = null;
    }
    if (data.subTribeId === "" || data.subTribeId === null) {
      data.subTribeId = null;
    }

    const expectedVersion = body.version !== undefined ? Number(body.version) : undefined;
    let updated;
    if (expectedVersion !== undefined) {
      const result = await prisma.electionKey.updateMany({
        where: { id, version: expectedVersion },
        data: { ...data, version: { increment: 1 } } as any
      });
      if (result.count === 0) {
        return NextResponse.json(
          { error: "السجل تغيّر بواسطة مستخدم آخر، أعد التحميل" },
          { status: 409 }
        );
      }
      const fetched = await prisma.electionKey.findUnique({ where: { id } });
      if (!fetched) {
        return NextResponse.json(
          { error: "المفتاح الانتخابي غير موجود" },
          { status: 404 }
        );
      }
      updated = fetched;
    } else {
      updated = await prisma.electionKey.update({
        where: { id },
        data,
      });
    }

    await auditLog({
      userId: user.userId,
      username: user.username,
      action: "UPDATE",
      entity: "ElectionKey",
      entityId: id,
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
  { params, user }: { params: Promise<{ id: string }>; user: AuthenticatedUser }
) {
  try {
    const { id } = await params;
    const existing = await prisma.electionKey.findUnique({
      where: { id },
      select: { id: true, firstName: true, keyCode: true, phone: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "المفتاح الانتخابي غير موجود" },
        { status: 404 }
      );
    }

    // حذف السجلات المرتبطة لتفادي انتهاك القيود الخارجية (Foreign Key Constraints)
    await prisma.$transaction([
      prisma.task.deleteMany({ where: { electoralKeyId: id } }),
      prisma.service.deleteMany({ where: { keyId: id } }),
      prisma.voter.deleteMany({ where: { keyId: id } }),
      prisma.electionKey.delete({ where: { id } }),
    ]);

    await auditLog({
      userId: user.userId,
      username: user.username,
      action: "DELETE",
      entity: "ElectionKey",
      entityId: id,
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

