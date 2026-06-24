const { PrismaClient } = require('@prisma/client');

async function main() {
  const p = new PrismaClient();
  
  console.log('=== RateLimits ===');
  const rl = await p.rateLimit.findMany();
  for (const r of rl) {
    console.log(`key: ${r.key} | count: ${r.count} | blockedUntil: ${r.blockedUntil} | lastAttempt: ${r.lastAttemptAt}`);
  }
  
  // Reset all rate limits
  if (rl.length > 0) {
    await p.rateLimit.deleteMany();
    console.log('All rate limits cleared!');
  }
  
  // Set mustChangePwd to false for admin
  await p.user.update({ where: { username: 'admin' }, data: { mustChangePwd: false } });
  await p.user.update({ where: { username: 'observer' }, data: { mustChangePwd: false } });
  await p.user.update({ where: { username: 'key_user' }, data: { mustChangePwd: false } });
  console.log('mustChangePwd set to false for all users');
  
  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
