const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 بدء تهيئة قاعدة البيانات (JS)...');

  // Read passwords from environment variables ONLY - no hardcoded defaults
  const adminPassword = process.env.ADMIN_PASSWORD;
  const userPassword = process.env.USER_PASSWORD;

  if (!adminPassword || adminPassword.length < 8) {
    throw new Error('❌ خطأ: يجب ضبط متغير البيئة ADMIN_PASSWORD بكلمة مرور لا تقل عن 8 أحرف');
  }
  if (!userPassword || userPassword.length < 8) {
    throw new Error('❌ خطأ: يجب ضبط متغير البيئة USER_PASSWORD بكلمة مرور لا تقل عن 8 أحرف');
  }

  // Create/Update admin user with mustChangePwd flag
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: { mustChangePwd: false },
    create: {
      username: 'admin',
      password: await bcrypt.hash(adminPassword, 12),
      role: 'ADMIN',
      mustChangePwd: false,
    },
  });

  // Create/Update observer user
  await prisma.user.upsert({
    where: { username: 'observer' },
    update: { mustChangePwd: false },
    create: {
      username: 'observer',
      password: await bcrypt.hash(userPassword, 12),
      role: 'OBSERVER',
      mustChangePwd: false,
    },
  });

  // Create/Update key_user
  await prisma.user.upsert({
    where: { username: 'key_user' },
    update: { mustChangePwd: false },
    create: {
      username: 'key_user',
      password: await bcrypt.hash(userPassword, 12),
      role: 'KEY_USER',
      mustChangePwd: false,
    },
  });

  console.log('✅ تم تهيئة قاعدة البيانات بنجاح!');
  console.log('⚠️  جميع المستخدمين مطالبون بتغيير كلمة المرور عند أول دخول');
}

main()
  .catch((e) => {
    console.error('❌ خطأ في تهيئة قاعدة البيانات:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

