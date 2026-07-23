import type { Prisma } from "@prisma/client";

type SequenceClient = Pick<
  Prisma.TransactionClient,
  "$queryRawUnsafe"
>;

const SEQUENCE_LOCK_SQL =
  "SELECT pg_advisory_xact_lock(hashtext('electoral_key_code_sequence'))";
const MAX_CODE_SQL = `
  SELECT COALESCE(
    MAX(
      CASE
        WHEN "keyCode" ~ '^[0-9]+$' THEN "keyCode"::bigint
        ELSE NULL
      END
    ),
    0
  )::bigint AS "maxCode"
  FROM "ElectionKey"
`;

/**
 * يحجز أكواداً رقمية متسلسلة داخل transaction واحدة.
 * القفل advisory مشترك بين الإنشاء الفردي والاستيراد الجماعي وعبر كل المثيلات.
 */
export async function reserveElectionKeyCodes(
  tx: SequenceClient,
  count: number
): Promise<string[]> {
  if (!Number.isSafeInteger(count) || count < 1 || count > 5_000) {
    throw new Error("Invalid election-key code reservation size");
  }

  await tx.$queryRawUnsafe(SEQUENCE_LOCK_SQL);
  const rows = await tx.$queryRawUnsafe<Array<{ maxCode: bigint }>>(
    MAX_CODE_SQL
  );
  const maxCode = rows[0]?.maxCode ?? BigInt(0);

  return Array.from({ length: count }, (_, index) =>
    (maxCode + BigInt(index + 1)).toString()
  );
}
