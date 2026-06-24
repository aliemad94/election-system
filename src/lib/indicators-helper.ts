// ====================================================================
// indicators-helper.ts — إثراء المفتاح الانتخابي بالمؤشرات الفردية
// ====================================================================
// يحسب لكل مفتاح: EII, KRI, VPS, DRS, campaignROI, weightedScore
// بالإضافة إلى تجميعات الأصوات (supported/neutral/weak/net).
// ====================================================================

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
  pollingCenter: string;
  tribeId: string | null;
  subTribeId: string | null;
  riskLevel: number;
  influenceLevel: number;
  mobilizationCap: number;
  loyaltyScore: number;
  classification?: string;
  [key: string]: unknown; // للحقول الأخرى المنقولة من المفتاح الأصلي
}

/**
 * يأخذ مفتاحاً انتخابياً خاماً + قائمة ناخبيه + اتجاهات الرأي،
 * ويرجع مفتاحاً مُثرىً بكل المؤشرات المحسوبة.
 *
 * @param key المفتاح الانتخابي الخام (من Prisma)
 * @param allVoters كل الناخبين (سيُفلتر الداخلي)
 * @param sentimentTrends اتجاهات الرأي (اختياري)
 */
export function enrichElectoralKey(
  key: any,
  allVoters: any[] = [],
  _sentimentTrends: any[] = []
): EnrichedKey {
  // فلترة ناخبي هذا المفتاح
  const voters = allVoters.filter((v) => v.keyId === key.id);
  const services = key.services || [];

  // ===== 1. تجميع الأصوات حسب الحالة =====
  let supportedVotes = 0;
  let neutralVotes = 0;
  let weakVotes = 0;
  let totalVotes = voters.length;

  if (totalVotes > 0) {
    voters.forEach((v) => {
      const stat = (v.status || "").toUpperCase();
      if (stat === "SUPPORTED") supportedVotes++;
      else if (stat === "WEAK") weakVotes++;
      else neutralVotes++;
    });
  } else {
    // fallback لتقدير expectedVotes
    const exp = key.expectedVotes || 0;
    supportedVotes = Math.round(exp * 0.6);
    neutralVotes = Math.round(exp * 0.3);
    weakVotes = Math.round(exp * 0.1);
    totalVotes = exp;
  }

  const net = supportedVotes * 0.8 + neutralVotes * 0.5 + weakVotes * 0.3;
  const netVotes = Math.round(net * 10) / 10;

  // ===== 2. التقييم الموزون (Weighted Score) =====
  const weightedScore = totalVotes > 0 ? Math.round(((netVotes / totalVotes) * 100) * 10) / 10 : 0;

  let classification = "ضعيف";
  if (weightedScore >= 75) classification = "قوي";
  else if (weightedScore >= 60) classification = "جيد";
  else if (weightedScore >= 45) classification = "مقبول";

  // ===== 3. EII (Electoral Impact Index) =====
  // = (تقييم موزون × 30%) + (نسبة أصوات صافية × 25%) + (نفوذ × 25%) + (تحشيد × 20%)
  const netVotesRatio = totalVotes > 0 ? (netVotes / totalVotes) * 100 : 0;
  const influenceLevelNormalized = ((key.influenceLevel || 3) / 5) * 100;
  const mobilizationCapNormalized = ((key.mobilizationCap || 3) / 5) * 100;
  const eiiScore = Math.round(
    weightedScore * 0.3 +
      netVotesRatio * 0.25 +
      influenceLevelNormalized * 0.25 +
      mobilizationCapNormalized * 0.2
  );

  // ===== 4. KRI (Key Reliability Index) =====
  // = (ولاء × 25%) + (أسباب دعم × 20%) + (حماية × 20%) + (تجنب احتياجات × 20%) + (استقرار × 15%)
  const loyaltyScoreNormalized = ((key.loyaltyScore || 3) / 5) * 100;
  const supportReasonPresence =
    totalVotes > 0
      ? (voters.filter(
          (v) => v.supportReason && v.supportReason.trim() !== ""
        ).length /
          totalVotes) *
        100
      : 80;
  // الحماية = عكس مستوى الخطر
  const riskLevelInvNormalized = ((6 - (key.riskLevel || 1)) / 5) * 100;

  // تجنّب الاحتياجات = نسبة الخدمات غير المعلّقة
  const totalServicesCount = services.length;
  const pendingServicesCount = services.filter(
    (s: any) => s.status === "PENDING" || s.status === "IN_PROGRESS"
  ).length;
  const noRequests =
    totalServicesCount > 0
      ? 100 - (pendingServicesCount / totalServicesCount) * 50
      : 100;

  // الاستقرار = عكس الخطر
  const stability = 100 - (key.riskLevel || 1) * 15;
  const kriScore = Math.round(
    loyaltyScoreNormalized * 0.25 +
      supportReasonPresence * 0.2 +
      riskLevelInvNormalized * 0.2 +
      noRequests * 0.2 +
      stability * 0.15
  );

  // ===== 5. VPS (Vote Probability Score) =====
  const vpsScore =
    totalVotes > 0
      ? Math.round(
          (supportedVotes * 80 + neutralVotes * 50 + weakVotes * 30) /
            totalVotes
        )
      : 80;

  // ===== 6. DRS (Defection Risk Score) =====
  const loyaltyInv = ((5 - (key.loyaltyScore || 3)) / 4) * 100;
  const weakSupportRatio =
    totalVotes > 0 ? (weakVotes / totalVotes) * 100 : 10;
  const needsPressure = ((key.riskLevel || 1) / 5) * 100;

  const lowEducationRatio =
    totalVotes > 0
      ? (voters.filter(
          (v) =>
            v.education === "ابتدائي" || v.education === "أمي" || !v.education
        ).length /
          totalVotes) *
        100
      : 20;
  const lowOrg = (1 - (key.keyAccuracyScore || 1.0)) * 100;
  const noContactRatio =
    totalVotes > 0
      ? (voters.filter((v) => !v.lastContactDate).length / totalVotes) * 100
      : 30;

  const drsScore = Math.round(
    loyaltyInv * 0.25 +
      weakSupportRatio * 0.2 +
      needsPressure * 0.2 +
      lowEducationRatio * 0.15 +
      lowOrg * 0.1 +
      noContactRatio * 0.1
  );

  // ===== 7. Campaign ROI =====
  const totalSpent = services.reduce(
    (sum: number, s: any) => sum + (s.cost || 0),
    0
  );
  const campaignROI =
    totalSpent > 0
      ? Math.round((netVotes / (totalSpent / 1000000)) * 10 * 10) / 10
      : netVotes > 0
      ? 10.0
      : 0.0;

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
    classification,
    keyAccuracyScore: key.keyAccuracyScore || 1.0,
    pollingCenter: key.pollingCenter,
    tribeId: key.tribeId,
    subTribeId: key.subTribeId,
    riskLevel: key.riskLevel || 1,
    influenceLevel: key.influenceLevel || 1,
    mobilizationCap: key.mobilizationCap || 1,
    loyaltyScore: key.loyaltyScore || 3,
  };
}

