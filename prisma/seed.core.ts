import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function seedCore(tx: any = prisma) {
  console.log("🌱 بدء تهيئة قاعدة البيانات الأساسية (seed.core.ts)...");

  const adminPassword = process.env.ADMIN_PASSWORD || "YOUR_ADMIN_PASSWORD";
  const userPassword = process.env.USER_PASSWORD || "YOUR_USER_PASSWORD";

  if (!adminPassword || adminPassword.length < 8) {
    console.error("❌ ADMIN_PASSWORD يجب أن تكون 8 أحرف على الأقل");
    throw new Error("ADMIN_PASSWORD must be at least 8 characters");
  }
  if (!userPassword || userPassword.length < 8) {
    console.error("❌ USER_PASSWORD يجب أن تكون 8 أحرف على الأقل");
    throw new Error("USER_PASSWORD must be at least 8 characters");
  }

  const adminHash = await bcrypt.hash(adminPassword, 12);
  const observerHash = await bcrypt.hash(userPassword, 12);
  const keyUserHash = await bcrypt.hash(userPassword, 12);

  await tx.user.upsert({
    where: { username: "admin" },
    update: { password: adminHash, mustChangePwd: false },
    create: {
      username: "admin",
      password: adminHash,
      role: "ADMIN",
      mustChangePwd: false,
    },
  });

  await tx.user.upsert({
    where: { username: "observer" },
    update: { password: observerHash, mustChangePwd: false },
    create: {
      username: "observer",
      password: observerHash,
      role: "OBSERVER",
      mustChangePwd: false,
    },
  });

  await tx.user.upsert({
    where: { username: "key_user" },
    update: { password: keyUserHash, mustChangePwd: false },
    create: {
      username: "key_user",
      password: keyUserHash,
      role: "KEY_USER",
      mustChangePwd: false,
    },
  });

  console.log("✅ تم إنشاء/تحديث المستخدمين الثلاثة: admin / observer / key_user");

  await tx.systemConfig.upsert({
    where: { id: "system" },
    update: {},
    create: { id: "system", enabled: true },
  });

  console.log("✅ تم تهيئة إعدادات النظام الأساسية.");
}

// تشغيل مباشر إذا تم استدعاؤه كـ Script رئيسي
if (require.main === module) {
  seedCore()
    .catch((e) => {
      console.error("❌ خطأ في التهيئة الأساسية:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
