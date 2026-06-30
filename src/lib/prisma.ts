// ====================================================================
// Prisma Client Singleton
// يضمن وجود نسخة واحدة فقط في وضع التطوير لتفادي استنزاف الاتصالات
// ====================================================================

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// تشغيل محرك الجدولة في الخلفية تلقائياً عند تحميل قاعدة البيانات
import { startScheduler } from "./scheduler";
startScheduler();

export async function disconnectPrisma() {
  await prisma.$disconnect();
}

