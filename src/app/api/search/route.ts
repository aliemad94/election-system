// ====================================================================
// /api/search — بحث شامل عبر الناخبين والعشائر والمفاتيح
// مع حماية البيانات حسب الدور (OBSERVER / KEY_USER / ADMIN)
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, type AuthenticatedUser } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/security";
import { applyKeyUserScope, getKeyUserScope } from "@/lib/scope-service";

async function searchHandler(
  req: NextRequest,
  { user }: { user: AuthenticatedUser }
) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim();
  const entity = searchParams.get("entity") ?? "all";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: "البحث يجب أن يكون حرفين على الأقل" },
      { status: 400 }
    );
  }

  try {
    const perEntity = entity === "all" ? Math.floor(limit / 3) : limit;

    let votersList: any[] = [];
    let tribesList: any[] = [];
    let keysList: any[] = [];

    if (user.role !== "OBSERVER" && (entity === "voters" || entity === "all")) {
      // === حماية البحث حسب الدور ===
      // KEY_USER: يبحث في ناخبي مفتاحه فقط
      const voterSearchFields: any[] = [
        { firstName: { contains: query } },
        { fatherName: { contains: query } },
        { grandfatherName: { contains: query } },
        { fourthName: { contains: query } },
      ];

      // إضافة البحث في البيانات الحساسة فقط للأدوار المخوّلة
      if (user.role === "ADMIN") {
        voterSearchFields.push(
          { nationalId: { contains: query } },
          { phone: { contains: query } }
        );
      } else if (user.role === "KEY_USER") {
        // KEY_USER يمكنه البحث بالهاتف لكن ليس بالهوية الوطنية
        voterSearchFields.push({ phone: { contains: query } });
      }

      const voterWhere: any = {
        OR: voterSearchFields,
      };

      // تقييد KEY_USER بناخبي مفتاحه فقط
      await applyKeyUserScope(voterWhere, user);

      const voters = await prisma.voter.findMany({
        where: voterWhere,
        take: perEntity,
        select: {
          id: true,
          firstName: true,
          fatherName: true,
          grandfatherName: true,
          fourthName: true,
          // لا نُرجع nationalId في نتائج البحث — حساس
          votedOnDay: true,
          district: true,
          tribe: { select: { name: true } },
        },
      });
      votersList = voters.map((v) => {
        const nameVal = `${v.firstName} ${v.fatherName} ${v.grandfatherName}`.trim();
        return {
          id: v.id,
          fullName: nameVal,
          subtitle: `${v.district} — ${v.tribe?.name ?? ""}${v.votedOnDay ? " ✓" : ""}`,
        };
      });
    }

    if (entity === "tribes" || entity === "all") {
      const tribes = await prisma.tribe.findMany({
        where: { name: { contains: query } },
        take: perEntity,
        select: { id: true, name: true, _count: { select: { voters: true } } },
      });
      tribesList = tribes.map((t) => ({
        id: t.id,
        fullName: t.name,
        subtitle: `${t._count.voters} ناخب`,
      }));
    }

    if (user.role !== "OBSERVER" && (entity === "keys" || entity === "all")) {
      // تقييد البحث في المفاتيح حسب الدور
      const keySearchFields: any[] = [
        { firstName: { contains: query } },
        { fatherName: { contains: query } },
        { keyCode: { contains: query } },
      ];

      // الهاتف في المفاتيح: ADMIN و KEY_USER فقط
      if (user.role === "ADMIN" || user.role === "KEY_USER") {
        keySearchFields.push({ phone: { contains: query } });
      }

      const keyWhere: any = {
        OR: keySearchFields,
      };

      // تقييد KEY_USER بمفتاحه فقط
      if (user.role === "KEY_USER") {
        const scope = await getKeyUserScope(user.userId);
        if (scope) {
          keyWhere.id = scope.keyId;
        } else {
          keyWhere.id = "none";
        }
      }

      const keys = await prisma.electionKey.findMany({
        where: keyWhere,
        take: perEntity,
        select: {
          id: true,
          keyCode: true,
          firstName: true,
          fatherName: true,
          district: true,
          tribe: { select: { name: true } },
        },
      });
      keysList = keys.map((k) => {
        const nameVal = `${k.firstName} ${k.fatherName}`;
        return {
          id: k.id,
          fullName: `${k.keyCode} — ${nameVal}`,
          subtitle: `${k.district} — ${k.tribe?.name ?? ""}`,
        };
      });
    }

    const flatResults = [
      ...votersList.map(v => ({ id: v.id, entity: "voters", label: v.fullName, sublabel: v.subtitle })),
      ...tribesList.map(t => ({ id: t.id, entity: "tribes", label: t.fullName, sublabel: t.subtitle })),
      ...keysList.map(k => ({ id: k.id, entity: "keys", label: k.fullName, sublabel: k.subtitle }))
    ];

    return NextResponse.json({
      voters: votersList,
      tribes: tribesList,
      electionKeys: keysList,
      results: flatResults,
      total: flatResults.length,
      query
    });
  } catch (error) {
    return handleApiError(error, "search");
  }
}

export const GET = withAuth(searchHandler, {
  GET: ["ADMIN", "KEY_USER", "OBSERVER"],
});
