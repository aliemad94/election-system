const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 بدء تهيئة قاعدة البيانات (JS)...');

  // Read passwords from environment variables ONLY - no hardcoded defaults
  const adminPassword = process.env.ADMIN_PASSWORD;
  const userPassword = process.env.USER_PASSWORD;

  if (!adminPassword || !userPassword) {
    throw new Error('خطأ حرج: يجب تحديد ADMIN_PASSWORD و USER_PASSWORD في متغيرات البيئة قبل تشغيل الـ seed');
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

  console.log('🌱 مسح المهام والمتطوعين القدامى لإعادة التهيئة...');
  await prisma.task.deleteMany({});
  await prisma.volunteer.deleteMany({});

  console.log('🌱 تهيئة المتطوعين والكوادر...');
  const vol1 = await prisma.volunteer.create({
    data: {
      fullName: 'علي جاسم محمد',
      phone: '07701234567',
      email: 'ali.jassim@example.com',
      role: 'FIELD_AGENT',
      district: 'الناصرية',
      area: 'الشرقية',
      notes: 'مندوب نشط ذو علاقات واسعة',
      efficiencyScore: 95,
      totalAssignedTasks: 2,
      totalCompletedTasks: 1,
    }
  });

  const vol2 = await prisma.volunteer.create({
    data: {
      fullName: 'فاطمة أحمد حسن',
      phone: '07809876543',
      email: 'fatima.ahmed@example.com',
      role: 'COORDINATOR',
      district: 'الشطرة',
      area: 'المركز',
      notes: 'منسقة متميزة في إدارة الكوادر النسوية',
      efficiencyScore: 88,
      totalAssignedTasks: 1,
      totalCompletedTasks: 1,
    }
  });

  console.log('🌱 تهيئة المهام الميدانية...');
  const firstVoter = await prisma.voter.findFirst();

  await prisma.task.createMany({
    data: [
      {
        title: 'متابعة عائلة آل حسن في الناصرية',
        description: 'التواصل مع الوجيه أبو علي وتأكيد دعمهم الانتخابي وحل مشكلة بطاقاتهم',
        priority: 'URGENT',
        status: 'IN_PROGRESS',
        taskType: 'FIELD',
        district: 'الناصرية',
        impactEstimate: '20-30 صوت',
        targetVoterId: firstVoter ? firstVoter.id : null,
        assignedToId: vol1.id,
      },
      {
        title: 'توزيع المنشورات الانتخابية في الشطرة',
        description: 'توزيع البوسترات والبرنامج الانتخابي في السوق المركزي',
        priority: 'NORMAL',
        status: 'COMPLETED',
        taskType: 'FIELD',
        district: 'الشطرة',
        impactEstimate: 'تأثير عام',
        targetVoterId: null,
        assignedToId: vol2.id,
      },
      {
        title: 'حل مشكلة خدمات زقاق 14',
        description: 'متابعة طلب بلدية لتبليط زقاق 14 لضمان كسب 15 ناخب متردد',
        priority: 'HIGH',
        status: 'PENDING',
        taskType: 'FIELD',
        district: 'الناصرية',
        impactEstimate: '15 صوت',
        targetVoterId: null,
        assignedToId: vol1.id,
      }
    ]
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
