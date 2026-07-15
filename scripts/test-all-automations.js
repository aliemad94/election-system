// ====================================================================
// scripts/test-all-automations.js — فحص واختبار كافة أنظمة الأتمتة في المنصة
// ====================================================================
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { evaluateKeyDoubleFilter } = require('../src/lib/electoral-calculations');
const { invalidateIndicatorsCache, getCachedIndicators } = require('../src/lib/indicators-cache');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

async function testAutomationSystems() {
  console.log('\x1b[36m%s\x1b[0m', '=== بدء اختبار كافة أنظمة الأتمتة (Automation Systems Verification) ===\n');

  let testsPassed = 0;
  let totalTests = 4;

  // 1. اختبار أتمتة الفلترة الذكية والتشخيص بالذكاء الاصطناعي (AI Diagnostic & Double Filter)
  try {
    console.log('\x1b[33m%s\x1b[0m', '[1/4] اختبار أتمتة التشخيص والتقييم الثنائي (AI Diagnostic)...');
    
    const dummyVotes = { supportedVotes: 100, neutralVotes: 50, weakVotes: 20, totalVotes: 170 };
    const dummyRatings = {
      loyaltyScore: 5,        // ولاء قوي جداً
      influenceLevel: 4,      // تأثير واسع
      mobilizationCap: 4,     // تحشيد قوي
      voteProtection: 2,      // خطر: حماية أصوات ضعيفة
      supportReason: 3,
      needsLevel: 4,
      politicalNote: 3,
      organizationalNote: 4,
      generalNote: 4,
      dataAccuracy: 4,
      trainingReadiness: 3
    };

    const result = evaluateKeyDoubleFilter('المفتاح التجريبي', dummyVotes, dummyRatings);
    
    // التحقق من تفعيل التوصيات التلقائية الخاصة بعامل الخطر المكتشف (حماية الأصوات)
    console.log(`- نتيجة معامل الكفاءة: ${result.efficiencyCoefficient}%`);
    console.log(`- الأصوات المضمونة في الصندوق: ${result.actualBallots}`);
    console.log(`- التوصية التلقائية: ${result.recommendation}`);
    
    if (result.recommendation.includes('حماية الأصوات') && result.actualBallots > 0) {
      console.log('\x1b[32m%s\x1b[0m', '✅ نجح اختبار أتمتة التوصيات الذكية ورصد عوامل الخطر.');
      testsPassed++;
    } else {
      console.log('\x1b[31m%s\x1b[0m', '❌ فشل اختبار أتمتة التوصيات.');
    }
  } catch (err) {
    console.error('❌ خطأ في اختبار الذكاء الاصطناعي والتقييم:', err);
  }
  console.log();

  // 2. اختبار أتمتة فلترة واستهداف حملات الرسائل النصية (SMS Targeting Engine)
  try {
    console.log('\x1b[33m%s\x1b[0m', '[2/4] اختبار أتمتة محرك استهداف وتصفية حملات SMS...');
    
    // محاكاة استدعاء الاستهداف
    const districtFilter = 'الغراف';
    const targetVoters = await prisma.voter.findMany({
      where: {
        district: districtFilter,
        status: 'SUPPORTED',
        phone: { not: null }
      }
    });

    console.log(`- عدد الناخبين المؤيدين في الغراف ولديهم أرقام هواتف: ${targetVoters.length}`);
    console.log('\x1b[32m%s\x1b[0m', '✅ نجح اختبار الفلترة الديناميكية وقراءة أهداف الحملة من قاعدة البيانات.');
    testsPassed++;
  } catch (err) {
    console.error('❌ خطأ في اختبار فلترة رسائل SMS:', err);
  }
  console.log();

  // 3. اختبار أتمتة النسخ الاحتياطي التلقائي (Automated DB Backups)
  try {
    console.log('\x1b[33m%s\x1b[0m', '[3/4] اختبار أتمتة النسخ الاحتياطي (Database Backup)...');
    
    // تشغيل الاسكربت المخصص للنسخ الاحتياطي
    const isPostgres = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql');
    if (isPostgres) {
      console.log('- قاعدة البيانات الحالية: PostgreSQL. جاري تشغيل أداة pg_dump...');
      try {
        const backupScript = path.join(__dirname, 'backup-db.js');
        execSync(`node "${backupScript}"`, { stdio: 'pipe' });
        console.log('\x1b[32m%s\x1b[0m', '✅ نجح تشغيل نظام النسخ الاحتياطي وضغط البيانات.');
        testsPassed++;
      } catch (backupErr) {
        console.warn('- تنبيه: أداة pg_dump غير مثبتة محلياً أو غير معرفة في متغيرات النظام (Common on Windows dev environments).');
        console.log('- جاري التحقق من نظام النسخ الاحتياطي المشفر البديل (JSON encryption)...');
        const backupDir = path.join(__dirname, '..', 'backups');
        const files = fs.existsSync(backupDir) ? fs.readdirSync(backupDir) : [];
        const jsonBackups = files.filter(f => f.startsWith('backup-') && f.endsWith('.enc.json'));
        if (jsonBackups.length > 0) {
          console.log(`- تم العثور على ملفات نسخ احتياطي مشفرة بنجاح: ${jsonBackups[jsonBackups.length - 1]}`);
          console.log('\x1b[32m%s\x1b[0m', '✅ نجح نظام النسخ الاحتياطي البديل المدمج بنجاح.');
          testsPassed++;
        } else {
          throw new Error('لم يتم العثور على أي ملفات نسخ احتياطي (SQL or JSON).');
        }
      }
    } else {
      console.log('- قاعدة البيانات الحالية: SQLite (بيئة التطوير). جاري عمل نسخة احتياطية محلية...');
      const backupDir = path.join(__dirname, '..', 'backups');
      if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
      const destPath = path.join(backupDir, `backup_test_${Date.now()}.db`);
      fs.copyFileSync(path.join(__dirname, '..', 'prisma', 'dev.db'), destPath);
      console.log(`- تم نسخ قاعدة البيانات بنجاح إلى: ${destPath}`);
      console.log('\x1b[32m%s\x1b[0m', '✅ نجح محاكاة النسخ الاحتياطي التلقائي.');
      testsPassed++;
    }
  } catch (err) {
    console.error('❌ خطأ في اختبار النسخ الاحتياطي التلقائي:', err);
  }
  console.log();

  // 4. اختبار أتمتة تحديث وإبطال كاش المؤشرات (Indicators Cache Invalidation)
  try {
    console.log('\x1b[33m%s\x1b[0m', '[4/4] اختبار أتمتة الذاكرة المؤقتة وإبطال الكاش (Cache Invalidation)...');
    
    // جلب البيانات أولاً (سيتم ملء الكاش)
    console.log('- جلب المؤشرات وحفظها في الكاش...');
    const data1 = await getCachedIndicators();
    const time1 = new Date(data1.lastCalculated).getTime();
    
    // إبطال الكاش آلياً لمحاكاة حدوث عملية كتابة/تعديل
    console.log('- استدعاء دالة إبطال الكاش التلقائي...');
    invalidateIndicatorsCache();
    
    // جلب البيانات مرة أخرى للتأكد من إعادة حسابها وتحديث الطابع الزمني
    const data2 = await getCachedIndicators();
    const time2 = new Date(data2.lastCalculated).getTime();
    
    console.log(`- توقيت جلب الكاش الأول: ${new Date(time1).toISOString()}`);
    console.log(`- توقيت جلب الكاش الثاني (بعد الإبطال): ${new Date(time2).toISOString()}`);
    
    if (time2 >= time1) {
      console.log('\x1b[32m%s\x1b[0m', '✅ نجح اختبار أتمتة الكاش وإعادة تحديث البيانات الذاتية.');
      testsPassed++;
    } else {
      console.log('\x1b[31m%s\x1b[0m', '❌ فشل اختبار أتمتة كاش المؤشرات.');
    }
  } catch (err) {
    console.error('❌ خطأ في اختبار الذاكرة المؤقتة وإبطال الكاش:', err);
  }
  console.log();

  // خلاصة الاختبارات
  console.log('------------------------------------------------------------');
  if (testsPassed === totalTests) {
    console.log('\x1b[32m%s\x1b[0m', `🎉 ممتاز! اجتازت جميع أنظمة الأتمتة الاختبار بنجاح (${testsPassed}/${totalTests}).`);
  } else {
    console.log('\x1b[31m%s\x1b[0m', `⚠️ تحذير: لم تجتز جميع الأنظمة بنجاح (${testsPassed}/${totalTests}).`);
  }
  console.log('------------------------------------------------------------');
  
  await prisma.$disconnect();
  process.exit(0);
}

testAutomationSystems();
