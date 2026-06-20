// ====================================================================
// /api/volunteers — إدارة المتطوعين (GET + POST)
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError, auditLog } from "@/lib/security";

async function getHandler(_req: NextRequest) {
  try {
    const volunteers = await prisma.volunteer.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { tasks: true } } },
    });

    const mapped = volunteers.map((v) => ({
      ...v,
      taskCount: v._count.tasks,
      completionRate:
        v.totalAssignedTasks > 0
          ? Math.round((v.totalCompletedTasks / v.totalAssignedTasks) * 100)
          : 0,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    return handleApiError(error, "volunteers-get");
  }
}

async function postHandler(req: NextRequest, { user }: any) {
  try {
    const body = await req.json();
    const { fullName, phone, email, role, district, area, notes } = body;

    if (!fullName || !phone || !role) {
      return NextResponse.json(
        { error: "الاسم الكامل والهاتف والدور حقول مطلوبة" },
        { status: 400 }
      );
    }

    const existing = await prisma.volunteer.findUnique({ where: { phone } });
    if (existing) {
      return NextResponse.json(
        { error: "رقم الهاتف مسجل لمتطوع آخر مسبقاً" },
        { status: 400 }
      );
    }

    const volunteer = await prisma.volunteer.create({
      data: {
        fullName,
        phone,
        email: email || null,
        role,
        district: district || null,
        area: area || null,
        notes: notes || null,
        efficiencyScore: 100,
      },
    });

    await auditLog({
      userId: user.userId,
      username: user.username,
      action: "CREATE",
      entity: "Volunteer",
      entityId: volunteer.id,
      details: { name: volunteer.fullName, role: volunteer.role },
    });

    return NextResponse.json(volunteer, { status: 201 });
  } catch (error) {
    return handleApiError(error, "volunteers-post");
  }
}

export const GET = withAuth(getHandler, {
  GET: ["ADMIN", "KEY_USER", "OBSERVER"],
});
export const POST = withAuth(postHandler, { POST: ["ADMIN", "KEY_USER"] });

