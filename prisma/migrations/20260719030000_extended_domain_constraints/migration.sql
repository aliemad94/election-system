-- Normalize phone formatting without accepting malformed legacy values.
UPDATE "Tribe"
SET "leaderPhone" = CASE
  WHEN NULLIF(regexp_replace("leaderPhone", '[\s()-]', '', 'g'), '') IS NULL THEN NULL
  WHEN regexp_replace("leaderPhone", '[\s()-]', '', 'g') LIKE '+9647%'
    THEN '0' || substring(regexp_replace("leaderPhone", '[\s()-]', '', 'g') FROM 5)
  ELSE regexp_replace("leaderPhone", '[\s()-]', '', 'g')
END
WHERE "leaderPhone" IS NOT NULL;

UPDATE "ElectionKey"
SET "phone2" = CASE
  WHEN NULLIF(regexp_replace("phone2", '[\s()-]', '', 'g'), '') IS NULL THEN NULL
  WHEN regexp_replace("phone2", '[\s()-]', '', 'g') LIKE '+9647%'
    THEN '0' || substring(regexp_replace("phone2", '[\s()-]', '', 'g') FROM 5)
  ELSE regexp_replace("phone2", '[\s()-]', '', 'g')
END
WHERE "phone2" IS NOT NULL;

UPDATE "Volunteer"
SET "phone" = CASE
  WHEN regexp_replace("phone", '[\s()-]', '', 'g') LIKE '+9647%'
    THEN '0' || substring(regexp_replace("phone", '[\s()-]', '', 'g') FROM 5)
  ELSE regexp_replace("phone", '[\s()-]', '', 'g')
END;

-- Attendance has one canonical state. The voted flag is retained as the
-- authoritative legacy value and its derived fields are repaired atomically.
UPDATE "Voter"
SET
  "checkedIn" = "votedOnDay",
  "checkedInAt" = CASE
    WHEN "votedOnDay" THEN COALESCE("checkedInAt", "updatedAt", CURRENT_TIMESTAMP)
    ELSE NULL
  END
WHERE
  "checkedIn" IS DISTINCT FROM "votedOnDay"
  OR ("votedOnDay" AND "checkedInAt" IS NULL)
  OR (NOT "votedOnDay" AND "checkedInAt" IS NOT NULL);

ALTER TABLE "SMSDelivery"
  DROP CONSTRAINT "SMSDelivery_status_check",
  ADD CONSTRAINT "SMSDelivery_status_check"
  CHECK (
    "status" IN (
      'PENDING', 'SENDING', 'SUBMISSION_UNKNOWN',
      'QUEUED', 'SENT', 'DELIVERED', 'FAILED'
    )
  );

ALTER TABLE "Tribe"
  ADD CONSTRAINT "Tribe_values_check"
  CHECK (
    "influenceRating" BETWEEN 1 AND 5
    AND ("population" IS NULL OR "population" >= 0)
    AND (
      "leaderPhone" IS NULL
      OR "leaderPhone" ~ '^07[3-9][0-9]{8}$'
    )
  );

ALTER TABLE "ElectionKey"
  ADD CONSTRAINT "ElectionKey_identity_check"
  CHECK (
    "gender" IN ('ذكر', 'أنثى')
    AND "classification" IN ('ضعيف', 'مقبول', 'جيد', 'قوي', 'قوي جداً')
    AND ("phone" IS NULL OR "phone" ~ '^07[3-9][0-9]{8}$')
    AND ("phone2" IS NULL OR "phone2" ~ '^07[3-9][0-9]{8}$')
  );

ALTER TABLE "Voter"
  ADD CONSTRAINT "Voter_identity_check"
  CHECK (
    "gender" IN ('ذكر', 'أنثى')
    AND "status" IN ('SUPPORTED', 'NEUTRAL', 'WEAK')
    AND ("phone" IS NULL OR "phone" ~ '^07[3-9][0-9]{8}$')
    AND (
      "nationalId" IS NULL
      OR char_length(btrim("nationalId")) BETWEEN 3 AND 50
    )
  ),
  ADD CONSTRAINT "Voter_checkin_state_check"
  CHECK (
    "votedOnDay" = "checkedIn"
    AND (
      ("votedOnDay" AND "checkedInAt" IS NOT NULL)
      OR (NOT "votedOnDay" AND "checkedInAt" IS NULL)
    )
  );

ALTER TABLE "CommissionData"
  ADD CONSTRAINT "CommissionData_counts_check"
  CHECK (
    "registeredVoters" >= 0
    AND "actualVoters" BETWEEN 0 AND "registeredVoters"
    AND "maleVoters" >= 0
    AND "femaleVoters" >= 0
    AND "maleVoters" + "femaleVoters" <= "actualVoters"
    AND "pollingCenters" >= 0
    AND "ballotStations" >= 0
  );

ALTER TABLE "Competitor"
  ADD CONSTRAINT "Competitor_values_check"
  CHECK (
    "estimatedVotes" >= 0
    AND "strengthLevel" BETWEEN 1 AND 5
  );

ALTER TABLE "SentimentTrend"
  ADD CONSTRAINT "SentimentTrend_values_check"
  CHECK (
    "sentiment" IN ('POSITIVE', 'NEGATIVE', 'NEUTRAL')
    AND "score" BETWEEN 0 AND 1
  );

ALTER TABLE "Volunteer"
  ADD CONSTRAINT "Volunteer_values_check"
  CHECK (
    "phone" ~ '^07[3-9][0-9]{8}$'
    AND "role" IN (
      'FIELD_AGENT', 'LOGISTICS', 'MEDIA', 'COORDINATOR',
      'ELECTION_DAY_OBSERVER'
    )
    AND "efficiencyScore" BETWEEN 0 AND 100
    AND "totalAssignedTasks" >= 0
    AND "totalCompletedTasks" BETWEEN 0 AND "totalAssignedTasks"
  );

ALTER TABLE "ConfidenceLog"
  ADD CONSTRAINT "ConfidenceLog_values_check"
  CHECK (
    "oldScore" BETWEEN 0 AND 100
    AND "newScore" BETWEEN 0 AND 100
    AND "change" = "newScore" - "oldScore"
  );

ALTER TABLE "SMSCampaign"
  ADD CONSTRAINT "SMSCampaign_provider_check"
  CHECK ("provider" IN ('TWILIO', 'VONAGE'));

ALTER TABLE "Alert"
  ADD CONSTRAINT "Alert_type_check"
  CHECK ("type" IN ('INFO', 'WARNING', 'CRITICAL'));

ALTER TABLE "EarlyWarning"
  ADD CONSTRAINT "EarlyWarning_values_check"
  CHECK (
    "severity" IN (
      'LOW', 'MEDIUM', 'HIGH', 'CRITICAL',
      'منخفض', 'متوسط', 'مرتفع', 'حرج'
    )
    AND "status" IN ('ACTIVE', 'IN_PROGRESS', 'RESOLVED')
    AND "estimatedVotesAtRisk" >= 0
  );

ALTER TABLE "DynamicIndicator"
  ADD CONSTRAINT "DynamicIndicator_values_check"
  CHECK (
    "value" BETWEEN 0 AND 100
    AND "previousValue" BETWEEN 0 AND 100
    AND "trend" IN ('UP', 'STABLE', 'DOWN')
  );

ALTER TABLE "CompositeIndicator"
  ADD CONSTRAINT "CompositeIndicator_values_check"
  CHECK (
    "eii" BETWEEN 0 AND 100
    AND "kri" BETWEEN 0 AND 100
    AND "vps" BETWEEN 0 AND 100
    AND "drs" BETWEEN 0 AND 100
    AND "campaignRoi" BETWEEN 0 AND 100
    AND "api" BETWEEN 0 AND 100
    AND "ewli" BETWEEN 0 AND 100
    AND "gsi" BETWEEN 0 AND 100
    AND "edri" BETWEEN 0 AND 100
    AND "efi" BETWEEN 0 AND 100
  );

ALTER TABLE "CandidateResult"
  ADD CONSTRAINT "CandidateResult_gender_check"
  CHECK ("gender" IN ('ذكر', 'أنثى'));

ALTER TABLE "ProvinceReference"
  ADD CONSTRAINT "ProvinceReference_values_check"
  CHECK (
    "totalRegisteredVoters" >= 0
    AND "totalActualVoters" BETWEEN 0 AND "totalRegisteredVoters"
    AND "generalTurnout" BETWEEN 0 AND 100
    AND "maleVoters" >= 0
    AND "femaleVoters" >= 0
    AND "maleVoters" + "femaleVoters" <= "totalActualVoters"
    AND "pollingCentersCount" >= 0
    AND "ballotStationsCount" >= 0
  );
