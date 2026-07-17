// ====================================================================
// GET /api/export/csv — تصدير البيانات بصيغة CSV مع BOM للعربية
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, type AuthenticatedUser } from "@/lib/auth-guard";
import { applyKeyUserScope } from "@/lib/scope-service";

async function getHandler(
  request: NextRequest,
  { user }: { user: AuthenticatedUser }
) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "electoral-keys";

    if (type === "voters" && user.role === "OBSERVER") {
      return NextResponse.json(
        { error: "غير مصرح - لا تملك صلاحية تصدير بيانات الناخبين" },
        { status: 403 }
      );
    }

    let csvContent = "";
    const BOM = "\uFEFF"; // Byte Order Mark for Arabic in Excel

    switch (type) {
      case "electoral-keys": {
        const where: any = {};
        if (user.role === "KEY_USER") {
          where.phone = user.username;
        }
        const keys = await prisma.electionKey.findMany({
          where,
          include: { tribe: true, subTribe: true },
          orderBy: { weightedScore: "desc" },
        });

        csvContent = BOM + [
          "الرمز,الاسم الأول,اسم الأب,اسم الجد,اسم العائلة,الهاتف,القضاء,الناحية,الأصوات المؤيدة,الأصوات المحايدة,الأصوات الضعيفة,إجمالي الأصوات,الأصوات الصافية,الولاء,التأثير,التحشيد,الحماية,الدعم,الدرجة المرجحة,التصنيف,العشيرة",
          ...keys.map((k) =>
            [
              k.keyCode,
              k.firstName,
              k.fatherName,
              k.grandfatherName,
              k.fourthName,
              k.phone,
              k.district,
              k.subDistrict,
              k.supportedVotes,
              k.neutralVotes,
              k.weakVotes,
              k.totalVotes,
              k.netVotes,
              k.loyaltyScore,
              k.influenceLevel,
              k.mobilizationCap,
              k.voteProtection,
              k.supportReason,
              k.weightedScore,
              k.classification,
              k.tribe?.name || "",
            ]
              .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
              .join(",")
          ),
        ].join("\n");
        break;
      }

      case "voters": {
        const where: any = {};
        await applyKeyUserScope(where, user);
        const voters = await prisma.voter.findMany({
          where,
          include: { tribe: true, electionKey: true },
          orderBy: { createdAt: "desc" },
        });

        csvContent = BOM + [
          "الاسم الأول,اسم الأب,اسم الجد,اسم العائلة,الهاتف,القضاء,الناحية,الحالة,درجة الدعم,درجة الثقة,العشيرة,المفتاح الانتخابي",
          ...voters.map((v) =>
            [
              v.firstName,
              v.fatherName,
              v.grandfatherName,
              v.fourthName,
              v.phone || "",
              v.district,
              v.subDistrict,
              v.status,
              v.supportDegree,
              v.confidenceScore,
              v.tribe?.name || "",
              v.electionKey?.keyCode || "",
            ]
              .map((val) => `"${String(val ?? '').replace(/"/g, '""')}"`)
              .join(",")
          ),
        ].join("\n");
        break;
      }

      case "tribes": {
        const tribes = await prisma.tribe.findMany({
          include: { _count: { select: { voters: true, electionKeys: true } } },
          orderBy: { name: "asc" },
        });

        csvContent = BOM + [
          "اسم العشيرة,القضاء,تصنيف التأثير,التعداد التقريبي,عدد الناخبين,عدد المفاتيح,ملاحظات",
          ...tribes.map((t) =>
            [
              t.name,
              t.district || "",
              t.influenceRating,
              t.population || "",
              t._count.voters,
              t._count.electionKeys,
              t.notes || "",
            ]
              .map((val) => `"${String(val ?? '').replace(/"/g, '""')}"`)
              .join(",")
          ),
        ].join("\n");
        break;
      }

      default:
        return NextResponse.json(
          { error: "نوع التصدير غير مدعوم. الأنواع المتاحة: electoral-keys, voters, tribes" },
          { status: 400 }
        );
    }

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${type}-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting CSV:", error);
    return NextResponse.json(
      { error: "حدث خطأ في تصدير البيانات" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getHandler, {
  GET: ["ADMIN", "KEY_USER"],
});
