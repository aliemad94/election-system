// ====================================================================
// comprehensive-indicators-cache.ts — تخزين مؤقت لمحرك الـ80 مؤشراً (TTL 15s)
// ====================================================================
// يمنع إعادة الحساب المكلف (O(N) على كامل بيانات الناخبين والمفاتيح)
// عند الطلبات المتتالية على لوحة التحكم وصفحة التحليل الشامل.
// ====================================================================

import { calculateComprehensiveIndicators } from "./comprehensive-indicators-engine";

interface CachedResult {
  data: unknown;
  timestamp: number;
}

const CACHE_TTL_MS = 60_000; // 60 ثانية (1 دقيقة)
let cache: CachedResult | null = null;
let inFlight: Promise<unknown> | null = null;

export async function getCachedComprehensiveIndicators(): Promise<unknown> {
  const now = Date.now();

  if (cache && now - cache.timestamp < CACHE_TTL_MS) {
    return cache.data;
  }

  if (inFlight) {
    return inFlight;
  }

  inFlight = calculateComprehensiveIndicators()
    .then((data) => {
      cache = { data, timestamp: Date.now() };
      return data;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

export function invalidateComprehensiveIndicatorsCache(): void {
  cache = null;
}
