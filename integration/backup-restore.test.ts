import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { NextRequest } from "next/server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { POST as backupPost } from "@/app/api/cron/backup/route";
import { createToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/security";

const username = "integration_admin";
const keyUsername = "integration_restore_key_user";
const extraUsername = "integration_post_backup_admin";
let password = "";
let token = "";
let backupDirectory = "";

function assertIsolatedDatabase(): void {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) throw new Error("DATABASE_URL is required");
  const databaseUrl = new URL(rawUrl);
  if (!["localhost", "127.0.0.1", "::1"].includes(databaseUrl.hostname)) {
    throw new Error("Backup integration test refuses a remote database");
  }
  if (!/(test|ci|fresh|restore|audit|smoke)/i.test(databaseUrl.pathname)) {
    throw new Error("Database name must clearly identify an isolated test database");
  }
}

function request(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost/api/cron/backup", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie: `election_auth=${token}`,
    },
    body: JSON.stringify(body),
  });
}

beforeAll(async () => {
  assertIsolatedDatabase();
  password = process.env.INTEGRATION_ADMIN_PASSWORD || "";
  if (password.length < 12) {
    throw new Error("INTEGRATION_ADMIN_PASSWORD must contain at least 12 characters");
  }

  backupDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "electoral-backup-integration-")
  );
  process.env.BACKUP_DIR = backupDirectory;
  process.env.BACKUP_ENCRYPTION_KEY=[REDACTED] ||
    "integration-backup-key-with-more-than-thirty-two-characters";

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.user.upsert({
    where: { username },
    update: {
      password: passwordHash,
      role: "ADMIN",
      isActive: true,
      mustChangePwd: false,
      electionKeyId: null,
      tokenIssuedBefore: null,
    },
    create: {
      username,
      password: passwordHash,
      role: "ADMIN",
      isActive: true,
      mustChangePwd: false,
    },
  });
  await prisma.systemConfig.upsert({
    where: { id: "system" },
    update: {},
    create: { id: "system", enabled: true },
  });
  token = await createToken({
    userId: admin.id,
    username: admin.username,
    role: "ADMIN",
    isOwner: true,
  });
});

afterAll(async () => {
  await prisma.$disconnect();
  if (backupDirectory) {
    await fs.rm(backupDirectory, { recursive: true, force: true });
  }
});

describe("encrypted backup restore", () => {
  it("restores business data while preserving append-only audit history", async () => {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.deleteMany({ where: { username: extraUsername } });
    const restoreKey = await prisma.electionKey.upsert({
      where: { keyCode: "99000001" },
      update: {
        firstName: "Integration",
        fatherName: "Restore",
        grandfatherName: "Key",
        fourthName: "User",
        gender: "ذكر",
        education: "test",
        profession: "test",
        subDistrict: "test",
        pollingCenter: "test",
      },
      create: {
        keyCode: "99000001",
        firstName: "Integration",
        fatherName: "Restore",
        grandfatherName: "Key",
        fourthName: "User",
        gender: "ذكر",
        education: "test",
        profession: "test",
        subDistrict: "test",
        pollingCenter: "test",
      },
    });
    await prisma.user.upsert({
      where: { username: keyUsername },
      update: {
        password: passwordHash,
        role: "KEY_USER",
        isActive: true,
        mustChangePwd: false,
        electionKeyId: restoreKey.id,
        tokenIssuedBefore: null,
      },
      create: {
        username: keyUsername,
        password: passwordHash,
        role: "KEY_USER",
        isActive: true,
        mustChangePwd: false,
        electionKeyId: restoreKey.id,
      },
    });

    const beforeTribes = await prisma.tribe.count();
    const createResponse = await backupPost(request({ action: "create" }), {});
    expect(createResponse.status).toBe(200);
    const created = (await createResponse.json()) as {
      success: boolean;
      fileName: string;
    };
    expect(created.success).toBe(true);
    expect(created.fileName).toMatch(/^backup-.*\.enc\.json$/);

    const marker = `restore-marker-${crypto.randomUUID()}`;
    const tribeId = await prisma.$transaction(async (tx) => {
      const tribe = await tx.tribe.create({ data: { name: marker } });
      await writeAuditLog(tx, {
        username,
        action: "CREATE",
        entity: "Tribe",
        entityId: tribe.id,
        details: { integrationTest: true },
      });
      return tribe.id;
    });
    await prisma.user.create({
      data: {
        username: extraUsername,
        password: passwordHash,
        role: "ADMIN",
        isActive: true,
        mustChangePwd: false,
      },
    });

    const restoreRequestedAt = new Date();
    const restoreResponse = await backupPost(
      request({
        action: "restore",
        confirmation: "RESTORE DATABASE",
        currentPassword: password,
        backupFileName: created.fileName,
        acknowledgeAuditAppendOnly: true,
      }),
      {}
    );
    expect(restoreResponse.status).toBe(200);
    const restored = (await restoreResponse.json()) as {
      success: boolean;
      safetyBackup: string;
    };
    expect(restored.success).toBe(true);
    expect(restored.safetyBackup).toMatch(/^backup-.*\.enc\.json$/);

    await expect(prisma.tribe.count()).resolves.toBe(beforeTribes);
    await expect(
      prisma.tribe.findUnique({ where: { id: tribeId } })
    ).resolves.toBeNull();
    await expect(
      prisma.auditLog.findFirst({
        where: { entity: "Tribe", entityId: tribeId, action: "CREATE" },
      })
    ).resolves.not.toBeNull();
    await expect(
      prisma.auditLog.findFirst({
        where: {
          entity: "Database",
          action: "UPDATE",
          details: { contains: '"action":"RESTORE"' },
        },
      })
    ).resolves.not.toBeNull();

    const restoredKeyUser = await prisma.user.findUniqueOrThrow({
      where: { username: keyUsername },
    });
    expect(restoredKeyUser.isActive).toBe(true);
    expect(restoredKeyUser.electionKeyId).toBe(restoreKey.id);
    expect(restoredKeyUser.tokenIssuedBefore?.getTime()).toBeGreaterThanOrEqual(
      restoreRequestedAt.getTime()
    );

    const extraAccount = await prisma.user.findUniqueOrThrow({
      where: { username: extraUsername },
    });
    expect(extraAccount.isActive).toBe(false);
    expect(extraAccount.electionKeyId).toBeNull();
    expect(extraAccount.tokenIssuedBefore?.getTime()).toBeGreaterThanOrEqual(
      restoreRequestedAt.getTime()
    );

    const restoredAdmin = await prisma.user.findUniqueOrThrow({
      where: { username },
    });
    expect(restoredAdmin.tokenIssuedBefore?.getTime()).toBeGreaterThanOrEqual(
      restoreRequestedAt.getTime()
    );
  });
});
