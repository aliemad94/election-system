// ====================================================================
// /api/voters/[id] — تحديث وحذف ناخب
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import type { AuthenticatedUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError, auditLog } from "@/lib/security";
import { invalidateComprehensiveIndicatorsCache } from "@/lib/comprehensive-indicators-cache";
import { updateVoterSchema, formatZodError } from "@/lib/validators";

async function putHandler(
  req: NextRequest,
  { params, user }: { params: Promise<{ id: string }>; user: AuthenticatedUser }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateVoterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const existing = await prisma.voter.findUnique({
      where: { id },
      select: { id: true, keyId: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "الناخب غير موجود" },
        { status: 404 }
      );
    }

    // التحقق من تكرار الهاتف باستثناء السجل الحالي
    if (parsed.data.phone) {
      const phoneExists = await prisma.voter.findFirst({
        where: { phone: parsed.data.phone, id: { not: id } },
        select: { id: true, firstName: true, fatherName: true, electionKey: { select: { firstName: true } } },
      });
      if (phoneExists) {
        return NextResponse.json(
          { error: `رقم الهاتف مسجل مسبقاً للناخب ${phoneExists.firstName} ${phoneExists.fatherName} تحت المفتاح ${phoneExists.electionKey?.firstName || "غير معروف"}` },
          { status: 400 }
        );
      }
    }

    // التحقق من تكرار الهوية الوطنية باستثناء السجل الحالي
    if (parsed.data.nationalId) {
      const nationalIdExists = await prisma.voter.findFirst({
        where: { nationalId: parsed.data.nationalId, id: { not: id } },
        select: { id: true, firstName: true, fatherName: true, electionKey: { select: { firstName: true } } },
      });
      if (nationalIdExists) {
        return NextResponse.json(
          { error: `رقم الهوية الوطنية مسجل مسبقاً للناخب ${nationalIdExists.firstName} ${nationalIdExists.fatherName} تحت المفتاح ${nationalIdExists.electionKey?.firstName || "غير معروف"}` },
          { status: 400 }
        );
      }
    }

    const data: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.dateOfBirth) {
      data.birthDate = new Date(parsed.data.dateOfBirth);
    }
    delete data.dateOfBirth;

    if (parsed.data.checkedInAt === undefined) {
      delete data.checkedInAt;
    } else if (parsed.data.checkedInAt === null || parsed.data.checkedInAt === "") {
      data.checkedInAt = null;
    } else {
      data.checkedInAt = new Date(parsed.data.checkedInAt);
    }

    if (data.tribeId === "" || data.tribeId === null) {
      data.tribeId = null;
    }
    if (data.subTribeId === "" || data.subTribeId === null) {
      data.subTribeId = null;
    }
    if (data.keyId === "" || data.keyId === null) {
      delete data.keyId;
    }

    const updated = await prisma.voter.update({
      where: { id },
      data,
    });

    await auditLog({
      userId: user.userId,
      username: user.username,
      action: "UPDATE",
      entity: "Voter",
      entityId: id,
      details: { name: updated.firstName, keyId: updated.keyId },
    });

    invalidateComprehensiveIndicatorsCache();

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error, "voters-put");
  }
}

async function deleteHandler(
  _req: NextRequest,
  { params, user }: { params: Promise<{ id: string }>; user: AuthenticatedUser }
) {
  try {
    const { id } = await params;
    const existing = await prisma.voter.findUnique({
      where: { id },
      select: { id: true, firstName: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "الناخب غير موجود" },
        { status: 404 }
      );
    }

    await prisma.voter.delete({ where: { id } });

    await auditLog({
      userId: user.userId,
      username: user.username,
      action: "DELETE",
      entity: "Voter",
      entityId: id,
      details: { name: existing.firstName },
    });

    invalidateComprehensiveIndicatorsCache();

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, "voters-delete");
  }
}

export const PUT = withAuth(putHandler, { PUT: ["ADMIN", "KEY_USER"] });
export const DELETE = withAuth(deleteHandler, { DELETE: ["ADMIN"] });

