#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const ROOT = path.resolve(__dirname, "..");

const domainChecks = [
  {
    name: "User roles",
    table: "User",
    columns: ["role"],
    where: `upper("role") NOT IN ('ADMIN', 'KEY_USER', 'OBSERVER', 'VIEWER')`,
  },
  {
    name: "Non-KEY user election-key links",
    table: "User",
    columns: ["role", "electionKeyId"],
    where: `"electionKeyId" IS NOT NULL AND upper("role") <> 'KEY_USER'`,
    reconciledBy: "20260718015000_user_key_scope_reconciliation",
  },
  {
    name: "ElectionKey vote/rating ranges",
    table: "ElectionKey",
    columns: [
      "supportedVotes",
      "neutralVotes",
      "weakVotes",
      "expectedVotes",
      "influenceLevel",
      "mobilizationCap",
      "loyaltyScore",
      "riskLevel",
      "voteProtection",
      "supportReason",
      "needsLevel",
      "politicalNote",
      "organizationalNote",
      "generalNote",
    ],
    where: `
      "supportedVotes" < 0 OR "neutralVotes" < 0 OR "weakVotes" < 0
      OR "expectedVotes" < 0
      OR "influenceLevel" NOT BETWEEN 1 AND 5
      OR "mobilizationCap" NOT BETWEEN 1 AND 5
      OR "loyaltyScore" NOT BETWEEN 1 AND 5
      OR "riskLevel" NOT BETWEEN 1 AND 5
      OR "voteProtection" NOT BETWEEN 1 AND 5
      OR "supportReason" NOT BETWEEN 1 AND 5
      OR "needsLevel" NOT BETWEEN 1 AND 5
      OR "politicalNote" NOT BETWEEN 1 AND 5
      OR "organizationalNote" NOT BETWEEN 1 AND 5
      OR "generalNote" NOT BETWEEN 1 AND 5
    `,
  },
  {
    name: "ElectionKey identity/phone values",
    table: "ElectionKey",
    columns: ["gender", "classification", "phone", "phone2"],
    where: `
      "gender" NOT IN ('ذكر', 'أنثى')
      OR "classification" NOT IN ('ضعيف', 'مقبول', 'جيد', 'قوي', 'قوي جداً')
      OR (
        "phone" IS NOT NULL
        AND (
          CASE
            WHEN regexp_replace("phone", '[\\s()-]', '', 'g') LIKE '+9647%'
              THEN '0' || substring(regexp_replace("phone", '[\\s()-]', '', 'g') FROM 5)
            WHEN regexp_replace("phone", '[\\s()-]', '', 'g') LIKE '9647%'
              THEN '0' || substring(regexp_replace("phone", '[\\s()-]', '', 'g') FROM 4)
            ELSE regexp_replace("phone", '[\\s()-]', '', 'g')
          END
        ) !~ '^07[3-9][0-9]{8}$'
      )
      OR (
        "phone2" IS NOT NULL
        AND NULLIF(regexp_replace("phone2", '[\\s()-]', '', 'g'), '') IS NOT NULL
        AND (
          CASE
            WHEN regexp_replace("phone2", '[\\s()-]', '', 'g') LIKE '+9647%'
              THEN '0' || substring(regexp_replace("phone2", '[\\s()-]', '', 'g') FROM 5)
            WHEN regexp_replace("phone2", '[\\s()-]', '', 'g') LIKE '9647%'
              THEN '0' || substring(regexp_replace("phone2", '[\\s()-]', '', 'g') FROM 4)
            ELSE regexp_replace("phone2", '[\\s()-]', '', 'g')
          END
        ) !~ '^07[3-9][0-9]{8}$'
      )
    `,
  },
  {
    name: "Voter identity/range values",
    table: "Voter",
    columns: [
      "gender",
      "status",
      "phone",
      "nationalId",
      "supportDegree",
      "confidenceScore",
      "influenceRate",
      "familySize",
      "latitude",
      "longitude",
    ],
    where: `
      "gender" NOT IN ('ذكر', 'أنثى')
      OR "status" NOT IN ('SUPPORTED', 'NEUTRAL', 'WEAK')
      OR "supportDegree" NOT BETWEEN 1 AND 5
      OR "confidenceScore" NOT BETWEEN 0 AND 100
      OR "influenceRate" NOT BETWEEN 0 AND 100
      OR ("familySize" IS NOT NULL AND "familySize" NOT BETWEEN 0 AND 100)
      OR ("latitude" IS NOT NULL AND "latitude" NOT BETWEEN -90 AND 90)
      OR ("longitude" IS NOT NULL AND "longitude" NOT BETWEEN -180 AND 180)
      OR (
        "nationalId" IS NOT NULL
        AND char_length(btrim("nationalId")) NOT BETWEEN 3 AND 50
      )
      OR (
        "phone" IS NOT NULL
        AND NULLIF(regexp_replace("phone", '[\\s()-]', '', 'g'), '') IS NOT NULL
        AND (
          CASE
            WHEN regexp_replace("phone", '[\\s()-]', '', 'g') LIKE '+9647%'
              THEN '0' || substring(regexp_replace("phone", '[\\s()-]', '', 'g') FROM 5)
            WHEN regexp_replace("phone", '[\\s()-]', '', 'g') LIKE '9647%'
              THEN '0' || substring(regexp_replace("phone", '[\\s()-]', '', 'g') FROM 4)
            ELSE regexp_replace("phone", '[\\s()-]', '', 'g')
          END
        ) !~ '^07[3-9][0-9]{8}$'
      )
    `,
  },
  {
    name: "Tribe values",
    table: "Tribe",
    columns: ["influenceRating", "population", "leaderPhone"],
    where: `
      "influenceRating" NOT BETWEEN 1 AND 5
      OR ("population" IS NOT NULL AND "population" < 0)
      OR (
        "leaderPhone" IS NOT NULL
        AND NULLIF(regexp_replace("leaderPhone", '[\\s()-]', '', 'g'), '') IS NOT NULL
        AND (
          CASE
            WHEN regexp_replace("leaderPhone", '[\\s()-]', '', 'g') LIKE '+9647%'
              THEN '0' || substring(regexp_replace("leaderPhone", '[\\s()-]', '', 'g') FROM 5)
            WHEN regexp_replace("leaderPhone", '[\\s()-]', '', 'g') LIKE '9647%'
              THEN '0' || substring(regexp_replace("leaderPhone", '[\\s()-]', '', 'g') FROM 4)
            ELSE regexp_replace("leaderPhone", '[\\s()-]', '', 'g')
          END
        ) !~ '^07[3-9][0-9]{8}$'
      )
    `,
  },
  {
    name: "CommissionData counts",
    table: "CommissionData",
    columns: [
      "registeredVoters",
      "actualVoters",
      "maleVoters",
      "femaleVoters",
      "pollingCenters",
      "ballotStations",
    ],
    where: `
      "registeredVoters" < 0
      OR "actualVoters" NOT BETWEEN 0 AND "registeredVoters"
      OR "maleVoters" < 0 OR "femaleVoters" < 0
      OR "maleVoters" + "femaleVoters" > "actualVoters"
      OR "pollingCenters" < 0 OR "ballotStations" < 0
    `,
  },
  {
    name: "Competitor values",
    table: "Competitor",
    columns: ["estimatedVotes", "strengthLevel"],
    where: `"estimatedVotes" < 0 OR "strengthLevel" NOT BETWEEN 1 AND 5`,
  },
  {
    name: "SentimentTrend values",
    table: "SentimentTrend",
    columns: ["sentiment", "score"],
    where: `
      "sentiment" NOT IN ('POSITIVE', 'NEGATIVE', 'NEUTRAL')
      OR "score" NOT BETWEEN 0 AND 1
    `,
  },
  {
    name: "Volunteer values",
    table: "Volunteer",
    columns: [
      "phone",
      "role",
      "efficiencyScore",
      "totalAssignedTasks",
      "totalCompletedTasks",
    ],
    where: `
      (
        CASE
          WHEN regexp_replace("phone", '[\\s()-]', '', 'g') LIKE '+9647%'
            THEN '0' || substring(regexp_replace("phone", '[\\s()-]', '', 'g') FROM 5)
          WHEN regexp_replace("phone", '[\\s()-]', '', 'g') LIKE '9647%'
            THEN '0' || substring(regexp_replace("phone", '[\\s()-]', '', 'g') FROM 4)
          ELSE regexp_replace("phone", '[\\s()-]', '', 'g')
        END
      ) !~ '^07[3-9][0-9]{8}$'
      OR "role" NOT IN (
        'FIELD_AGENT', 'LOGISTICS', 'MEDIA', 'COORDINATOR',
        'ELECTION_DAY_OBSERVER'
      )
      OR "efficiencyScore" NOT BETWEEN 0 AND 100
      OR "totalAssignedTasks" < 0
      OR "totalCompletedTasks" NOT BETWEEN 0 AND "totalAssignedTasks"
    `,
  },
  {
    name: "ConfidenceLog values",
    table: "ConfidenceLog",
    columns: ["oldScore", "newScore", "change"],
    where: `
      "oldScore" NOT BETWEEN 0 AND 100
      OR "newScore" NOT BETWEEN 0 AND 100
      OR "change" <> "newScore" - "oldScore"
    `,
  },
  {
    name: "Service values",
    table: "Service",
    columns: ["status", "priority", "cost", "estimatedVotesImpact"],
    where: `
      "status" NOT IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')
      OR "priority" NOT IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')
      OR "cost" < 0 OR "estimatedVotesImpact" < 0
    `,
  },
  {
    name: "Task values",
    table: "Task",
    columns: ["status", "priority"],
    where: `
      "status" NOT IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')
      OR "priority" NOT IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')
    `,
  },
  {
    name: "SMSCampaign values",
    table: "SMSCampaign",
    columns: ["status", "provider", "recipientCount"],
    where: `
      "status" NOT IN (
        'DRAFT', 'SCHEDULED', 'PROCESSING', 'SUBMITTED',
        'DELIVERED', 'PARTIAL', 'FAILED', 'SENT'
      )
      OR "provider" NOT IN ('TWILIO', 'VONAGE')
      OR "recipientCount" < 0
    `,
  },
  {
    name: "SMSDelivery values",
    table: "SMSDelivery",
    columns: ["status", "attempts"],
    where: `
      "status" NOT IN (
        'PENDING', 'SENDING', 'SUBMISSION_UNKNOWN',
        'QUEUED', 'SENT', 'DELIVERED', 'FAILED'
      )
      OR "attempts" < 0
    `,
  },
  {
    name: "Alert values",
    table: "Alert",
    columns: ["type"],
    where: `"type" NOT IN ('INFO', 'WARNING', 'CRITICAL')`,
  },
  {
    name: "EarlyWarning values",
    table: "EarlyWarning",
    columns: ["severity", "status", "estimatedVotesAtRisk"],
    where: `
      "severity" NOT IN (
        'LOW', 'MEDIUM', 'HIGH', 'CRITICAL',
        'منخفض', 'متوسط', 'مرتفع', 'حرج'
      )
      OR "status" NOT IN ('ACTIVE', 'IN_PROGRESS', 'RESOLVED')
      OR "estimatedVotesAtRisk" < 0
    `,
  },
  {
    name: "DynamicIndicator values",
    table: "DynamicIndicator",
    columns: ["value", "previousValue", "trend"],
    where: `
      "value" NOT BETWEEN 0 AND 100
      OR "previousValue" NOT BETWEEN 0 AND 100
      OR "trend" NOT IN ('UP', 'STABLE', 'DOWN')
    `,
  },
  {
    name: "CompositeIndicator values",
    table: "CompositeIndicator",
    columns: [
      "eii",
      "kri",
      "vps",
      "drs",
      "campaignRoi",
      "api",
      "ewli",
      "gsi",
      "edri",
      "efi",
    ],
    where: `
      "eii" NOT BETWEEN 0 AND 100
      OR "kri" NOT BETWEEN 0 AND 100
      OR "vps" NOT BETWEEN 0 AND 100
      OR "drs" NOT BETWEEN 0 AND 100
      OR "campaignRoi" NOT BETWEEN 0 AND 100
      OR "api" NOT BETWEEN 0 AND 100
      OR "ewli" NOT BETWEEN 0 AND 100
      OR "gsi" NOT BETWEEN 0 AND 100
      OR "edri" NOT BETWEEN 0 AND 100
      OR "efi" NOT BETWEEN 0 AND 100
    `,
  },
  {
    name: "RateLimit values",
    table: "RateLimit",
    columns: ["count"],
    where: `"count" < 0`,
  },
  {
    name: "ElectionResult counts",
    table: "ElectionResult",
    columns: [
      "totalRegistered",
      "totalVotes",
      "invalidVotes",
      "totalSeats",
      "seatsWon",
      "participationRate",
    ],
    where: `
      "totalRegistered" < 0
      OR "totalVotes" NOT BETWEEN 0 AND "totalRegistered"
      OR "invalidVotes" NOT BETWEEN 0 AND "totalVotes"
      OR "totalSeats" < 0
      OR "seatsWon" NOT BETWEEN 0 AND "totalSeats"
      OR "participationRate" NOT BETWEEN 0 AND 100
    `,
  },
  {
    name: "CandidateResult values",
    table: "CandidateResult",
    columns: [
      "votes",
      "votePercentage",
      "votePercentageOfTurnout",
      "seatsAllocated",
      "gender",
    ],
    where: `
      "votes" < 0
      OR "votePercentage" NOT BETWEEN 0 AND 100
      OR "votePercentageOfTurnout" NOT BETWEEN 0 AND 100
      OR "seatsAllocated" < 0
      OR "gender" NOT IN ('ذكر', 'أنثى')
    `,
  },
  {
    name: "ProvinceReference values",
    table: "ProvinceReference",
    columns: [
      "totalRegisteredVoters",
      "totalActualVoters",
      "generalTurnout",
      "maleVoters",
      "femaleVoters",
      "pollingCentersCount",
      "ballotStationsCount",
    ],
    where: `
      "totalRegisteredVoters" < 0
      OR "totalActualVoters" NOT BETWEEN 0 AND "totalRegisteredVoters"
      OR "generalTurnout" NOT BETWEEN 0 AND 100
      OR "maleVoters" < 0 OR "femaleVoters" < 0
      OR "maleVoters" + "femaleVoters" > "totalActualVoters"
      OR "pollingCentersCount" < 0 OR "ballotStationsCount" < 0
    `,
  },
];

async function runDomainPreflight(pendingMigrations) {
  const columns = await prisma.$queryRawUnsafe(`
    SELECT table_name AS "tableName", column_name AS "columnName"
    FROM information_schema.columns
    WHERE table_schema = 'public'
  `);
  const available = new Map();
  for (const column of columns) {
    if (!available.has(column.tableName)) {
      available.set(column.tableName, new Set());
    }
    available.get(column.tableName).add(column.columnName);
  }

  const violations = [];
  const reconciliations = [];
  let executed = 0;
  for (const check of domainChecks) {
    const tableColumns = available.get(check.table);
    if (
      !tableColumns ||
      !check.columns.every((column) => tableColumns.has(column))
    ) {
      continue;
    }
    const [result] = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*)::int AS "count" FROM "${check.table}" WHERE ${check.where}`
    );
    executed += 1;
    if (result.count > 0) {
      if (
        check.reconciledBy &&
        pendingMigrations.includes(check.reconciledBy)
      ) {
        reconciliations.push({
          name: check.name,
          count: result.count,
          migration: check.reconciledBy,
        });
      } else {
        violations.push({ name: check.name, count: result.count });
      }
    }
  }

  if (reconciliations.length > 0) {
    console.warn(
      `WARN: reviewed migration reconciliation required: ${reconciliations
        .map(
          (item) => `${item.name}=${item.count} via ${item.migration}`
        )
        .join(", ")}`
    );
  }

  if (violations.length > 0) {
    console.error(
      `BLOCKED: domain constraint violations: ${violations
        .map((violation) => `${violation.name}=${violation.count}`)
        .join(", ")}`
    );
    return false;
  }
  console.log(
    `PASS: domain preflight found 0 blocking invalid rows across ${executed} applicable checks; ` +
      `reviewedReconciliationRows=${reconciliations.reduce((sum, item) => sum + item.count, 0)}.`
  );
  return true;
}

async function main() {
  const expectedMigrations = fs
    .readdirSync(path.join(ROOT, "prisma", "migrations"), {
      withFileTypes: true,
    })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  const [state] = await prisma.$queryRawUnsafe(`
    SELECT
      current_database() AS "databaseName",
      EXISTS (
        SELECT 1
        FROM pg_catalog.pg_tables
        WHERE schemaname = 'public'
          AND tablename = '_prisma_migrations'
      ) AS "hasMigrationTable",
      (
        SELECT COUNT(*)::int
        FROM pg_catalog.pg_tables
        WHERE schemaname = 'public'
          AND tablename <> '_prisma_migrations'
      ) AS "businessTableCount"
  `);

  console.log(
    `Migration preflight: database=${state.databaseName}, ` +
      `businessTables=${state.businessTableCount}, ` +
      `migrationTable=${state.hasMigrationTable ? "present" : "absent"}`
  );

  if (!state.hasMigrationTable) {
    if (state.businessTableCount > 0) {
      console.error(
        "BLOCKED: the database is non-empty but has no Prisma migration history. " +
          "Take a verified backup, compare the live schema, and baseline it explicitly " +
          "before deployment. This script will not mutate or auto-baseline production."
      );
      process.exitCode = 2;
      return;
    }
    console.log("PASS: empty database is safe for initial prisma migrate deploy.");
    return;
  }

  const applied = await prisma.$queryRawUnsafe(`
    SELECT
      migration_name AS "migrationName",
      finished_at AS "finishedAt",
      rolled_back_at AS "rolledBackAt"
    FROM "_prisma_migrations"
    ORDER BY started_at ASC
  `);

  const failed = applied.filter(
    (migration) => !migration.finishedAt && !migration.rolledBackAt
  );
  if (failed.length > 0) {
    console.error(
      `BLOCKED: unfinished migration(s): ${failed
        .map((migration) => migration.migrationName)
        .join(", ")}`
    );
    process.exitCode = 2;
    return;
  }

  const appliedNames = new Set(
    applied
      .filter((migration) => migration.finishedAt && !migration.rolledBackAt)
      .map((migration) => migration.migrationName)
  );
  const unknown = [...appliedNames].filter(
    (migration) => !expectedMigrations.includes(migration)
  );
  if (unknown.length > 0) {
    console.error(
      `BLOCKED: database contains migration(s) absent from this release: ${unknown.join(
        ", "
      )}`
    );
    process.exitCode = 2;
    return;
  }

  const pending = expectedMigrations.filter(
    (migration) => !appliedNames.has(migration)
  );
  if (!(await runDomainPreflight(pending))) {
    process.exitCode = 2;
    return;
  }
  console.log(
    pending.length > 0
      ? `PASS: migration history is valid; pending=${pending.join(", ")}`
      : "PASS: migration history is valid and current."
  );
}

main()
  .catch((error) => {
    console.error(`Migration preflight failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
