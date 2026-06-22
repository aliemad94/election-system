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

  console.log('🏠 تهيئة العشائر المرجعية...');
  const tribeMap = new Map();
  for (const tribeName of REFERENCE_TRIBES) {
    const dbTribe = await prisma.tribe.upsert({
      where: { name: tribeName },
      update: {},
      create: {
        name: tribeName,
        district: DHIQAR_DISTRICTS[Math.floor(Math.random() * DHIQAR_DISTRICTS.length)],
        influenceRating: 3 + Math.floor(Math.random() * 3),
        population: 5000 + Math.floor(Math.random() * 10000),
        notes: `عشيرة ${tribeName} — من العشائر الرئيسية المؤثرة في محافظة ذي قار`,
      },
    });
    tribeMap.set(tribeName, dbTribe.id);
  }

  // إضافة أفخاذ/عشائر فرعية (SubTribes)
  console.log('🌿 تهيئة العشائر الفرعية...');
  const subTribeIds = [];
  for (const tribeName of REFERENCE_TRIBES) {
    const tribeId = tribeMap.get(tribeName);
    for (let i = 1; i <= 2; i++) {
      const subTribeName = `فخذ آل ${tribeName} ${i}`;
      const subTribe = await prisma.subTribe.upsert({
        where: { name_tribeId: { name: subTribeName, tribeId } },
        update: {},
        create: {
          name: subTribeName,
          tribeId,
        },
      });
      subTribeIds.push(subTribe.id);
    }
  }

  console.log('🏛️ تهيئة بيانات المفوضية المرجعية (CommissionData)...');
  const countComm = await prisma.commissionData.count();
  if (countComm === 0) {
    for (const district of DHIQAR_DISTRICTS.slice(0, 7)) { // لأول 7 أقضية رئيسية
      for (let center = 1; center <= 3; center++) {
        for (let station = 1; station <= 2; station++) {
          await prisma.commissionData.create({
            data: {
              province: "ذي قار",
              district,
              subDistrict: `ناحية ${district} المركزية`,
              pollingCenter: `مركز ${district} ${100 + center}`,
              ballotStation: `محطة ${station}`,
              registeredVoters: 700 + Math.floor(Math.random() * 500),
              historicalTurnout: 0.45 + Math.random() * 0.25,
              expectedTurnout: 0.55 + Math.random() * 0.15,
            },
          });
        }
      }
    }
  }

  console.log('👤 تهيئة المفاتيح الانتخابية (ElectionKey)...');
  const keyIds = [];
  const keyFirstNames = ["علي", "حسين", "محمد", "عباس", "أحمد", "جعفر", "سجاد", "ضياء", "مهند", "رياض"];
  const keyFatherNames = ["كريم", "جاسم", "حسن", "عجيل", "كاظم", "محسن", "راضي", "صاحب", "موسى", "حميد"];

  for (let i = 1; i <= 6; i++) {
    const keyCode = `KEY-${1000 + i}`;
    const firstName = keyFirstNames[i % keyFirstNames.length];
    const fatherName = keyFatherNames[i % keyFatherNames.length];
    const grandfatherName = "عبد الله";
    const fourthName = "الخفاجي";
    const phone = `0770${1000000 + i * 12345}`;
    const district = DHIQAR_DISTRICTS[i % 5];
    const tribeName = REFERENCE_TRIBES[i % REFERENCE_TRIBES.length];
    const tribeId = tribeMap.get(tribeName);

    // حسابات الأصوات الافتراضية
    const supported = 20 + i * 5;
    const neutral = 10 + i * 2;
    const weak = 5 + i;
    const total = supported + neutral + weak;
    // netVotes = (supported * 0.8) + (neutral * 0.5) + (weak * 0.3)
    const net = Math.round((supported * 0.8) + (neutral * 0.5) + (weak * 0.3));

    // الأبعاد التقييمية التسعة (1-5)
    const loyalty = 3 + (i % 3);
    const influence = 3 + (i % 3);
    const mobilization = 3 + (i % 3);
    const protection = 3 + (i % 3);
    const supportR = 3 + (i % 3);
    const needs = 2 + (i % 4);
    const political = 3 + (i % 3);
    const organizational = 3 + (i % 3);
    const general = 3 + (i % 3);

    // weightedScore = rawScore * (totalVotes / 50)
    const rawScore = (loyalty * 20) + (influence * 20) + (mobilization * 15) + (protection * 15) + (supportR * 10) + (needs * 5) + (political * 5) + (organizational * 5) + (general * 5);
    const weighted = Math.round((rawScore * (total / 50)) * 100) / 100;

    let classification = "مقبول";
    if (weighted < 20) classification = "ضعيف";
    else if (weighted < 50) classification = "مقبول";
    else if (weighted < 100) classification = "جيد";
    else classification = "قوي";

    const totalInvestment = 500000 + i * 100000;
    const costPerVote = net > 0 ? Math.round((totalInvestment / net) * 100) / 100 : 0;

    const dbKey = await prisma.electionKey.upsert({
      where: { phone },
      update: {},
      create: {
        keyCode,
        firstName,
        fatherName,
        grandfatherName,
        fourthName,
        gender: "ذكر",
        birthDate: new Date("1980-01-01"),
        education: "بكالوريوس",
        profession: "موظف حكومي",
        phone,
        province: "ذي قار",
        district,
        subDistrict: `صوب ${district}`,
        pollingCenter: `مركز ${district} للبنين`,
        expectedVotes: total,
        influenceLevel: influence,
        mobilizationCap: mobilization,
        loyaltyScore: loyalty,
        riskLevel: 2,
        supportedVotes: supported,
        neutralVotes: neutral,
        weakVotes: weak,
        totalVotes: total,
        netVotes: net,
        voteProtection: protection,
        supportReason: supportR,
        needsLevel: needs,
        politicalNote: political,
        organizationalNote: organizational,
        generalNote: general,
        weightedScore: weighted,
        classification,
        totalInvestment,
        costPerVote,
        tribeId,
      },
    });
    keyIds.push(dbKey.id);
  }

  console.log('🗳️ تهيئة الناخبين (Voters)...');
  const voterFirstNames = ["سعد", "ماجد", "ميثم", "جليل", "أبو بكر", "عمار", "كرار", "علي", "فاطمة", "زينب"];
  for (let idx = 0; idx < keyIds.length; idx++) {
    const keyId = keyIds[idx];
    const district = DHIQAR_DISTRICTS[idx % 5];
    const tribeName = REFERENCE_TRIBES[idx % REFERENCE_TRIBES.length];
    const tribeId = tribeMap.get(tribeName);

    for (let v = 1; v <= 4; v++) {
      const vfirstName = voterFirstNames[(idx * 4 + v) % voterFirstNames.length];
      const vphone = `0780${2000000 + idx * 1000 + v * 15}`;
      const nationalId = `NID-${10000000 + idx * 5000 + v * 7}`;

      const voter = await prisma.voter.create({
        data: {
          firstName: vfirstName,
          fatherName: "جمال",
          grandfatherName: "سلمان",
          fourthName: "العراقي",
          gender: v % 4 === 0 ? "أنثى" : "ذكر",
          birthDate: new Date("1995-05-12"),
          phone: vphone,
          nationalId,
          province: "ذي قار",
          district,
          subDistrict: `حي الحسين`,
          pollingCenter: `مدرسة دجلة المختلطة`,
          ballotStation: `${idx + 1}`,
          status: v % 3 === 0 ? "WEAK" : v % 3 === 1 ? "SUPPORTED" : "NEUTRAL",
          supportDegree: v % 3 === 1 ? 4 : 3,
          confidenceScore: 40 + (v * 12) % 60,
          keyId,
          tribeId,
        },
      });

      // إضافة سجلات الثقة الافتراضية
      await prisma.confidenceLog.create({
        data: {
          voterId: voter.id,
          oldScore: 50,
          newScore: voter.confidenceScore,
          change: voter.confidenceScore - 50,
          reason: "التقييم الأولي عند التسجيل في المنظومة الميدانية",
          changedBy: "admin",
        },
      });
    }
  }

  console.log('⚠️ تهيئة التنبيهات والإنذار المبكر (Alerts / Early Warnings)...');
  await prisma.alert.create({
    data: {
      type: "WARNING",
      title: "تراجع أداء مفتاح انتخابي",
      message: "لوحظ تراجع في معدلات تواصل المفتاح KEY-1001 مع الناخبين الموكلين إليه خلال الـ 48 ساعة الماضية",
      source: "KeyMonitor",
    },
  });

  await prisma.alert.create({
    data: {
      type: "INFO",
      title: "تهيئة النظام بنجاح",
      message: "تم تشغيل المنصة بنجاح واستيراد كافة بيانات المفوضية وأقضية ذي قار",
      source: "System",
    },
  });

  if (keyIds.length > 0) {
    await prisma.earlyWarning.create({
      data: {
        electoralKeyId: keyIds[0],
        warningType: "CONFIDENCE_DROP",
        severity: "HIGH",
        description: "انخفاض مفاجئ في معدل ثقة الناخبين المرتبطين بهذا المفتاح بمعدل 15 نقطة خلال أسبوع",
        status: "ACTIVE",
      },
    });

    await prisma.earlyWarning.create({
      data: {
        electoralKeyId: keyIds[1],
        warningType: "DEFECTION_RISK",
        severity: "CRITICAL",
        description: "مؤشرات على اتصالات خارجية وتغيير الولاء مع المفتاح الانتخابي في منطقة النشاط الميداني",
        status: "ACTIVE",
      },
    });
  }

  console.log('📈 تهيئة المؤشرات الديناميكية والمركبة للمناطق...');
  for (const district of DHIQAR_DISTRICTS.slice(0, 5)) {
    // مؤشرات ديناميكية
    await prisma.dynamicIndicator.create({
      data: {
        area: district,
        indicatorType: "MOOD",
        value: 70 + Math.floor(Math.random() * 20),
        previousValue: 65,
        trend: "UP",
      },
    });

    await prisma.dynamicIndicator.create({
      data: {
        area: district,
        indicatorType: "STABILITY",
        value: 80 + Math.floor(Math.random() * 15),
        previousValue: 82,
        trend: "STABLE",
      },
    });

    // مؤشرات مركبة (Composite Indicators)
    await prisma.compositeIndicator.create({
      data: {
        area: district,
        eii: 60 + Math.random() * 30,
        kri: 70 + Math.random() * 20,
        vps: 55 + Math.random() * 35,
        drs: 10 + Math.random() * 30,
        campaignRoi: 80 + Math.random() * 20,
        api: 50 + Math.random() * 40,
        ewli: 15 + Math.random() * 20,
        gsi: 65 + Math.random() * 25,
        edri: 75 + Math.random() * 15,
        efi: 70 + Math.random() * 25,
      },
    });
  }

  console.log('📊 تهيئة النتائج التاريخية (ElectionResult)...');
  for (const district of DHIQAR_DISTRICTS.slice(0, 3)) {
    await prisma.electionResult.create({
      data: {
        year: 2021,
        district,
        totalVotes: 35000 + Math.floor(Math.random() * 15000),
        validVotes: 32000,
        invalidVotes: 3000,
        participationRate: 0.48 + Math.random() * 0.1,
        winnerName: "قائمة العهد الجديد",
        winnerVotes: 12000,
        notes: "الانتخابات البرلمانية لعام 2021 — الدائرة الانتخابية المقابلة للقضاء",
      },
    });
  }

  console.log('✅ تم تهيئة قاعدة البيانات بنجاح تام بكافة النماذج المرجعية!');
}

main()
  .catch((e) => {
    console.error('❌ خطأ في تهيئة قاعدة البيانات:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
