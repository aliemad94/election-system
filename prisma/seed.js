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
  
  console.log('🧹 تنظيف البيانات الوهمية القديمة...');
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
  console.log('✅ تم تنظيف كافة البيانات العالقة بنجاح.');

  // 1. قراءة كلمات المرور من متغيرات البيئة إلزامياً (بدل fallback صامت لقيم معروفة للعامة).
  // يتطابق هذا مع آلية start.sh في Docker التي تخرج بـ FATAL عند غياب المتغيرات،
  // ويُغلق الثغرة التي كانت تُنشئ حساب ADMIN بكلمة سر عامة عند أي خطأ تهيئة في الإنتاج.
  // الاستثناء الوحيد: التطوير المحلي عبر opt-in صريح (ALLOW_INSECURE_SEED_DEFAULTS=true).
  const allowInsecureDefaults = process.env.ALLOW_INSECURE_SEED_DEFAULTS === 'true';

  // حاجز أمان وقت التشغيل: لا يُسمح بكلمات المرور الافتراضية في الإنتاج إطلاقاً.
  // حتى لو تسرّب ALLOW_INSECURE_SEED_DEFAULTS=true إلى بيئة الإنتاج، يُحجَز هنا
  // (تماثلاً مع حماية BYPASS_AUTH في middleware.ts —Failure E من premortem).
  if (allowInsecureDefaults && process.env.NODE_ENV === 'production') {
    console.error('❌ FATAL: ALLOW_INSECURE_SEED_DEFAULTS=true غير مسموح به في الإنتاج.');
    console.error('   اضبط ADMIN_PASSWORD و USER_PASSWORD صراحةً في متغيرات البيئة.');
    process.exit(1);
  }

  if (!process.env.ADMIN_PASSWORD && !allowInsecureDefaults) {
    console.error('❌ FATAL: متغير البيئة ADMIN_PASSWORD مطلوب لتشغيل البذور.');
    console.error('   اضبطه في .env (للتطوير المحلي يمكن استخدام ALLOW_INSECURE_SEED_DEFAULTS=true).');
    process.exit(1);
  }
  if (!process.env.USER_PASSWORD && !allowInsecureDefaults) {
    console.error('❌ FATAL: متغير البيئة USER_PASSWORD مطلوب لتشغيل البذور.');
    console.error('   اضبطه في .env (للتطوير المحلي يمكن استخدام ALLOW_INSECURE_SEED_DEFAULTS=true).');
    process.exit(1);
  }

  // قيم هروب للتطوير المحلي فقط — لا تُستخدم أبداً عند allowInsecureDefaults=false
  const adminPassword = process.env.ADMIN_PASSWORD || (allowInsecureDefaults ? 'dev-admin-change-me' : undefined);
  const userPassword = process.env.USER_PASSWORD || (allowInsecureDefaults ? 'dev-user-change-me' : undefined);

  if (allowInsecureDefaults) {
    console.warn('⚠️  تحذير: يتم استخدام كلمات مرور افتراضية للتطوير المحلي (ALLOW_INSECURE_SEED_DEFAULTS=true).');
    console.warn('   لا تستخدم هذا الوضع في الإنتاج إطلاقاً.');
  }

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
  const visitorAccessHash = await bcrypt.hash(userPassword, 12);
  const ownerAccessHash = await bcrypt.hash(adminPassword, 12);

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
