// ====================================================================
// المعادلات الحسابية الانتخابية — محركات الحساب الأساسية
// Electoral Calculations Engine — Core Computation Module
// ====================================================================
// يحتوي هذا الملف على جميع المعادلات الحسابية المذكورة في الوثيقة المرجعية:
// 1. معادلة الأصوات الصافية (Net Votes)
// 2. معادلة الدرجة المرجّحة (Weighted Score)
// 3. معادلة التصنيف (Classification)
// ====================================================================

/**
 * أوزان أنواع الأصوات في معادلة الأصوات الصافية
 * مستوحاة من التحليل الإحصائي للسلوك التصويتي في الانتخابات العراقية
 */
export const VOTE_WEIGHTS = {
  supported: 0.8, // 80% احتمال تصويت فعلي
  neutral: 0.5,   // 50% احتمال متوسط
  weak: 0.3,      // 30% احتمال منخفض
} as const;

/**
 * أوزان الأبعاد التقييمية التسعة في معادلة الدرجة المرجّحة
 * المجموع = 100
 */
export const DIMENSION_WEIGHTS = {
  loyaltyScore: 20,         // الولاء — الأعلى وزناً
  influenceLevel: 20,       // التأثير — الأعلى وزناً
  mobilizationCap: 15,      // التحشيد
  voteProtection: 15,       // الحماية
  supportReason: 10,        // الدعم
  needsLevel: 5,            // الاحتياجات
  politicalNote: 5,         // الانحياز السياسي
  organizationalNote: 5,    // القدرة التنظيمية
  generalNote: 5,           // التقييم العام
} as const;

/**
 * عتبات التصنيف
 */
export const CLASSIFICATION_THRESHOLDS = {
  WEAK: 45,       // أقل من 45: ضعيف
  ACCEPTABLE: 60, // 45 إلى أقل من 60: مقبول
  GOOD: 75,      // 60 إلى أقل من 75: جيد
  // 75 فأكثر: قوي
} as const;

/**
 * تسميات التصنيف
 */
export const CLASSIFICATION_LABELS = {
  WEAK: 'ضعيف',
  ACCEPTABLE: 'مقبول',
  GOOD: 'جيد',
  STRONG: 'قوي',
} as const;

export type Classification = keyof typeof CLASSIFICATION_LABELS;
export type ClassificationLabel = typeof CLASSIFICATION_LABELS[Classification];

// ====================================================================
// الواجهات (Interfaces)
// ====================================================================

export interface VoteData {
  supportedVotes: number;
  neutralVotes: number;
  weakVotes: number;
}

export interface RatingData {
  loyaltyScore: number;       // 1-5  [F1]
  influenceLevel: number;     // 1-5  [F2]
  mobilizationCap: number;    // 1-5  [F3]
  voteProtection: number;     // 1-5  [F4]
  supportReason: number;      // 1-5  [F5]
  needsLevel: number;         // 1-5  [F6] مقلوب: احتياجات مرتفعة = درجة منخفضة
  politicalNote: number;      // 1-5  [F7]
  organizationalNote: number; // 1-5  [F8]
  generalNote: number;        // 1-5  [F9]
}

/** نموذج التقييم الموسع — 11 حقلاً مع مضاعفات الدقة والتدريب */
export interface RatingDataV2 extends RatingData {
  dataAccuracy: number;       // 1-5  [F10] دقة المعلومات — مضاعف ثقة
  trainingReadiness: number;  // 1-5  [F11] التدريب الانتخابي — مضاعف جاهزية
}

export interface ElectoralKeyData extends VoteData, RatingData {
  totalVotes: number;
}

export interface ElectoralKeyDataV2 extends VoteData, RatingDataV2 {
  totalVotes: number;
}

/** نتيجة التقييم الموسع — نظام الفلترة الثنائية */
export interface DoubleFilterResult {
  netVoters: number;
  claimedVoters: number;
  filterOneLoss: number;
  filterOneLossPercent: number;
  efficiencyCoefficient: number;
  classification: string;
  rawEfficiency: number;
  accuracyMultiplier: number;
  trainingMultiplier: number;
  actualBallots: number;
  leakedVotes: number;
  dimensionScores: Array<{ field: string; rating: number; weight: number; contribution: number }>;
  recommendation: string;
}

export interface CalculationResult {
  netVotes: number;
  weightedScore: number;
  classification: ClassificationLabel;
  rawScore: number;
  totalVotes: number;
}

// ====================================================================
// دوال الحساب الأساسية
// ====================================================================

/**
 * حساب الأصوات الصافية (Net Votes)
 * المعادلة: netVotes = (supportedVotes × 0.8) + (neutralVotes × 0.5) + (weakVotes × 0.3)
 */
export function calculateNetVotes(data: VoteData): number {
  const netVotes =
    (data.supportedVotes * VOTE_WEIGHTS.supported) +
    (data.neutralVotes * VOTE_WEIGHTS.neutral) +
    (data.weakVotes * VOTE_WEIGHTS.weak);

  return Math.round(netVotes * 10) / 10; // تقريب الصافي لرقم عشري واحد
}

/**
 * حساب مجموع الأصوات الكلية
 */
export function calculateTotalVotes(data: VoteData): number {
  return data.supportedVotes + data.neutralVotes + data.weakVotes;
}

/**
 * حساب الدرجة الخام (Raw Score) من الأبعاد التقييمية التسعة
 * المعادلة:
 * rawScore = (loyaltyRating × 20) + (influenceRating × 20) + (mobilizationRating × 15)
 *          + (protectionRating × 15) + (supportRating × 10) + (needsRating × 5)
 *          + (politicalAlignmentRating × 5) + (organizationalRating × 5)
 *          + (generalRating × 5)
 * الحد الأقصى النظري = 500 (جميع التقييمات = 5)
 */
export function calculateRawScore(ratings: RatingData): number {
  return (
    (ratings.loyaltyScore * DIMENSION_WEIGHTS.loyaltyScore) +
    (ratings.influenceLevel * DIMENSION_WEIGHTS.influenceLevel) +
    (ratings.mobilizationCap * DIMENSION_WEIGHTS.mobilizationCap) +
    (ratings.voteProtection * DIMENSION_WEIGHTS.voteProtection) +
    (ratings.supportReason * DIMENSION_WEIGHTS.supportReason) +
    (ratings.needsLevel * DIMENSION_WEIGHTS.needsLevel) +
    (ratings.politicalNote * DIMENSION_WEIGHTS.politicalNote) +
    (ratings.organizationalNote * DIMENSION_WEIGHTS.organizationalNote) +
    (ratings.generalNote * DIMENSION_WEIGHTS.generalNote)
  );
}

/**
 * حساب التقييم كنسبة مئوية حقيقية من الأصوات الكلية
 * المعادلة: weightedScore = (netVotes / totalVotes) * 100
 */
export function calculateWeightedScore(netVotes: number, totalVotes: number): number {
  if (totalVotes <= 0) return 0;
  const evaluation = (netVotes / totalVotes) * 100;
  return Math.round(evaluation * 10) / 10;
}

/**
 * تحديد التصنيف بناءً على النسبة المئوية للتقييم
 *
 * | النسبة المئوية للتقييم | التصنيف |
 * |---|---|
 * | أقل من 45 | ضعيف |
 * | 45 إلى أقل من 60 | مقبول |
 * | 60 إلى أقل من 75 | جيد |
 * | 75 فأكثر | قوي |
 */
export function classifyKey(weightedScore: number): ClassificationLabel {
  if (weightedScore >= 75) {
    return CLASSIFICATION_LABELS.STRONG;
  }
  if (weightedScore >= 60) {
    return CLASSIFICATION_LABELS.GOOD;
  }
  if (weightedScore >= 45) {
    return CLASSIFICATION_LABELS.ACCEPTABLE;
  }
  return CLASSIFICATION_LABELS.WEAK;
}

/**
 * إجراء جميع الحسابات دفعة واحدة لمفتاح انتخابي
 * يُستخدم عند إنشاء أو تحديث مفتاح
 */
export function calculateAll(data: ElectoralKeyData): CalculationResult {
  const totalVotes = data.totalVotes || calculateTotalVotes(data);
  const netVotes = calculateNetVotes(data);
  const rawScore = calculateRawScore(data);
  const weightedScore = calculateWeightedScore(netVotes, totalVotes);
  const classification = classifyKey(weightedScore);

  return {
    netVotes,
    weightedScore,
    classification,
    rawScore,
    totalVotes,
  };
}

/**
 * محاكاة سيناريو — حساب النتائج بدون حفظ
 * يسمح بتعديل القيم افتراضياً ورؤية تأثيرها
 */
export function simulateScenario(
  currentData: ElectoralKeyData,
  overrides: Partial<ElectoralKeyData>,
): CalculationResult {
  const simulatedData: ElectoralKeyData = {
    ...currentData,
    ...overrides,
  };

  // إعادة حساب totalVotes إذا تغيرت الأصوات الفرعية
  if (overrides.supportedVotes !== undefined || overrides.neutralVotes !== undefined || overrides.weakVotes !== undefined) {
    simulatedData.totalVotes = calculateTotalVotes(simulatedData);
  }

  return calculateAll(simulatedData);
}

/**
 * حساب تكلفة الصوت الواحد
 */
export function calculateCostPerVote(totalInvestment: number, netVotes: number): number {
  if (netVotes <= 0) return 0;
  return Math.round((totalInvestment / netVotes) * 100) / 100;
}

// ====================================================================
// ثوابت محافظة ذي قار
// ====================================================================

export const DHI_QAR_CONSTANTS = {
  /** عدد المقاعد البرلمانية */
  PARLIAMENTARY_SEATS: 18,
  /** عدد الناخبين المسجّلين */
  REGISTERED_VOTERS: 1099438,
  /** نسبة المشاركة التاريخية */
  HISTORICAL_PARTICIPATION_RATE: 0.4897,
  /** العتبة الانتخابية */
  ELECTORAL_THRESHOLD: 0.05,
  /** الأقضية السبعة */
  DISTRICTS: [
    'الناصرية',
    'سوق الشيوخ',
    'الشطرة',
    'الرفاعي',
    'البطحاء',
    'الغراف',
    'قلعة سكر',
  ] as const,
} as const;

/**
 * حساب عدد الأصوات المطلوبة لتجاوز العتبة الانتخابية
 */
export function calculateThresholdVotes(
  registeredVoters: number = DHI_QAR_CONSTANTS.REGISTERED_VOTERS,
  participationRate: number = DHI_QAR_CONSTANTS.HISTORICAL_PARTICIPATION_RATE,
): number {
  const expectedVotes = registeredVoters * participationRate;
  return Math.ceil(expectedVotes * DHI_QAR_CONSTANTS.ELECTORAL_THRESHOLD);
}

/**
 * حساب عدد الأصوات المطلوبة لكل مقعد
 */
export function calculateVotesPerSeat(
  registeredVoters: number = DHI_QAR_CONSTANTS.REGISTERED_VOTERS,
  participationRate: number = DHI_QAR_CONSTANTS.HISTORICAL_PARTICIPATION_RATE,
): number {
  const expectedVotes = registeredVoters * participationRate;
  return Math.ceil(expectedVotes / DHI_QAR_CONSTANTS.PARLIAMENTARY_SEATS);
}

// ====================================================================
// ═══ نظام الفلترة الثنائية — Double Filter (11 حقلاً) ═══
// ====================================================================

/** الخطوة 1: الفلتر الأول — الأصوات الصافية (Net Tonnage) */
export function filterOneNetVoters(votes: VoteData): { netVoters: number; loss: number; lossPercent: number } {
  const total = calculateTotalVotes(votes);
  const net = calculateNetVotes(votes);
  const loss = total - net;
  return {
    netVoters: Math.round(net * 100) / 100,
    loss: Math.round(loss * 100) / 100,
    lossPercent: total > 0 ? Math.round((loss / total) * 1000) / 10 : 0,
  };
}

/** الخطوة 2: الفلتر الثاني — معامل كفاءة المفتاح (11 حقلاً) */
export function filterTwoEfficiencyCoefficient(ratings: RatingDataV2): {
  coefficient: number; classification: string; rawEfficiency: number;
  accuracyMultiplier: number; trainingMultiplier: number;
  dimensionScores: Array<{ field: string; rating: number; weight: number; contribution: number }>;
} {
  const dims = [
    { field: 'مستوى الولاء [F1]', rating: ratings.loyaltyScore, weight: 20, contribution: 0 },
    { field: 'مستوى التأثير [F2]', rating: ratings.influenceLevel, weight: 20, contribution: 0 },
    { field: 'القدرة على التحشيد [F3]', rating: ratings.mobilizationCap, weight: 15, contribution: 0 },
    { field: 'حماية الأصوات [F4]', rating: ratings.voteProtection, weight: 15, contribution: 0 },
    { field: 'أسباب الدعم [F5]', rating: ratings.supportReason, weight: 10, contribution: 0 },
    { field: 'الاحتياجات [F6]', rating: ratings.needsLevel, weight: 5, contribution: 0 },
    { field: 'الملاحظات السياسية [F7]', rating: ratings.politicalNote, weight: 5, contribution: 0 },
    { field: 'الملاحظات التنظيمية [F8]', rating: ratings.organizationalNote, weight: 5, contribution: 0 },
    { field: 'الملاحظات العامة [F9]', rating: ratings.generalNote, weight: 5, contribution: 0 },
  ];
  let raw = 0;
  for (const d of dims) { d.contribution = Math.round((d.rating / 5) * d.weight * 100) / 100; raw += d.contribution; }
  const am = ratings.dataAccuracy / 5;
  const tm = ratings.trainingReadiness / 5;
  const coeff = Math.round(raw * am * tm * 100) / 100;
  let cls = coeff < 20 ? 'ضعيف' : coeff < 50 ? 'مقبول' : coeff <= 100 ? 'جيد' : 'قوي جداً';
  return { coefficient: coeff, classification: cls, rawEfficiency: Math.round(raw * 100) / 100,
    accuracyMultiplier: Math.round(am * 100) / 100, trainingMultiplier: Math.round(tm * 100) / 100, dimensionScores: dims };
}

/** الخطوة 3: الحساب السيادي — الأصوات المضمونة والمتسربة */
export function finalSovereignCalculation(netVoters: number, efficiency: number) {
  const actual = Math.round(netVoters * (efficiency / 100) * 100) / 100;
  const leaked = Math.round((netVoters - actual) * 100) / 100;
  return { actualBallots: actual, leakedVotes: leaked, leakPercent: netVoters > 0 ? Math.round((leaked / netVoters) * 1000) / 10 : 0 };
}

/** التقييم الشامل — الفلترة الثنائية الكاملة */
export function evaluateKeyDoubleFilter(
  keyName: string, votes: VoteData & { totalVotes: number }, ratings: RatingDataV2,
): DoubleFilterResult {
  const f1 = filterOneNetVoters(votes);
  const f2 = filterTwoEfficiencyCoefficient(ratings);
  const f3 = finalSovereignCalculation(f1.netVoters, f2.coefficient);
  const weak: string[] = [];
  if (ratings.loyaltyScore <= 2) weak.push('الولاء');
  if (ratings.influenceLevel <= 2) weak.push('التأثير');
  if (ratings.mobilizationCap <= 2) weak.push('التحشيد');
  if (ratings.voteProtection <= 2) weak.push('حماية الأصوات');
  if (ratings.dataAccuracy <= 2) weak.push('دقة المعلومات');
  if (ratings.trainingReadiness <= 2) weak.push('التدريب');
  let rec = f2.classification === 'قوي جداً' || f2.classification === 'جيد'
    ? 'المفتاح موثوق. عدد الأصوات المضمونة مرتفع.'
    : f2.classification === 'مقبول'
    ? `يحتاج تحسين في: ${weak.join('، ') || 'الأداء العام'}.`
    : `ضعيف — ${weak.length ? 'تركيز الجهود على: ' + weak.join('، ') : 'إعادة تقييم الجدوى'}.`;
  if (f3.leakedVotes > 50) rec += ` ${Math.round(f3.leakedVotes)} صوت معرض للتسرب — تأمينهم عبر متابعة يوم الاقتراع.`;
  return { netVoters: f1.netVoters, claimedVoters: votes.totalVotes, filterOneLoss: f1.loss,
    filterOneLossPercent: f1.lossPercent, efficiencyCoefficient: f2.coefficient, classification: f2.classification,
    rawEfficiency: f2.rawEfficiency, accuracyMultiplier: f2.accuracyMultiplier, trainingMultiplier: f2.trainingMultiplier,
    actualBallots: f3.actualBallots, leakedVotes: f3.leakedVotes, dimensionScores: f2.dimensionScores, recommendation: rec };
}

/** توليد تقرير Markdown شامل */
export function generateDoubleFilterReport(keyName: string, r: DoubleFilterResult): string {
  const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n);
  return [
    '# 📊 تقرير تقييم المفتاح الانتخابي', '',
    '## 1. الملخص التنفيذي', '',
    `| البند | القيمة |`, `|-------|--------|`,
    `| اسم المفتاح | **${keyName}** |`, `| التصنيف | **${r.classification}** |`,
    `| الأصوات المُدّعاة | ${r.claimedVoters.toLocaleString()} |`,
    `| الأصوات المضمونة فعلياً | **${r.actualBallots.toLocaleString()}** |`,
    `| معامل الكفاءة | ${r.efficiencyCoefficient}% |`, '',
    '## 2. الفلتر الأول — تنقية الأصوات الخام', '',
    `صافي الأصوات = (مؤيد × 0.80) + (محايد × 0.50) + (ضعيف × 0.30)`, '',
    `| النوع | المعامل |`, `|-------|---------|`,
    `| مؤيد | × 0.80  |`, `| محايد | × 0.50 |`, `| ضعيف | × 0.30 |`,
    `| **صافي الأصوات** | **${r.netVoters.toLocaleString()}** |`,
    `| نسبة التسرب من الفلتر الأول | ${r.filterOneLossPercent}% |`, '',
    '## 3. الفلتر الثاني — معامل كفاءة المفتاح (11 حقلاً)', '',
    `| الحقل | التقييم | الوزن | المساهمة |`, `|-------|---------|-------|----------|`,
    ...r.dimensionScores.map(d => `| ${d.field} | ${stars(d.rating)} (${d.rating}/5) | ${d.weight}% | ${d.contribution}% |`),
    `| **المجموع الخام** | | **100%** | **${r.rawEfficiency}%** |`,
    `| مضاعف دقة المعلومات [F10] | ${stars(5)}/5 | — | × ${r.accuracyMultiplier} |`,
    `| مضاعف التدريب [F11] | ${stars(5)}/5 | — | × ${r.trainingMultiplier} |`,
    `| **معامل الكفاءة النهائي** | | | **${r.efficiencyCoefficient}%** |`, '',
    '## 4. النتيجة السيادية النهائية', '',
    `| البند | القيمة |`, `|-------|--------|`,
    `| 🗳️ الأصوات المضمونة في الصندوق | **${r.actualBallots.toLocaleString()} صوت** |`,
    `| 📉 الأصوات المتوقعة للتسرب | ${r.leakedVotes.toLocaleString()} صوت`,
    `| 💡 التوصية | ${r.recommendation} |`,
  ].join('\n');
}

// ====================================================================
// ═══ حساب النتائج الانتخابية الشاملة (Election Results Calculator) ═══
// ====================================================================
// يحسب النتائج الفعلية للانتخابات من أصوات المرشحين المُدخلة يدوياً.
// يستخدم Saint-Laguë المعدّل (قاسم أول 1.7) لتوزيع المقاعد.
//
// ملاحظة: seatsAllocated هنا يمثّل المقاعد الفعلية (نتائج رسمية)
// وهو مستقل تماماً عن "توقعات المقاعد" (projectedSeats) في
// indicators-engine.ts التي تُحسب لحظياً من بيانات التقديرات.
// لا يوجد تعارض: التوقعات تُحسب لحظياً ولا تُخزَّن في DB.
// ====================================================================

import { allocateSeatsLaguë } from './seat-projection';

export interface ElectionResultInput {
  candidates: {
    candidateName: string;
    partyName?: string;
    votes: number;
    isOurCandidate?: boolean;
    gender?: string; // ذكر | أنثى
  }[];
  totalRegistered: number;
  totalVotes: number;
  invalidVotes: number;
  totalSeats: number;
}

export interface ElectionResultOutput {
  validVotes: number;
  participationRate: number;
  thresholdVotes: number;
  candidates: {
    candidateName: string;
    partyName: string;
    votes: number;
    votePercentage: number;            // نسبة من الأصوات الصحيحة (أساس Saint-Laguë)
    votePercentageOfTurnout: number;   // نسبة من إجمالي المصوتين
    seatsAllocated: number;
    isOurCandidate: boolean;
    gender: string;
  }[];
  seatsWon: number;
  winnerName: string;
  winnerVotes: number;
}

/**
 * حساب نتائج الانتخابات الشاملة من أصوات المرشحين الفعلية.
 * يحسب نسبتين لكل مرشح مع تطبيق كوتا النساء بنسبة 25% وفقاً للقانون العراقي.
 */
export function calculateElectionResults(input: ElectionResultInput): ElectionResultOutput {
  const validVotes = input.totalVotes - input.invalidVotes;
  const participationRate = input.totalRegistered > 0
    ? Math.round((input.totalVotes / input.totalRegistered) * 10000) / 100
    : 0;
  const thresholdVotes = Math.ceil(
    Math.max(0, validVotes) * DHI_QAR_CONSTANTS.ELECTORAL_THRESHOLD
  );

  // توزيع المقاعد بطريقة Saint-Laguë المعدّلة (قاسم أول 1.7) على مستوى الكيانات/الأحزاب
  const partyVotesMap = new Map<string, number>();
  input.candidates.forEach(c => {
    const pName = c.partyName || 'مستقلون / أخرى';
    partyVotesMap.set(pName, (partyVotesMap.get(pName) || 0) + c.votes);
  });

  const parties = Array.from(partyVotesMap.entries()).map(([partyName, votes]) => ({
    partyName,
    votes,
  }));

  const allocatedParties = allocateSeatsLaguë(parties, input.totalSeats);
  const partySeatsMap = new Map(allocatedParties.map(p => [p.partyName, p.seats]));

  // توزيع مقاعد كل حزب على مرشحيه الحاصلين على أعلى الأصوات
  const partyCandidatesMap = new Map<string, typeof input.candidates>();
  input.candidates.forEach(c => {
    const pName = c.partyName || 'مستقلون / أخرى';
    if (!partyCandidatesMap.has(pName)) {
      partyCandidatesMap.set(pName, []);
    }
    partyCandidatesMap.get(pName)!.push(c);
  });

  // 1. التخصيص الأولي للمقاعد داخل كل حزب (الأعلى أصواتاً)
  const candidateAllocations = input.candidates.map(c => ({
    candidateName: c.candidateName,
    partyName: c.partyName || 'مستقلون / أخرى',
    votes: c.votes,
    gender: c.gender || 'ذكر',
    isOurCandidate: c.isOurCandidate || false,
    hasSeat: false,
  }));

  partyCandidatesMap.forEach((pCandidates, pName) => {
    const seatsAvailable = partySeatsMap.get(pName) || 0;
    
    // استبعاد السجلات النائبة (المخصصة للأصوات المتبقية) من الحصول على مقاعد فردية
    const realCandidates = candidateAllocations.filter(c => 
      c.partyName === pName &&
      !c.candidateName.includes("أصوات بقية") && 
      !c.candidateName.includes("بقية أصوات") &&
      !c.candidateName.includes("بقية مرشحي")
    );
    
    // ترتيب مرشحي هذا الحزب الفعليين تنازلياً حسب الأصوات الشخصية
    const sorted = [...realCandidates].sort((a, b) => b.votes - a.votes);
    sorted.forEach((c, index) => {
      if (index < seatsAvailable) {
        c.hasSeat = true;
      }
    });
  });

  // 2. تطبيق كوتا النساء بنسبة 25% (معدل كوتا النساء في المحافظة)
  const targetFemaleSeats = Math.ceil(input.totalSeats * 0.25);
  let currentFemaleSeats = candidateAllocations.filter(c => c.hasSeat && c.gender === 'أنثى').length;

  if (currentFemaleSeats < targetFemaleSeats) {
    const neededFemales = targetFemaleSeats - currentFemaleSeats;

    for (let step = 0; step < neededFemales; step++) {
      let bestSwap: {
        maleWinnerIndex: number;
        femaleNonWinnerIndex: number;
        cost: number;
      } | null = null;

      // فحص إمكانيات التبديل داخل كل قائمة لضمان عدم سرقة مقاعد الكتل الأخرى
      for (const [pName, seatsAvailable] of partySeatsMap.entries()) {
        if (seatsAvailable === 0) continue;

        const partyCandidates = candidateAllocations.map((c, idx) => ({ c, idx }))
          .filter(x => x.c.partyName === pName);

        const maleWinners = partyCandidates.filter(x => x.c.hasSeat && x.c.gender === 'ذكر');
        const femaleNonWinners = partyCandidates.filter(x => 
          !x.c.hasSeat && 
          x.c.gender === 'أنثى' &&
          !x.c.candidateName.includes("أصوات بقية") && 
          !x.c.candidateName.includes("بقية أصوات") &&
          !x.c.candidateName.includes("بقية مرشحي")
        );

        if (maleWinners.length > 0 && femaleNonWinners.length > 0) {
          // نجد الرجل الفائز بالأقل أصوات
          const lowestMaleWinner = maleWinners.reduce((prev, curr) => prev.c.votes < curr.c.votes ? prev : curr);
          // نجد المرأة غير الفائزة بالأعلى أصوات
          const highestFemaleNonWinner = femaleNonWinners.reduce((prev, curr) => prev.c.votes > curr.c.votes ? prev : curr);

          const cost = lowestMaleWinner.c.votes - highestFemaleNonWinner.c.votes;
          
          if (bestSwap === null || cost < bestSwap.cost) {
            bestSwap = {
              maleWinnerIndex: lowestMaleWinner.idx,
              femaleNonWinnerIndex: highestFemaleNonWinner.idx,
              cost,
            };
          }
        }
      }

      if (bestSwap) {
        candidateAllocations[bestSwap.maleWinnerIndex].hasSeat = false;
        candidateAllocations[bestSwap.femaleNonWinnerIndex].hasSeat = true;
      } else {
        break; // لا توجد خيارات تبديل أخرى
      }
    }
  }

  // بناء النتيجة النهائية المرتبة
  const candidates = candidateAllocations.map(c => ({
    candidateName: c.candidateName,
    partyName: c.partyName,
    votes: c.votes,
    votePercentage: validVotes > 0
      ? Math.round((c.votes / validVotes) * 10000) / 100
      : 0,
    votePercentageOfTurnout: input.totalVotes > 0
      ? Math.round((c.votes / input.totalVotes) * 10000) / 100
      : 0,
    seatsAllocated: c.hasSeat ? 1 : 0,
    isOurCandidate: c.isOurCandidate,
    gender: c.gender,
  }));

  // ترتيب تنازلي بالأصوات
  candidates.sort((a, b) => b.votes - a.votes);

  const seatsWon = candidates
    .filter(c => c.isOurCandidate)
    .reduce((s, c) => s + c.seatsAllocated, 0);

  // تحديد اسم وصوت الكيان الفائز بالأغلبية (الحائز على أعلى الأصوات)
  const sortedParties = [...parties].sort((a, b) => b.votes - a.votes);
  const winningParty = sortedParties[0];

  return {
    validVotes,
    participationRate,
    thresholdVotes,
    candidates,
    seatsWon,
    winnerName: winningParty?.partyName || '',
    winnerVotes: winningParty?.votes || 0,
  };
}
