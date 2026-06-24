import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 بدء تهيئة قاعدة البيانات (PostgreSQL)...');

  const adminPassword = process.env.ADMIN_PASSWORD || "Admin12345!";
  const userPassword = process.env.USER_PASSWORD || "User12345!";

  if (!adminPassword || adminPassword.length < 8) {
    console.error('❌ ADMIN_PASSWORD must be set and at least 8 characters long');
    process.exit(1);
  }

  if (!userPassword || userPassword.length < 8) {
    console.error('❌ USER_PASSWORD must be set and at least 8 characters long');
    process.exit(1);
  }

  // Use upsert - non-destructive, won't wipe existing data
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
}

main()
  .catch((e) => {
    console.error('❌ خطأ في تهيئة قاعدة البيانات:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

