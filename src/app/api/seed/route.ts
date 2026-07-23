import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { withAuth } from "@/lib/auth-guard";

async function postHandler(request: NextRequest) {
  try {
    console.log("Seeding core database dynamically via API...");
    const adminPassword = process.env.ADMIN_PASSWORD || "YOUR_ADMIN_PASSWORD";
    const userPassword = process.env.USER_PASSWORD || "YOUR_USER_PASSWORD";

    if (!adminPassword || adminPassword.length < 12) {
      throw new Error("ADMIN_PASSWORD must be at least 12 characters");
    }
    if (!userPassword || userPassword.length < 12) {
      throw new Error("USER_PASSWORD must be at least 12 characters");
    }

    const adminHash = await bcrypt.hash(adminPassword, 12);
    const observerHash = await bcrypt.hash(userPassword, 12);
    const keyUserHash = await bcrypt.hash(userPassword, 12);

    await prisma.$transaction(async (tx) => {
      // إنشاء فقط إذا غير موجود — لا نعيد كلمات المرور
      const existingAdmin = await tx.user.findUnique({ where: { username: "admin" } });
      if (!existingAdmin) {
        await tx.user.create({
          data: {
            username: "admin",
            password: adminHash,
            role: "ADMIN",
            mustChangePwd: false,
          },
        });
      }

      const existingObserver = await tx.user.findUnique({ where: { username: "observer" } });
      if (!existingObserver) {
        await tx.user.create({
          data: {
            username: "observer",
            password: observerHash,
            role: "OBSERVER",
            mustChangePwd: false,
          },
        });
      }

      const existingKeyUser = await tx.user.findUnique({ where: { username: "key_user" } });
      if (!existingKeyUser) {
        await tx.user.create({
          data: {
            username: "key_user",
            password: keyUserHash,
            role: "KEY_USER",
            mustChangePwd: false,
          },
        });
      }

      await tx.systemConfig.upsert({
        where: { id: "system" },
        update: {},
        create: { id: "system", enabled: true },
      });
    });

    return NextResponse.json({ success: true, message: "Core database seeded successfully!" });
  } catch (error) {
    console.error("Error seeding core database:", error);
    return NextResponse.json(
      { error: "حدث خطأ في تهيئة قاعدة البيانات" },
      { status: 500 }
    );
  }
}

export const POST = withAuth(postHandler, {
  POST: ["ADMIN"],
});
