-- Stop before normalization if distinct legacy formats would collapse onto a
-- value protected by an existing UNIQUE index. This migration intentionally
-- sorts before 20260718010000_security_hardening.
DO $$
BEGIN
  IF EXISTS (
    SELECT normalized_phone
    FROM (
      SELECT CASE
        WHEN NULLIF(regexp_replace("phone", '[\s()-]', '', 'g'), '') IS NULL THEN NULL
        WHEN regexp_replace("phone", '[\s()-]', '', 'g') LIKE '+9647%'
          THEN '0' || substring(regexp_replace("phone", '[\s()-]', '', 'g') FROM 5)
        ELSE regexp_replace("phone", '[\s()-]', '', 'g')
      END AS normalized_phone
      FROM "ElectionKey"
      WHERE "phone" IS NOT NULL
    ) normalized
    WHERE normalized_phone IS NOT NULL
    GROUP BY normalized_phone
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION
      'Cannot normalize ElectionKey phone values: distinct legacy formats collide';
  END IF;

  IF EXISTS (
    SELECT normalized_phone
    FROM (
      SELECT CASE
        WHEN regexp_replace("phone", '[\s()-]', '', 'g') LIKE '+9647%'
          THEN '0' || substring(regexp_replace("phone", '[\s()-]', '', 'g') FROM 5)
        ELSE regexp_replace("phone", '[\s()-]', '', 'g')
      END AS normalized_phone
      FROM "Volunteer"
    ) normalized
    GROUP BY normalized_phone
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION
      'Cannot normalize Volunteer phone values: distinct legacy formats collide';
  END IF;
END
$$;
