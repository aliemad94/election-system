import { prisma } from "./prisma";
import { calculateAllCompositeIndicators } from "./indicators-engine";

export async function calculateComprehensiveIndicators() {
  // 1. Fetch all composite indicators
  const composite = await calculateAllCompositeIndicators();
  const gov = composite.governorate;

  // 2. Fetch voters, keys, tribes, competitors, services, commissionData
  const voters = await prisma.voter.findMany({
    include: { tribe: true, services: true },
  });
  const keys = await prisma.electionKey.findMany({
    include: { tribe: true, services: true },
  });
  const tribes = await prisma.tribe.findMany({
    include: { voters: true },
  });
  const competitors = await prisma.competitor.findMany();
  const commissionData = await prisma.commissionData.findMany();

  const totalVoters = voters.length;
  const totalKeys = keys.length;
  const totalTribes = tribes.length;

  // 3. Calculate voter distributions
  let supportedCount = 0;
  let neutralCount = 0;
  let weakCount = 0;
  voters.forEach((v) => {
    const s = (v.status || "").toUpperCase();
    if (s === "SUPPORTED") supportedCount++;
    else if (s === "WEAK") weakCount++;
    else neutralCount++;
  });

  const totalStatusCount = Math.max(1, totalVoters);
  const supportDistribution = {
    supported: { count: supportedCount, percentage: Math.round((supportedCount / totalStatusCount) * 100) },
    neutral: { count: neutralCount, percentage: Math.round((neutralCount / totalStatusCount) * 100) },
    weak: { count: weakCount, percentage: Math.round((weakCount / totalStatusCount) * 100) },
  };

  // 4. Verification metrics
  const gpsVerifiedCount = voters.filter((v) => v.gpsVerified).length;
  const registryVerifiedCount = voters.filter((v) => v.isRegistryVerified).length;
  const gpsVerificationRate = totalVoters > 0 ? Math.round((gpsVerifiedCount / totalVoters) * 100) : 0;
  const registryVerificationRate = totalVoters > 0 ? Math.round((registryVerifiedCount / totalVoters) * 100) : 0;

  // 5. Accuracy & Services
  const avgAccuracy = keys.length > 0
    ? Math.round((keys.reduce((sum, k) => sum + (k.keyAccuracyScore || 1.0), 0) / keys.length) * 100)
    : 100;

  const servedVoters = voters.filter((v) => v.services.length > 0);
  const servedSupported = servedVoters.filter((v) => (v.status || "").toUpperCase() === "SUPPORTED");
  const serviceConversionRate = servedVoters.length > 0
    ? Math.round((servedSupported.length / servedVoters.length) * 100)
    : 0;

  // 6. Geographic strength & Map
  const districtNames = Array.from(new Set(composite.districts.map((d) => d.name)));
  const geoDistribution = composite.districts.map((d) => ({
    district: d.name,
    netVotes: d.totalNetVotes,
    percentage: d.efiScore,
    keyCount: d.totalKeysInArea,
  }));

  const areaMap = composite.districts.map((d) => {
    let color: "green" | "yellow" | "red" = "yellow";
    if (d.efiScore >= 50) color = "green";
    else if (d.efiScore < 35) color = "red";
    return {
      district: d.name,
      color,
      strength: d.efiScore,
      netVotes: d.totalNetVotes,
      keyCount: d.totalKeysInArea,
    };
  });

  const strongAreas = areaMap.filter((a) => a.color === "green");
  const weakAreas = areaMap.filter((a) => a.color === "red");

  // 7. Key Ranking
  const keyRanking = composite.districts
    .flatMap((d) => {
      // For now, let's fetch enriched keys and rank them globally
      return keys.map((k) => {
        const votersForKey = voters.filter((v) => v.keyId === k.id);
        const kSupported = votersForKey.filter((v) => (v.status || "").toUpperCase() === "SUPPORTED").length;
        const kWeak = votersForKey.filter((v) => (v.status || "").toUpperCase() === "WEAK").length;
        const netVotes = Math.max(0, kSupported - kWeak);

        // weightedScore
        const rawScore =
          ((k.loyaltyScore || 3) - 1) * 20 +
          ((k.influenceLevel || 3) - 1) * 20 +
          ((k.mobilizationCap || 3) - 1) * 15 +
          ((k.riskLevel || 3) - 1) * 15 +
          60;
        const weightedScore = Math.min(100, Math.max(0, Math.round(rawScore / 2)));

        return {
          code: k.keyCode,
          name: `${k.firstName} ${k.fatherName}`,
          nickname: k.tribe?.name || "",
          district: k.district,
          netVotes,
          weightedScore,
          eiiScore: Math.round(weightedScore * 0.8), // approximation for ranking display
          kriScore: Math.round((k.loyaltyScore || 3) * 20),
          drsScore: Math.round((k.riskLevel || 1) * 20),
        };
      });
    })
    // deduplicate by code
    .filter((v, i, self) => self.findIndex((t) => t.code === v.code) === i)
    .sort((a, b) => b.netVotes - a.netVotes)
    .map((k, idx) => ({ ...k, rank: idx + 1 }));

  // Decisive Data Object
  const expectedVotesOnDay = gov.totalSupportedVotes;
  const votesNeededToWin = 12000;
  const electoralGap = Math.max(0, votesNeededToWin - expectedVotesOnDay);
  const winProbability = Math.min(100, Math.round((expectedVotesOnDay / votesNeededToWin) * 100));

  const totalCommissionRegistered = commissionData.reduce((sum, c) => sum + (c.registeredVoters || 0), 0) || 50000;
  const expectedTurnout = commissionData.length > 0
    ? Math.round(commissionData.reduce((sum, c) => {
        const val = c.historicalTurnout || 50;
        return sum + (val > 1 ? val : val * 100);
      }, 0) / commissionData.length)
    : 50;

  const avgKRI = gov.kriScore;
  const avgDRS = gov.drsScore;
  const overallRisk = Math.min(100, Math.max(0, Math.round(avgDRS * 0.6 + (100 - avgKRI) * 0.4)));

  const decisive = {
    expectedVotesOnDay,
    expectedVotes: expectedVotesOnDay,
    votesNeededToWin,
    electoralGap,
    winProbability,
    expectedParticipation: expectedTurnout,
    expectedTurnout,
    overallRisk,
    strongAreas,
    weakAreas,
    geoDistribution,
    keyRanking: keyRanking.slice(0, 10), // return top 10 for dashboard performance
    avgKRI,
    avgDRS,
    stability: `${avgKRI}%`,
    earlyWarning: avgDRS > 50 ? "خطر مرتفع" : avgDRS > 30 ? "تحذير متوسط" : "طبيعي",
    defectionRisk: `${avgDRS}%`,
    supportDistribution,
    supportersDistribution: {
      supported: supportedCount,
      neutral: neutralCount,
      opponent: weakCount,
    },
    areaMap,
    totalNetVotes: gov.totalNetVotes,
    totalRegistered: totalCommissionRegistered,
    projectedSeats: gov.projectedSeats,
    gpsVerificationRate,
    registryVerificationRate,
    averageKeyAccuracy: avgAccuracy,
    serviceConversionRate,
  };

  // Regions Data
  const regions = {
    strongAreas: strongAreas.map((a) => a.district),
    weakAreas: weakAreas.map((a) => a.district),
    priorityIndex: areaMap.map((a) => ({ district: a.district, priority: 100 - a.strength })),
    politicalValue: areaMap.map((a) => ({ district: a.district, value: a.netVotes })),
    competitionIndex: areaMap.map((a) => ({ district: a.district, index: 100 - a.strength })),
    concentrationHHI: 2500, // standard value
    expansionIndex: 65,
    expansionPotential: 35,
    turnoutChange: [],
    votingShift: [],
  };

  // Keys Data
  const keysSection = {
    accuracy: avgAccuracy,
    efficiency: Math.round(gov.campaignROI * 10),
    dependency: 45,
    electoralInfluence: gov.eiiScore,
    ranking: keyRanking,
    strategicValue: keyRanking.map((k) => ({ name: k.name, value: k.weightedScore })),
    lossRisk: keyRanking.map((k) => ({ name: k.name, risk: k.drsScore })),
  };

  // Audience Data
  const maleCount = voters.filter((v) => v.gender === "ذكر").length;
  const femaleCount = voters.filter((v) => v.gender === "أنثى").length;
  const genderRatio = {
    male: maleCount,
    female: femaleCount,
    malePercentage: totalVoters > 0 ? Math.round((maleCount / totalVoters) * 100) : 50,
    femalePercentage: totalVoters > 0 ? Math.round((femaleCount / totalVoters) * 100) : 50,
  };

  const graduatesCount = voters.filter(
    (v) => v.education && ["بكالوريوس", "ماجستير", "دكتوراه", "خريج"].includes(v.education)
  ).length;

  const audience = {
    genderRatio,
    graduatesRatio: totalVoters > 0 ? Math.round((graduatesCount / totalVoters) * 100) : 40,
    segmentation: [],
    topAgeGroups: [],
    hesitantAgeGroups: [],
    votingAgeGroups: [],
    educationImpact: [],
    topProfessions: [],
    topIssues: [],
    segmentMessaging: [],
  };

  // Influence Data
  const tribalVoterCount = voters.filter((v) => v.tribeId).length;
  const tribalInfluence = totalVoters > 0 ? Math.round((tribalVoterCount / totalVoters) * 100) : 60;

  const sortedTribes = tribes
    .map((t) => {
      const tVoters = voters.filter((v) => v.tribeId === t.id);
      const supported = tVoters.filter((v) => (v.status || "").toUpperCase() === "SUPPORTED").length;
      const weak = tVoters.filter((v) => (v.status || "").toUpperCase() === "WEAK").length;
      const net = Math.max(0, supported - weak);
      return { id: t.id, name: t.name, count: tVoters.length, netVotes: net };
    })
    .sort((a, b) => b.count - a.count);

  const influence = {
    tribalInfluence,
    digitalInfluence: 35,
    digitalReach: 40,
    professionalInfluence: [],
    tribalVoting: [],
    topSupportingTribes: sortedTribes.slice(0, 5),
    neutralTribes: sortedTribes.filter((t) => t.netVotes === 0).slice(0, 5),
    competingTribes: sortedTribes.slice(5, 10),
    competitorStrength: competitors.map((c) => ({ competitor: c.name, strength: c.estimatedVotes })),
  };

  // Performance Data
  const performance = {
    mobilization: gov.edriScore,
    readiness: gov.edriScore,
    exhaustion: Math.round(gov.drsScore * 0.8),
    overallLoyalty: gov.kriScore,
    servedCitizens: voters.filter((v) => v.services.length > 0).length,
    recurringServices: [],
    frequentAreas: [],
    needingEffort: [],
  };

  // Investment Data
  const totalSpent = voters.flatMap((v) => v.services).reduce((sum, s) => sum + (s.cost || 0), 0) +
                     keys.flatMap((k) => k.services).reduce((sum, s) => sum + (s.cost || 0), 0);
  const costPerVote = expectedVotesOnDay > 0 ? Math.round(totalSpent / expectedVotesOnDay) : 0;

  const investment = {
    serviceROI: gov.campaignROI,
    financialROI: gov.campaignROI,
    costPerVote,
    investmentKeys: [],
    impactfulServices: [],
  };

  return {
    decisive,
    regions,
    keys: keysSection,
    audience,
    influence,
    performance,
    media: {
      digitalCampaigns: 4,
      dailyDigitalActivity: 75,
      directContactImpact: 85,
      mediaReachable: 60,
      topMessages: [],
    },
    investment,
    pollingDay: {
      supportersTurnout: Math.round(voters.filter((v) => v.votedOnDay).length / Math.max(1, supportedCount) * 100),
      mobilizationAchieved: Math.round(voters.filter((v) => v.votedOnDay).length / Math.max(1, totalVoters) * 100),
      observerCoverage: 95,
      voteProtection: 90,
      protectedVotes: voters.filter((v) => v.votedOnDay && v.gpsVerified).length,
      complaintsRate: 2,
      earlyWarningEDay: 5,
      readinessEDay: gov.edriScore,
      hourlyTurnout: [],
      pollingCenterStrength: [],
    },
    strategic: {
      partyWinRates: [],
      partyStrengthChange: [],
      participationChange: [],
      historicalShifts: [],
      nextElectionForecast: { trend: "صعودي", predictedTurnout: expectedTurnout },
    },
    meta: {
      calculatedAt: new Date().toISOString(),
      totalKeys,
      totalVoters,
      totalTribes,
      totalDistricts: districtNames.length || 1,
    },
  };
}
