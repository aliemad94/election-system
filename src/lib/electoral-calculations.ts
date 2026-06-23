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
  WEAK: 20,       // أقل من 20: ضعيف
  ACCEPTABLE: 50, // 20 إلى أقل من 50: مقبول
  GOOD: 100,      // 50 إلى أقل من 100: جيد
  // 100 فأكثر: قوي
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

  return Math.round(netVotes * 100) / 100; // تقريب لرقمين عشريين
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
 * حساب الدرجة المرجّحة (Weighted Score)
 * المعادلة: weightedScore = rawScore × (totalVotes / 50)
 * يربط الجودة بالكم: مفتاح بدرجة عالية لكن بأصوات قليلة لا يتفوق على مفتاح بدرجة متوسطة بأصوات كثيرة
 */
export function calculateWeightedScore(ratings: RatingData, totalVotes: number): number {
  const rawScore = calculateRawScore(ratings);
  const voteFactor = totalVotes / 50;
  const weightedScore = rawScore * voteFactor;

  return Math.round(weightedScore * 100) / 100;
}

/**
 * تحديد التصنيف بناءً على الدرجة المرجّحة
 *
 * | الدرجة المرجّحة | التصنيف |
 * |---|---|
 * | أقل من 20 | ضعيف |
 * | 20 إلى أقل من 50 | مقبول |
 * | 50 إلى أقل من 100 | جيد |
 * | 100 فأكثر | قوي |
 */
export function classifyKey(weightedScore: number): ClassificationLabel {
  if (weightedScore < CLASSIFICATION_THRESHOLDS.WEAK) {
    return CLASSIFICATION_LABELS.WEAK;
  }
  if (weightedScore < CLASSIFICATION_THRESHOLDS.ACCEPTABLE) {
    return CLASSIFICATION_LABELS.ACCEPTABLE;
  }
  if (weightedScore < CLASSIFICATION_THRESHOLDS.GOOD) {
    return CLASSIFICATION_LABELS.GOOD;
  }
  return CLASSIFICATION_LABELS.STRONG;
}

/**
 * إجراء جميع الحسابات دفعة واحدة لمفتاح انتخابي
 * يُستخدم عند إنشاء أو تحديث مفتاح
 */
export function calculateAll(data: ElectoralKeyData): CalculationResult {
  const totalVotes = data.totalVotes || calculateTotalVotes(data);
  const netVotes = calculateNetVotes(data);
  const rawScore = calculateRawScore(data);
  const weightedScore = calculateWeightedScore(data, totalVotes);
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
  REGISTERED_VOTERS: 855000,
  /** نسبة المشاركة التاريخية */
  HISTORICAL_PARTICIPATION_RATE: 0.58,
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
