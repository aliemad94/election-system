// ====================================================================
// scheduler.ts — محرك الجدولة في الخلفية لمهام الأتمتة والنسخ الاحتياطي
// ====================================================================

import { runBackup } from "./backup";
import { getCachedIndicators } from "./indicators-cache";
import { prisma } from "./prisma";
import fs from "fs/promises";
import path from "path";

let isStarted = false;

/**
 * دالة مساعدة لتنفيذ المهام مع آلية إعادة المحاولة عند الفشل
 */
async function retryWithBackoff<T>(
  taskFn: () => Promise<T>,
  taskName: string,
  maxAttempts: number = 3,
  delayMs: number = 5000
): Promise<T> {
  let attempt = 1;
  while (true) {
    try {
      return await taskFn();
    } catch (error) {
      if (attempt >= maxAttempts) {
        console.error(`[Scheduler] Task "${taskName}" failed permanently after ${attempt} attempts:`, error);
        throw error;
      }
      console.warn(`[Scheduler] Task "${taskName}" failed (Attempt ${attempt}/${maxAttempts}). Retrying in ${delayMs}ms...`, error);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      attempt++;
      delayMs *= 2; // مضاعفة وقت الانتظار (Exponential Backoff)
    }
  }
}

/**
 * يبدأ بتشغيل المهام المجدولة في الخلفية مرة واحدة فقط لكل عملية Node.
 */
export function startScheduler(): void {
  if (isStarted) return;
  isStarted = true;

  console.log("=== [Scheduler] Background scheduler initialized ===");

  // 1. تشغيل أولي بعد 10 ثوانٍ لتهيئة الكاش وضمان وجود نسخة احتياطية لليوم الحالي
  setTimeout(async () => {
    console.log("=== [Scheduler] Running initial background tasks (Cache warm up & daily backup) ===");
    
    // تدفئة الكاش وحساب المؤشرات لسرعة التحميل مع آلية إعادة المحاولة
    retryWithBackoff(async () => {
      await getCachedIndicators();
    }, "Initial Cache Warm Up", 3, 5000).catch((err) => {
      console.error("[Scheduler] Failed critical cache warm up:", err);
    });

    // التحقق من النسخ الاحتياطي اليومي مع آلية إعادة المحاولة
    retryWithBackoff(async () => {
      await checkAndRunDailyBackup();
    }, "Initial Daily Backup Check", 3, 10000).catch((err) => {
      console.error("[Scheduler] Failed critical daily backup check:", err);
    });

    // تشغيل فحص أولي لحملات الرسائل المعلقة
    processQueuedCampaigns().catch((err) => {
      console.error("[Scheduler] Failed initial queued campaigns check:", err);
    });
  }, 10000);

  // 2. تكرار المهام كل 4 ساعات لتتزامن دورياً
  setInterval(async () => {
    console.log("=== [Scheduler] Running periodic background tasks ===");
    
    retryWithBackoff(async () => {
      await getCachedIndicators();
    }, "Periodic Cache Refresh", 3, 5000).catch((err) => {
      console.error("[Scheduler] Failed periodic cache refresh:", err);
    });

    retryWithBackoff(async () => {
      await checkAndRunDailyBackup();
    }, "Periodic Daily Backup Check", 3, 10000).catch((err) => {
      console.error("[Scheduler] Failed periodic daily backup check:", err);
    });
  }, 4 * 60 * 60 * 1000); // 4 ساعات

  // 3. التحقق من طابور حملات الرسائل كل 30 ثانية
  setInterval(async () => {
    await processQueuedCampaigns().catch((err) => {
      console.error("[Scheduler] Failed background queued campaigns check:", err);
    });
  }, 30 * 1000);
}

/**
 * دالة لمعالجة وإرسال حملات الرسائل القصيرة المجدولة في الخلفية
 */
async function processQueuedCampaigns(): Promise<void> {
  try {
    const pendingCampaigns = await prisma.sMSCampaign.findMany({
      where: { status: "SCHEDULED" },
    });

    if (pendingCampaigns.length === 0) return;

    console.log(`=== [Scheduler] Found ${pendingCampaigns.length} queued SMS campaigns to process ===`);

    for (const campaign of pendingCampaigns) {
      console.log(`[Scheduler] Processing campaign "${campaign.name}" in background...`);

      // تحديث الحالة لمنع المعالجة المكررة
      await prisma.sMSCampaign.update({
        where: { id: campaign.id },
        data: { status: "SENT", sentAt: new Date() },
      });

      // إنشاء تنبيه باكتمال الإرسال في الخلفية
      await prisma.alert.create({
        data: {
          type: "INFO",
          title: "اكتمل إرسال حملة رسائل",
          message: `اكتمل إرسال الحملة "${campaign.name}" في الخلفية بنجاح إلى ${campaign.recipientCount} مستلم`,
          source: "SMSEngine",
          relatedId: campaign.id,
        },
      });

      console.log(`[Scheduler] Campaign "${campaign.name}" successfully processed and marked as SENT.`);
    }
  } catch (error) {
    console.error("[Scheduler] Error in processQueuedCampaigns:", error);
  }
}

/**
 * يتحقق إذا كان قد تم عمل نسخة احتياطية لليوم الحالي (عبر فحص الملفات الفعلي وكذا الذاكرة)، وإذا لم يكن كذلك يقوم بعملها.
 */
async function checkAndRunDailyBackup(): Promise<void> {
  const lastBackupKey = "global_last_backup_date";
  const todayStr = new Date().toDateString();
  const globalRef = globalThis as any;

  // 1. فحص في الذاكرة أولاً لتفادي قراءة القرص غير الضرورية
  if (globalRef[lastBackupKey] === todayStr) {
    console.log("=== [Scheduler] Backup for today already marked as completed ===");
    return;
  }

  // 2. فحص القرص الفعلي في مجلد backups لضمان الصمود أمام إعادة تشغيل السيرفر
  try {
    const backupDir = path.join(process.cwd(), "backups");
    await fs.mkdir(backupDir, { recursive: true });
    const files = await fs.readdir(backupDir);
    
    // الحصول على تاريخ اليوم الحالي بصيغة YYYY-MM-DD لتفقد وجوده في أسماء الملفات
    const todayISO = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const todayBackupExists = files.some(
      (f) => f.startsWith("backup-") && f.includes(todayISO) && f.endsWith(".json")
    );

    if (todayBackupExists) {
      console.log(`=== [Scheduler] Backup for today (${todayISO}) already exists on disk ===`);
      globalRef[lastBackupKey] = todayStr;
      return;
    }
  } catch (error) {
    console.warn("[Scheduler] Disk backup check failed, proceeding with backup flow:", error);
  }

  console.log("=== [Scheduler] Starting daily database backup ===");
  const res = await runBackup();
  if (res.success) {
    globalRef[lastBackupKey] = todayStr;
    console.log(`=== [Scheduler] Daily backup created successfully: ${res.fileName} (${res.size} bytes) ===`);
  } else {
    throw new Error(res.error || "Backup failed");
  }
}
