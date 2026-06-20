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

  // ---- 1. التحقق من متغيرات البيئة ----
  const adminPassword = process.env.ADMIN_PASSWORD;
  const userPassword = process.env.USER_PASSWORD;

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
    update: {},
    create: {
      username: "admin",
      password: adminHash,
      role: "ADMIN",
      mustChangePwd: false,
    },
  });

  await prisma.user.upsert({
    where: { username: "observer" },
    update: {},
    create: {
      username: "observer",
      password: observerHash,
      role: "OBSERVER",
      mustChangePwd: false,
    },
  });

  await prisma.user.upsert({
    where: { username: "key_user" },
    update: {},
    create: {
      username: "key_user",
      password: keyUserHash,
      role: "KEY_USER",
      mustChangePwd: false,
    },
  });

  console.log("✅ تم إنشاء 3 مستخدمين: admin / observer / key_user");

  // ---- 3. إنشاء العشائر المرجعية ----
  for (const tribeName of REFERENCE_TRIBES) {
    await prisma.tribe.upsert({
      where: { name: tribeName },
      update: {},
      create: {
        name: tribeName,
        description: `عشيرة ${tribeName} — من عشائر محافظة ذي قار`,
      },
    });
  }
  console.log(`✅ تم إنشاء/تأكيد ${REFERENCE_TRIBES.length} عشيرة مرجعية`);

  // ---- 4. بيانات المفوضية المرجعية لأقضية ذي قار ----
  // (سجلات مبدئية لكل قضاء بمركز اقتراع افتراضي لتغذية محركات GSI/EDRI)
  const existingCommission = await prisma.commissionData.count();
  if (existingCommission === 0) {
    for (const district of DHIQAR_DISTRICTS) {
      // 3 مراكز اقتراع افتراضية لكل قضاء
      for (let center = 1; center <= 3; center++) {
        for (let station = 1; station <= 2; station++) {
          await prisma.commissionData.create({
            data: {
              province: "ذي قار",
              district,
              subDistrict: `${district} - القطاع ${center}`,
              pollingCenter: `${district}-${center}`,
              ballotStation: `${district}-${center}-${station}`,
              registeredVoters: 800 + Math.floor(Math.random() * 600),
              historicalTurnout: 0.55 + Math.random() * 0.2,
              expectedTurnout: 0.6,
            },
          });
        }
      }
    }
    console.log(
      `✅ تم إنشاء ${DHIQAR_DISTRICTS.length * 6} سجل مفوضية لأقضية ذي قار`
    );
  } else {
    console.log(`ℹ️  بيانات المفوضية موجودة مسبقاً (${existingCommission} سجل)`);
  }

  // ---- 5. منافسون مرجعيون ----
  const existingCompetitors = await prisma.competitor.count();
  if (existingCompetitors === 0) {
    const refCompetitors = [
      { name: "القائمة المستقلة", party: "مستقل", tribe: "متعدد", baseDistrict: "الناصرية", estimatedVotes: 8500, strengthLevel: 3 },
      { name: "ائتلاف العشائر", party: "ائتلافي", tribe: "متعدد", baseDistrict: "الشطرة", estimatedVotes: 6200, strengthLevel: 3 },
      { name: "حركة الإصلاح", party: "حركة", tribe: "متعدد", baseDistrict: "سوق الشيوخ", estimatedVotes: 5400, strengthLevel: 2 },
      { name: "تجمع الكفاءات", party: "تجمع", tribe: "متعدد", baseDistrict: "الرفاعي", estimatedVotes: 4100, strengthLevel: 2 },
    ];
    for (const c of refCompetitors) {
      await prisma.competitor.create({ data: c });
    }
    console.log(`✅ تم إنشاء ${refCompetitors.length} منافس مرجعي`);
  }

  console.log("\n📊 ملخص الحسابات الافتراضية:");
  console.log("   admin     → ADMIN     (تغيير كلمة المرور غير مطلوب)");
  console.log("   observer  → OBSERVER  (قراءة فقط)");
  console.log("   key_user  → KEY_USER  (إدارة مفاتيح)");
  console.log("\n✅ اكتملت التهيئة بنجاح!");
}

main()
  .catch((e) => {
    console.error("❌ خطأ في التهيئة:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
