import { PrismaClient } from "@prisma/client";
import { seedCore } from "./seed.core";
import { seedDemo } from "./seed.demo";

const prisma = new PrismaClient();

async function main() {
  const isProd = process.env.NODE_ENV === "production";
  if (isProd) {
    console.log("🚀 تشغيل التهيئة الأساسية في بيئة الإنتاج...");
    await seedCore(prisma);
  } else {
    console.log("💻 تشغيل التهيئة الكاملة والتفريغ في بيئة التطوير...");
    await seedDemo();
  }
}

main()
  .catch((e) => {
    console.error("❌ خطأ في التهيئة العامة للـ Seed wrapper:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
