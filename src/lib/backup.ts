// ====================================================================
// backup.ts — نظام النسخ الاحتياطي التلقائي لقاعدة البيانات
// مع تشفير AES-256-GCM لحماية البيانات الحساسة
// ====================================================================

import { prisma } from "./prisma";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export interface BackupResult {
  success: boolean;
  fileName?: string;
  filePath?: string;
  size?: number;
  encrypted?: boolean;
  error?: string;
}

/**
 * يشتق مفتاح تشفير 256-bit من JWT_SECRET باستخدام PBKDF2.
 * يضمن أن المفتاح ثابت بين عمليات النسخ والاستعادة طالما JWT_SECRET لم يتغير.
 */
function deriveEncryptionKey(): Buffer {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET مطلوب لتشفير النسخ الاحتياطية");
  }
  // Salt ثابت مرتبط بالمشروع — لا يحتاج أن يكون سرياً
  const salt = "electoral-machine-backup-v1";
  return crypto.pbkdf2Sync(secret, salt, 100_000, 32, "sha256");
}

/**
 * يشفّر نصاً بـ AES-256-GCM ويُرجع النتيجة كـ JSON (iv + authTag + ciphertext).
 */
export function encryptData(plaintext: string): string {
  const key = deriveEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "base64");
  encrypted += cipher.final("base64");
  const authTag = cipher.getAuthTag();

  return JSON.stringify({
    v: 1, // إصدار التشفير
    iv: iv.toString("base64"),
    tag: authTag.toString("base64"),
    data: encrypted,
  });
}

/**
 * يفك تشفير بيانات مشفّرة بـ AES-256-GCM.
 */
export function decryptData(encryptedJson: string): string {
  const key = deriveEncryptionKey();
  const { iv, tag, data } = JSON.parse(encryptedJson);

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(iv, "base64")
  );
  decipher.setAuthTag(Buffer.from(tag, "base64"));

  let decrypted = decipher.update(data, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

/**
 * يقوم بتصدير جداول النظام بالكامل بصيغة JSON مشفّرة ويحفظها كملف احتياطي.
 * يبقي فقط على آخر 7 نسخ ويقوم بحذف النسخ الأقدم تلقائياً.
 */
export async function runBackup(): Promise<BackupResult> {
  try {
    // جلب كافة السجلات من الجداول الانتخابية والتشغيلية
    const [
      tribes,
      subTribes,
      keys,
      voters,
      services,
      commission,
      results,
      candidates,
      volunteers,
      tasks,
      warnings,
      indicators,
      compositeIndicators,
      configs,
      access,
      competitors,
      sentimentTrends,
      confidenceLogs,
      smsCampaigns,
      alerts
    ] = await Promise.all([
      prisma.tribe.findMany(),
      prisma.subTribe.findMany(),
      prisma.electionKey.findMany(),
      prisma.voter.findMany(),
      prisma.service.findMany(),
      prisma.commissionData.findMany(),
      prisma.electionResult.findMany(),
      prisma.candidateResult.findMany(),
      prisma.volunteer.findMany(),
      prisma.task.findMany(),
      prisma.earlyWarning.findMany(),
      prisma.dynamicIndicator.findMany(),
      prisma.compositeIndicator.findMany(),
      prisma.systemConfig.findMany(),
      prisma.accessControl.findMany(),
      prisma.competitor.findMany(),
      prisma.sentimentTrend.findMany(),
      prisma.confidenceLog.findMany(),
      prisma.sMSCampaign.findMany(),
      prisma.alert.findMany(),
    ]);

    const backupData = {
      timestamp: new Date().toISOString(),
      tribes,
      subTribes,
      keys,
      voters,
      services,
      commission,
      results,
      candidates,
      volunteers,
      tasks,
      warnings,
      indicators,
      compositeIndicators,
      configs,
      access,
      competitors,
      sentimentTrends,
      confidenceLogs,
      smsCampaigns,
      alerts
    };

    // إعداد مسار حفظ ملفات النسخ الاحتياطي
    const backupDir = path.join(process.cwd(), "backups");
    await fs.mkdir(backupDir, { recursive: true });

    // اسم الملف الاحتياطي بالتوقيت الحالي
    const timestampStr = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `backup-${timestampStr}.enc.json`;
    const filePath = path.join(backupDir, fileName);

    // تشفير البيانات قبل الحفظ
    const serializedData = JSON.stringify(backupData);
    const encryptedData = encryptData(serializedData);
    await fs.writeFile(filePath, encryptedData, "utf-8");

    // تنظيف النسخ القديمة والاحتفاظ بآخر 7 نسخ فقط
    // يدعم كلا الامتدادين (.json و .enc.json) للتوافق مع النسخ القديمة
    const files = await fs.readdir(backupDir);
    const backupFiles = files
      .filter((f) => f.startsWith("backup-") && (f.endsWith(".json") || f.endsWith(".enc.json")))
      .map((f) => ({
        name: f,
        time: f.replace("backup-", "").replace(".enc.json", "").replace(".json", ""),
      }));

    // ترتيب تنازلي (الأحدث أولاً)
    backupFiles.sort((a, b) => b.time.localeCompare(a.time));

    // حذف ما زاد عن 7 نسخ
    if (backupFiles.length > 7) {
      for (let i = 7; i < backupFiles.length; i++) {
        await fs.unlink(path.join(backupDir, backupFiles[i].name)).catch((err) => {
          console.error(`Failed to delete old backup file: ${backupFiles[i].name}`, err);
        });
      }
    }

    return {
      success: true,
      fileName,
      filePath,
      size: encryptedData.length,
      encrypted: true,
    };
  } catch (error) {
    console.error("Backup process encountered an error:", error);
    return {
      success: false,
      error: String(error),
    };
  }
}
