// ====================================================================
// /api/electoral-keys/deduplicate-nicknames — تنقية وتوحيد ألقاب المفاتيح
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import type { AuthenticatedUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError, auditLog } from "@/lib/security";
import { normalizeArabicName } from "@/lib/arabic-normalization";

// GET /api/electoral-keys/deduplicate-nicknames — رصد الألقاب المتشابهة
async function getHandler(req: NextRequest) {
  try {
    // جلب تكرار كل لقب فريد في قاعدة البيانات للمفاتيح النشطة
    const nicknameCounts = await prisma.electionKey.groupBy({
      by: ["nickname"],
      where: {
        nickname: {
          not: null,
        },
        deletedAt: null,
      },
      _count: {
        id: true,
      },
    });

    // تصفية وحذف الحقول الفارغة أو المساحات البيضاء
    const validCounts = nicknameCounts.filter(
      (item) => item.nickname && item.nickname.trim() !== ""
    );

    // تجميع الألقاب حسب الجذر المطبع
    const groupsMap = new Map<string, Array<{ nickname: string; count: number }>>();

    for (const item of validCounts) {
      const nickname = item.nickname as string;
      const normalized = normalizeArabicName(nickname);
      if (!normalized) continue;

      if (!groupsMap.has(normalized)) {
        groupsMap.set(normalized, []);
      }
      groupsMap.get(normalized)!.push({
        nickname,
        count: item._count.id,
      });
    }

    // تصفية المجموعات التي تحتوي على أكثر من طريقة إملاء واحدة (أي بها تكرار إملائي)
    const duplicateGroups = [];

    for (const [normalized, list] of groupsMap.entries()) {
      if (list.length > 1) {
        // ترتيب التكرارات الإملائية تنازلياً حسب عدد السجلات المتأثرة
        const sortedList = [...list].sort((a, b) => b.count - a.count);

        duplicateGroups.push({
          normalized,
          suggestedPrimary: sortedList[0].nickname, // المقترح الافتراضي هو الأكثر تكراراً
          nicknames: sortedList,
        });
      }
    }

    return NextResponse.json(duplicateGroups);
  } catch (error) {
    return handleApiError(error, "electoral-keys-deduplicate-nicknames-get");
  }
}

// POST /api/electoral-keys/deduplicate-nicknames — توحيد اللقب وتحديث السجلات
async function postHandler(req: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const { primaryNickname, duplicateNicknames } = await req.json();

    if (!primaryNickname || !Array.isArray(duplicateNicknames) || duplicateNicknames.length === 0) {
      return NextResponse.json(
        { error: "بيانات التوحيد غير مكتملة. يرجى تحديد اللقب الرئيسي والألقاب المكررة." },
        { status: 400 }
      );
    }

    // تحديث كافة سجلات المفاتيح الانتخابية المكررة لتصبح باللقب المعتمد الموحد
    const updateResult = await prisma.electionKey.updateMany({
      where: {
        nickname: { in: duplicateNicknames },
        deletedAt: null,
      },
      data: {
        nickname: primaryNickname,
      },
    });

    // تسجيل العملية في سجل التدقيق الإداري
    await auditLog({
      userId: user.userId,
      username: user.username,
      action: "UPDATE",
      entity: "ElectionKey",
      details: {
        message: "تم توحيد ألقاب المفاتيح الانتخابية المكررة إملائياً",
        primaryNickname,
        duplicateNicknames: duplicateNicknames.join(","),
        affectedCount: updateResult.count,
      },
    });

    return NextResponse.json({
      success: true,
      message: `تم توحيد الألقاب بنجاح! تم تحديث عدد (${updateResult.count}) سجل.`,
    });
  } catch (error) {
    return handleApiError(error, "electoral-keys-deduplicate-nicknames-post");
  }
}

export const GET = withAuth(getHandler, {
  GET: ["ADMIN", "KEY_USER"],
});
export const POST = withAuth(postHandler, { POST: ["ADMIN"] }); // التوحيد النهائي مقصور على المالك/المدير
