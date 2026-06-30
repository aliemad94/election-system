// ====================================================================
// GET /api/cron/backup — واجهة النسخ الاحتياطي اليدوي والمجدول للآدمن
// ====================================================================

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-guard";
import { runBackup } from "@/lib/backup";
import { handleApiError } from "@/lib/security";

async function getHandler() {
  try {
    const result = await runBackup();
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "تم إنشاء النسخة الاحتياطية بنجاح",
        fileName: result.fileName,
        size: result.size
      });
    } else {
      return NextResponse.json(
        { error: result.error || "فشل النسخ الاحتياطي" },
        { status: 500 }
      );
    }
  } catch (error) {
    return handleApiError(error, "cron-backup-get");
  }
}

export const GET = withAuth(getHandler, {
  GET: ["ADMIN"],
});
