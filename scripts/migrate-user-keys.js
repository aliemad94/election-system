const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  console.log("⚡ بدء هجرة ربط المستخدمين بالمفاتيح الانتخابية...");
  
  const keyUsers = await prisma.user.findMany({
    where: {
      role: "KEY_USER",
    },
  });

  let migratedCount = 0;
  for (const user of keyUsers) {
    if (user.electionKeyId) {
      console.log(`⏭️ المستخدم ${user.username} مرتبط بالفعل بمفتاح ID: ${user.electionKeyId}`);
      continue;
    }

    // ابحث عن مفتاح هاتف يطابق اسم المستخدم
    const keys = await prisma.electionKey.findMany({
      where: {
        phone: user.username,
      },
    });

    if (keys.length === 1) {
      const key = keys[0];
      await prisma.user.update({
        where: { id: user.id },
        data: { electionKeyId: key.id },
      });
      console.log(`✅ تم ربط المستخدم ${user.username} بالمفتاح ${key.firstName} ${key.fatherName}`);
      migratedCount++;
    } else if (keys.length > 1) {
      console.warn(`⚠ تعارض: وجد أكثر من تطابق للمستخدم ${user.username}، لن يتم التخمين تلقائياً.`);
    } else {
      console.log(`ℹ لم يعثر على مفتاح هاتف يطابق اسم المستخدم ${user.username}`);
    }
  }

  console.log(`🏁 اكتملت الهجرة. تم ربط ${migratedCount} مستخدمين.`);
}

run()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
