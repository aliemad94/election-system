// ====================================================================
// /api/cron/backup — إدارة النسخ الاحتياطي واستعادة البيانات للآدمن
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-guard";
import { runBackup } from "@/lib/backup";
import { handleApiError, auditLog } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

/**
 * دالة مساعدة لتحويل السلاسل النصية التي تطابق صيغة التواريخ ISO إلى كائنات Date تلقائياً.
 */
function parseDates(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "string") {
    const isIsoDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj);
    if (isIsoDate) {
      const d = new Date(obj);
      if (!isNaN(d.getTime())) return d;
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(parseDates);
  }
  if (typeof obj === "object") {
    const newObj: any = {};
    for (const key of Object.keys(obj)) {
      newObj[key] = parseDates(obj[key]);
    }
    return newObj;
  }
  return obj;
}

async function getHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    const backupDir = path.join(process.cwd(), "backups");
    await fs.mkdir(backupDir, { recursive: true });

    // 1. جلب قائمة الملفات
    if (action === "list") {
      const files = await fs.readdir(backupDir);
      const backups = await Promise.all(
        files
          .filter((f) => f.startsWith("backup-") && f.endsWith(".json"))
          .map(async (f) => {
            const stat = await fs.stat(path.join(backupDir, f));
            return {
              fileName: f,
              size: stat.size,
              createdAt: stat.mtime.toISOString(),
            };
          })
      );

      // ترتيب التنازلي حسب التاريخ (الأحدث أولاً)
      backups.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

      return NextResponse.json({ backups });
    }

    // 2. تنزيل نسخة محددة
    if (action === "download") {
      const file = searchParams.get("file");
      if (!file || file.includes("..") || file.includes("/") || file.includes("\\")) {
        return NextResponse.json({ error: "اسم الملف غير صالح" }, { status: 400 });
      }

      const filePath = path.join(backupDir, file);
      try {
        const content = await fs.readFile(filePath, "utf-8");
        return new NextResponse(content, {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Content-Disposition": `attachment; filename="${file}"`,
          },
        });
      } catch {
        return NextResponse.json({ error: "الملف غير موجود على السيرفر" }, { status: 404 });
      }
    }

    // 3. الإجراء الافتراضي: توليد نسخة احتياطية فورية
    const result = await runBackup();
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "تم إنشاء النسخة الاحتياطية بنجاح",
        fileName: result.fileName,
        size: result.size,
      });
    } else {
      return NextResponse.json({ error: result.error || "فشل النسخ الاحتياطي" }, { status: 500 });
    }
  } catch (error) {
    return handleApiError(error, "cron-backup-get");
  }
}

async function postHandler(request: NextRequest, { user }: any) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action !== "restore") {
      return NextResponse.json({ error: "الإجراء غير مدعوم" }, { status: 400 });
    }

    const rawBody = await request.json().catch(() => null);
    if (!rawBody) {
      return NextResponse.json({ error: "بيانات الاستعادة فارغة أو غير صالحة" }, { status: 400 });
    }

    // تطبيق دالة تحويل التواريخ
    const body = parseDates(rawBody);

    const {
      tribes,
      subTribes,
      keys,
      voters,
      services,
      commission,
      results,
      candidates,
      volunteers,
      tasks,
      warnings,
      indicators,
      compositeIndicators,
      configs,
      access,
    } = body;

    console.log("=== [Restore Engine] Initiating Database Restore Transaction ===");

    // تشغيل عملية استعادة البيانات بالكامل داخل معاملة واحدة آمنة
    await prisma.$transaction(async (tx) => {
      // 1. مسح البيانات القديمة بالترتيب الصحيح لتفادي مشاكل المفاتيح الخارجية
      await tx.candidateResult.deleteMany();
      await tx.electionResult.deleteMany();
      await tx.task.deleteMany();
      await tx.earlyWarning.deleteMany();
      await tx.service.deleteMany();
      await tx.voter.deleteMany();
      await tx.electionKey.deleteMany();
      await tx.subTribe.deleteMany();
      await tx.tribe.deleteMany();
      await tx.volunteer.deleteMany();
      await tx.dynamicIndicator.deleteMany();
      await tx.compositeIndicator.deleteMany();

      // 2. إعادة إدراج البيانات بالترتيب الهرمي الصحيح
      if (volunteers?.length) await tx.volunteer.createMany({ data: volunteers });
      if (tribes?.length) await tx.tribe.createMany({ data: tribes });
      if (subTribes?.length) await tx.subTribe.createMany({ data: subTribes });
      if (keys?.length) await tx.electionKey.createMany({ data: keys });
      if (voters?.length) await tx.voter.createMany({ data: voters });
      if (services?.length) await tx.service.createMany({ data: services });
      if (tasks?.length) await tx.task.createMany({ data: tasks });
      if (warnings?.length) await tx.earlyWarning.createMany({ data: warnings });
      if (indicators?.length) await tx.dynamicIndicator.createMany({ data: indicators });
      if (compositeIndicators?.length) await tx.compositeIndicator.createMany({ data: compositeIndicators });
      if (results?.length) await tx.electionResult.createMany({ data: results });
      if (candidates?.length) await tx.candidateResult.createMany({ data: candidates });
    });

    console.log("=== [Restore Engine] Database Restore Completed Successfully ===");

    // تسجيل العملية في سجل التدقيق
    await auditLog({
      userId: user.userId,
      username: user.username,
      action: "UPDATE",
      entity: "Database",
      entityId: "all",
      details: { action: "RESTORE", timestamp: new Date().toISOString() },
    });

    return NextResponse.json({
      success: true,
      message: "تمت استعادة قاعدة البيانات بالكامل بنجاح!",
    });
  } catch (error) {
    console.error("Database restore transaction failed:", error);
    return NextResponse.json(
      { error: `فشلت استعادة البيانات: ${String(error)}` },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getHandler, {
  GET: ["ADMIN"],
});

export const POST = withAuth(postHandler, {
  POST: ["ADMIN"],
});
