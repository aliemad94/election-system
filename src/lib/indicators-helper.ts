import { ElectionKey, Voter, Service, Tribe, SubTribe } from '@prisma/client';

export interface EnrichedKey extends ElectionKey {
  voters: Voter[];
  services: Service[];
  tribe: Tribe | null;
  subTribe: SubTribe | null;
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
}

export function enrichElectoralKey(
  key: ElectionKey & { voters?: Voter[]; services?: Service[]; tribe?: Tribe | null; subTribe?: SubTribe | null },
  allVoters: Voter[] = [],
  sentimentTrends: any[] = []
): EnrichedKey {
  const voters = key.voters || [];
  const services = key.services || [];

  // Calculate average sentiment score for district
  const districtSentiment = sentimentTrends.filter(t => t.region === key.district);
  const avgSentimentScore = districtSentiment.length > 0
    ? districtSentiment.reduce((sum, t) => sum + (t.score || 0), 0) / districtSentiment.length
    : 0.0; // scale -1 to +1

  // calculate voters counts
  const supported = voters.filter(v => v.status === 'SUPPORTIVE').length;
  const neutral = voters.filter(v => v.status === 'NEUTRAL').length;
  const opposed = voters.filter(v => v.status === 'OPPOSED').length;
  const total = voters.length;

  // Calibrate key accuracy based on GPS and Registry verification rates
  const auditedClaimed = voters.filter(v => v.gpsVerified || v.isRegistryVerified);
  const verifiedSupportiveClaimed = auditedClaimed.filter(v => v.status === 'SUPPORTIVE').length;
  
  const calibratedAccuracy = auditedClaimed.length > 0
    ? (verifiedSupportiveClaimed / auditedClaimed.length)
    : (key.keyAccuracyScore ?? 1.0);

  // Dynamic Imputation of Net Votes using voter-level weights
  let rawNetVotes = 0;
  voters.forEach(v => {
    if (v.status === 'SUPPORTIVE') {
      rawNetVotes += 1.0;
    } else if (v.status === 'NEUTRAL') {
      // Calculate demographic imputation weight
      let tribeWeight = 0.5;
      if (v.tribeId) {
        const tribeVoters = allVoters.filter(x => x.tribeId === v.tribeId);
        if (tribeVoters.length > 0) {
          tribeWeight = tribeVoters.filter(x => x.status === 'SUPPORTIVE').length / tribeVoters.length;
        }
      }
      
      let areaWeight = 0.5;
      const areaVoters = allVoters.filter(x => x.area === v.area || x.subDistrict === v.subDistrict);
      if (areaVoters.length > 0) {
        areaWeight = areaVoters.filter(x => x.status === 'SUPPORTIVE').length / areaVoters.length;
      }
      
      let eduWeight = 0.5;
      if (v.education === 'بكالوريوس' || v.education === 'ماجستير' || v.education === 'دكتوراه') {
        eduWeight = 0.6;
      } else if (v.education === 'يقرا ويكتب' || v.education === 'ابتدائية') {
        eduWeight = 0.45;
      }

      const combined = (tribeWeight * 0.4) + (areaWeight * 0.4) + (eduWeight * 0.2);
      const sentimentMultiplier = 1.0 + (avgSentimentScore * 0.15); // +/- 15%
      const weight = Math.min(1.0, Math.max(0.0, combined * sentimentMultiplier));
      
      rawNetVotes += weight;
    }
    // OPPOSED adds 0.0
  });

  const netVotes = Math.round(rawNetVotes * calibratedAccuracy);

  // EII (Electoral Influence Index)
  const eiiScore = Math.min(100, Math.max(0, (key.influenceLevel * 10) + (key.mobilizationCap * 10)));

  // KRI (Key Reliability Index)
  const loyaltyPart = key.loyaltyScore * 12;
  const accuracyPart = calibratedAccuracy * 40;
  const kriScore = Math.min(100, Math.max(0, Math.round(loyaltyPart + accuracyPart)));

  // VPS (Voting Probability Score)
  const supportedRatio = total > 0 ? (supported / total) : 0.5;
  const vpsScore = Math.min(100, Math.max(0, Math.round((key.loyaltyScore * 10) + (supportedRatio * 50))));

  // DRS (Defection Risk Score)
  const drsScore = Math.min(100, Math.max(0, key.riskLevel * 20));

  // Campaign ROI based on Services Linked directly to Key + its Voters
  const keyServiceCost = services.reduce((sum, s) => sum + s.cost, 0);
  
  // Find costs of services linked directly to voters of this key
  const voterIds = voters.map(v => v.id);
  const voterServicesCost = allVoters
    .filter(v => voterIds.includes(v.id))
    .flatMap(v => (v as any).services || [])
    .reduce((sum: number, s: any) => sum + (s.cost || 0), 0);

  const totalSpent = keyServiceCost + voterServicesCost;
  
  let campaignROI = 0;
  if (totalSpent > 0) {
    campaignROI = Math.min(200, Math.round((netVotes / (totalSpent / 1000000)) * 10) / 10);
  } else {
    campaignROI = netVotes > 0 ? 100.0 : 0.0;
  }

  const weightedScore = Math.round((eiiScore + kriScore + (100 - drsScore)) / 3);

  return {
    ...key,
    voters,
    services,
    tribe: key.tribe || null,
    subTribe: key.subTribe || null,
    eiiScore,
    kriScore,
    vpsScore,
    drsScore,
    campaignROI,
    netVotes,
    supportedVotes: supported,
    neutralVotes: neutral,
    weakVotes: opposed,
    totalVotes: total,
    weightedScore,
    keyAccuracyScore: calibratedAccuracy,
  };
}
