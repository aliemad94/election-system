import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 بدء تهيئة قاعدة البيانات بالبيانات الجديدة (عند الحاجة)...');

  // تحقق مما إذا كان هناك أي مستخدم بالفعل
  const existingUsersCount = await prisma.user.count();
  if (existingUsersCount > 0) {
    console.log('⚠️ قاعدة البيانات تحتوي بالفعل على مستخدمين. تم تخطي التهيئة لتجنب الكتابة فوق البيانات.');
    return;
  }

  // 2. إنشاء المستخدمين
  console.log('👤 إنشاء مستخدمي النظام الأساسيين للتجريب...');
  const adminPassword = await bcrypt.hash('admin2024', 10);
  const userPassword = await bcrypt.hash('election2024', 10);

  // مدير النظام
  await prisma.user.create({
    data: {
      username: 'admin',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // مراقب
  await prisma.user.create({
    data: {
      username: 'observer',
      password: userPassword,
      role: 'OBSERVER',
    },
  });

  // مندوب / مفتاح انتخابي
  await prisma.user.create({
    data: {
      username: 'key_user',
      password: userPassword,
      role: 'KEY_USER',
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

