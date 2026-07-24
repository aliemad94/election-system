const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const envPath = path.join(ROOT, ".env");
const envBakPath = path.join(ROOT, ".env.bak_temp");
const schemaPath = path.join(ROOT, "prisma", "schema.prisma");
const schemaBakPath = path.join(ROOT, "prisma", "schema.prisma.bak_temp");
const schemaSqlitePath = path.join(ROOT, "prisma", "schema.sqlite.prisma");

async function main() {
  console.log("🚀 بدء عملية تنظيف قاعدة البيانات المحلية لـ SQLite...");

  // 1. الاحتفاظ بنسخة احتياطية من الملفات الأصلية
  if (fs.existsSync(envPath)) {
    fs.copyFileSync(envPath, envBakPath);
  }
  if (fs.existsSync(schemaPath)) {
    fs.copyFileSync(schemaPath, schemaBakPath);
  }

  try {
    // 2. إعداد ملف البيئة المؤقت لـ SQLite
    fs.writeFileSync(envPath, 'DATABASE_URL="file:./dev.db"\n');
    console.log("✅ تم إعداد ملف البيئة المؤقت لـ SQLite.");

    // 3. نسخ مخطط SQLite مؤقتاً
    if (fs.existsSync(schemaSqlitePath)) {
      fs.copyFileSync(schemaSqlitePath, schemaPath);
      console.log("✅ تم استخدام مخطط SQLite مؤقتاً.");
    } else {
      throw new Error("ملف schema.sqlite.prisma غير موجود!");
    }

    // 4. توليد Prisma Client لـ SQLite
    console.log("⏳ توليد Prisma Client لـ SQLite...");
    execSync("npx prisma generate", { cwd: ROOT, stdio: "inherit" });

    // 5. تشغيل سكربت التنظيف
    console.log("⏳ تشغيل عملية الحذف والتنظيف...");
    execSync("node scripts/clean-tribes.js", { cwd: ROOT, stdio: "inherit" });

    console.log("🎉 تم تنظيف قاعدة البيانات المحلية بنجاح كامل!");
  } catch (error) {
    console.error("❌ حدث خطأ أثناء عملية التنظيف:", error);
  } finally {
    // 6. استعادة الملفات الأصلية بدقة
    console.log("⏳ استعادة التكوينات والملفات الأصلية لـ PostgreSQL...");
    if (fs.existsSync(envBakPath)) {
      fs.copyFileSync(envBakPath, envPath);
      fs.unlinkSync(envBakPath);
    }
    if (fs.existsSync(schemaBakPath)) {
      fs.copyFileSync(schemaBakPath, schemaPath);
      fs.unlinkSync(schemaBakPath);
    }

    // إعادة توليد عميل Prisma لـ PostgreSQL لضمان سلامة الإنتاج
    execSync("npx prisma generate", { cwd: ROOT, stdio: "inherit" });
    console.log("✅ تم استعادة الملفات وتوليد Prisma Client الأصلي بنجاح.");
  }
}

main();
