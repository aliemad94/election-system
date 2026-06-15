import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const voters = await prisma.voter.findMany({
      include: { tribe: true },
    });

    const totalVoters = voters.length;
    const checkedInCount = voters.filter((v) => v.checkedIn).length;
    const votedPercentage = totalVoters > 0 ? Math.round((checkedInCount / totalVoters) * 100) : 0;

    const votersByDistrict = [
      {
        district: "المركز",
        count: totalVoters,
        avgConfidence: 3,
      },
    ];

    // Group by tribe
    const tribeGroups: Record<string, { count: number }> = {};
    voters.forEach((v) => {
      const t = v.tribe?.name || "غير محدد";
      if (!tribeGroups[t]) {
        tribeGroups[t] = { count: 0 };
      }
      tribeGroups[t].count++;
    });

    const votersByTribe = Object.entries(tribeGroups).map(([tribeName, data]) => ({
      tribe: { id: tribeName, name: tribeName, influence: 3, district: "المركز" },
      count: data.count,
      avgConfidence: 3,
    })).sort((a, b) => b.count - a.count);

    return NextResponse.json({
      totalVoters,
      votedCount: checkedInCount,
      votedPercentage,
      highConfidenceCount: totalVoters,
      avgConfidence: 3,
      votersByDistrict,
      votersByTribe,
      confidenceDistribution: [{ score: 3, count: totalVoters }],
    });
  } catch (error) {
    console.error("[voters-stats-get] failed:", error);
    return NextResponse.json({ error: "Failed to load voter stats" }, { status: 500 });
  }
}
