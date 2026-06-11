import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 بدء تهيئة قاعدة البيانات...');

  // Read passwords from environment variables ONLY - no hardcoded defaults
  const adminPassword = process.env.ADMIN_PASSWORD;
  const userPassword = process.env.USER_PASSWORD;

  if (!adminPassword || adminPassword.length < 8) {
    console.error('❌ ADMIN_PASSWORD must be set and at least 8 characters long');
    console.error('   Set it via: export ADMIN_PASSWORD="your-secure-password"');
    process.exit(1);
  }

  if (!userPassword || userPassword.length < 8) {
    console.error('❌ USER_PASSWORD must be set and at least 8 characters long');
    console.error('   Set it via: export USER_PASSWORD="your-secure-password"');
    process.exit(1);
  }

  // Create/Update admin user with mustChangePwd flag
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: await bcrypt.hash(adminPassword, 12),
      role: 'ADMIN',
      mustChangePwd: true,
    },
  });

  // Create/Update observer user
  await prisma.user.upsert({
    where: { username: 'observer' },
    update: {},
    create: {
      username: 'observer',
      password: await bcrypt.hash(userPassword, 12),
      role: 'OBSERVER',
      mustChangePwd: true,
    },
  });

  // Create/Update key_user
  await prisma.user.upsert({
    where: { username: 'key_user' },
    update: {},
    create: {
      username: 'key_user',
      password: await bcrypt.hash(userPassword, 12),
      role: 'KEY_USER',
      mustChangePwd: true,
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
