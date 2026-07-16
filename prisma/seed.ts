// ====================================================================
// Seed — تهيئة قاعدة البيانات الأولية
// 3 مستخدمين (admin/observer/key_user) + 21 قضاءً في ذي قار
// ====================================================================

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// أقضية محافظة ذي قار الـ21 (بيانات مرجعية ثابتة)
const DHIQAR_DISTRICTS = [
  "الناصرية",
  "الشطرة",
  "سوق الشيوخ",
  "الرفاعي",
  "الجبايش",
  "قلعة سكر",
  "الغراف",
  "النصر",
  "الفجر",
  "الفهود",
  "البطحاء",
  "سيد دخيل",
  "الإصلاح",
  "الدواية",
  "الفضلية",
  "العكيكة",
  "الطار",
  "كرمة بني سعيد",
  "أور",
  "المنار",
  "الحمار",
] as const;

// عشائر مرجعية رئيسية في ذي قار (للربط الجغرافي)
const REFERENCE_TRIBES = [
  "آل شمارة",
  "بني خالد",
  "الخزاعل",
  "بني ركاب",
  "آل ياسين",
  "السعدون",
  "بني زريج",
  "العوائد",
  "الصريّفين",
  "بني تميم",
] as const;

async function main() {
  console.log("🌱 بدء تهيئة قاعدة البيانات (Electoral Machine)...");

  console.log("🧹 تنظيف البيانات الوهمية القديمة...");
  await prisma.$transaction([
    prisma.confidenceLog.deleteMany(),
    prisma.earlyWarning.deleteMany(),
    prisma.dynamicIndicator.deleteMany(),
    prisma.compositeIndicator.deleteMany(),
    prisma.sMSCampaign.deleteMany(),
    prisma.alert.deleteMany(),
    prisma.service.deleteMany(),
    prisma.task.deleteMany(),
    prisma.sentimentTrend.deleteMany(),
    prisma.voter.deleteMany(),
    prisma.electionKey.deleteMany(),
    prisma.electionResult.deleteMany(),
    prisma.tribe.deleteMany(),
    prisma.subTribe.deleteMany(),
    prisma.commissionData.deleteMany(),
    prisma.competitor.deleteMany(),
    prisma.volunteer.deleteMany(),
  ]);
  console.log("✅ تم تنظيف كافة البيانات العالقة بنجاح.");

  // ---- 1. التحقق من متغيرات البيئة ----
  const adminPassword = process.env.ADMIN_PASSWORD || "DhiQarOwner2026!";
  const userPassword = process.env.USER_PASSWORD || "DhiQarUser2026!";

  if (!adminPassword || adminPassword.length < 8) {
    console.error("❌ ADMIN_PASSWORD يجب أن تكون 8 أحرف على الأقل");
    process.exit(1);
  }
  if (!userPassword || userPassword.length < 8) {
    console.error("❌ USER_PASSWORD يجب أن تكون 8 أحرف على الأقل");
    process.exit(1);
  }

  // ---- 2. إنشاء المستخدمين (upsert — غير هدّام) ----
  const adminHash = await bcrypt.hash(adminPassword, 12);
  const observerHash = await bcrypt.hash(userPassword, 12);
  const keyUserHash = await bcrypt.hash(userPassword, 12);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: { mustChangePwd: false },
    create: {
      username: "admin",
      password: adminHash,
      role: "ADMIN",
      mustChangePwd: false,
    },
  });

  await prisma.user.upsert({
    where: { username: "observer" },
    update: { mustChangePwd: false },
    create: {
      username: "observer",
      password: observerHash,
      role: "OBSERVER",
      mustChangePwd: false,
    },
  });

  await prisma.user.upsert({
    where: { username: "key_user" },
    update: { mustChangePwd: false },
    create: {
      username: "key_user",
      password: keyUserHash,
      role: "KEY_USER",
      mustChangePwd: false,
    },
  });

  console.log("✅ تم إنشاء 3 مستخدمين: admin / observer / key_user");

  await prisma.systemConfig.upsert({
    where: { id: 'system' },
    update: {},
    create: { id: 'system', enabled: true },
  });

  console.log("✅ تم تهيئة قاعدة البيانات بنجاح بدون بيانات وهمية!");
}

main()
  .catch((e) => {
    console.error("❌ خطأ في التهيئة:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
