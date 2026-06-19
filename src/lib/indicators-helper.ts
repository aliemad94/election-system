export interface EnrichedKey {
  id: string;
  keyCode: string;
  firstName: string;
  fatherName: string;
  district: string;
  eiiScore: number;
  kriScore: number;
  vpsScore: number;
  drsScore: number;
  campaignROI: number;
  netVotes: number;
  supportedVotes: number;
  neutralVotes: number;
  weakVotes: number;
  totalVotes: number;
  weightedScore: number;
  keyAccuracyScore: number;
  tribeId: string | null;
  subTribeId: string | null;
}

export function calculateKeyScore(key: any) {
  let ratings = {
    loyaltyLevel: key.loyaltyScore ?? key.loyaltyLevel ?? 3,
    influenceLevel: key.influenceLevel ?? 3,
    mobilizationAbility: key.mobilizationCap ?? key.mobilizationAbility ?? 3,
    voteProtection: 3,
    supportReason: 3,
    needsLevel: 3,
    politicalNote: 3,
    organizationalNote: 3,
    generalNote: 3,
    riskLevel: key.riskLevel ?? 3,
  };
  
  if (key.reliabilityLogs) {
    let parsedLogs = key.reliabilityLogs;
    if (typeof parsedLogs === "string") {
      try {
        parsedLogs = JSON.parse(parsedLogs);
      } catch (e) {}
    }
    if (parsedLogs && typeof parsedLogs === "object") {
      ratings = { ...ratings, ...parsedLogs };
    }
  }

  const rawScore =
    ((ratings.loyaltyLevel || 3) - 1) * 20 +
    ((ratings.influenceLevel || 3) - 1) * 20 +
    ((ratings.mobilizationAbility || 3) - 1) * 15 +
    ((ratings.voteProtection || 3) - 1) * 15 +
    ((ratings.supportReason || 3) - 1) * 10 +
    ((ratings.needsLevel || 3) - 1) * 5 +
    ((ratings.politicalNote || 3) - 1) * 5 +
    ((ratings.organizationalNote || 3) - 1) * 5 +
    ((ratings.generalNote || 3) - 1) * 5;

  const score = Math.min(100, Math.max(0, Math.round(rawScore / 4)));
  
  let classification = "مقبول";
  if (score < 20) classification = "ضعيف";
  else if (score <= 50) classification = "مقبول";
  else if (score <= 80) classification = "جيد";
  else classification = "قوي";

  return { score, classification, ratings };
}

export function enrichElectoralKey(key: any, allVoters: any[] = [], sentimentTrends: any[] = []): any {
  // Filter voters belonging to this key
  const voters = allVoters.filter(v => v.keyId === key.id);
  const services = key.services || [];

  let supportedVotes = 0;
  let neutralVotes = 0;
  let weakVotes = 0;
  let totalVotes = voters.length;

  if (totalVotes > 0) {
    voters.forEach(v => {
      const stat = (v.status || '').toUpperCase();
      if (stat === 'SUPPORTED') {
        supportedVotes++;
      } else if (stat === 'WEAK') {
        weakVotes++;
      } else {
        neutralVotes++;
      }
    });
  } else {
    // Fallback to expectedVotes estimation
    const exp = key.expectedVotes || 0;
    supportedVotes = Math.round(exp * 0.6);
    neutralVotes = Math.round(exp * 0.3);
    weakVotes = Math.round(exp * 0.1);
    totalVotes = exp;
  }

  const netVotes = Math.max(0, supportedVotes - weakVotes);

  // 1. Calculate Weighted Score
  const { score: weightedScore } = calculateKeyScore(key);

  // 2. EII (Electoral Influence Index)
  const netVotesRatio = totalVotes > 0 ? (netVotes / totalVotes) * 100 : 0;
  const influenceLevelNormalized = ((key.influenceLevel || 3) / 5) * 100;
  const mobilizationCapNormalized = ((key.mobilizationCap || 3) / 5) * 100;
  const eiiScore = Math.round(
    (weightedScore * 0.30) +
    (netVotesRatio * 0.25) +
    (influenceLevelNormalized * 0.25) +
    (mobilizationCapNormalized * 0.20)
  );

  // 3. KRI (Key Reliability Index)
  const loyaltyScoreNormalized = ((key.loyaltyScore || 3) / 5) * 100;
  const supportReasonPresence = totalVotes > 0 
    ? (voters.filter(v => v.supportReason && v.supportReason.trim() !== '').length / totalVotes) * 100 
    : 80;
  const riskLevelInvNormalized = ((6 - (key.riskLevel || 1)) / 5) * 100;
  
  const totalServicesCount = services.length;
  const pendingServicesCount = services.filter((s: any) => s.status === 'قيد المتابعة').length;
  const noRequests = totalServicesCount > 0 
    ? 100 - (pendingServicesCount / totalServicesCount) * 50
    : 100;

  const stability = 100 - (key.riskLevel || 1) * 15;
  const kriScore = Math.round(
    (loyaltyScoreNormalized * 0.25) +
    (supportReasonPresence * 0.20) +
    (riskLevelInvNormalized * 0.20) +
    (noRequests * 0.20) +
    (stability * 0.15)
  );

  // 4. VPS (Vote Probability Score)
  const vpsScore = totalVotes > 0 
    ? Math.round(((supportedVotes * 80 + neutralVotes * 50 + weakVotes * 30) / totalVotes))
    : 80;

  // 5. DRS (Defection Risk Score)
  const loyaltyInv = ((5 - (key.loyaltyScore || 3)) / 4) * 100;
  const weakSupportRatio = totalVotes > 0 ? (weakVotes / totalVotes) * 100 : 10;
  const needsPressure = ((key.riskLevel || 1) / 5) * 100;
  
  const lowEducationRatio = totalVotes > 0
    ? (voters.filter(v => v.education === 'ابتدائي' || v.education === 'أمي' || !v.education).length / totalVotes) * 100
    : 20;
  const lowOrg = (1 - (key.keyAccuracyScore || 1.0)) * 100;
  const noContactRatio = totalVotes > 0
    ? (voters.filter(v => !v.lastContactDate).length / totalVotes) * 100
    : 30;

  const drsScore = Math.round(
    (loyaltyInv * 0.25) +
    (weakSupportRatio * 0.20) +
    (needsPressure * 0.20) +
    (lowEducationRatio * 0.15) +
    (lowOrg * 0.10) +
    (noContactRatio * 0.10)
  );

  // 6. Campaign ROI
  const totalSpent = services.reduce((sum: number, s: any) => sum + (s.cost || 0), 0);
  const campaignROI = totalSpent > 0
    ? Math.round((netVotes / (totalSpent / 1000000)) * 10 * 10) / 10
    : netVotes > 0 ? 10.0 : 0.0;

  return {
    ...key,
    voters,
    services,
    tribe: key.tribe || null,
    subTribe: key.subTribe || null,
    eiiScore: Math.min(100, Math.max(0, eiiScore)),
    kriScore: Math.min(100, Math.max(0, kriScore)),
    vpsScore: Math.min(100, Math.max(0, vpsScore)),
    drsScore: Math.min(100, Math.max(0, drsScore)),
    campaignROI: Math.min(100, Math.max(0, campaignROI)),
    netVotes,
    supportedVotes,
    neutralVotes,
    weakVotes,
    totalVotes,
    weightedScore,
    keyAccuracyScore: key.keyAccuracyScore || 1.0,
  };
}
