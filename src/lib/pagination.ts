export type Pagination = { page: number; limit: number };

function parsePositiveInteger(
  value: string | null,
  fallback: number,
  maximum: number
): number | null {
  if (value === null) return fallback;
  if (!/^[1-9][0-9]*$/.test(value)) return null;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed > maximum) return null;
  return parsed;
}

export function parsePagination(
  searchParams: URLSearchParams,
  defaultLimit: number
): Pagination | null {
  const page = parsePositiveInteger(searchParams.get("page"), 1, 1_000_000);
  const limit = parsePositiveInteger(searchParams.get("limit"), defaultLimit, 100);
  return page === null || limit === null ? null : { page, limit };
}
