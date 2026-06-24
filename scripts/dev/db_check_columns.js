const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Voter' OR table_name = 'voter';
    `;
    console.log("Voter columns in DB:", columns);
  } catch (err) {
    console.error("Error checking columns:", err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
