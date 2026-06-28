// ====================================================================
// /api/tribes/deduplicate — تنقية ودمج العشائر المتشابهة
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError, auditLog } from "@/lib/security";
import { normalizeArabicName } from "@/lib/arabic-normalization";

// GET /api/tribes/deduplicate — العثور على العشائر المتشابهة المقترحة للدمج
async function getHandler(req: NextRequest) {
  try {
    // جلب كافة العشائر النشطة
    const tribes = await prisma.tribe.findMany({
      where: { deletedAt: null },
      include: {
        _count: {
          select: { voters: true, electionKeys: true, subTribes: true },
        },
      },
    });

    // تصنيف العشائر حسب الاسم المطبع
    const groupsMap = new Map<string, typeof tribes>();
    
    for (const t of tribes) {
      const normalized = normalizeArabicName(t.name);
      if (!normalized) continue;
      
      if (!groupsMap.has(normalized)) {
        groupsMap.set(normalized, []);
      }
      groupsMap.get(normalized)!.push(t);
    }

    // تصفية المجموعات التي تحتوي على أكثر من سجل واحد (أي مكررات محتملة)
    const duplicateGroups = [];
    
    for (const [normalized, list] of groupsMap.entries()) {
      if (list.length > 1) {
        // ترتيب القائمة تنازلياً حسب عدد الناخبين لتحديد المقترح الرئيسي (Master Candidate)
        const sortedList = [...list].sort((a, b) => {
          const aCount = a._count.voters + a._count.electionKeys * 10; // إعطاء وزن أكبر للمفاتيح
          const bCount = b._count.voters + b._count.electionKeys * 10;
          return bCount - aCount;
        });

        duplicateGroups.push({
          normalized,
          suggestedPrimary: sortedList[0], // العشيرة الأكثر نشاطاً كخيار رئيسي
          tribes: list.map(t => ({
            id: t.id,
            name: t.name,
            leaderName: t.leaderName,
            leaderPhone: t.leaderPhone,
            district: t.district,
            influence: t.influenceRating,
            voterCount: t._count.voters,
            keyCount: t._count.electionKeys,
            subTribeCount: t._count.subTribes,
          })),
        });
      }
    }

    return NextResponse.json(duplicateGroups);
  } catch (error) {
    return handleApiError(error, "tribes-deduplicate-get");
  }
}

// POST /api/tribes/deduplicate — تنفيذ عملية دمج العشائر المتشابهة
async function postHandler(req: NextRequest, { user }: any) {
  try {
    const { primaryTribeId, duplicateTribeIds } = await req.json();

    if (!primaryTribeId || !Array.isArray(duplicateTribeIds) || duplicateTribeIds.length === 0) {
      return NextResponse.json(
        { error: "بيانات الدمج غير مكتملة. يرجى تحديد العشيرة الرئيسية والمكررة." },
        { status: 400 }
      );
    }

    // التحقق من وجود العشيرة الرئيسية
    const primaryTribe = await prisma.tribe.findUnique({
      where: { id: primaryTribeId, deletedAt: null },
      include: { subTribes: { where: { deletedAt: null } } },
    });

    if (!primaryTribe) {
      return NextResponse.json(
        { error: "العشيرة الرئيسية غير موجودة أو تم حذفها." },
        { status: 404 }
      );
    }

    // إجراء عملية الدمج داخل معاملة قاعدة بيانات واحدة (Database Transaction)
    await prisma.$transaction(async (tx) => {
      // 1. معالجة الأفخاذ/البيوت (SubTribes) لتفادي أخطاء قيود التفرد (Unique Constraint)
      for (const dupId of duplicateTribeIds) {
        const dupSubTribes = await tx.subTribe.findMany({
          where: { tribeId: dupId, deletedAt: null },
        });

        for (const sub of dupSubTribes) {
          // التحقق إذا كان الاسم موجوداً في العشيرة الرئيسية
          const matchedPrimarySub = primaryTribe.subTribes.find(
            (ps) => ps.name.trim().toLowerCase() === sub.name.trim().toLowerCase()
          );

          if (matchedPrimarySub) {
            // إذا كان الفخذ مكرراً، ننقل الناخبين والمفاتيح إليه مباشرة ونحذف الفخذ المكرر
            await tx.voter.updateMany({
              where: { subTribeId: sub.id },
              data: { subTribeId: matchedPrimarySub.id, tribeId: primaryTribeId },
            });
            await tx.electionKey.updateMany({
              where: { subTribeId: sub.id },
              data: { subTribeId: matchedPrimarySub.id, tribeId: primaryTribeId },
            });
            // حذف الفخذ المكرر (soft delete)
            await tx.subTribe.update({
              where: { id: sub.id },
              data: { deletedAt: new Date() },
            });
          } else {
            // إذا لم يكن مكرراً، ننقل الفخذ بأكمله إلى العشيرة الرئيسية بتعديل tribeId
            await tx.subTribe.update({
              where: { id: sub.id },
              data: { tribeId: primaryTribeId },
            });
          }
        }
      }

      // 2. تحديث جميع الناخبين المتبقين بدون فخذ (أو مع فخذ منقول)
      await tx.voter.updateMany({
        where: { tribeId: { in: duplicateTribeIds } },
        data: { tribeId: primaryTribeId },
      });

      // 3. تحديث جميع المفاتيح الانتخابية المتبقية
      await tx.electionKey.updateMany({
        where: { tribeId: { in: duplicateTribeIds } },
        data: { tribeId: primaryTribeId },
      });

      // 4. حذف العشائر المكررة (Soft Delete)
      await tx.tribe.updateMany({
        where: { id: { in: duplicateTribeIds } },
        data: { deletedAt: new Date() },
      });
    });

    // تسجيل العملية في سجل التدقيق الإداري
    await auditLog({
      userId: user.userId,
      username: user.username,
      action: "UPDATE",
      entity: "Tribe",
      entityId: primaryTribeId,
      details: {
        message: "تم دمج عشائر مكررة في العشيرة الرئيسية",
        mergedFromIds: duplicateTribeIds.join(","),
        primaryName: primaryTribe.name,
      },
    });

    return NextResponse.json({ success: true, message: "تم الدمج وتطهير البيانات بنجاح!" });
  } catch (error) {
    return handleApiError(error, "tribes-deduplicate-post");
  }
}

export const GET = withAuth(getHandler, {
  GET: ["ADMIN", "KEY_USER", "OBSERVER"],
});
export const POST = withAuth(postHandler, { POST: ["ADMIN"] }); // القبول النهائي للدمج مقصور على المالك/المدير
