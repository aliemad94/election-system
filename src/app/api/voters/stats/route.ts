import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const voters = await db.voter.findMany({
      where: { province: 'ذي قار' },
      include: { tribe: true }
    });

    const totalVoters = voters.length;
    const votedCount = voters.filter(v => v.votedOnDay).length;
    const votedPercentage = totalVoters > 0 ? Math.round((votedCount / totalVoters) * 100) : 0;
    const highConfidenceCount = voters.filter(v => v.supportDegree >= 4).length;

    const totalSupport = voters.reduce((sum, v) => sum + (v.supportDegree || 3), 0);
    const avgConfidence = totalVoters > 0 ? Math.round((totalSupport / totalVoters) * 10) / 10 : 3.0;

    // Group by district
    const districtGroups: Record<string, { count: number; totalSupport: number }> = {};
    voters.forEach(v => {
      const dist = v.district || 'الغراف';
      if (!districtGroups[dist]) {
        districtGroups[dist] = { count: 0, totalSupport: 0 };
      }
      districtGroups[dist].count++;
      districtGroups[dist].totalSupport += v.supportDegree || 3;
    });

    const votersByDistrict = Object.entries(districtGroups).map(([district, data]) => ({
      district,
      count: data.count,
      avgConfidence: Math.round((data.totalSupport / data.count) * 10) / 10,
    }));

    // Group by tribe
    const tribeGroups: Record<string, { count: number; totalSupport: number }> = {};
    voters.forEach(v => {
      const t = (v as any).tribe?.name || 'غير محدد';
      if (!tribeGroups[t]) {
        tribeGroups[t] = { count: 0, totalSupport: 0 };
      }
      tribeGroups[t].count++;
      tribeGroups[t].totalSupport += v.supportDegree || 3;
    });

    const votersByTribe = Object.entries(tribeGroups).map(([tribeName, data]) => ({
      tribe: { id: tribeName, name: tribeName, influence: 3, district: 'الغراف' },
      count: data.count,
      avgConfidence: Math.round((data.totalSupport / data.count) * 10) / 10,
    })).sort((a, b) => b.count - a.count);

    // Group by supportDegree
    const confidenceDistMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    voters.forEach(v => {
      const score = v.supportDegree || 3;
      confidenceDistMap[score] = (confidenceDistMap[score] || 0) + 1;
    });

    const confidenceDistribution = Object.entries(confidenceDistMap).map(([score, count]) => ({
      score: parseInt(score),
      count,
    }));

    return NextResponse.json({
      totalVoters,
      votedCount,
      votedPercentage,
      highConfidenceCount,
      avgConfidence,
      votersByDistrict,
      votersByTribe,
      confidenceDistribution,
    });
  } catch (error) {
    console.error('Error fetching voter stats:', error);
    return NextResponse.json({ error: 'فشل في جلب إحصائيات الناخبين' }, { status: 500 });
  }
}
