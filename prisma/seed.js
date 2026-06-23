const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

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
];

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
];

async function main() {
  console.log('🌱 بدء تهيئة قاعدة البيانات الشاملة (JS)...');

  // 1. قراءة وإعداد كلمات المرور الافتراضية
  const adminPassword = process.env.ADMIN_PASSWORD || "DqAdmin2024!Owner";
  const userPassword = process.env.USER_PASSWORD || "DqElection2024!Secure";

  console.log('👤 تهيئة المستخدمين...');
  // إنشاء/تحديث مستخدم المدير (admin)
  const adminHash = await bcrypt.hash(adminPassword, 12);
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: { password: adminHash },
    create: {
      username: 'admin',
      password: adminHash,
      role: 'ADMIN',
      mustChangePwd: false,
    },
  });

  // إنشاء/تحديث مستخدم المراقب (observer)
  const observerHash = await bcrypt.hash(userPassword, 12);
  await prisma.user.upsert({
    where: { username: 'observer' },
    update: { password: observerHash },
    create: {
      username: 'observer',
      password: observerHash,
      role: 'OBSERVER',
      mustChangePwd: false,
    },
  });

  // إنشاء/تحديث مستخدم إدارة المفاتيح (key_user)
  await prisma.user.upsert({
    where: { username: 'key_user' },
    update: { password: observerHash },
    create: {
      username: 'key_user',
      password: observerHash,
      role: 'KEY_USER',
      mustChangePwd: false,
    },
  });

  console.log('🔒 تهيئة سجلات التحكم بالوصول (AccessControl)...');
  const visitorAccessHash = await bcrypt.hash("DqElection2024!Secure", 12);
  const ownerAccessHash = await bcrypt.hash("DqAdmin2024!Owner", 12);

  await prisma.accessControl.upsert({
    where: { label: 'زائر' },
    update: { password: visitorAccessHash, isActive: true },
    create: {
      label: 'زائر',
      password: visitorAccessHash,
      isActive: true,
    },
  });

  await prisma.accessControl.upsert({
    where: { label: 'مالك' },
    update: { password: ownerAccessHash, isActive: true },
    create: {
      label: 'مالك',
      password: ownerAccessHash,
      isActive: true,
    },
  });

  await prisma.systemConfig.upsert({
    where: { id: 'system' },
    update: {},
    create: { id: 'system', enabled: true },
  });

  // تهيئة البيانات المرجعية للمحافظة (Read-Only)
  console.log('📊 تهيئة البيانات المرجعية لمحافظة ذي قار...');
  await prisma.provinceReference.upsert({
    where: { province: 'ذي قار' },
    update: {},
    create: {
      province: 'ذي قار',
      totalRegisteredVoters: 1099438,
      totalActualVoters: 538390,
      generalTurnout: 48.97,
      maleVoters: 322970,
      femaleVoters: 215420,
      pollingCentersCount: 527,
      ballotStationsCount: 2212,
    },
  });

  console.log('✅ تم تهيئة قاعدة البيانات بنجاح بدون بيانات وهمية!');
}

main()
  .catch((e) => {
    console.error('❌ خطأ في تهيئة قاعدة البيانات:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
