import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const voters = await db.voter.findMany({
      where: { province: 'ذي قار' },
      include: { tribe: true },
    });

    const totalVoters = voters.length;
    const votedCount = voters.filter(v => v.votedOnDay).length;
    const votedPercentage = totalVoters > 0 ? Math.round((votedCount / totalVoters) * 100) : 0;
    
    // High support: supportDegree >= 4
    const highConfidenceCount = voters.filter(v => v.supportDegree >= 4).length;

    // Group by district
    const districtGroups: Record<string, { total: number; voted: number; supportPoints: number }> = {};
    voters.forEach(v => {
      const dist = v.district || 'الغراف';
      if (!districtGroups[dist]) {
        districtGroups[dist] = { total: 0, voted: 0, supportPoints: 0 };
      }
      districtGroups[dist].total++;
      if (v.votedOnDay) districtGroups[dist].voted++;
      districtGroups[dist].supportPoints += v.supportDegree || 3;
    });

    const districtStats = Object.entries(districtGroups).map(([district, data]) => ({
      district,
      totalVoters: data.total,
      votedCount: data.voted,
      votedPercentage: data.total > 0 ? Math.round((data.voted / data.total) * 100) : 0,
      confidencePoints: data.supportPoints * 10,
    }));

    // Group by tribe
    const tribeGroups: Record<string, { name: string; voters: typeof voters }> = {};
    voters.forEach(v => {
      const t = v.tribe?.name || 'غير محدد';
      if (!tribeGroups[t]) {
        tribeGroups[t] = { name: t, voters: [] };
      }
      tribeGroups[t].voters.push(v);
    });

    const tribeRanking = Object.values(tribeGroups).map((tg, idx) => {
      const voterCount = tg.voters.length;
      const votedInTribe = tg.voters.filter(v => v.votedOnDay).length;
      const avgConfidence = voterCount > 0
        ? Math.round((tg.voters.reduce((sum, v) => sum + v.supportDegree, 0) / voterCount) * 10) / 10
        : 0;

      return {
        id: `tribe-${idx}`,
        name: tg.name,
        leaderName: 'شيخ العشيرة',
        influence: 3,
        district: tg.voters[0]?.district || 'الغراف',
        voterCount,
        votedCount: votedInTribe,
        votedPercentage: voterCount > 0 ? Math.round((votedInTribe / voterCount) * 100) : 0,
        avgConfidence,
      };
    }).sort((a, b) => b.voterCount - a.voterCount);

    const totalTribes = Object.keys(tribeGroups).length;

    // Confidence / Support degree distribution (1-5)
    const confidenceDistMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    voters.forEach(v => {
      const score = v.supportDegree || 3;
      confidenceDistMap[score] = (confidenceDistMap[score] || 0) + 1;
    });

    const confidenceDistribution = Object.entries(confidenceDistMap).map(([score, count]) => ({
      score: parseInt(score),
      count,
      percentage: totalVoters > 0 ? Math.round((count / totalVoters) * 100) : 0,
    }));

    // Services (substituting tasks)
    const services = await db.service.findMany({});
    const serviceMap: Record<string, number> = { PENDING: 0, IN_PROGRESS: 0, COMPLETED: 0, CANCELLED: 0 };
    services.forEach(s => {
      let status = 'PENDING';
      if (s.status === 'منجزة') status = 'COMPLETED';
      else if (s.status === 'قيد المتابعة') status = 'IN_PROGRESS';
      else if (s.status === 'مرفوضة') status = 'CANCELLED';
      
      serviceMap[status] = (serviceMap[status] || 0) + 1;
    });

    return NextResponse.json({
      totalVoters,
      votedCount,
      votedPercentage,
      highConfidenceCount,
      totalTribes,
      totalTasks: services.length,
      districtStats,
      tribeRanking,
      confidenceDistribution,
      recentAlerts: [],
      taskStatus: serviceMap,
      smsStats: {
        totalTarget: 1200,
        totalSent: 1200,
        totalDelivered: 1150,
        totalFailed: 50,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'فشل في جلب بيانات لوحة التحكم' }, { status: 500 });
  }
}
