ALTER TABLE "User"
  ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

UPDATE "User"
SET "role" = CASE
  WHEN upper("role") = 'VIEWER' THEN 'OBSERVER'
  ELSE upper("role")
END;

UPDATE "User"
SET "isActive" = false
WHERE "role" = 'KEY_USER' AND "electionKeyId" IS NULL;

UPDATE "SMSCampaign"
SET "status" = 'SUBMITTED'
WHERE "status" = 'SENT';

UPDATE "Task"
SET "completedAt" = COALESCE("completedAt", "updatedAt", CURRENT_TIMESTAMP)
WHERE "status" = 'COMPLETED';

UPDATE "Task"
SET "completedAt" = NULL
WHERE "status" <> 'COMPLETED' AND "completedAt" IS NOT NULL;

UPDATE "ElectionKey"
SET
  "totalVotes" = "supportedVotes" + "neutralVotes" + "weakVotes",
  "netVotes" = LEAST(
    GREATEST("netVotes", 0),
    "supportedVotes" + "neutralVotes" + "weakVotes"
  );

UPDATE "ElectionResult"
SET "validVotes" = "totalVotes" - "invalidVotes"
WHERE "invalidVotes" BETWEEN 0 AND "totalVotes";

ALTER TABLE "User"
  ADD CONSTRAINT "User_role_check"
  CHECK ("role" IN ('ADMIN', 'KEY_USER', 'OBSERVER')),
  ADD CONSTRAINT "User_key_scope_check"
  CHECK (
    (
      "role" = 'KEY_USER'
      AND ("electionKeyId" IS NOT NULL OR "isActive" = false)
    )
    OR (
      "role" <> 'KEY_USER'
      AND "electionKeyId" IS NULL
    )
  );

ALTER TABLE "ElectionKey"
  ADD CONSTRAINT "ElectionKey_vote_counts_check"
  CHECK (
    "supportedVotes" >= 0
    AND "neutralVotes" >= 0
    AND "weakVotes" >= 0
    AND "totalVotes" = "supportedVotes" + "neutralVotes" + "weakVotes"
    AND "netVotes" >= 0
    AND "netVotes" <= "totalVotes"
    AND "expectedVotes" >= 0
  ),
  ADD CONSTRAINT "ElectionKey_ratings_check"
  CHECK (
    "influenceLevel" BETWEEN 1 AND 5
    AND "mobilizationCap" BETWEEN 1 AND 5
    AND "loyaltyScore" BETWEEN 1 AND 5
    AND "riskLevel" BETWEEN 1 AND 5
    AND "voteProtection" BETWEEN 1 AND 5
    AND "supportReason" BETWEEN 1 AND 5
    AND "needsLevel" BETWEEN 1 AND 5
    AND "politicalNote" BETWEEN 1 AND 5
    AND "organizationalNote" BETWEEN 1 AND 5
    AND "generalNote" BETWEEN 1 AND 5
  ),
  ADD CONSTRAINT "ElectionKey_ranges_check"
  CHECK (
    "version" >= 0
    AND "keyAccuracyScore" BETWEEN 0 AND 1
    AND ("age" IS NULL OR "age" BETWEEN 18 AND 120)
    AND ("familySize" IS NULL OR "familySize" BETWEEN 0 AND 100)
    AND "weightedScore" BETWEEN 0 AND 100
    AND "eiiScore" BETWEEN 0 AND 100
    AND "kriScore" BETWEEN 0 AND 100
    AND "vpsScore" BETWEEN 0 AND 100
    AND "drsScore" BETWEEN 0 AND 100
    AND "campaignROI" BETWEEN 0 AND 100
    AND "totalSpent" >= 0
    AND "monthlyBudget" >= 0
    AND "totalInvestment" >= 0
    AND "costPerVote" >= 0
  );

ALTER TABLE "Voter"
  ADD CONSTRAINT "Voter_ranges_check"
  CHECK (
    "supportDegree" BETWEEN 1 AND 5
    AND "confidenceScore" BETWEEN 0 AND 100
    AND "influenceRate" BETWEEN 0 AND 100
    AND ("familySize" IS NULL OR "familySize" BETWEEN 0 AND 100)
    AND ("latitude" IS NULL OR "latitude" BETWEEN -90 AND 90)
    AND ("longitude" IS NULL OR "longitude" BETWEEN -180 AND 180)
    AND "version" >= 0
  );

ALTER TABLE "Service"
  ADD CONSTRAINT "Service_status_check"
  CHECK ("status" IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  ADD CONSTRAINT "Service_priority_check"
  CHECK ("priority" IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
  ADD CONSTRAINT "Service_values_check"
  CHECK ("cost" >= 0 AND "estimatedVotesImpact" >= 0);

ALTER TABLE "Task"
  ADD CONSTRAINT "Task_status_check"
  CHECK ("status" IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  ADD CONSTRAINT "Task_priority_check"
  CHECK ("priority" IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
  ADD CONSTRAINT "Task_completed_at_check"
  CHECK (
    ("status" = 'COMPLETED' AND "completedAt" IS NOT NULL)
    OR ("status" <> 'COMPLETED' AND "completedAt" IS NULL)
  );

ALTER TABLE "ElectionResult"
  ADD CONSTRAINT "ElectionResult_counts_check"
  CHECK (
    "totalRegistered" >= 0
    AND "totalVotes" BETWEEN 0 AND "totalRegistered"
    AND "invalidVotes" BETWEEN 0 AND "totalVotes"
    AND "validVotes" = "totalVotes" - "invalidVotes"
    AND "totalSeats" >= 0
    AND "seatsWon" BETWEEN 0 AND "totalSeats"
    AND "thresholdVotes" >= 0
    AND "winnerVotes" >= 0
    AND "participationRate" BETWEEN 0 AND 100
  );

ALTER TABLE "CandidateResult"
  ADD CONSTRAINT "CandidateResult_values_check"
  CHECK (
    "votes" >= 0
    AND "votePercentage" BETWEEN 0 AND 100
    AND "votePercentageOfTurnout" BETWEEN 0 AND 100
    AND "seatsAllocated" >= 0
  );

ALTER TABLE "SMSCampaign"
  ADD CONSTRAINT "SMSCampaign_status_check"
  CHECK (
    "status" IN (
      'DRAFT', 'SCHEDULED', 'PROCESSING', 'SUBMITTED',
      'DELIVERED', 'PARTIAL', 'FAILED'
    )
  ),
  ADD CONSTRAINT "SMSCampaign_recipient_count_check"
  CHECK ("recipientCount" >= 0);

ALTER TABLE "SMSDelivery"
  ADD CONSTRAINT "SMSDelivery_status_check"
  CHECK (
    "status" IN ('PENDING', 'SENDING', 'QUEUED', 'SENT', 'DELIVERED', 'FAILED')
  ),
  ADD CONSTRAINT "SMSDelivery_attempts_check"
  CHECK ("attempts" >= 0);

ALTER TABLE "RateLimit"
  ADD CONSTRAINT "RateLimit_count_check"
  CHECK ("count" >= 0);
