// ====================================================================
// config-store.ts — إعدادات النظام (DB-backed)
// ====================================================================

import { prisma } from "./prisma";

/**
 * يقرأ إعدادات النظام من قاعدة البيانات.
 * يرجع { enabled: true } كقيمة افتراضية عند الفشل.
 */
export async function getSystemConfig(): Promise<{ enabled: boolean }> {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { id: "system" },
    });
    return config ?? { enabled: true };
  } catch {
    return { enabled: true };
  }
}

/**
 * يحدّث إعدادات النظام (upsert).
 */
export async function setSystemConfig(config: {
  enabled: boolean;
}): Promise<void> {
  await prisma.systemConfig.upsert({
    where: { id: "system" },
    update: { enabled: config.enabled },
    create: { id: "system", enabled: config.enabled },
  });
}

