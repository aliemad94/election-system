-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "mustChangePwd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "username" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tribe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "leaderName" TEXT,
    "leaderPhone" TEXT,
    "district" TEXT,
    "influenceRating" INTEGER NOT NULL DEFAULT 3,
    "population" INTEGER,
    "notes" TEXT,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SubTribe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "tribeId" TEXT NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "SubTribe_tribeId_fkey" FOREIGN KEY ("tribeId") REFERENCES "Tribe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ElectionKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "keyCode" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "fatherName" TEXT NOT NULL,
    "grandfatherName" TEXT NOT NULL,
    "fourthName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "birthDate" DATETIME NOT NULL,
    "education" TEXT NOT NULL,
    "profession" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "socialMedia" TEXT,
    "province" TEXT NOT NULL DEFAULT 'ذي قار',
    "district" TEXT NOT NULL DEFAULT 'الغراف',
    "subDistrict" TEXT NOT NULL,
    "pollingCenter" TEXT NOT NULL,
    "expectedVotes" INTEGER NOT NULL DEFAULT 0,
    "influenceLevel" INTEGER NOT NULL DEFAULT 1,
    "mobilizationCap" INTEGER NOT NULL DEFAULT 1,
    "loyaltyScore" INTEGER NOT NULL DEFAULT 3,
    "riskLevel" INTEGER NOT NULL DEFAULT 1,
    "deletedAt" DATETIME,
    "version" INTEGER NOT NULL DEFAULT 0,
    "keyAccuracyScore" REAL NOT NULL DEFAULT 1.0,
    "reliabilityLogs" TEXT,
    "nickname" TEXT,
    "phone2" TEXT,
    "email" TEXT,
    "address" TEXT,
    "neighborhood" TEXT,
    "pollingStation" TEXT,
    "age" INTEGER,
    "specialization" TEXT,
    "maritalStatus" TEXT,
    "familySize" INTEGER,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "firstContactDate" DATETIME,
    "lastContactDate" DATETIME,
    "lastSpentDate" DATETIME,
    "trainingStatus" TEXT,
    "dataAccuracy" TEXT,
    "createdBy" TEXT,
    "totalVotes" INTEGER NOT NULL DEFAULT 0,
    "supportedVotes" INTEGER NOT NULL DEFAULT 0,
    "neutralVotes" INTEGER NOT NULL DEFAULT 0,
    "weakVotes" INTEGER NOT NULL DEFAULT 0,
    "netVotes" INTEGER NOT NULL DEFAULT 0,
    "voteProtection" INTEGER NOT NULL DEFAULT 3,
    "supportReason" INTEGER NOT NULL DEFAULT 3,
    "needsLevel" INTEGER NOT NULL DEFAULT 3,
    "politicalNote" INTEGER NOT NULL DEFAULT 3,
    "organizationalNote" INTEGER NOT NULL DEFAULT 3,
    "generalNote" INTEGER NOT NULL DEFAULT 3,
    "weightedScore" REAL NOT NULL DEFAULT 0.0,
    "classification" TEXT NOT NULL DEFAULT 'مقبول',
    "eiiScore" REAL NOT NULL DEFAULT 0.0,
    "kriScore" REAL NOT NULL DEFAULT 0.0,
    "vpsScore" REAL NOT NULL DEFAULT 0.0,
    "drsScore" REAL NOT NULL DEFAULT 0.0,
    "campaignROI" REAL NOT NULL DEFAULT 0.0,
    "totalSpent" REAL NOT NULL DEFAULT 0.0,
    "monthlyBudget" REAL NOT NULL DEFAULT 0.0,
    "totalInvestment" REAL NOT NULL DEFAULT 0.0,
    "costPerVote" REAL NOT NULL DEFAULT 0.0,
    "tribeId" TEXT,
    "subTribeId" TEXT,
    "lastEvaluationAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ElectionKey_tribeId_fkey" FOREIGN KEY ("tribeId") REFERENCES "Tribe" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ElectionKey_subTribeId_fkey" FOREIGN KEY ("subTribeId") REFERENCES "SubTribe" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Voter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "fatherName" TEXT NOT NULL,
    "grandfatherName" TEXT NOT NULL,
    "fourthName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "birthDate" DATETIME NOT NULL,
    "phone" TEXT,
    "education" TEXT,
    "profession" TEXT,
    "specialization" TEXT,
    "maritalStatus" TEXT,
    "familySize" INTEGER,
    "nationalId" TEXT,
    "area" TEXT,
    "socialMedia" TEXT,
    "firstContactDate" DATETIME,
    "province" TEXT NOT NULL DEFAULT 'ذي قار',
    "district" TEXT NOT NULL DEFAULT 'الغراف',
    "subDistrict" TEXT NOT NULL,
    "pollingCenter" TEXT NOT NULL,
    "ballotStation" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEUTRAL',
    "supportDegree" INTEGER NOT NULL DEFAULT 3,
    "supportReason" TEXT,
    "voterCategory" TEXT,
    "conversionPath" TEXT,
    "votedOnDay" BOOLEAN NOT NULL DEFAULT false,
    "checkedIn" BOOLEAN NOT NULL DEFAULT false,
    "checkedInAt" DATETIME,
    "confidenceScore" INTEGER NOT NULL DEFAULT 50,
    "evaluationForm" TEXT,
    "notes" TEXT,
    "predictedClusterId" TEXT,
    "imputationWeights" TEXT,
    "recruitedById" TEXT,
    "keyId" TEXT NOT NULL,
    "tribeId" TEXT,
    "subTribeId" TEXT,
    "relationship" TEXT,
    "influenceRate" INTEGER NOT NULL DEFAULT 50,
    "isPrimaryFollow" BOOLEAN NOT NULL DEFAULT true,
    "lastContactDate" DATETIME,
    "contactResult" TEXT,
    "nextAction" TEXT,
    "followUpDate" DATETIME,
    "latitude" REAL,
    "longitude" REAL,
    "gpsVerified" BOOLEAN NOT NULL DEFAULT false,
    "isRegistryVerified" BOOLEAN NOT NULL DEFAULT false,
    "registryVoterId" TEXT,
    "deletedAt" DATETIME,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Voter_recruitedById_fkey" FOREIGN KEY ("recruitedById") REFERENCES "Voter" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Voter_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "ElectionKey" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Voter_tribeId_fkey" FOREIGN KEY ("tribeId") REFERENCES "Tribe" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Voter_subTribeId_fkey" FOREIGN KEY ("subTribeId") REFERENCES "SubTribe" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "cost" REAL NOT NULL DEFAULT 0.0,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "assignedTo" TEXT,
    "estimatedVotesImpact" INTEGER NOT NULL DEFAULT 0,
    "keyId" TEXT,
    "voterId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "Service_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "ElectionKey" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Service_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "Voter" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommissionData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "province" TEXT NOT NULL DEFAULT 'ذي قار',
    "district" TEXT NOT NULL,
    "registeredVoters" INTEGER NOT NULL DEFAULT 0,
    "actualVoters" INTEGER NOT NULL DEFAULT 0,
    "maleVoters" INTEGER NOT NULL DEFAULT 0,
    "femaleVoters" INTEGER NOT NULL DEFAULT 0,
    "pollingCenters" INTEGER NOT NULL DEFAULT 0,
    "ballotStations" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Competitor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "party" TEXT NOT NULL,
    "tribe" TEXT NOT NULL,
    "baseDistrict" TEXT NOT NULL,
    "estimatedVotes" INTEGER NOT NULL DEFAULT 0,
    "strengthLevel" INTEGER NOT NULL DEFAULT 3,
    "primaryArea" TEXT,
    "keyStrengths" TEXT,
    "keyWeaknesses" TEXT,
    "counterStrategy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SentimentTrend" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL,
    "sentiment" TEXT NOT NULL,
    "keywords" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "region" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Volunteer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "role" TEXT NOT NULL,
    "district" TEXT,
    "area" TEXT,
    "notes" TEXT,
    "efficiencyScore" INTEGER NOT NULL DEFAULT 100,
    "totalAssignedTasks" INTEGER NOT NULL DEFAULT 0,
    "totalCompletedTasks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "taskType" TEXT NOT NULL DEFAULT 'FIELD',
    "district" TEXT,
    "impactEstimate" TEXT,
    "dueDate" DATETIME,
    "completedAt" DATETIME,
    "targetVoterId" TEXT,
    "assignedToId" TEXT,
    "electoralKeyId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Task_targetVoterId_fkey" FOREIGN KEY ("targetVoterId") REFERENCES "Voter" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "Volunteer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_electoralKeyId_fkey" FOREIGN KEY ("electoralKeyId") REFERENCES "ElectionKey" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RateLimit" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "count" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "blockedUntil" DATETIME
);

-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'system',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ConfidenceLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "voterId" TEXT NOT NULL,
    "oldScore" INTEGER NOT NULL,
    "newScore" INTEGER NOT NULL,
    "change" INTEGER NOT NULL,
    "reason" TEXT,
    "changedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConfidenceLog_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "Voter" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SMSCampaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "filterType" TEXT,
    "filterValue" TEXT,
    "recipientCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "scheduledAt" DATETIME,
    "sentAt" DATETIME,
    "provider" TEXT NOT NULL DEFAULT 'TWILIO',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "source" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "relatedId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AccessControl" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastChanged" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EarlyWarning" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "electoralKeyId" TEXT,
    "warningType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "detectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME,
    "areaType" TEXT,
    "areaName" TEXT,
    "estimatedVotesAtRisk" INTEGER NOT NULL DEFAULT 0,
    "recommendedAction" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EarlyWarning_electoralKeyId_fkey" FOREIGN KEY ("electoralKeyId") REFERENCES "ElectionKey" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DynamicIndicator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "area" TEXT NOT NULL,
    "indicatorType" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "previousValue" REAL NOT NULL DEFAULT 0,
    "trend" TEXT NOT NULL DEFAULT 'STABLE',
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CompositeIndicator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "area" TEXT NOT NULL,
    "eii" REAL NOT NULL DEFAULT 0,
    "kri" REAL NOT NULL DEFAULT 0,
    "vps" REAL NOT NULL DEFAULT 0,
    "drs" REAL NOT NULL DEFAULT 0,
    "campaignRoi" REAL NOT NULL DEFAULT 0,
    "api" REAL NOT NULL DEFAULT 0,
    "ewli" REAL NOT NULL DEFAULT 0,
    "gsi" REAL NOT NULL DEFAULT 0,
    "edri" REAL NOT NULL DEFAULT 0,
    "efi" REAL NOT NULL DEFAULT 0,
    "calculatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ElectionResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "district" TEXT,
    "scope" TEXT NOT NULL DEFAULT 'محافظة',
    "electionType" TEXT NOT NULL DEFAULT 'برلمانية',
    "totalRegistered" INTEGER NOT NULL DEFAULT 0,
    "totalVotes" INTEGER NOT NULL DEFAULT 0,
    "validVotes" INTEGER NOT NULL DEFAULT 0,
    "invalidVotes" INTEGER NOT NULL DEFAULT 0,
    "participationRate" REAL NOT NULL DEFAULT 0,
    "totalSeats" INTEGER NOT NULL DEFAULT 0,
    "seatsWon" INTEGER NOT NULL DEFAULT 0,
    "thresholdVotes" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'أولية',
    "winnerName" TEXT,
    "winnerVotes" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CandidateResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "electionResultId" TEXT NOT NULL,
    "candidateName" TEXT NOT NULL,
    "partyName" TEXT,
    "votes" INTEGER NOT NULL DEFAULT 0,
    "votePercentage" REAL NOT NULL DEFAULT 0,
    "votePercentageOfTurnout" REAL NOT NULL DEFAULT 0,
    "seatsAllocated" INTEGER NOT NULL DEFAULT 0,
    "isOurCandidate" BOOLEAN NOT NULL DEFAULT false,
    "gender" TEXT NOT NULL DEFAULT 'ذكر',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CandidateResult_electionResultId_fkey" FOREIGN KEY ("electionResultId") REFERENCES "ElectionResult" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProvinceReference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "province" TEXT NOT NULL DEFAULT 'ذي قار',
    "totalRegisteredVoters" INTEGER NOT NULL DEFAULT 1099438,
    "totalActualVoters" INTEGER NOT NULL DEFAULT 538390,
    "generalTurnout" REAL NOT NULL DEFAULT 48.97,
    "maleVoters" INTEGER NOT NULL DEFAULT 322970,
    "femaleVoters" INTEGER NOT NULL DEFAULT 215420,
    "pollingCentersCount" INTEGER NOT NULL DEFAULT 527,
    "ballotStationsCount" INTEGER NOT NULL DEFAULT 2212,
    "lastRegistryUpdate" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "Tribe_name_key" ON "Tribe"("name");

-- CreateIndex
CREATE INDEX "Tribe_district_idx" ON "Tribe"("district");

-- CreateIndex
CREATE INDEX "Tribe_influenceRating_idx" ON "Tribe"("influenceRating");

-- CreateIndex
CREATE INDEX "SubTribe_tribeId_idx" ON "SubTribe"("tribeId");

-- CreateIndex
CREATE UNIQUE INDEX "SubTribe_name_tribeId_key" ON "SubTribe"("name", "tribeId");

-- CreateIndex
CREATE UNIQUE INDEX "ElectionKey_keyCode_key" ON "ElectionKey"("keyCode");

-- CreateIndex
CREATE UNIQUE INDEX "ElectionKey_phone_key" ON "ElectionKey"("phone");

-- CreateIndex
CREATE INDEX "ElectionKey_tribeId_idx" ON "ElectionKey"("tribeId");

-- CreateIndex
CREATE INDEX "ElectionKey_subTribeId_idx" ON "ElectionKey"("subTribeId");

-- CreateIndex
CREATE INDEX "ElectionKey_province_idx" ON "ElectionKey"("province");

-- CreateIndex
CREATE INDEX "ElectionKey_district_idx" ON "ElectionKey"("district");

-- CreateIndex
CREATE INDEX "ElectionKey_influenceLevel_idx" ON "ElectionKey"("influenceLevel");

-- CreateIndex
CREATE INDEX "ElectionKey_isActive_idx" ON "ElectionKey"("isActive");

-- CreateIndex
CREATE INDEX "ElectionKey_classification_idx" ON "ElectionKey"("classification");

-- CreateIndex
CREATE INDEX "ElectionKey_weightedScore_idx" ON "ElectionKey"("weightedScore");

-- CreateIndex
CREATE INDEX "Voter_keyId_idx" ON "Voter"("keyId");

-- CreateIndex
CREATE INDEX "Voter_tribeId_idx" ON "Voter"("tribeId");

-- CreateIndex
CREATE INDEX "Voter_subTribeId_idx" ON "Voter"("subTribeId");

-- CreateIndex
CREATE INDEX "Voter_province_idx" ON "Voter"("province");

-- CreateIndex
CREATE INDEX "Voter_district_idx" ON "Voter"("district");

-- CreateIndex
CREATE INDEX "Voter_status_idx" ON "Voter"("status");

-- CreateIndex
CREATE INDEX "Voter_votedOnDay_idx" ON "Voter"("votedOnDay");

-- CreateIndex
CREATE INDEX "Voter_confidenceScore_idx" ON "Voter"("confidenceScore");

-- CreateIndex
CREATE INDEX "Voter_recruitedById_idx" ON "Voter"("recruitedById");

-- CreateIndex
CREATE INDEX "Service_keyId_idx" ON "Service"("keyId");

-- CreateIndex
CREATE INDEX "Service_voterId_idx" ON "Service"("voterId");

-- CreateIndex
CREATE INDEX "Service_category_idx" ON "Service"("category");

-- CreateIndex
CREATE INDEX "Service_status_idx" ON "Service"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CommissionData_district_key" ON "CommissionData"("district");

-- CreateIndex
CREATE INDEX "CommissionData_province_idx" ON "CommissionData"("province");

-- CreateIndex
CREATE INDEX "CommissionData_district_idx" ON "CommissionData"("district");

-- CreateIndex
CREATE INDEX "Competitor_baseDistrict_idx" ON "Competitor"("baseDistrict");

-- CreateIndex
CREATE INDEX "SentimentTrend_source_idx" ON "SentimentTrend"("source");

-- CreateIndex
CREATE INDEX "SentimentTrend_region_idx" ON "SentimentTrend"("region");

-- CreateIndex
CREATE INDEX "SentimentTrend_createdAt_idx" ON "SentimentTrend"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Volunteer_phone_key" ON "Volunteer"("phone");

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");

-- CreateIndex
CREATE INDEX "Task_priority_idx" ON "Task"("priority");

-- CreateIndex
CREATE INDEX "Task_district_idx" ON "Task"("district");

-- CreateIndex
CREATE INDEX "Task_assignedToId_idx" ON "Task"("assignedToId");

-- CreateIndex
CREATE INDEX "Task_electoralKeyId_idx" ON "Task"("electoralKeyId");

-- CreateIndex
CREATE INDEX "RateLimit_lastAttemptAt_idx" ON "RateLimit"("lastAttemptAt");

-- CreateIndex
CREATE INDEX "ConfidenceLog_voterId_idx" ON "ConfidenceLog"("voterId");

-- CreateIndex
CREATE INDEX "ConfidenceLog_createdAt_idx" ON "ConfidenceLog"("createdAt");

-- CreateIndex
CREATE INDEX "SMSCampaign_status_idx" ON "SMSCampaign"("status");

-- CreateIndex
CREATE INDEX "SMSCampaign_scheduledAt_idx" ON "SMSCampaign"("scheduledAt");

-- CreateIndex
CREATE INDEX "Alert_type_idx" ON "Alert"("type");

-- CreateIndex
CREATE INDEX "Alert_isRead_idx" ON "Alert"("isRead");

-- CreateIndex
CREATE INDEX "Alert_createdAt_idx" ON "Alert"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AccessControl_label_key" ON "AccessControl"("label");

-- CreateIndex
CREATE INDEX "EarlyWarning_electoralKeyId_idx" ON "EarlyWarning"("electoralKeyId");

-- CreateIndex
CREATE INDEX "EarlyWarning_severity_idx" ON "EarlyWarning"("severity");

-- CreateIndex
CREATE INDEX "EarlyWarning_status_idx" ON "EarlyWarning"("status");

-- CreateIndex
CREATE INDEX "EarlyWarning_warningType_idx" ON "EarlyWarning"("warningType");

-- CreateIndex
CREATE INDEX "DynamicIndicator_area_idx" ON "DynamicIndicator"("area");

-- CreateIndex
CREATE INDEX "DynamicIndicator_indicatorType_idx" ON "DynamicIndicator"("indicatorType");

-- CreateIndex
CREATE INDEX "DynamicIndicator_recordedAt_idx" ON "DynamicIndicator"("recordedAt");

-- CreateIndex
CREATE INDEX "CompositeIndicator_area_idx" ON "CompositeIndicator"("area");

-- CreateIndex
CREATE INDEX "CompositeIndicator_calculatedAt_idx" ON "CompositeIndicator"("calculatedAt");

-- CreateIndex
CREATE INDEX "ElectionResult_year_idx" ON "ElectionResult"("year");

-- CreateIndex
CREATE INDEX "ElectionResult_district_idx" ON "ElectionResult"("district");

-- CreateIndex
CREATE INDEX "ElectionResult_scope_idx" ON "ElectionResult"("scope");

-- CreateIndex
CREATE INDEX "ElectionResult_electionType_idx" ON "ElectionResult"("electionType");

-- CreateIndex
CREATE INDEX "ElectionResult_status_idx" ON "ElectionResult"("status");

-- CreateIndex
CREATE INDEX "CandidateResult_electionResultId_idx" ON "CandidateResult"("electionResultId");

-- CreateIndex
CREATE INDEX "CandidateResult_isOurCandidate_idx" ON "CandidateResult"("isOurCandidate");

-- CreateIndex
CREATE UNIQUE INDEX "ProvinceReference_province_key" ON "ProvinceReference"("province");
