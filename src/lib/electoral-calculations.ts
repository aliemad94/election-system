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
  loyaltyScore: number;       // 1-5
  influenceLevel: number;     // 1-5
  mobilizationCap: number;    // 1-5
  voteProtection: number;     // 1-5 (protectionRating)
  supportReason: number;      // 1-5 (supportRating)
  needsLevel: number;         // 1-5 (needsRating)
  politicalNote: number;      // 1-5 (politicalAlignmentRating)
  organizationalNote: number; // 1-5 (organizationalRating)
  generalNote: number;        // 1-5 (generalRating)
}

export interface ElectoralKeyData extends VoteData, RatingData {
  totalVotes: number;
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
