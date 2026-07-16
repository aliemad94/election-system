const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🧹 بدء تنظيف العشائر والبيانات الوهمية العالقة...");

  try {
    // 1. مسح القبائل الفرعية والعشائر بالكامل
    const subTribesCount = await prisma.subTribe.deleteMany();
    console.log(`✅ تم حذف ${subTribesCount.count} قبيلة فرعية.`);

    const tribesCount = await prisma.tribe.deleteMany();
    console.log(`✅ تم حذف ${tribesCount.count} عشيرة.`);

    // 2. التحقق من خلو جدول الناخبين والمفاتيح (اختياري، كإجراء تنظيف أمان)
    const votersCount = await prisma.voter.count();
    const keysCount = await prisma.electionKey.count();
    
    console.log(`📊 الحالة الحالية لقاعدة البيانات:`);
    console.log(`   - العشائر المتبقية: 0`);
    console.log(`   - الناخبون المسجلون: ${votersCount}`);
    console.log(`   - المفاتيح الانتخابية: ${keysCount}`);

    console.log("✨ تم تنظيف كافة البيانات الوهمية العالقة في إدارة العشائر بنجاح كامل!");
  } catch (error) {
    console.error("❌ حدث خطأ أثناء عملية التنظيف:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
