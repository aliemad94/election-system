// ====================================================================
// /api/electoral-keys/[id] — تحديث وحذف مفتاح انتخابي
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError, auditLog } from "@/lib/security";
import { updateElectionKeySchema, formatZodError } from "@/lib/validators";

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

    const data: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.dateOfBirth) {
      data.birthDate = new Date(parsed.data.dateOfBirth);
      delete data.dateOfBirth;
    }
    if (parsed.data.firstContactDate) {
      data.firstContactDate = new Date(parsed.data.firstContactDate);
    }
    if (parsed.data.lastContactDate) {
      data.lastContactDate = new Date(parsed.data.lastContactDate);
    }
    if (parsed.data.lastSpentDate) {
      data.lastSpentDate = new Date(parsed.data.lastSpentDate);
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

    return NextResponse.json(updated);
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

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, "electoral-keys-delete");
  }
}

export const PUT = withAuth(putHandler, { PUT: ["ADMIN", "KEY_USER"] });
export const DELETE = withAuth(deleteHandler, { DELETE: ["ADMIN"] });

