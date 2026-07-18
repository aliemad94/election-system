const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 بدء تدوير كلمات المرور وإبطال الجلسات الحالية للإنتاج...");
  
  const adminPassword = process.env.ADMIN_PASSWORD;
  const userPassword = process.env.USER_PASSWORD;

  if (!adminPassword || adminPassword.length < 8) {
    throw new Error("ADMIN_PASSWORD environment variable is required and must be at least 8 characters long.");
  }
  if (!userPassword || userPassword.length < 8) {
    throw new Error("USER_PASSWORD environment variable is required and must be at least 8 characters long.");
  }

  const adminHash = await bcrypt.hash(adminPassword, 12);
  const observerHash = await bcrypt.hash(userPassword, 12);
  const keyUserHash = await bcrypt.hash(userPassword, 12);

  const now = new Date();

  // تحديث كلمات المرور وإبطال الجلسات
  const updatedAdmin = await prisma.user.updateMany({
    where: { username: "admin" },
    data: { password: adminHash, tokenIssuedBefore: now }
  });
  console.log(`✅ تم تحديث كلمة مرور admin وإبطال جلساته. (الصفوف المتأثرة: ${updatedAdmin.count})`);

  const updatedObserver = await prisma.user.updateMany({
    where: { username: "observer" },
    data: { password: observerHash, tokenIssuedBefore: now }
  });
  console.log(`✅ تم تحديث كلمة مرور observer وإبطال جلساته. (الصفوف المتأثرة: ${updatedObserver.count})`);

  const updatedKeyUser = await prisma.user.updateMany({
    where: { username: "key_user" },
    data: { password: keyUserHash, tokenIssuedBefore: now }
  });
  console.log(`✅ تم تحديث كلمة مرور key_user وإبطال جلساته. (الصفوف المتأثرة: ${updatedKeyUser.count})`);

  console.log("🎉 اكتمل تدوير كلمات المرور وإبطال الجلسات بنجاح!");
}

main()
  .catch(e => {
    console.error("❌ فشل تدوير كلمات المرور:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
