import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 بدء تهيئة قاعدة البيانات بالقبائل والناخبين...');

  const tribesCount = 10;
  const votersPerTribe = 100;

  for (let i = 1; i <= tribesCount; i++) {
    // Check if tribe exists
    let tribe = await prisma.tribe.findUnique({
      where: { id: `tribe_${i}` },
    });

    if (!tribe) {
      tribe = await prisma.tribe.create({
        data: {
          id: `tribe_${i}`,
          name: `قبيلة ${i}`,
        },
      });
    }

    for (let j = 0; j < votersPerTribe; j++) {
      const idx = (i - 1) * votersPerTribe + j;
      const voterId = `voter_${idx}`;
      
      const existingVoter = await prisma.voter.findUnique({
        where: { id: voterId },
      });

      if (!existingVoter) {
        await prisma.voter.create({
          data: {
            id: voterId,
            name: `ناخب ${idx}`,
            nationalId: `NAT-${100000 + idx}`,
            phone: `0770${100000 + idx}`,
            tribeId: tribe.id,
            checkedIn: false,
          },
        });
      }
    }
  }

  console.log('✅ تم تهيئة قاعدة البيانات بنجاح!');
}

main()
  .catch((e) => {
    console.error('❌ خطأ في تهيئة قاعدة البيانات:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
