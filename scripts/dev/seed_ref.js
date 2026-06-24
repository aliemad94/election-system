const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const ref = await prisma.provinceReference.upsert({
    where: { province: 'ذي قار' },
    update: {},
    create: {
      province: 'ذي قار',
      totalRegisteredVoters: 1099438,
      districtsCount: 15,
      subDistrictsCount: 42,
      pollingCentersCount: 527,
      ballotStationsCount: 2222,
      historicalTurnout: 48.5,
      allocatedSeats: 19,
    },
  });
  console.log('Seeded:', ref.province, ref.totalRegisteredVoters);
  await prisma.$disconnect();
})();
