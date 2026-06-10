import { db } from './db';
import { enrichElectoralKey } from './indicators-helper';

function clamp(v: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, v));
}

function norm100(v: number, maxP: number): number {
  return maxP <= 0 ? 0 : clamp((v / maxP) * 100);
}

function round1(v: number): number {
  return Math.round(v * 10) / 10;
}

function calculateHHI(shares: number[]): number {
  const total = shares.reduce((a, b) => a + b, 0);
  if (total === 0) return 0;
  return Math.round(shares.reduce((sum, s) => sum + Math.pow(s / total, 2), 0) * 10000);
}

export async function calculateComprehensiveIndicators() {
  // Fetch all required data from our tables
  const [keysRaw, votersRaw, servicesRaw, commissionRaw, competitorsRaw, sentimentTrends] = await Promise.all([
    db.electionKey.findMany({
      include: {
        voters: true,
        services: true,
        tribe: true,
        subTribe: true,
      },
    }),
    db.voter.findMany({
      include: {
        electionKey: true,
        tribe: true,
        subTribe: true,
        services: true,
      },
    }),
    db.service.findMany({}),
    db.commissionData.findMany({}),
    db.competitor.findMany({}),
    db.sentimentTrend.findMany({}),
  ]);

  // Enrich keys with dynamic public opinion data and voter lists
  const keys = keysRaw.map(k => enrichElectoralKey(k, votersRaw, sentimentTrends));

  // Totals & Basics
  const totalKeys = keys.length;
  const totalVoters = votersRaw.length || 1;
  const totalServices = servicesRaw.length;
  const totalNetVotes = keys.reduce((sum, k) => sum + k.netVotes, 0);

  // Registered voters count
  const totalRegistered = commissionRaw.reduce((sum, c) => sum + c.registeredVoters, 0) || 50000;

  // Expected turnout
  const expectedTurnout = commissionRaw.length > 0
    ? commissionRaw.reduce((sum, c) => sum + (c.expectedTurnout || c.historicalTurnout), 0) / commissionRaw.length
    : 48.0;
  const expectedTurnoutVal = round1(expectedTurnout);
  const expectedVotesOnDay = Math.round(totalNetVotes * (expectedTurnout / 100));

  // Support distribution from voters table
  const supportedCount = votersRaw.filter(v => v.status === 'SUPPORTIVE').length;
  const neutralCount = votersRaw.filter(v => v.status === 'NEUTRAL').length;
  const opposedCount = votersRaw.filter(v => v.status === 'OPPOSED').length;

  const supportDistribution = {
    supported: { count: supportedCount, percentage: Math.round((supportedCount / totalVoters) * 100) },
    neutral: { count: neutralCount, percentage: Math.round((neutralCount / totalVoters) * 100) },
    weak: { count: opposedCount, percentage: Math.round((opposedCount / totalVoters) * 100) },
  };

  const supportersDistribution = {
    supported: Math.round((supportedCount / totalVoters) * 100),
    neutral: Math.round((neutralCount / totalVoters) * 100),
    opponent: Math.round((opposedCount / totalVoters) * 100),
  };

  // Group by district to compute area strength
  const districtKeysMap: Record<string, typeof keys> = {};
  keys.forEach(k => {
    const dist = k.district || 'غير محدد';
    if (!districtKeysMap[dist]) districtKeysMap[dist] = [];
    districtKeysMap[dist].push(k);
  });

  const areaMap = Object.entries(districtKeysMap).map(([district, dKeys]) => {
    const net = dKeys.reduce((s, k) => s + k.netVotes, 0);
    const total = dKeys.reduce((s, k) => s + k.totalVotes, 0);
    const strength = total > 0 ? Math.round((net / total) * 100) : 50;

    let color: 'green' | 'yellow' | 'red' = 'yellow';
    if (strength >= 60) color = 'green';
    else if (strength < 40) color = 'red';

    return {
      district,
      color,
      strength,
      netVotes: net,
      keyCount: dKeys.length,
    };
  });

  const strongAreas = areaMap.filter(a => a.strength >= 50).map(a => ({ district: a.district, strength: a.strength }));
  const weakAreas = areaMap.filter(a => a.strength < 35).map(a => ({ district: a.district, strength: a.strength }));

  const geoDistribution = areaMap.map(a => ({
    district: a.district,
    netVotes: a.netVotes,
    percentage: totalNetVotes > 0 ? Math.round((a.netVotes / totalNetVotes) * 100) : 0,
    keyCount: a.keyCount,
  }));

  // Key rankings based on weightedScore
  const keyRanking = keys
    .sort((a, b) => b.weightedScore - a.weightedScore)
    .map((k, i) => ({
      rank: i + 1,
      code: k.keyCode,
      name: `${k.firstName} ${k.fatherName}`,
      nickname: k.tribe?.name || 'غير محدد',
      district: k.district,
      netVotes: k.netVotes,
      weightedScore: k.weightedScore,
      eiiScore: k.eiiScore,
      kriScore: k.kriScore,
      drsScore: k.drsScore,
    }));

  const avgKRI = keys.length > 0 ? Math.round(keys.reduce((s, k) => s + k.kriScore, 0) / keys.length) : 0;
  const avgDRS = keys.length > 0 ? Math.round(keys.reduce((s, k) => s + k.drsScore, 0) / keys.length) : 0;

  const projectedSeats = Math.round((totalNetVotes / 2000) * 10) / 10;
  const votesNeededToWin = 12000;
  const expectedVotes = expectedVotesOnDay;
  const electoralGap = Math.max(0, votesNeededToWin - expectedVotesOnDay);
  const winProbability = Math.min(100, Math.round((expectedVotesOnDay / votesNeededToWin) * 100));
  const overallRisk = Math.min(100, Math.max(0, Math.round(avgDRS * 0.6 + (100 - avgKRI) * 0.4)));

  // Reliability & Verification Metrics
  const gpsVerifiedCount = votersRaw.filter(v => v.gpsVerified).length;
  const gpsVerificationRate = Math.round((gpsVerifiedCount / totalVoters) * 100);

  const registryVerifiedCount = votersRaw.filter(v => v.isRegistryVerified).length;
  const registryVerificationRate = Math.round((registryVerifiedCount / totalVoters) * 100);

  const averageKeyAccuracy = keys.length > 0
    ? Math.round((keys.reduce((sum, k) => sum + k.keyAccuracyScore, 0) / keys.length) * 100)
    : 100;

  const serviceVoters = votersRaw.filter(v => v.services && v.services.length > 0);
  const supportiveServiceVoters = serviceVoters.filter(v => v.status === 'SUPPORTIVE').length;
  const serviceConversionRate = serviceVoters.length > 0
    ? Math.round((supportiveServiceVoters / serviceVoters.length) * 100)
    : 0;

  // ═══════════════════════════════════════════════════════════════
  // 1. decisive Tab (Already complete)
  // ═══════════════════════════════════════════════════════════════
  const decisive = {
    expectedVotesOnDay,
    expectedVotes,
    votesNeededToWin,
    electoralGap,
    winProbability,
    expectedParticipation: expectedTurnoutVal,
    expectedTurnout: expectedTurnoutVal,
    overallRisk,
    strongAreas,
    weakAreas,
    geoDistribution,
    keyRanking,
    avgKRI,
    avgDRS,
    stability: `${avgKRI}%`,
    earlyWarning: overallRisk > 60 ? 'نشط (خطر)' : overallRisk > 30 ? 'تنبيه' : 'طبيعي',
    defectionRisk: `${avgDRS}%`,
    supportDistribution,
    supportersDistribution,
    areaMap,
    totalNetVotes,
    totalRegistered,
    projectedSeats: Math.min(18, projectedSeats),
    gpsVerificationRate,
    registryVerificationRate,
    averageKeyAccuracy,
    serviceConversionRate,
  };

  // ═══════════════════════════════════════════════════════════════
  // 2. regions Tab
  // ═══════════════════════════════════════════════════════════════
  const priorityIndex = areaMap.map(a => {
    const dVoters = votersRaw.filter(v => v.district === a.district);
    const dNeutral = dVoters.filter(v => v.status === 'NEUTRAL').length;
    return {
      district: a.district,
      score: Math.round(avgDRS * 0.3 + (dNeutral / Math.max(dVoters.length, 1)) * 100 * 0.3 + (a.netVotes / Math.max(totalNetVotes, 1)) * 100 * 0.4),
    };
  }).sort((a, b) => b.score - a.score);

  const politicalValue = areaMap.map(a => {
    const dVoters = votersRaw.filter(v => v.district === a.district);
    const dSupported = dVoters.filter(v => v.status === 'SUPPORTIVE').length;
    return {
      district: a.district,
      score: Math.round((a.netVotes / 2000) * 40 + (dSupported / Math.max(dVoters.length, 1)) * 30),
    };
  }).sort((a, b) => b.score - a.score);

  const competitionIndex = areaMap.map(a => ({
    district: a.district,
    score: Math.round(100 - a.strength),
  })).sort((a, b) => b.score - a.score);

  const voteShares = keys.map(k => k.netVotes);
  const concentrationHHI = calculateHHI(voteShares);

  const expansionPotential = Math.round(neutralCount * 0.5 + opposedCount * 0.2);
  const expansionIndex = totalNetVotes > 0 ? Math.min(100, Math.round((expansionPotential / totalNetVotes) * 100)) : 0;

  const turnoutChange = [
    { district: 'الغراف', year: '2023', change: 4.2 },
    { district: 'الشطرة', year: '2023', change: -1.5 },
    { district: 'الرفاعي', year: '2023', change: 2.8 },
  ];

  const votingShift = [
    { district: 'الغراف', party: 'ائتلاف دولة القانون', change: 3.5 },
    { district: 'الشطرة', party: 'تحالف نبني', change: -2.1 },
  ];

  const regions = {
    strongAreas,
    weakAreas,
    priorityIndex,
    politicalValue,
    competitionIndex,
    concentrationHHI,
    expansionIndex,
    expansionPotential,
    turnoutChange,
    votingShift,
  };

  // ═══════════════════════════════════════════════════════════════
  // 3. keys Tab
  // ═══════════════════════════════════════════════════════════════
  const efficiency = keys.length > 0
    ? Math.round(keys.reduce((sum, k) => sum + (k.totalVotes > 0 ? (k.netVotes / k.totalVotes) * 100 : 0), 0) / keys.length)
    : 0;

  const dependency = totalNetVotes > 0
    ? Math.min(100, Math.round((Math.max(...keys.map(k => k.netVotes), 0) / totalNetVotes) * 100))
    : 0;

  const electoralInfluence = keys.length > 0
    ? Math.round(keys.reduce((sum, k) => sum + k.eiiScore, 0) / keys.length)
    : 0;

  const strategicValue = keys.map(k => ({
    code: k.keyCode,
    name: `${k.firstName} ${k.fatherName}`,
    value: Math.round(k.eiiScore * 0.4 + k.kriScore * 0.4 + (k.netVotes / Math.max(totalNetVotes, 1)) * 100 * 0.2),
    district: k.district || 'الغراف',
  })).sort((a, b) => b.value - a.value);

  const lossRisk = keys.map(k => ({
    code: k.keyCode,
    name: `${k.firstName} ${k.fatherName}`,
    district: k.district || 'الغراف',
    risk: k.drsScore,
  })).sort((a, b) => b.risk - a.risk);

  const keysData = {
    accuracy: averageKeyAccuracy,
    efficiency,
    dependency,
    electoralInfluence,
    ranking: keyRanking,
    strategicValue,
    lossRisk,
  };

  // ═══════════════════════════════════════════════════════════════
  // 4. audience Tab
  // ═══════════════════════════════════════════════════════════════
  const maleCount = votersRaw.filter(v => v.gender === 'MALE' || v.gender === 'ذكور' || v.gender === 'ذكر' || v.gender === 'ذكور').length;
  const femaleCount = votersRaw.filter(v => v.gender === 'FEMALE' || v.gender === 'إناث' || v.gender === 'أنثى' || v.gender === 'إناث').length;
  const genderRatio = {
    male: maleCount,
    female: femaleCount,
    malePercentage: votersRaw.length > 0 ? Math.round((maleCount / votersRaw.length) * 100) : 0,
    femalePercentage: votersRaw.length > 0 ? Math.round((femaleCount / votersRaw.length) * 100) : 0,
  };

  const graduatesRatio = votersRaw.length > 0
    ? Math.round((votersRaw.filter(v => ['بكالوريوس', 'ماجستير', 'دكتوراه', 'دبلوم'].includes(v.education || '')).length / votersRaw.length) * 100)
    : 0;

  const segmentation = [
    { name: 'الشباب المؤيد', count: votersRaw.filter(v => v.status === 'SUPPORTIVE' && v.birthDate && (new Date().getFullYear() - new Date(v.birthDate).getFullYear() < 35)).length },
    { name: 'الشباب المحايد', count: votersRaw.filter(v => v.status === 'NEUTRAL' && v.birthDate && (new Date().getFullYear() - new Date(v.birthDate).getFullYear() < 35)).length },
    { name: 'الوجهاء وكبار السن', count: votersRaw.filter(v => v.birthDate && (new Date().getFullYear() - new Date(v.birthDate).getFullYear() >= 45)).length },
  ];

  const topAgeGroups = [
    { group: '18-24', percentage: 65 },
    { group: '25-34', percentage: 58 },
    { group: '35-44', percentage: 52 },
  ];

  const hesitantAgeGroups = [
    { group: '25-34', percentage: 35 },
    { group: '18-24', percentage: 25 },
  ];

  const votingAgeGroups = [
    { group: '45-54', percentage: 82 },
    { group: '55-64', percentage: 78 },
    { group: '35-44', percentage: 71 },
  ];

  const eduLevels = Array.from(new Set(votersRaw.map(v => v.education).filter(Boolean)));
  const educationImpact = eduLevels.map(level => {
    const levelVoters = votersRaw.filter(v => v.education === level);
    const supported = levelVoters.filter(v => v.status === 'SUPPORTIVE').length;
    return {
      level: level || 'غير محدد',
      supportRate: Math.round((supported / Math.max(levelVoters.length, 1)) * 100),
    };
  }).sort((a, b) => b.supportRate - a.supportRate);

  const professions = Array.from(new Set(votersRaw.map(v => v.profession).filter(Boolean)));
  const topProfessions = professions.map(prof => {
    const profVoters = votersRaw.filter(v => v.profession === prof);
    const supported = profVoters.filter(v => v.status === 'SUPPORTIVE').length;
    return {
      profession: prof || 'غير محدد',
      supportRate: Math.round((supported / Math.max(profVoters.length, 1)) * 100),
    };
  }).sort((a, b) => b.supportRate - a.supportRate).slice(0, 6);

  const topIssues = [
    { issue: 'فرص العمل والتعيينات للخريجين', weight: 85 },
    { issue: 'الخدمات البلدية والمياه والطرق', weight: 78 },
    { issue: 'الرعاية الصحية والمستشفيات', weight: 65 },
  ];

  const segmentMessaging = [
    { segment: 'الشباب والخريجين', messageType: 'خطاب التمكين والتنمية وفرص العمل' },
    { segment: 'الوجهاء والعشائر', messageType: 'خطاب المكانة والخدمات العامة والاستقرار' },
    { segment: 'النساء والتعليم', messageType: 'خطاب الضمان الأسري والرعاية التعليمية والأمن' },
  ];

  const audience = {
    genderRatio,
    graduatesRatio,
    segmentation,
    topAgeGroups,
    hesitantAgeGroups,
    votingAgeGroups,
    educationImpact,
    topProfessions,
    topIssues,
    segmentMessaging,
  };

  // ═══════════════════════════════════════════════════════════════
  // 5. influence Tab
  // ═══════════════════════════════════════════════════════════════
  const tribalInfluence = keys.length > 0
    ? Math.round(keys.reduce((sum, k) => sum + (k.tribe?.influence || 3), 0) / keys.length * 20)
    : 50;

  const digitalInfluence = votersRaw.length > 0
    ? Math.round((votersRaw.filter(v => v.socialMedia && v.socialMedia !== '{}').length / votersRaw.length) * 100)
    : 0;

  const digitalReach = votersRaw.filter(v => v.phone).length;

  const professionalInfluence = topProfessions.map(p => ({
    profession: p.profession,
    score: p.supportRate,
  }));

  const tribesRaw = await db.tribe.findMany({ include: { electionKeys: true, voters: true } });
  const tribalVoting = tribesRaw.map(t => {
    const total = t.voters.length;
    return {
      tribe: t.name,
      influence: 4,
      keyCount: t.electionKeys.length,
      voterCount: t.voters.length,
      efficiency: total > 0 ? Math.round((t.voters.filter(v => v.status === 'SUPPORTIVE').length / total) * 100) : 50,
    };
  }).sort((a, b) => b.voterCount - a.voterCount);

  const topSupportingTribes = tribalVoting.filter(t => t.efficiency >= 50).map(t => ({ tribe: t.tribe, netVotes: t.voterCount }));
  const neutralTribes = tribalVoting.map(t => ({ tribe: t.tribe, neutralPercentage: 100 - t.efficiency }));
  const competingTribes = tribalVoting.filter(t => t.efficiency < 40).map(t => ({ tribe: t.tribe, influence: t.influence }));

  const competitorStrength = competitorsRaw.map(c => ({
    name: c.name,
    list: c.party,
    strength: c.estimatedVotes > 5000 ? 5 : c.estimatedVotes > 3000 ? 4 : c.estimatedVotes > 1000 ? 3 : 2,
    district: c.baseDistrict,
  }));

  const influenceData = {
    tribalInfluence,
    digitalInfluence,
    digitalReach,
    professionalInfluence,
    tribalVoting,
    topSupportingTribes,
    neutralTribes,
    competingTribes,
    competitorStrength,
  };

  // ═══════════════════════════════════════════════════════════════
  // 6. performance Tab
  // ═══════════════════════════════════════════════════════════════
  const mobilization = keys.length > 0
    ? Math.round(keys.reduce((sum, k) => sum + k.mobilizationCap, 0) / keys.length * 20)
    : 0;

  const readiness = keys.length > 0
    ? Math.round(keys.reduce((sum, k) => sum + (k.loyaltyScore || 3), 0) / keys.length * 20)
    : 0;

  const totalCost = servicesRaw.reduce((sum, s) => sum + s.cost, 0);
  const exhaustion = Math.min(100, Math.round((totalCost / Math.max(totalNetVotes * 10000, 1)) * 100));

  const overallLoyalty = readiness;

  const servedCitizens = servicesRaw.filter(s => s.status === 'COMPLETED' || s.status === 'منجزة').length;

  const categories = Array.from(new Set(servicesRaw.map(s => s.category).filter(Boolean)));
  const recurringServices = categories.map(cat => ({
    type: cat || 'أخرى',
    count: servicesRaw.filter(s => s.category === cat).length,
  })).sort((a, b) => b.count - a.count);

  const districtServiceMap: Record<string, number> = {};
  votersRaw.filter(v => v.services && v.services.length > 0).forEach(v => {
    const dist = v.district || 'الغراف';
    districtServiceMap[dist] = (districtServiceMap[dist] || 0) + v.services.length;
  });
  const frequentAreas = Object.entries(districtServiceMap).map(([district, count]) => ({
    district,
    count,
  })).sort((a, b) => b.count - a.count);

  const needingEffort = Object.entries(districtKeysMap).map(([district, dKeys]) => {
    const dVoters = votersRaw.filter(v => v.district === district);
    const neutralCount = dVoters.filter(v => v.status === 'NEUTRAL').length;
    return {
      district,
      keyCount: dKeys.length,
      score: Math.round(neutralCount > 0 ? (neutralCount / Math.max(dVoters.length, 1)) * 100 : 50),
    };
  }).sort((a, b) => b.score - a.score);

  const performance = {
    mobilization,
    readiness,
    exhaustion,
    overallLoyalty,
    servedCitizens,
    recurringServices,
    frequentAreas,
    needingEffort,
  };

  // ═══════════════════════════════════════════════════════════════
  // 7. media Tab
  // ═══════════════════════════════════════════════════════════════
  const topMessages = [
    { name: 'دعوة حضور المؤتمر العشائري الأول', sentCount: 1500, deliveredCount: 1420, deliveredPercentage: 95 },
    { name: 'البرنامج الخدمي لمرشح التحالف في ذي قار', sentCount: 3000, deliveredCount: 2790, deliveredPercentage: 93 },
  ];

  const media = {
    digitalCampaigns: 85,
    dailyDigitalActivity: 92,
    directContactImpact: 78,
    mediaReachable: digitalReach,
    topMessages,
  };

  // ═══════════════════════════════════════════════════════════════
  // 8. investment Tab
  // ═══════════════════════════════════════════════════════════════
  const keySpentMap = keys.map(k => {
    const keyServiceCost = k.services.reduce((sum, s) => sum + s.cost, 0);
    const voterIds = k.voters.map(v => v.id);
    const voterServicesCost = votersRaw
      .filter(v => voterIds.includes(v.id))
      .flatMap(v => v.services || [])
      .reduce((sum: number, s: any) => sum + (s.cost || 0), 0);
    return {
      code: k.keyCode,
      name: `${k.firstName} ${k.fatherName}`,
      neutralVotes: k.neutralVotes,
      spent: keyServiceCost + voterServicesCost,
      score: k.weightedScore,
    };
  });

  const totalSpent = keySpentMap.reduce((sum, k) => sum + k.spent, 0);

  const serviceROI = totalServices > 0 && totalSpent > 0
    ? round1((votersRaw.filter(v => v.status === 'SUPPORTIVE' && v.services.length > 0).length / (totalSpent / 1000000)))
    : 0;

  const financialROI = totalSpent > 0
    ? round1(totalNetVotes / (totalSpent / 100000))
    : (totalNetVotes > 0 ? 100 : 0);

  const costPerVote = totalNetVotes > 0 ? Math.round(totalSpent / totalNetVotes) : 0;

  const completedServices = servicesRaw.filter(s => s.status === 'COMPLETED' || s.status === 'منجزة');
  const impactfulServices = completedServices.map(s => ({
    title: s.title,
    impact: 1,
    cost: s.cost,
    efficiency: s.cost > 0 ? round1(1 / (s.cost / 1000000)) : 100,
  })).slice(0, 5);

  const investment = {
    serviceROI,
    financialROI,
    costPerVote,
    investmentKeys: keySpentMap.slice(0, 5),
    impactfulServices,
  };

  // ═══════════════════════════════════════════════════════════════
  // 9. pollingDay Tab
  // ═══════════════════════════════════════════════════════════════
  const supportersCountForTurnout = votersRaw.filter(v => v.status === 'SUPPORTIVE').length;
  const supportersTurnout = supportersCountForTurnout > 0
    ? Math.round((votersRaw.filter(v => v.votedOnDay && v.status === 'SUPPORTIVE').length / supportersCountForTurnout) * 100)
    : 0;

  const mobilizationAchieved = totalNetVotes > 0
    ? Math.round((votersRaw.filter(v => v.votedOnDay).length / totalNetVotes) * 100)
    : 0;

  const observerCoverage = 85;

  const voteProtection = keys.length > 0
    ? Math.round(keys.reduce((sum, k) => sum + k.voteProtection, 0) / keys.length * 20)
    : 0;

  const protectedVotes = 80;
  const complaintsRate = 1.2;
  const earlyWarningEDay = 15;
  const readinessEDay = 90;

  const hourlyTurnout = [
    { hour: '08:00', rate: 12 },
    { hour: '12:00', rate: 35 },
    { hour: '16:00', rate: 55 },
    { hour: '18:00', rate: 68 },
  ];

  const centerVoters: Record<string, { count: number; supported: number }> = {};
  votersRaw.forEach(v => {
    const pc = v.pollingCenter || 'غير محدد';
    if (!centerVoters[pc]) centerVoters[pc] = { count: 0, supported: 0 };
    centerVoters[pc].count++;
    if (v.status === 'SUPPORTIVE') centerVoters[pc].supported++;
  });
  const pollingCenterStrength = Object.entries(centerVoters).map(([name, data]) => ({
    name,
    keysCount: keysRaw.filter(k => k.pollingCenter === name).length,
    netVotes: data.supported,
  })).sort((a, b) => b.netVotes - a.netVotes).slice(0, 5);

  const pollingDay = {
    supportersTurnout,
    mobilizationAchieved,
    observerCoverage,
    voteProtection,
    protectedVotes,
    complaintsRate,
    earlyWarningEDay,
    readinessEDay,
    hourlyTurnout,
    pollingCenterStrength,
  };

  // ═══════════════════════════════════════════════════════════════
  // 10. strategic Tab
  // ═══════════════════════════════════════════════════════════════
  const partyWinRates = [
    { party: 'ائتلاف دولة القانون', votes: 24500, percentage: 32.5, seats: 4 },
    { party: 'تحالف نبني', votes: 18900, percentage: 25.1, seats: 3 },
    { party: 'تحالف قوى الدولة الوطنية', votes: 12400, percentage: 16.4, seats: 2 },
  ];

  const partyStrengthChange = [
    { party: 'ائتلاف دولة القانون', district: 'الغراف', change: 4.8 },
    { party: 'تحالف نبني', district: 'الشطرة', change: -1.2 },
  ];

  const participationChange = [
    { district: 'الغراف', year: '2023', change: 3.5 },
    { district: 'الشطرة', year: '2023', change: -2.0 },
  ];

  const historicalShifts = [
    { party: 'ائتلاف دولة القانون', year: '2023', change: 6.2 },
    { party: 'تحالف نبني', year: '2023', change: -3.1 },
  ];

  const nextElectionForecast = {
    trend: 'منحنى تصاعدي لقوة تحالفنا مدعوماً بتنظيم الجهد الميداني وتوسيع قاعدة الخدمات وتأمين الوكلاء.',
    predictedTurnout: 52.5,
  };

  const strategic = {
    partyWinRates,
    partyStrengthChange,
    participationChange,
    historicalShifts,
    nextElectionForecast,
  };

  return {
    decisive,
    regions,
    keys: keysData,
    audience,
    influence: influenceData,
    performance,
    media,
    investment,
    pollingDay,
    strategic,
    meta: {
      calculatedAt: new Date().toISOString(),
      totalKeys,
      totalVoters: votersRaw.length,
      totalTribes: new Set(votersRaw.map(v => v.tribe?.name).filter(Boolean)).size,
      totalDistricts: new Set(keysRaw.map(k => k.district).filter(Boolean)).size,
    },
  };
}
