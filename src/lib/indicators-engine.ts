import { prisma } from "./prisma";
import { enrichElectoralKey } from "./indicators-helper";
import { allocateSeatsLaguë } from "./seat-projection";

export async function calculateAllCompositeIndicators() {
  // 1. Fetch DB data
  const keys = await prisma.electionKey.findMany({
    include: {
      tribe: true,
      services: true,
    },
  });

  const voters = await prisma.voter.findMany({
    include: {
      tribe: true,
      electionKey: true,
    },
  });

  const sentimentTrends = await prisma.sentimentTrend.findMany();
  const competitors = await prisma.competitor.findMany();
  const commissionData = await prisma.commissionData.findMany();

  // 2. Enrich Keys
  const enrichedKeys = keys.map((key) => enrichElectoralKey(key, voters, sentimentTrends));

  // 3. Define helper to calculate metrics for a subset of keys and voters
  const calculateAreaMetrics = (areaKeys: typeof enrichedKeys, areaVoters: typeof voters, areaName: string) => {
    const totalKeys = areaKeys.length;
    const totalVoters = areaVoters.length;

    // Sum vote counts
    let supportedVotes = 0;
    let neutralVotes = 0;
    let weakVotes = 0;

    if (totalVoters > 0) {
      areaVoters.forEach((v) => {
        const stat = (v.status || "").toUpperCase();
        if (stat === "SUPPORTED") supportedVotes++;
        else if (stat === "WEAK") weakVotes++;
        else neutralVotes++;
      });
    } else {
      // Fallback from keys expected votes
      areaKeys.forEach((k) => {
        supportedVotes += k.supportedVotes;
        neutralVotes += k.neutralVotes;
        weakVotes += k.weakVotes;
      });
    }

    const totalVotes = supportedVotes + neutralVotes + weakVotes;
    const netVotes = Math.max(0, supportedVotes - weakVotes);

    // Weighted averages for key indexes
    const sumVotes = Math.max(1, totalVotes);
    let sumEII = 0;
    let sumKRI = 0;
    let sumVPS = 0;
    let sumDRS = 0;
    let sumROI = 0;
    let sumWeightedScore = 0;

    areaKeys.forEach((k) => {
      const w = k.totalVotes || 1;
      sumEII += k.eiiScore * w;
      sumKRI += k.kriScore * w;
      sumVPS += k.vpsScore * w;
      sumDRS += k.drsScore * w;
      sumROI += k.campaignROI * w;
      sumWeightedScore += k.weightedScore * w;
    });

    const avgEII = Math.round(sumEII / sumVotes);
    const avgKRI = Math.round(sumKRI / sumVotes);
    const avgVPS = Math.round(sumVPS / sumVotes);
    const avgDRS = Math.round(sumDRS / sumVotes);
    const avgROI = Math.round(sumROI / sumVotes);
    const avgWeightedScore = Math.round(sumWeightedScore / sumVotes);

    // API (Area Penetration Index)
    const neutralPercent = totalVotes > 0 ? (neutralVotes / totalVotes) * 100 : 30;
    const expansion = totalVotes > 0 ? (supportedVotes / totalVotes) * 100 : 50;
    const apiScore = Math.round(
      (neutralPercent * 0.3) +
      (expansion * 0.25) +
      (avgKRI * 0.25) +
      (avgWeightedScore * 0.20)
    );

    // EWLI (Early Warning Loss Index)
    const weakVotesRatio = totalVotes > 0 ? (weakVotes / totalVotes) * 100 : 10;
    const threats = avgDRS * 0.8;
    const supportDecline = 100 - avgKRI;
    const competitorStrength = 30; // fallback default
    const ewliScore = Math.round(
      (weakVotesRatio * 0.3) +
      (avgDRS * 0.25) +
      (threats * 0.20) +
      (supportDecline * 0.15) +
      (competitorStrength * 0.10)
    );

    // GSI (Geographic Strength Index)
    const distinctCentersInCommission = Array.from(
      new Set(commissionData.filter((c) => c.district === areaName || areaName === "ذي قار").map((c) => c.pollingCenter))
    );
    const distinctCentersInKeys = Array.from(new Set(areaKeys.map((k) => k.pollingCenter)));
    const coverage = distinctCentersInCommission.length > 0
      ? (distinctCentersInKeys.filter((c) => distinctCentersInCommission.includes(c)).length / distinctCentersInCommission.length) * 100
      : 80; // default coverage if no commission data loaded

    const voteDist = 85;
    const balance = 80;
    const gsiScore = Math.round(
      (coverage * 0.25) +
      (voteDist * 0.25) +
      (avgWeightedScore * 0.25) +
      (balance * 0.25)
    );

    // EDRI (Election Day Readiness Index)
    const trainedKeys = totalKeys > 0
      ? (areaKeys.filter((k) => k.keyAccuracyScore >= 0.8).length / totalKeys) * 100
      : 90;
    const highProtection = totalKeys > 0
      ? (areaKeys.filter((k) => k.riskLevel <= 2).length / totalKeys) * 100
      : 80;
    const gpsVerifiedVoters = areaVoters.filter((v) => v.gpsVerified).length;
    const observers = totalVoters > 0 ? (gpsVerifiedVoters / totalVoters) * 100 : 70;
    const registryVerifiedVoters = areaVoters.filter((v) => v.isRegistryVerified).length;
    const verified = totalVoters > 0 ? (registryVerifiedVoters / totalVoters) * 100 : 60;
    const loyalty = avgKRI;

    const edriScore = Math.round(
      (trainedKeys * 0.2) +
      (highProtection * 0.2) +
      (observers * 0.2) +
      (verified * 0.2) +
      (loyalty * 0.2)
    );

    // EFI (Electoral Forecast Index)
    const efiScore = Math.round(
      (avgEII * 0.15) +
      (avgKRI * 0.15) +
      (avgVPS * 0.20) +
      ((100 - avgDRS) * 0.10) +
      (apiScore * 0.10) +
      ((100 - ewliScore) * 0.10) +
      (gsiScore * 0.10) +
      (edriScore * 0.10)
    );

    // Seat Projection using Saint-Laguë
    // Sum estimated votes of competitors in this area
    const areaCompetitors = competitors.filter(
      (c) => c.baseDistrict === areaName || areaName === "ذي قار"
    );

    const parties = [
      { partyName: "حملتنا الانتخابية", votes: netVotes },
      ...areaCompetitors.map((c) => ({
        partyName: c.party || c.name,
        votes: c.estimatedVotes || 1000,
      })),
    ];

    const totalSeats = 18;
    const allocated = allocateSeatsLaguë(parties, totalSeats);
    const ourSeats = allocated.find((p) => p.partyName === "حملتنا الانتخابية")?.seats || 0;

    return {
      eiiScore: Math.min(100, Math.max(0, avgEII || 70)),
      kriScore: Math.min(100, Math.max(0, avgKRI || 70)),
      vpsScore: Math.min(100, Math.max(0, avgVPS || 70)),
      drsScore: Math.min(100, Math.max(0, avgDRS || 20)),
      campaignROI: Math.min(100, Math.max(0, avgROI || 5)),
      apiScore: Math.min(100, Math.max(0, apiScore || 70)),
      ewliScore: Math.min(100, Math.max(0, ewliScore || 20)),
      gsiScore: Math.min(100, Math.max(0, gsiScore || 70)),
      edriScore: Math.min(100, Math.max(0, edriScore || 75)),
      efiScore: Math.min(100, Math.max(0, efiScore || 70)),
      totalKeysInArea: totalKeys,
      totalNetVotes: netVotes,
      totalSupportedVotes: supportedVotes,
      totalNeutralVotes: neutralVotes,
      totalWeakVotes: weakVotes,
      totalVotersInArea: totalVoters,
      projectedSeats: ourSeats,
    };
  };

  // 4. Calculate governorate (ذي قار) metrics
  const governorateMetrics = calculateAreaMetrics(enrichedKeys, voters, "ذي قار");

  // 5. Calculate per district metrics
  const districtNames = Array.from(new Set(keys.map((k) => k.district || "الغراف")));
  const districts = districtNames.map((dName) => {
    const dKeys = enrichedKeys.filter((k) => k.district === dName);
    const dVoters = voters.filter((v) => v.district === dName);
    const metrics = calculateAreaMetrics(dKeys, dVoters, dName);
    return {
      id: `dist-${dName}`,
      name: dName,
      ...metrics,
      calculatedAt: new Date().toISOString(),
    };
  });

  return {
    governorate: {
      id: "gov-ذي قار",
      ...governorateMetrics,
      calculatedAt: new Date().toISOString(),
    },
    districts,
    lastCalculated: new Date().toISOString(),
  };
}
