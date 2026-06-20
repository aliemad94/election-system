// ====================================================================
// /api/stats — إحصائيات عامة شاملة
// ====================================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/security";

async function getHandler() {
  try {
    const [
      totalVoters,
      checkedInCount,
      totalKeys,
      totalTribes,
      totalServices,
      totalCompetitors,
      totalVolunteers,
      totalTasks,
      pendingTasks,
      totalCommission,
    ] = await Promise.all([
      prisma.voter.count(),
      prisma.voter.count({ where: { votedOnDay: true } }),
      prisma.electionKey.count(),
      prisma.tribe.count(),
      prisma.service.count(),
      prisma.competitor.count(),
      prisma.volunteer.count(),
      prisma.task.count(),
      prisma.task.count({ where: { status: "PENDING" } }),
      prisma.commissionData.count(),
    ]);

    const supportedCount = await prisma.voter.count({
      where: { status: "SUPPORTED" },
    });
    const weakCount = await prisma.voter.count({ where: { status: "WEAK" } });

    const turnoutPct =
      totalVoters > 0 ? Math.round((checkedInCount / totalVoters) * 100) : 0;

    return NextResponse.json({
      voters: { total: totalVoters, checkedIn: checkedInCount, turnoutPct, supported: supportedCount, weak: weakCount },
      keys: { total: totalKeys },
      tribes: { total: totalTribes },
      services: { total: totalServices },
      competitors: { total: totalCompetitors },
      volunteers: { total: totalVolunteers },
      tasks: { total: totalTasks, pending: pendingTasks },
      commission: { total: totalCommission },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error, "stats-get");
  }
}

export const GET = withAuth(getHandler, {
  GET: ["ADMIN", "KEY_USER", "OBSERVER"],
});

