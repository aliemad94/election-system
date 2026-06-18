import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedUser } from "@/lib/auth-guard";

async function getHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    // 1. Core aggregates
    const totalVoters = await prisma.voter.count();
    const checkedInCount = await prisma.voter.count({ where: { votedOnDay: true } });
    const votedPercentage = totalVoters > 0 ? Math.round((checkedInCount / totalVoters) * 100) : 0;
    const highConfidenceCount = await prisma.voter.count({ where: { supportDegree: { gte: 4 } } });

    // Calculate average confidence score
    const avgAggregate = await prisma.voter.aggregate({
      _avg: { supportDegree: true }
    });
    const avgConfidence = avgAggregate._avg.supportDegree 
      ? Math.round(avgAggregate._avg.supportDegree * 10) / 10 
      : 3.0;

    // 2. Group by district
    const districtGroups = await prisma.voter.groupBy({
      by: ['district'],
      _count: { id: true },
      _avg: { supportDegree: true }
    });

    const votersByDistrict = districtGroups.map(g => ({
      district: g.district || "غير محدد",
      count: g._count.id,
      avgConfidence: g._avg.supportDegree ? Math.round(g._avg.supportDegree * 10) / 10 : 3.0
    }));

    // 3. Group by tribe
    const tribeGroups = await prisma.voter.groupBy({
      by: ['tribeId'],
      _count: { id: true },
      _avg: { supportDegree: true }
    });
    const tribes = await prisma.tribe.findMany({
      select: { id: true, name: true }
    });
    const tribeNameMap = new Map(tribes.map(t => [t.id, t.name]));

    const votersByTribe = tribeGroups.map(g => {
      const tName = g.tribeId ? tribeNameMap.get(g.tribeId) : "غير محدد";
      return {
        tribe: {
          id: g.tribeId || "unspecified",
          name: tName || "غير محدد",
          influence: 3,
          district: "المركز",
        },
        count: g._count.id,
        avgConfidence: g._avg.supportDegree ? Math.round(g._avg.supportDegree * 10) / 10 : 3.0
      };
    }).sort((a, b) => b.count - a.count);

    // 4. Group by confidence scores
    const confidenceCounts = await prisma.voter.groupBy({
      by: ['supportDegree'],
      _count: { id: true }
    });
    const confidenceDistribution = confidenceCounts.map(g => ({
      score: g.supportDegree || 3,
      count: g._count.id
    })).sort((a, b) => b.score - a.score);

    return NextResponse.json({
      totalVoters,
      votedCount: checkedInCount,
      votedPercentage,
      highConfidenceCount,
      avgConfidence,
      votersByDistrict,
      votersByTribe,
      confidenceDistribution,
    });
  } catch (error) {
    console.error("[voters-stats-get] failed:", error);
    return NextResponse.json({ error: "Failed to load voter stats" }, { status: 500 });
  }
}

export const GET = withAuth(getHandler, { GET: ["admin", "viewer", "operator", "key_user"] });
