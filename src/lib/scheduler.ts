// ====================================================================
// scheduler.ts — محرك الجدولة في الخلفية لمهام الأتمتة والنسخ الاحتياطي
// ====================================================================

import { runBackup } from "./backup";
import { getCachedIndicators } from "./indicators-cache";

let isStarted = false;

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
    try {
      // تدفئة الكاش وحساب المؤشرات لسرعة التحميل
      await getCachedIndicators().catch((err) => {
        console.error("[Scheduler] Failed to warm up indicators cache:", err);
      });
      // التحقق من النسخ الاحتياطي اليومي
      await checkAndRunDailyBackup();
    } catch (e) {
      console.error("[Scheduler] Startup background tasks failed:", e);
    }
  }, 10000);

  // 2. تكرار المهام كل 4 ساعات لتحديث المؤشرات والتحقق من النسخ الاحتياطي
  setInterval(async () => {
    console.log("=== [Scheduler] Running periodic background tasks ===");
    try {
      // تحديث المؤشرات في الكاش
      await getCachedIndicators().catch((err) => {
        console.error("[Scheduler] Failed to refresh indicators cache:", err);
      });
      // التحقق من النسخ الاحتياطي اليومي
      await checkAndRunDailyBackup();
    } catch (e) {
      console.error("[Scheduler] Periodic background tasks failed:", e);
    }
  }, 4 * 60 * 60 * 1000); // 4 ساعات
}

/**
 * يتحقق إذا كان قد تم عمل نسخة احتياطية لليوم الحالي، وإذا لم يكن كذلك يقوم بعملها.
 */
async function checkAndRunDailyBackup(): Promise<void> {
  const lastBackupKey = "global_last_backup_date";
  const todayStr = new Date().toDateString();

  // تخزين تاريخ آخر نسخة احتياطية في كائن global المتاح عبر عملية Node بأكملها
  const globalRef = globalThis as any;
  if (globalRef[lastBackupKey] === todayStr) {
    console.log("=== [Scheduler] Backup for today already exists ===");
    return;
  }

  console.log("=== [Scheduler] Starting daily database backup ===");
  const res = await runBackup();
  if (res.success) {
    globalRef[lastBackupKey] = todayStr;
    console.log(`=== [Scheduler] Daily backup created successfully: ${res.fileName} (${res.size} bytes) ===`);
  } else {
    console.error(`=== [Scheduler] Daily backup failed: ${res.error} ===`);
  }
}
