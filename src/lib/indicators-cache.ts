// ====================================================================
// indicators-cache.ts — تخزين مؤقت للمؤشرات (TTL 15s)
// ====================================================================
// يمنع إعادة الحساب المكلف عند الطلبات المتتالية.
// invalidateIndicatorsCache() يُستدعى بعد أي عملية كتابة على
// ElectionKey/Voter/Service/Competitor/CommissionData.
// ====================================================================

import { calculateAllCompositeIndicators, type CompositeIndicatorsResult } from "./indicators-engine";

interface CachedIndicators {
  data: CompositeIndicatorsResult;
  timestamp: number;
}

const CACHE_TTL_MS = 15_000; // 15 ثانية
let cache: CachedIndicators | null = null;
let inFlight: Promise<CompositeIndicatorsResult> | null = null;

/**
 * يرجع المؤشرات المركّبة، من الذاكرة إن صالحة، أو يحسبها.
 * يمنع الحساب المتزامن عبر inFlight dedup.
 */
export async function getCachedIndicators(): Promise<CompositeIndicatorsResult> {
  const now = Date.now();

  // الذاكرة صالحة
  if (cache && now - cache.timestamp < CACHE_TTL_MS) {
    return cache.data;
  }

  // حساب جارٍ — ننتظره بدلاً من تكراره
  if (inFlight) {
    return inFlight;
  }

  inFlight = calculateAllCompositeIndicators()
    .then((data) => {
      cache = { data, timestamp: Date.now() };
      return data;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

/**
 * يُبطل الذاكرة المؤقتة — يُستدعى بعد أي كتابة على البيانات الأساسية.
 */
export function invalidateIndicatorsCache(): void {
  cache = null;
}

