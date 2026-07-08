/**
 * SafeData — نوع موحد وآمن للبيانات القادمة من API
 * يمنع الكراش لما البيانات فاضية أو شكلها مختلف عن المتوقع
 */
export interface SafeIndicatorValue {
  score: number;
  level: string;
  label: string;
}

export interface SafeAreaData {
  district: string;
  strength: number;
  netVotes: number;
  keyCount: number;
  avgWeighted?: number;
  registeredVoters?: number;
}

export interface SafeDecisiveData {
  expectedVotesOnDay: number;
  expectedVotes: number;
  expectedParticipation: number;
  expectedTurnout: number;
  votesNeededToWin: number;
  electoralGap: number;
  winProbability: number;
  overallRisk: number;
  stability: number;
  earlyWarning: number;
  totalNetVotes: number;
  totalRegistered: number;
  projectedSeats: number;
  avgKRI: number;
  avgDRS: number;
  strongAreas: SafeAreaData[];
  weakAreas: SafeAreaData[];
  geoDistribution: SafeAreaData[];
  areaMap: { district: string; color: string; strength: number; netVotes: number; keyCount: number }[];
  keyRanking: { rank: number; code: string; name: string; netVotes: number; weightedScore: number }[];
  supportDistribution: {
    supported: { count: number; percentage: number };
    neutral: { count: number; percentage: number };
    weak: { count: number; percentage: number };
  };
  supportersDistribution: {
    supported: number;
    neutral: number;
    opponent: number;
  };
}

/** قيم افتراضية آمنة للبيانات الفارغة */
export const EMPTY_DECISIVE: SafeDecisiveData = {
  expectedVotesOnDay: 0, expectedVotes: 0, expectedParticipation: 48.97, expectedTurnout: 48.97,
  votesNeededToWin: 12000, electoralGap: 12000, winProbability: 0,
  overallRisk: 0, stability: 0, earlyWarning: 0,
  totalNetVotes: 0, totalRegistered: 1099438, projectedSeats: 0,
  avgKRI: 0, avgDRS: 0,
  strongAreas: [], weakAreas: [], geoDistribution: [], areaMap: [], keyRanking: [],
  supportDistribution: {
    supported: { count: 0, percentage: 0 },
    neutral: { count: 0, percentage: 0 },
    weak: { count: 0, percentage: 0 },
  },
  supportersDistribution: { supported: 0, neutral: 0, opponent: 0 },
};

/**
 * دمج البيانات القادمة من API مع القيم الافتراضية — أي حقل ناقص ينملأ تلقائياً
 */
export function safeMerge<T extends Record<string, any>>(data: any, defaults: T): T {
  if (!data || typeof data !== 'object') return { ...defaults };
  const result = { ...defaults } as any;
  for (const key of Object.keys(defaults)) {
    const val = data[key];
    if (val === undefined || val === null) continue; // use default
    if (Array.isArray(defaults[key])) {
      result[key] = Array.isArray(val) ? val : (defaults[key] as any[]);
    } else if (typeof defaults[key] === 'object' && defaults[key] !== null) {
      result[key] = safeMerge(val, defaults[key]);
    } else {
      result[key] = val;
    }
  }
  return result;
}
