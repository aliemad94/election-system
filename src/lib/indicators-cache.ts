import { computeAllIndicators } from "./indicators";

interface CachedIndicators {
  data: Awaited<ReturnType<typeof computeAllIndicators>>;
  timestamp: number;
}

const CACHE_TTL_MS = 15_000;
let cache: CachedIndicators | null = null;
let inFlight: Promise<CachedIndicators["data"]> | null = null;

export async function getCachedIndicators() {
  const now = Date.now();
  if (cache && now - cache.timestamp < CACHE_TTL_MS) return cache.data;
  if (inFlight) return inFlight;
  inFlight = computeAllIndicators()
    .then((data) => { cache = { data, timestamp: Date.now() }; return data; })
    .finally(() => { inFlight = null; });
  return inFlight;
}

export function invalidateIndicatorsCache() {
  cache = null;
}
