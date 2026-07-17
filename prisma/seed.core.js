const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function seedCore(tx = prisma) {
  console.log("🌱 بدء تهيئة قاعدة البيانات الأساسية (seed.core.js)...");

  const adminPassword = process.env.ADMIN_PASSWORD || "DhiQarOwner2026!";
  const userPassword = process.env.USER_PASSWORD || "DhiQarUser2026!";

  if (!adminPassword || adminPassword.length < 8) {
    console.error("❌ ADMIN_PASSWORD يجب أن تكون 8 أحرف على الأقل");
    throw new Error("ADMIN_PASSWORD must be at least 8 characters");
  }
  if (!userPassword || userPassword.length < 8) {
    console.error("❌ USER_PASSWORD يجب أن تكون 8 أحرف على الأقل");
    throw new Error("USER_PASSWORD must be at least 8 characters");
  }

  // ====================================================================
  // إصلاح حرج: لا نعيد كلمات المرور إذا المستخدمين موجودين مسبقاً.
  // الـ upsert القديم كان يعيد password عند كل deploy مما يكسر
  // أي كلمة مرور تم تغييرها يدوياً بعد النشر.
  // ====================================================================

  const adminHash = await bcrypt.hash(adminPassword, 12);
  const observerHash = await bcrypt.hash(userPassword, 12);
  const keyUserHash = await bcrypt.hash(userPassword, 12);

  // التحقق من وجود المستخدمين قبل الإنشاء
  const existingAdmin = await tx.user.findUnique({ where: { username: "admin" } });
  const existingObserver = await tx.user.findUnique({ where: { username: "observer" } });
  const existingKeyUser = await tx.user.findUnique({ where: { username: "key_user" } });

  if (!existingAdmin) {
    await tx.user.create({
      data: {
        username: "admin",
        password: adminHash,
        role: "ADMIN",
        mustChangePwd: false,
      },
    });
    console.log("✅ تم إنشاء مستخدم admin جديد");
  } else {
    console.log("⏭️ مستخدم admin موجود — لم تُعدّل كلمة المرور");
  }

  if (!existingObserver) {
    await tx.user.create({
      data: {
        username: "observer",
        password: observerHash,
        role: "OBSERVER",
        mustChangePwd: false,
      },
    });
    console.log("✅ تم إنشاء مستخدم observer جديد");
  } else {
    console.log("⏭️ مستخدم observer موجود — لم تُعدّل كلمة المرور");
  }

  if (!existingKeyUser) {
    await tx.user.create({
      data: {
        username: "key_user",
        password: keyUserHash,
        role: "KEY_USER",
        mustChangePwd: false,
      },
    });
    console.log("✅ تم إنشاء مستخدم key_user جديد");
  } else {
    console.log("⏭️ مستخدم key_user موجود — لم تُعدّل كلمة المرور");
  }

  await tx.systemConfig.upsert({
    where: { id: "system" },
    update: {},
    create: { id: "system", enabled: true },
  });

  console.log("✅ تم تهيئة إعدادات النظام الأساسية.");
}

module.exports = { seedCore };

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
