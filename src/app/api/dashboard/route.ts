import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedUser } from "@/lib/auth-guard";

async function getHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    // 1. Core voter aggregates
    const totalVoters = await prisma.voter.count();
    const checkedInCount = await prisma.voter.count({ where: { votedOnDay: true } });
    const votedPercentage = totalVoters > 0 ? Math.round((checkedInCount / totalVoters) * 100) : 0;

    // 2. High confidence count (supportDegree >= 4)
    const highConfidenceCount = await prisma.voter.count({
      where: { supportDegree: { gte: 4 } }
    });

    // 3. District Statistics
    const districtGroups = await prisma.voter.groupBy({
      by: ['district'],
      _count: { id: true }
    });
    const districtVotedGroups = await prisma.voter.groupBy({
      by: ['district'],
      where: { votedOnDay: true },
      _count: { id: true }
    });
    const districtVotedMap = new Map(districtVotedGroups.map(g => [g.district, g._count.id]));

    const districtStats = districtGroups.map(g => {
      const dist = g.district || "غير محدد";
      const count = g._count.id;
      const voted = districtVotedMap.get(g.district) || 0;
      return {
        district: dist,
        totalVoters: count,
        votedCount: voted,
        votedPercentage: count > 0 ? Math.round((voted / count) * 100) : 0,
        confidencePoints: count * 30,
      };
    });

    // 4. Tribe Rankings (grouped by tribe)
    const tribeVoterCounts = await prisma.voter.groupBy({
      by: ['tribeId'],
      _count: { id: true }
    });
    const tribeVotedCounts = await prisma.voter.groupBy({
      by: ['tribeId'],
      where: { votedOnDay: true },
      _count: { id: true }
    });
    const tribes = await prisma.tribe.findMany({
      select: { id: true, name: true }
    });

    const tribeNameMap = new Map(tribes.map(t => [t.id, t.name]));
    const voterCountMap = new Map(tribeVoterCounts.map(g => [g.tribeId, g._count.id]));
    const votedCountMap = new Map(tribeVotedCounts.map(g => [g.tribeId, g._count.id]));

    const tribeRanking = tribes.map((t) => {
      const voterCount = voterCountMap.get(t.id) || 0;
      const votedCount = votedCountMap.get(t.id) || 0;
      return {
        id: t.id,
        name: t.name,
        leaderName: "شيخ العشيرة",
        influence: 3,
        district: "المركز",
        voterCount,
        votedCount,
        votedPercentage: voterCount > 0 ? Math.round((votedCount / voterCount) * 100) : 0,
        avgConfidence: 3,
      };
    }).filter(t => t.voterCount > 0)
      .sort((a, b) => b.voterCount - a.voterCount);

    // Add fallback for unspecified tribe voters
    const unspecifiedVoters = voterCountMap.get(null) || 0;
    const unspecifiedVoted = votedCountMap.get(null) || 0;
    if (unspecifiedVoters > 0) {
      tribeRanking.push({
        id: "unspecified",
        name: "غير محدد",
        leaderName: "غير محدد",
        influence: 0,
        district: "المركز",
        voterCount: unspecifiedVoters,
        votedCount: unspecifiedVoted,
        votedPercentage: unspecifiedVoters > 0 ? Math.round((unspecifiedVoted / unspecifiedVoters) * 100) : 0,
        avgConfidence: 3,
      });
    }

    // 5. Tasks Statistics (Dynamic)
    const totalTasks = await prisma.task.count();
    const taskStatusCounts = await prisma.task.groupBy({
      by: ['status'],
      _count: { id: true }
    });
    const taskStatus = { PENDING: 0, IN_PROGRESS: 0, COMPLETED: 0, CANCELLED: 0 };
    taskStatusCounts.forEach(g => {
      if (g.status in taskStatus) {
        taskStatus[g.status as keyof typeof taskStatus] = g._count.id;
      }
    });

    // 6. Confidence Score Distribution
    const confidenceCounts = await prisma.voter.groupBy({
      by: ['supportDegree'],
      _count: { id: true }
    });
    const confidenceDistribution = confidenceCounts.map(g => {
      const score = g.supportDegree || 3;
      const count = g._count.id;
      return {
        score,
        count,
        percentage: totalVoters > 0 ? Math.round((count / totalVoters) * 100) : 0
      };
    }).sort((a, b) => b.score - a.score);

    return NextResponse.json({
      totalVoters,
      votedCount: checkedInCount,
      votedPercentage,
      highConfidenceCount,
      totalTribes: tribes.length,
      totalTasks,
      districtStats,
      tribeRanking,
      confidenceDistribution,
      recentAlerts: [],
      taskStatus,
      smsStats: {
        totalTarget: totalVoters,
        totalSent: 0,
        totalDelivered: 0,
        totalFailed: 0,
      },
    });
  } catch (error) {
    console.error("[dashboard-get] failed:", error);
    return NextResponse.json({ error: "Failed to load dashboard data" }, { status: 500 });
  }
}

export const GET = withAuth(getHandler, { GET: ["admin", "viewer", "operator", "key_user"] });
