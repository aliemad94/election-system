const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.electionKey.findMany({
  select: {
    id: true,
    firstName: true,
    fatherName: true,
    phone: true,
    profession: true,
    education: true,
    district: true,
    pollingCenter: true,
    supportedVotes: true,
    neutralVotes: true,
    weakVotes: true,
    netVotes: true,
    loyaltyScore: true,
    influenceLevel: true,
    mobilizationCap: true,
  },
  orderBy: { createdAt: 'asc' }
}).then(d => {
  console.log(JSON.stringify(d, null, 2));
  p.$disconnect();
});
