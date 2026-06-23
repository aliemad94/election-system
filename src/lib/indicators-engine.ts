// ====================================================================
// indicators-engine.ts — محرك المؤشرات المركّبة الرئيسي
// ====================================================================
// يحسب لكل منطقة (قضاء) وللمحافظة ككل:
//   API  (Area Penetration Index)
//   EWLI (Early Warning Loss Index)
//   GSI  (Geographic Strength Index)
//   EDRI (Election Day Readiness Index)
//   EFI  (Electoral Forecast Index) — مركّب نهائي
//   توزيع المقاعد (Saint-Laguë)
// ====================================================================

import { prisma } from "./prisma";
import { enrichElectoralKey } from "./indicators-helper";
import { allocateSeatsLaguë } from "./seat-projection";

export interface AreaMetrics {
  eiiScore: number;
  kriScore: number;
  vpsScore: number;
  drsScore: number;
  campaignROI: number;
  apiScore: number;
  ewliScore: number;
  gsiScore: number;
  edriScore: number;
  efiScore: number;
  totalKeysInArea: number;
  totalNetVotes: number;
  totalSupportedVotes: number;
  totalNeutralVotes: number;
  totalWeakVotes: number;
  totalVotersInArea: number;
  projectedSeats: number;
}

export interface CompositeIndicatorsResult {
  governorate: AreaMetrics & { id: string; name: string; calculatedAt: string };
  districts: (AreaMetrics & {
    id: string;
    name: string;
    district: string;
    calculatedAt: string;
  })[];
  lastCalculated: string;
  seatProjection: {
    governorate: { partyName: string; votes: number; seats: number }[];
    totalSeats: number;
  };
}

const TOTAL_SEATS = 18; // مقاعد محافظة ذي قار التقديرية

/**
 * يحسب كل المؤشرات المركّبة للمحافظة والأقضية.
 * مكلف حسابياً — يُنصح بتغليفه بـ indicators-cache.
 */
export async function calculateAllCompositeIndicators(): Promise<CompositeIndicatorsResult> {
  // 1. جلب البيانات
  const [keys, voters, sentimentTrends, competitors, commissionData] =
    await Promise.all([
      prisma.electionKey.findMany({
        include: { tribe: true, services: true },
      }),
      prisma.voter.findMany(),
      prisma.sentimentTrend.findMany(),
      prisma.competitor.findMany(),
      prisma.commissionData.findMany(),
    ]);

  // 2. تجميع الناخبين حسب keyId — O(N) بدل O(N×M)
  const votersByKeyId = new Map<string, typeof voters>();
  for (const v of voters) {
    if (!v.keyId) continue;
    const list = votersByKeyId.get(v.keyId);
    if (list) list.push(v);
    else votersByKeyId.set(v.keyId, [v]);
  }

  // 3. إثراء المفاتيح
  const enrichedKeys = keys.map((key) =>
    enrichElectoralKey(key, votersByKeyId.get(key.id) ?? [], sentimentTrends)
  );

  // 3. دالة حساب مقاييس منطقة معيّنة
  const calculateAreaMetrics = (
    areaKeys: typeof enrichedKeys,
    areaVoters: typeof voters,
    areaName: string
  ): AreaMetrics => {
    const totalKeys = areaKeys.length;
    const totalVoters = areaVoters.length;

    // تجميع الأصوات
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
      // fallback من expectedVotes للمفاتيح
      areaKeys.forEach((k) => {
        supportedVotes += k.supportedVotes;
        neutralVotes += k.neutralVotes;
        weakVotes += k.weakVotes;
      });
    }

    const totalVotes = supportedVotes + neutralVotes + weakVotes;
    const netVotes = Math.max(0, supportedVotes - weakVotes);

    // متوسطات موزونة للمؤشرات الفردية
    const sumVotes = Math.max(1, totalVotes);
    let sumEII = 0,
      sumKRI = 0,
      sumVPS = 0,
      sumDRS = 0,
      sumROI = 0,
      sumWeightedScore = 0;

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

    // ===== API (Area Penetration Index) =====
    const neutralPercent =
      totalVotes > 0 ? (neutralVotes / totalVotes) * 100 : 30;
    const expansion = totalVotes > 0 ? (supportedVotes / totalVotes) * 100 : 50;
    const apiScore = Math.round(
      neutralPercent * 0.3 +
        expansion * 0.25 +
        avgKRI * 0.25 +
        avgWeightedScore * 0.2
    );

    // ===== EWLI (Early Warning Loss Index) =====
    const weakVotesRatio =
      totalVotes > 0 ? (weakVotes / totalVotes) * 100 : 10;
    const threats = avgDRS * 0.8;
    const supportDecline = 100 - avgKRI;
    const competitorStrength = 30; // fallback
    const ewliScore = Math.round(
      weakVotesRatio * 0.3 +
        avgDRS * 0.25 +
        threats * 0.2 +
        supportDecline * 0.15 +
        competitorStrength * 0.1
    );

    // ===== GSI (Geographic Strength Index) =====
    const distinctCentersInCommission = Array.from(
      new Set(
        commissionData
          .filter((c) => c.district === areaName || areaName === "ذي قار")
          .map((c) => c.pollingCenter)
      )
    );
    const distinctCentersInKeys = Array.from(
      new Set(areaKeys.map((k) => k.pollingCenter).filter(Boolean))
    );
    const coverage =
      distinctCentersInCommission.length > 0
        ? (distinctCentersInKeys.filter((c) =>
            distinctCentersInCommission.includes(c)
          ).length /
          distinctCentersInCommission.length) *
          100
        : 80;

    const voteDist = 85; // توزيع الأصوات (fallback)
    const balance = 80; // التوازن (fallback)
    const gsiScore = Math.round(
      coverage * 0.25 +
        voteDist * 0.25 +
        avgWeightedScore * 0.25 +
        balance * 0.25
    );

    // ===== EDRI (Election Day Readiness Index) =====
    const trainedKeys =
      totalKeys > 0
        ? (areaKeys.filter((k) => k.keyAccuracyScore >= 0.8).length /
            totalKeys) *
          100
        : 90;
    const highProtection =
      totalKeys > 0
        ? (areaKeys.filter((k) => k.riskLevel <= 2).length / totalKeys) * 100
        : 80;
    const gpsVerifiedVoters = areaVoters.filter((v) => v.gpsVerified).length;
    const observers =
      totalVoters > 0 ? (gpsVerifiedVoters / totalVoters) * 100 : 70;
    const registryVerifiedVoters = areaVoters.filter(
      (v) => v.isRegistryVerified
    ).length;
    const verified =
      totalVoters > 0 ? (registryVerifiedVoters / totalVoters) * 100 : 60;
    const loyalty = avgKRI;

    const edriScore = Math.round(
      trainedKeys * 0.2 +
        highProtection * 0.2 +
        observers * 0.2 +
        verified * 0.2 +
        loyalty * 0.2
    );

    // ===== EFI (Electoral Forecast Index) =====
    const efiScore = Math.round(
      avgEII * 0.15 +
        avgKRI * 0.15 +
        avgVPS * 0.2 +
        (100 - avgDRS) * 0.1 +
        apiScore * 0.1 +
        (100 - ewliScore) * 0.1 +
        gsiScore * 0.1 +
        edriScore * 0.1
    );

    // ===== توزيع المقاعد (Saint-Laguë) =====
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
    const allocated = allocateSeatsLaguë(parties, TOTAL_SEATS);
    const ourSeats =
      allocated.find((p) => p.partyName === "حملتنا الانتخابية")?.seats || 0;

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

  // 4. مقاييس المحافظة كاملة
  const governorateMetrics = calculateAreaMetrics(
    enrichedKeys,
    voters,
    "ذي قار"
  );

  // 5. مقاييس كل قضاء
  const districtNames = Array.from(
    new Set(keys.map((k) => k.district || "الغراف"))
  );
  const districts = districtNames
    .map((dName) => {
      const dKeys = enrichedKeys.filter((k) => k.district === dName);
      const dVoters = voters.filter((v) => v.district === dName);
      const metrics = calculateAreaMetrics(dKeys, dVoters, dName);
      return {
        id: `dist-${dName}`,
        name: dName,
        district: dName,
        ...metrics,
        calculatedAt: new Date().toISOString(),
      };
    })
    .filter((d) => d.totalKeysInArea > 0 || d.totalVotersInArea > 0);

  // 6. توزيع المقاعد للمحافظة (تفصيلي لكل حزب)
  const govCompetitors = competitors;
  const govParties = [
    { partyName: "حملتنا الانتخابية", votes: governorateMetrics.totalNetVotes },
    ...govCompetitors.map((c) => ({
      partyName: c.party || c.name,
      votes: c.estimatedVotes || 1000,
    })),
  ];
  const govAllocation = allocateSeatsLaguë(govParties, TOTAL_SEATS);

  return {
    governorate: {
      id: "gov-ذي قار",
      name: "ذي قار",
      ...governorateMetrics,
      calculatedAt: new Date().toISOString(),
    },
    districts: districts.sort((a, b) => b.efiScore - a.efiScore),
    lastCalculated: new Date().toISOString(),
    seatProjection: {
      governorate: govAllocation,
      totalSeats: TOTAL_SEATS,
    },
  };
}

