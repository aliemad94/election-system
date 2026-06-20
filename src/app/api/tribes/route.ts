// ====================================================================
// /api/tribes — إدارة العشائر (CRUD مع Zod + RBAC + audit)
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/security";
import { auditLog } from "@/lib/security";
import { createTribeSchema, formatZodError } from "@/lib/validators";

// GET /api/tribes — قائمة العشائر مع إحصاءات الناخبين
async function getHandler(_req: NextRequest) {
  try {
    const tribes = await prisma.tribe.findMany({
      include: {
        _count: {
          select: { voters: true, subTribes: true },
        },
      },
      orderBy: { name: "asc" },
    });

    // إحصاءات التصويت لكل عشيرة
    const votedGroups = await prisma.voter.groupBy({
      by: ["tribeId"],
      where: { votedOnDay: true, tribeId: { not: null } },
      _count: { id: true },
    });
    const votedMap = new Map(
      votedGroups.map((g) => [g.tribeId, g._count.id])
    );

    const result = tribes.map((t) => {
      const voterCount = t._count.voters;
      const votedCount = votedMap.get(t.id) || 0;
      return {
        id: t.id,
        name: t.name,
        description: t.description,
        voterCount,
        votedCount,
        votedPercentage:
          voterCount > 0 ? Math.round((votedCount / voterCount) * 100) : 0,
        subTribeCount: t._count.subTribes,
        createdAt: t.createdAt.toISOString(),
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error, "tribes-get");
  }
}

// POST /api/tribes — إنشاء عشيرة
async function postHandler(req: NextRequest, { user }: any) {
  try {
    const body = await req.json();
    const parsed = createTribeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const tribe = await prisma.tribe.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description || null,
      },
    });

    await auditLog({
      userId: user.userId,
      username: user.username,
      action: "CREATE",
      entity: "Tribe",
      entityId: tribe.id,
      details: { name: tribe.name },
    });

    return NextResponse.json(tribe, { status: 201 });
  } catch (error) {
    return handleApiError(error, "tribes-post");
  }
}

export const GET = withAuth(getHandler, {
  GET: ["ADMIN", "KEY_USER", "OBSERVER"],
});
export const POST = withAuth(postHandler, { POST: ["ADMIN", "KEY_USER"] });

