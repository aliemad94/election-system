import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const voters = await prisma.voter.findMany({
      include: { tribe: true },
    });

    const totalVoters = voters.length;
    const checkedInCount = voters.filter((v) => v.votedOnDay).length;
    const votedPercentage = totalVoters > 0 ? Math.round((checkedInCount / totalVoters) * 100) : 0;

    const districtStats = [
      {
        district: "المركز",
        totalVoters,
        votedCount: checkedInCount,
        votedPercentage,
        confidencePoints: totalVoters * 30,
      },
    ];

    // Group by tribe
    const tribeGroups: Record<string, { name: string; voters: typeof voters }> = {};
    voters.forEach((v) => {
      const t = v.tribe?.name || "غير محدد";
      if (!tribeGroups[t]) {
        tribeGroups[t] = { name: t, voters: [] };
      }
      tribeGroups[t].voters.push(v);
    });

    const tribeRanking = Object.values(tribeGroups).map((tg, idx) => {
      const voterCount = tg.voters.length;
      const checkedInInTribe = tg.voters.filter((v) => v.votedOnDay).length;

      return {
        id: `tribe-${idx}`,
        name: tg.name,
        leaderName: "شيخ العشيرة",
        influence: 3,
        district: "المركز",
        voterCount,
        votedCount: checkedInInTribe,
        votedPercentage: voterCount > 0 ? Math.round((checkedInInTribe / voterCount) * 100) : 0,
        avgConfidence: 3,
      };
    }).sort((a, b) => b.voterCount - a.voterCount);

    return NextResponse.json({
      totalVoters,
      votedCount: checkedInCount,
      votedPercentage,
      highConfidenceCount: totalVoters,
      totalTribes: Object.keys(tribeGroups).length,
      totalTasks: 0,
      districtStats,
      tribeRanking,
      confidenceDistribution: [
        { score: 3, count: totalVoters, percentage: 100 },
      ],
      recentAlerts: [],
      taskStatus: { PENDING: 0, IN_PROGRESS: 0, COMPLETED: 0, CANCELLED: 0 },
      smsStats: {
        totalTarget: 0,
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
