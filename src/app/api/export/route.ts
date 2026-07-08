// ====================================================================
// /api/export — تصدير البيانات إلى Excel
// ====================================================================
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, type AuthenticatedUser } from "@/lib/auth-guard";
import * as XLSX from "xlsx";

async function getHandler(
  req: NextRequest,
  { user }: { user: AuthenticatedUser }
) {
  try {
    const { searchParams } = new URL(req.url);
    const entity = searchParams.get("entity") || "voters";

    if (entity === "voters" && user.role === "OBSERVER") {
      return NextResponse.json(
        { error: "غير مصرح - لا تملك صلاحية تصدير بيانات الناخبين" },
        { status: 403 }
      );
    }

    const wb = XLSX.utils.book_new();

    switch (entity) {
      case "voters": {
        const voters = await prisma.voter.findMany({
          include: { electionKey: { select: { keyCode: true, firstName: true } }, tribe: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        });
        const rows = voters.map(v => ({
          "الاسم الكامل": [v.firstName, v.fatherName, v.grandfatherName, v.fourthName].filter(Boolean).join(" "),
          "الجنس": v.gender,
          "الهاتف": v.phone || "",
          "المحافظة": v.province,
          "القضاء": v.district,
          "الناحية": v.subDistrict,
          "مركز الاقتراع": v.pollingCenter,
          "المحطة": v.ballotStation,
          "الحالة": v.status === "SUPPORTED" ? "مؤيد" : v.status === "NEUTRAL" ? "محايد" : "ضعيف",
          "المفتاح": v.electionKey?.keyCode || "",
          "اسم المفتاح": v.electionKey?.firstName || "",
          "العشيرة": v.tribe?.name || "",
        }));
        const ws = XLSX.utils.json_to_sheet(rows, {});
        ws["!cols"] = rows.length > 0 ? Object.keys(rows[0]).map(() => ({ wch: 20 })) : [];
        XLSX.utils.book_append_sheet(wb, ws, "الناخبون");
        break;
      }

      case "keys": {
        const keys = await prisma.electionKey.findMany({
          include: { tribe: { select: { name: true } }, _count: { select: { voters: true } } },
          orderBy: { createdAt: "desc" },
        });
        const rows = keys.map(k => ({
          "الكود": k.keyCode,
          "الاسم": [k.firstName, k.fatherName, k.grandfatherName, k.fourthName].filter(Boolean).join(" "),
          "الهاتف": k.phone,
          "القضاء": k.district,
          "العشيرة": k.tribe?.name || "",
          "عدد الناخبين": k._count.voters,
          "الأصوات الكلية": k.totalVotes,
          "الأصوات الصافية": k.netVotes,
          "مستوى الولاء": k.loyaltyScore,
          "مستوى التأثير": k.influenceLevel,
          "القدرة على التحشيد": k.mobilizationCap,
          "القوة النهائية": k.weightedScore,
          "التصنيف": k.classification,
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        ws["!cols"] = rows.length > 0 ? Object.keys(rows[0]).map(() => ({ wch: 18 })) : [];
        XLSX.utils.book_append_sheet(wb, ws, "المفاتيح الانتخابية");
        break;
      }

      case "tribes": {
        const tribes = await prisma.tribe.findMany({
          include: { _count: { select: { voters: true, electionKeys: true } } },
          orderBy: { name: "asc" },
        });
        const rows = tribes.map(t => ({
          "العشيرة": t.name,
          "القضاء": t.district || "",
          "مستوى النفوذ": t.influenceRating,
          "عدد المفاتيح": t._count.electionKeys,
          "عدد الناخبين": t._count.voters,
          "الوصف": t.description || "",
          "ملاحظات": t.notes || "",
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        ws["!cols"] = rows.length > 0 ? Object.keys(rows[0]).map(() => ({ wch: 18 })) : [];
        XLSX.utils.book_append_sheet(wb, ws, "العشائر");
        break;
      }

      case "commission": {
        const commission = await prisma.commissionData.findMany({ orderBy: { district: "asc" } });
        const ref = await prisma.provinceReference.findFirst({ where: { province: "ذي قار" } });
        const rows = commission.map(c => ({
          "القضاء": c.district,
          "الناخبين المسجلين": c.registeredVoters,
          "المصوتين الفعليين": c.actualVoters,
          "نسبة المشاركة": c.registeredVoters > 0 ? Math.round((c.actualVoters / c.registeredVoters) * 100 * 100) / 100 : 0,
          "ذكور": c.maleVoters,
          "إناث": c.femaleVoters,
          "مراكز الاقتراع": c.pollingCenters,
          "محطات الاقتراع": c.ballotStations,
        }));
        if (ref) {
          rows.push({
            "القضاء": "المجموع (ذي قار)",
            "الناخبين المسجلين": ref.totalRegisteredVoters,
            "المصوتين الفعليين": ref.totalActualVoters,
            "نسبة المشاركة": ref.generalTurnout,
            "ذكور": ref.maleVoters,
            "إناث": ref.femaleVoters,
            "مراكز الاقتراع": ref.pollingCentersCount,
            "محطات الاقتراع": ref.ballotStationsCount,
          } as any);
        }
        const ws = XLSX.utils.json_to_sheet(rows);
        ws["!cols"] = rows.length > 0 ? Object.keys(rows[0]).map(() => ({ wch: 22 })) : [];
        XLSX.utils.book_append_sheet(wb, ws, "بيانات المفوضية");
        break;
      }

      default:
        return NextResponse.json({ error: "نوع الكيان غير معروف" }, { status: 400 });
    }

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    const names: Record<string, string> = {
      voters: "الناخبون",
      keys: "المفاتيح_الانتخابية",
      tribes: "العشائر",
      commission: "بيانات_المفوضية",
    };

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${names[entity] || "تصدير"}_${new Date().toISOString().slice(0, 10)}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "فشل التصدير" }, { status: 500 });
  }
}

export const GET = withAuth(getHandler, {
  GET: ["ADMIN", "KEY_USER", "OBSERVER"],
});
