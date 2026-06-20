// ====================================================================
// /api/voters/stats — ملخصات إحصائية للوحة التحكم
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/security";

async function getHandler(req: NextRequest, { user }: any) {
  try {
    const where: Record<string, unknown> = {};

    // KEY_USER يرى إحصاءات ناخبيه فقط
    if (user.role === "KEY_USER") {
      const key = await prisma.electionKey.findFirst({
        where: { phone: user.username },
        select: { id: true },
      });
      where.keyId = key?.id || "none";
    }

    const [
      totalVoters,
      checkedInCount,
      supportedCount,
      neutralCount,
      weakCount,
      avgAgg,
      districtGroups,
    ] = await Promise.all([
      prisma.voter.count({ where }),
      prisma.voter.count({ where: { ...where, votedOnDay: true } }),
      prisma.voter.count({ where: { ...where, status: "SUPPORTED" } }),
      prisma.voter.count({ where: { ...where, status: "NEUTRAL" } }),
      prisma.voter.count({ where: { ...where, status: "WEAK" } }),
      prisma.voter.aggregate({
        where,
        _avg: { supportDegree: true },
      }),
      prisma.voter.groupBy({
        by: ["district"],
        where,
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
    ]);

    const votedPercentage =
      totalVoters > 0 ? Math.round((checkedInCount / totalVoters) * 100) : 0;
    const avgConfidence = avgAgg._avg.supportDegree
      ? Math.round(avgAgg._avg.supportDegree * 10) / 10
      : 3.0;

    return NextResponse.json({
      totalVoters,
      checkedInCount,
      votedPercentage,
      supportedCount,
      neutralCount,
      weakCount,
      avgConfidence,
      districts: districtGroups.map((g) => ({
        district: g.district,
        count: g._count.id,
      })),
    });
  } catch (error) {
    return handleApiError(error, "voters-stats");
  }
}

export const GET = withAuth(getHandler, {
  GET: ["ADMIN", "KEY_USER", "OBSERVER"],
});
