const { PrismaClient } = require("@prisma/client");
const { seedCore } = require("./seed.core");

const prisma = new PrismaClient();

async function seedDemo() {
  console.log("🌱 بدء تهيئة قاعدة بيانات التطوير الوهمية (seed.demo.js)...");

  console.log("🧹 تنظيف البيانات الوهمية القديمة بالترتيب الصحيح للعلاقات...");
  await prisma.$transaction([
    prisma.confidenceLog.deleteMany(),
    prisma.task.deleteMany(),
    prisma.alert.deleteMany(),
    prisma.earlyWarning.deleteMany(),
    prisma.dynamicIndicator.deleteMany(),
    prisma.compositeIndicator.deleteMany(),
    prisma.sentimentTrend.deleteMany(),
    prisma.sMSCampaign.deleteMany(),
    prisma.service.deleteMany(),
    prisma.volunteer.deleteMany(),
    prisma.electionResult.deleteMany(),
    prisma.voter.deleteMany(),
    prisma.electionKey.deleteMany(),
    prisma.subTribe.deleteMany(),
    prisma.tribe.deleteMany(),
    prisma.commissionData.deleteMany(),
    prisma.competitor.deleteMany(),
  ]);
  console.log("✅ تم تنظيف كافة البيانات العالقة بنجاح.");

  // تشغيل التهيئة الأساسية للمستخدمين والإعدادات
  await seedCore(prisma);

  console.log("✅ تم تهيئة قاعدة بيانات التطوير بنجاح مع تنظيف البيانات القديمة!");
}

module.exports = { seedDemo };

if (require.main === module) {
  seedDemo()
    .catch((e) => {
      console.error("❌ خطأ في تهيئة التطوير الوهمية:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
