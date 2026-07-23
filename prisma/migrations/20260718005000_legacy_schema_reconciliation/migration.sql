-- Reconcile the pre-Prisma production schema with the committed init schema.
-- The init migration is baselined on the legacy database and is not executed
-- there, so every known legacy drift must be made explicit before subsequent
-- security and domain-constraint migrations run.

ALTER TABLE "AuditLog"
  ALTER COLUMN "details" TYPE TEXT USING "details"::text;

ALTER TABLE "CandidateResult"
  ALTER COLUMN "gender" SET DEFAULT 'ذكر';

ALTER TABLE "DynamicIndicator"
  ALTER COLUMN "trend" SET DEFAULT 'STABLE';

ALTER TABLE "EarlyWarning"
  ALTER COLUMN "severity" SET DEFAULT 'MEDIUM',
  ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

ALTER TABLE "ElectionKey"
  ALTER COLUMN "socialMedia" TYPE TEXT USING "socialMedia"::text,
  ALTER COLUMN "reliabilityLogs" TYPE TEXT USING "reliabilityLogs"::text,
  ALTER COLUMN "classification" SET DEFAULT 'مقبول';

ALTER TABLE "ElectionResult"
  ALTER COLUMN "scope" SET DEFAULT 'محافظة',
  ALTER COLUMN "status" SET DEFAULT 'أولية';

ALTER TABLE "SMSCampaign"
  ALTER COLUMN "status" SET DEFAULT 'DRAFT',
  ALTER COLUMN "provider" SET DEFAULT 'TWILIO';

ALTER TABLE "SentimentTrend"
  ALTER COLUMN "keywords" TYPE TEXT USING "keywords"::text;

ALTER TABLE "Service"
  ALTER COLUMN "priority" SET DEFAULT 'NORMAL';

ALTER TABLE "Task"
  ALTER COLUMN "priority" SET DEFAULT 'NORMAL',
  ALTER COLUMN "status" SET DEFAULT 'PENDING';

ALTER TABLE "Voter"
  ALTER COLUMN "socialMedia" TYPE TEXT USING "socialMedia"::text,
  ALTER COLUMN "imputationWeights" TYPE TEXT USING "imputationWeights"::text,
  ALTER COLUMN "evaluationForm" TYPE TEXT USING "evaluationForm"::text,
  ALTER COLUMN "status" SET DEFAULT 'NEUTRAL';
