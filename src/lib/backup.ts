// ====================================================================
// backup.ts — نظام النسخ الاحتياطي التلقائي لقاعدة البيانات
// ====================================================================

import { prisma } from "./prisma";
import fs from "fs/promises";
import path from "path";

export interface BackupResult {
  success: boolean;
  fileName?: string;
  filePath?: string;
  size?: number;
  error?: string;
}

/**
 * يقوم بتصدير جداول النظام بالكامل بصيغة JSON ويحفظها كملف احتياطي.
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
    const fileName = `backup-${timestampStr}.json`;
    const filePath = path.join(backupDir, fileName);

    const serializedData = JSON.stringify(backupData, null, 2);
    await fs.writeFile(filePath, serializedData, "utf-8");

    // تنظيف النسخ القديمة والاحتفاظ بآخر 7 نسخ فقط
    const files = await fs.readdir(backupDir);
    const backupFiles = files
      .filter((f) => f.startsWith("backup-") && f.endsWith(".json"))
      .map((f) => ({
        name: f,
        time: f.replace("backup-", "").replace(".json", ""),
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
      size: serializedData.length,
    };
  } catch (error) {
    console.error("Backup process encountered an error:", error);
    return {
      success: false,
      error: String(error),
    };
  }
}
