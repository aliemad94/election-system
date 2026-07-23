-- Security hardening: normalize identifiers before enforcing uniqueness.
UPDATE "Voter"
SET "phone" = CASE
  WHEN NULLIF(regexp_replace("phone", '[\s()-]', '', 'g'), '') IS NULL THEN NULL
  WHEN regexp_replace("phone", '[\s()-]', '', 'g') LIKE '+9647%'
    THEN '0' || substring(regexp_replace("phone", '[\s()-]', '', 'g') FROM 5)
  ELSE regexp_replace("phone", '[\s()-]', '', 'g')
END
WHERE "phone" IS NOT NULL;

UPDATE "ElectionKey"
SET "phone" = CASE
  WHEN NULLIF(regexp_replace("phone", '[\s()-]', '', 'g'), '') IS NULL THEN NULL
  WHEN regexp_replace("phone", '[\s()-]', '', 'g') LIKE '+9647%'
    THEN '0' || substring(regexp_replace("phone", '[\s()-]', '', 'g') FROM 5)
  ELSE regexp_replace("phone", '[\s()-]', '', 'g')
END
WHERE "phone" IS NOT NULL;

UPDATE "Voter"
SET "nationalId" = NULLIF(btrim("nationalId"), '')
WHERE "nationalId" IS NOT NULL;

-- Fail safely when normalized legacy duplicate identifiers exist.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "Voter"
    WHERE "phone" IS NOT NULL AND btrim("phone") <> ''
    GROUP BY "phone" HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Cannot add Voter phone uniqueness: duplicate non-empty values exist';
  END IF;

  IF EXISTS (
    SELECT 1 FROM "Voter"
    WHERE "nationalId" IS NOT NULL AND btrim("nationalId") <> ''
    GROUP BY "nationalId" HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Cannot add Voter nationalId uniqueness: duplicate non-empty values exist';
  END IF;
END
$$;

ALTER TABLE "ElectionKey"
  ALTER COLUMN "birthDate" DROP NOT NULL,
  ALTER COLUMN "phone" DROP NOT NULL;

ALTER TABLE "Voter"
  ALTER COLUMN "birthDate" DROP NOT NULL;

CREATE UNIQUE INDEX "Voter_phone_key" ON "Voter"("phone");
CREATE UNIQUE INDEX "Voter_nationalId_key" ON "Voter"("nationalId");

ALTER TABLE "SMSCampaign"
  ADD COLUMN "createdById" TEXT,
  ADD COLUMN "createdByUsername" TEXT,
  ADD COLUMN "lastError" TEXT,
  ADD COLUMN "processingStartedAt" TIMESTAMP(3);

CREATE TABLE "SchedulerLease" (
  "name" TEXT NOT NULL,
  "owner" TEXT NOT NULL,
  "lockedUntil" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SchedulerLease_pkey" PRIMARY KEY ("name")
);
CREATE INDEX "SchedulerLease_lockedUntil_idx"
  ON "SchedulerLease"("lockedUntil");

CREATE TABLE "SMSDelivery" (
  "id" TEXT NOT NULL,
  "campaignId" TEXT NOT NULL,
  "voterId" TEXT NOT NULL,
  "maskedPhone" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "providerMessageId" TEXT,
  "providerStatus" TEXT,
  "providerErrorCode" TEXT,
  "lastError" TEXT,
  "sentAt" TIMESTAMP(3),
  "deliveredAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SMSDelivery_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SMSDelivery_campaignId_voterId_key"
  ON "SMSDelivery"("campaignId", "voterId");
CREATE INDEX "SMSDelivery_campaignId_status_idx"
  ON "SMSDelivery"("campaignId", "status");
CREATE INDEX "SMSDelivery_status_idx"
  ON "SMSDelivery"("status");

ALTER TABLE "SMSDelivery"
  ADD CONSTRAINT "SMSDelivery_campaignId_fkey"
  FOREIGN KEY ("campaignId") REFERENCES "SMSCampaign"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- AuditLog is append-only at the database layer. INSERT remains allowed.
-- User deletion must fail instead of mutating the historical userId through SET NULL.
ALTER TABLE "AuditLog"
  DROP CONSTRAINT "AuditLog_userId_fkey",
  ADD CONSTRAINT "AuditLog_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE OR REPLACE FUNCTION prevent_audit_log_row_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'AuditLog is append-only: % is forbidden', TG_OP;
END;
$$;

CREATE OR REPLACE FUNCTION prevent_audit_log_truncate()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'AuditLog is append-only: TRUNCATE is forbidden';
END;
$$;

CREATE TRIGGER "AuditLog_prevent_update_delete"
BEFORE UPDATE OR DELETE ON "AuditLog"
FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_row_mutation();

CREATE TRIGGER "AuditLog_prevent_truncate"
BEFORE TRUNCATE ON "AuditLog"
FOR EACH STATEMENT EXECUTE FUNCTION prevent_audit_log_truncate();

REVOKE UPDATE, DELETE, TRUNCATE ON TABLE "AuditLog" FROM PUBLIC;
