import { db } from './db';
import { enrichElectoralKey } from './indicators-helper';

export async function calculateAllCompositeIndicators() {
  // Fetch raw data
  const [keysRaw, votersRaw, servicesRaw, commissionRaw, competitorsRaw] = await Promise.all([
    db.electionKey.findMany({
      include: {
        voters: true,
        services: true,
        tribe: true,
        subTribe: true,
      },
    }),
    db.voter.findMany({}),
    db.service.findMany({}),
    db.commissionData.findMany({}),
    db.competitor.findMany({}),
  ]);

  // Enrich keys
  const keys = keysRaw.map(k => enrichElectoralKey(k));

  const totalKeys = keys.length;
  const totalVoters = votersRaw.length;
  const totalNetVotes = keys.reduce((sum, k) => sum + k.netVotes, 0);

  const totalSupported = votersRaw.filter(v => v.status === 'SUPPORTIVE').length;
  const totalNeutral = votersRaw.filter(v => v.status === 'NEUTRAL').length;
  const totalOpposed = votersRaw.filter(v => v.status === 'OPPOSED').length;

  // Calculate Governorate level scores
  const eiiScore = keys.length > 0 ? keys.reduce((sum, k) => sum + k.eiiScore, 0) / keys.length : 0;
  const kriScore = keys.length > 0 ? keys.reduce((sum, k) => sum + k.kriScore, 0) / keys.length : 0;
  const drsScore = keys.length > 0 ? keys.reduce((sum, k) => sum + k.drsScore, 0) / keys.length : 0;
  const vpsScore = keys.length > 0 ? keys.reduce((sum, k) => sum + k.vpsScore, 0) / keys.length : 0;
  const campaignROI = keys.length > 0 ? keys.reduce((sum, k) => sum + k.campaignROI, 0) / keys.length : 0;

  const apiScore = Math.min(100, Math.max(0, (totalNeutral / Math.max(totalVoters, 1)) * 100 + 40));
  const ewliScore = Math.min(100, Math.max(0, drsScore * 0.7 + (totalOpposed / Math.max(totalVoters, 1)) * 100));
  const gsiScore = 75.0; 
  const edriScore = 80.0; 

  const efiScore = Math.min(100, Math.max(0, (eiiScore * 0.15) + (kriScore * 0.15) + (vpsScore * 0.20) + ((100 - drsScore) * 0.10) + (apiScore * 0.10) + ((100 - ewliScore) * 0.10) + (gsiScore * 0.10) + (edriScore * 0.10)));

  const projectedSeats = Math.min(18, Math.round((totalNetVotes / 2000) * 10) / 10);

  const governorate = {
    id: 'gov-ذي قار',
    eiiScore,
    kriScore,
    vpsScore,
    drsScore,
    campaignROI,
    apiScore,
    ewliScore,
    gsiScore,
    edriScore,
    efiScore,
    totalKeysInArea: totalKeys,
    totalNetVotes,
    totalSupportedVotes: totalSupported,
    totalNeutralVotes: totalNeutral,
    totalWeakVotes: totalOpposed,
    totalVotersInArea: totalVoters,
    projectedSeats,
    calculatedAt: new Date().toISOString(),
  };

  // Group by district to compute district level scores
  const districtsMap: Record<string, typeof keys> = {};
  keys.forEach(k => {
    const dist = k.district || 'الغراف';
    if (!districtsMap[dist]) districtsMap[dist] = [];
    districtsMap[dist].push(k);
  });

  const districts = Object.entries(districtsMap).map(([district, dKeys]) => {
    const dTotalKeys = dKeys.length;
    const dNetVotes = dKeys.reduce((sum, k) => sum + k.netVotes, 0);

    const dVoters = dKeys.flatMap(k => k.voters || []);
    const dTotalSupported = dVoters.filter(v => v.status === 'SUPPORTIVE').length;
    const dTotalNeutral = dVoters.filter(v => v.status === 'NEUTRAL').length;
    const dTotalWeak = dVoters.filter(v => v.status === 'OPPOSED').length;
    const dTotalVoters = dVoters.length;

    const dEii = dKeys.reduce((sum, k) => sum + k.eiiScore, 0) / dTotalKeys;
    const dKri = dKeys.reduce((sum, k) => sum + k.kriScore, 0) / dTotalKeys;
    const dDrs = dKeys.reduce((sum, k) => sum + k.drsScore, 0) / dTotalKeys;
    const dVps = dKeys.reduce((sum, k) => sum + k.vpsScore, 0) / dTotalKeys;
    const dROI = dKeys.reduce((sum, k) => sum + k.campaignROI, 0) / dTotalKeys;

    const dApi = 60.0;
    const dEwli = dDrs * 0.8;
    const dGsi = 70.0;
    const dEdri = 75.0;

    const dEfi = Math.min(100, Math.max(0, (dEii * 0.15) + (dKri * 0.15) + (dVps * 0.20) + ((100 - dDrs) * 0.10) + (dApi * 0.10) + ((100 - dEwli) * 0.10) + (dGsi * 0.10) + (dEdri * 0.10)));

    return {
      id: `dist-${district}`,
      district,
      eiiScore: dEii,
      kriScore: dKri,
      vpsScore: dVps,
      drsScore: dDrs,
      campaignROI: dROI,
      apiScore: dApi,
      ewliScore: dEwli,
      gsiScore: dGsi,
      edriScore: dEdri,
      efiScore: dEfi,
      totalKeysInArea: dTotalKeys,
      totalNetVotes: dNetVotes,
      totalSupportedVotes: dTotalSupported,
      totalNeutralVotes: dTotalNeutral,
      totalWeakVotes: dTotalWeak,
      totalVotersInArea: dTotalVoters,
      projectedSeats: Math.min(18, Math.round((dNetVotes / 2000) * 10) / 10),
    };
  });

  return {
    governorate,
    districts,
    lastCalculated: new Date().toISOString(),
  };
}
