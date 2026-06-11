import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { enrichElectoralKey } from '@/lib/indicators-helper';
import { requirePermission, handleApiError } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    const authResult = requirePermission(request, 'read');
    if ('error' in authResult) return authResult.error;

    const [keysRaw, votersRaw, commissionRaw] = await Promise.all([
      db.electionKey.findMany({
        include: {
          voters: true,
          services: true,
        },
      }),
      db.voter.findMany({}),
      db.commissionData.findMany({}),
    ]);

    const keys = keysRaw.map(k => enrichElectoralKey(k));

    const totalKeys = keys.length;
    const totalNetVotes = keys.reduce((sum, k) => sum + k.netVotes, 0);
    const totalSupportedVotes = keys.reduce((sum, k) => sum + k.supportedVotes, 0);
    const totalNeutralVotes = keys.reduce((sum, k) => sum + k.neutralVotes, 0);
    const totalWeakVotes = keys.reduce((sum, k) => sum + k.weakVotes, 0);

    const classificationStats = {
      strong: keys.filter(k => k.weightedScore >= 75).length,
      good: keys.filter(k => k.weightedScore >= 50 && k.weightedScore < 75).length,
      acceptable: keys.filter(k => k.weightedScore >= 25 && k.weightedScore < 50).length,
      weak: keys.filter(k => k.weightedScore < 25).length,
    };

    const topKeys = keys
      .sort((a, b) => b.weightedScore - a.weightedScore)
      .slice(0, 10)
      .map(k => ({
        id: k.id,
        code: k.keyCode,
        name: `${k.firstName} ${k.fatherName}`,
        nickname: k.tribe,
        totalVotes: k.totalVotes,
        netVotes: k.netVotes,
        weightedScore: k.weightedScore,
        classification: k.weightedScore >= 75 ? 'قوي' : k.weightedScore >= 50 ? 'جيد' : 'مقبول',
        district: k.district,
        tribeName: k.tribe,
        voterCount: k.voters.length,
      }));

    const keysByDistrict: Record<string, { count: number; netVotes: number; totalVotes: number }> = {};
    keys.forEach(k => {
      const d = k.district || 'غير محدد';
      if (!keysByDistrict[d]) keysByDistrict[d] = { count: 0, netVotes: 0, totalVotes: 0 };
      keysByDistrict[d].count++;
      keysByDistrict[d].netVotes += k.netVotes;
      keysByDistrict[d].totalVotes += k.totalVotes;
    });

    const totalVoters = votersRaw.length;
    const votedVoters = votersRaw.filter(v => v.votedOnDay).length;
    const supportedVoters = votersRaw.filter(v => v.status === 'SUPPORTIVE').length;
    const neutralVoters = votersRaw.filter(v => v.status === 'NEUTRAL').length;
    const weakVoters = votersRaw.filter(v => v.status === 'OPPOSED').length;

    const totalRegistered = commissionRaw.reduce((sum, d) => sum + d.registeredVoters, 0);
    const totalVoterNetVotes = Math.round(
      supportedVoters * 0.8 + neutralVoters * 0.5 + weakVoters * 0.3
    );

    return NextResponse.json({
      summary: {
        totalKeys,
        totalNetVotes,
        totalSupportedVotes,
        totalNeutralVotes,
        totalWeakVotes,
        totalVoters,
        votedVoters,
        totalVoterNetVotes,
        totalRegistered,
        totalVotesAtRisk: 0,
      },
      classificationStats,
      topKeys,
      keysByDistrict,
      warningStats: {
        atRisk: 0,
        penetrable: 0,
        safe: 0,
        swing: 0,
        lowParticipation: 0,
        highCompetition: 0,
      },
      warnings: [],
      latestIndicators: [],
      voterCategoryStats: {
        supported: supportedVoters,
        neutral: neutralVoters,
        weak: weakVoters,
        uncategorized: Math.max(0, totalVoters - supportedVoters - neutralVoters - weakVoters),
      },
      ihecData: commissionRaw,
    });
  } catch (error) {
    return handleApiError(error, 'analysis-get');
  }
}
