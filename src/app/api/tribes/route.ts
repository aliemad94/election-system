// ====================================================================
// /api/tribes — إدارة العشائر (CRUD مع Zod + RBAC + audit)
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import type { AuthenticatedUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/security";
import { auditLog } from "@/lib/security";
import { createTribeSchema, formatZodError } from "@/lib/validators";

// GET /api/tribes — قائمة العشائر مع إحصاءات الناخبين والتقسيم والبحث
async function getHandler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const shouldPaginate = searchParams.has("page") || searchParams.has("limit") || searchParams.get("paginate") === "true";
    const district = searchParams.get("district");
    const search = searchParams.get("search");

    const where: any = { deletedAt: null };
    
    if (district && district !== "all" && district.trim() !== "") {
      where.district = district;
    }
    
    if (search && search.trim() !== "") {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { leaderName: { contains: q, mode: "insensitive" } },
      ];
    }

    if (shouldPaginate) {
      const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
      const limit = Math.min(
        200,
        Math.max(1, parseInt(searchParams.get("limit") ?? "15"))
      );

      const [tribes, total] = await Promise.all([
        prisma.tribe.findMany({
          where,
          include: {
            _count: {
              select: { voters: true, subTribes: true },
            },
          },
          orderBy: { name: "asc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.tribe.count({ where }),
      ]);

      // إحصاءات التصويت لكل عشيرة
      const votedGroups = await prisma.voter.groupBy({
        by: ["tribeId"],
        where: { votedOnDay: true, tribeId: { not: null } },
        _count: { id: true },
      });
      const votedMap = new Map(
        votedGroups.map((g) => [g.tribeId, g._count.id])
      );

      // متوسط الثقة للناخبين المنتمين للعشيرة
      const confidenceGroups = await prisma.voter.groupBy({
        by: ["tribeId"],
        where: { tribeId: { not: null } },
        _avg: { supportDegree: true },
      });
      const confidenceMap = new Map(
        confidenceGroups.map((g) => [g.tribeId, g._avg.supportDegree ?? 3])
      );

      const list = tribes.map((t) => {
        const voterCount = t._count.voters;
        const votedCount = votedMap.get(t.id) || 0;
        const avgConfidence = confidenceMap.get(t.id) || 3;
        return {
          id: t.id,
          name: t.name,
          description: t.description,
          leaderName: t.leaderName,
          leaderPhone: t.leaderPhone,
          influence: t.influenceRating,
          district: t.district,
          notes: t.notes,
          voterCount,
          votedCount,
          votedPercentage:
            voterCount > 0 ? Math.round((votedCount / voterCount) * 100) : 0,
          avgConfidence: Number(avgConfidence.toFixed(1)),
          subTribeCount: t._count.subTribes,
          createdAt: t.createdAt.toISOString(),
        };
      });

      return NextResponse.json({
        list,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } else {
      // السلوك القديم المتوافق: إرجاع جميع السجلات في مصفوفة مسطحة
      const tribes = await prisma.tribe.findMany({
        where,
        include: {
          _count: {
            select: { voters: true, subTribes: true },
          },
        },
        orderBy: { name: "asc" },
      });

      const votedGroups = await prisma.voter.groupBy({
        by: ["tribeId"],
        where: { votedOnDay: true, tribeId: { not: null } },
        _count: { id: true },
      });
      const votedMap = new Map(
        votedGroups.map((g) => [g.tribeId, g._count.id])
      );

      const confidenceGroups = await prisma.voter.groupBy({
        by: ["tribeId"],
        where: { tribeId: { not: null } },
        _avg: { supportDegree: true },
      });
      const confidenceMap = new Map(
        confidenceGroups.map((g) => [g.tribeId, g._avg.supportDegree ?? 3])
      );

      const result = tribes.map((t) => {
        const voterCount = t._count.voters;
        const votedCount = votedMap.get(t.id) || 0;
        const avgConfidence = confidenceMap.get(t.id) || 3;
        return {
          id: t.id,
          name: t.name,
          description: t.description,
          leaderName: t.leaderName,
          leaderPhone: t.leaderPhone,
          influence: t.influenceRating,
          district: t.district,
          notes: t.notes,
          voterCount,
          votedCount,
          votedPercentage:
            voterCount > 0 ? Math.round((votedCount / voterCount) * 100) : 0,
          avgConfidence: Number(avgConfidence.toFixed(1)),
          subTribeCount: t._count.subTribes,
          createdAt: t.createdAt.toISOString(),
        };
      });

      return NextResponse.json(result);
    }
  } catch (error) {
    return handleApiError(error, "tribes-get");
  }
}

// POST /api/tribes — إنشاء عشيرة وحفظ كافة البيانات الخاصة بها
async function postHandler(req: NextRequest, { user }: { user: AuthenticatedUser }) {
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
        description: parsed.data.description || parsed.data.notes || null,
        leaderName: parsed.data.leaderName || null,
        leaderPhone: parsed.data.leaderPhone || null,
        district: parsed.data.district || null,
        influenceRating: parsed.data.influence !== undefined ? parsed.data.influence : 3,
        notes: parsed.data.notes || null,
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

