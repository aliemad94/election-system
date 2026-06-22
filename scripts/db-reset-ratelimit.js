const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const deleted = await prisma.rateLimit.deleteMany();
    console.log(`Cleared RateLimit table: ${deleted.count} records removed.`);
  } catch (err) {
    console.error("Error clearing rate limits:", err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
