const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const users = await prisma.user.count();
    const accessControls = await prisma.accessControl.count();
    const tribes = await prisma.tribe.count();
    const subTribes = await prisma.subTribe.count();
    const electionKeys = await prisma.electionKey.count();
    const voters = await prisma.voter.count();
    const confidenceLogs = await prisma.confidenceLog.count();
    const alerts = await prisma.alert.count();
    const warnings = await prisma.earlyWarning.count();
    const dynamicInd = await prisma.dynamicIndicator.count();
    const compositeInd = await prisma.compositeIndicator.count();

    console.log("DB Counts:");
    console.log(`- Users: ${users}`);
    console.log(`- AccessControl: ${accessControls}`);
    console.log(`- Tribe: ${tribes}`);
    console.log(`- SubTribe: ${subTribes}`);
    console.log(`- ElectionKey: ${electionKeys}`);
    console.log(`- Voter: ${voters}`);
    console.log(`- ConfidenceLog: ${confidenceLogs}`);
    console.log(`- Alert: ${alerts}`);
    console.log(`- EarlyWarning: ${warnings}`);
    console.log(`- DynamicIndicator: ${dynamicInd}`);
    console.log(`- CompositeIndicator: ${compositeInd}`);
  } catch (err) {
    console.error("Error in check script:", err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
