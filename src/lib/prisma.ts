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

if (process.env.NEXT_PHASE !== "phase-production-build") {
  import("./scheduler").then(({ startScheduler }) => {
    startScheduler();
  });
}

export async function disconnectPrisma() {
  await prisma.$disconnect();
}

