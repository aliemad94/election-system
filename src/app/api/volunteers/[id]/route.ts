// ====================================================================
// /api/volunteers/[id] — تحديث وحذف متطوع
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError, auditLog } from "@/lib/security";

async function putHandler(
  req: NextRequest,
  { params, user }: { params: Promise<{ id: string }>; user: any }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { fullName, phone, email, role, district, area, notes, efficiencyScore } = body;

    const existing = await prisma.volunteer.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "المتطوع غير موجود" },
        { status: 404 }
      );
    }

    // Check phone uniqueness if phone is changed
    if (phone && phone !== existing.phone) {
      const phoneExists = await prisma.volunteer.findUnique({ where: { phone } });
      if (phoneExists) {
        return NextResponse.json(
          { error: "رقم الهاتف مسجل لمتطوع آخر مسبقاً" },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.volunteer.update({
      where: { id },
      data: {
        fullName: fullName !== undefined ? fullName : existing.fullName,
        phone: phone !== undefined ? phone : existing.phone,
        email: email !== undefined ? email : existing.email,
        role: role !== undefined ? role : existing.role,
        district: district !== undefined ? district : existing.district,
        area: area !== undefined ? area : existing.area,
        notes: notes !== undefined ? notes : existing.notes,
        efficiencyScore: efficiencyScore !== undefined ? efficiencyScore : existing.efficiencyScore,
      },
    });

    await auditLog({
      userId: user.userId,
      username: user.username,
      action: "UPDATE",
      entity: "Volunteer",
      entityId: id,
      details: { name: updated.fullName, role: updated.role },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error, "volunteers-put");
  }
}

async function deleteHandler(
  _req: NextRequest,
  { params, user }: { params: Promise<{ id: string }>; user: any }
) {
  try {
    const { id } = await params;
    const existing = await prisma.volunteer.findUnique({
      where: { id },
      select: { id: true, fullName: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "المتطوع غير موجود" },
        { status: 404 }
      );
    }

    await prisma.volunteer.delete({ where: { id } });

    await auditLog({
      userId: user.userId,
      username: user.username,
      action: "DELETE",
      entity: "Volunteer",
      entityId: id,
      details: { name: existing.fullName },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, "volunteers-delete");
  }
}

export const PUT = withAuth(putHandler, { PUT: ["ADMIN", "KEY_USER"] });
export const DELETE = withAuth(deleteHandler, { DELETE: ["ADMIN"] });
