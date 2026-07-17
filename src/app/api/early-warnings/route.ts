// ====================================================================
// /api/early-warnings — إدارة نظام الإنذار المبكر (GET + POST)
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/security";
import { getCachedIndicators } from "@/lib/indicators-cache";
import { prisma } from "@/lib/prisma";

interface WarningData {
  id: string;
  areaType: string;
  areaName: string;
  warningType: string;
  severity: string;
  description: string | null;
  estimatedVotesAtRisk: number;
  recommendedAction: string | null;
  isActive: boolean;
  createdAt: string;
}

async function getHandler(request: NextRequest) {
  try {
    const [votersCount, keysCount] = await Promise.all([
      prisma.voter.count(),
      prisma.electionKey.count(),
    ]);

    if (votersCount === 0 && keysCount === 0) {
      return NextResponse.json([]);
    }

    const { searchParams } = new URL(request.url);
    const filterType = searchParams.get("warningType");
    const filterSeverity = searchParams.get("severity");

    const warnings: WarningData[] = [];

    // 1. جلب التحذيرات المخزنة في قاعدة البيانات
    const dbWarnings = await prisma.earlyWarning.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });

    const severityMap: Record<string, string> = {
      CRITICAL: "حرج",
      HIGH: "مرتفع",
      MEDIUM: "متوسط",
      LOW: "منخفض",
      "حرج": "حرج",
      "مرتفع": "مرتفع",
      "متوسط": "متوسط",
      "منخفض": "منخفض"
    };

    const typeMap: Record<string, string> = {
      DEFECTION_RISK: "مهددة_خسارة",
      CONFIDENCE_DROP: "متأرجحة",
      LOYALTY_CHANGE: "متأرجحة",
      FIELD_ISSUE: "قابلة_لاختراق",
      "مهددة_خسارة": "مهددة_خسارة",
      "متأرجحة": "متأرجحة",
      "مشاركة_منخفضة": "مشاركة_منخفضة",
      "مشاركة_منخفض": "مشاركة_منخفضة",
      "قابلة_لاختراق": "قابلة_لاختراق"
    };

    dbWarnings.forEach((w) => {
      warnings.push({
        id: w.id,
        areaType: w.areaType || "قضاء",
        areaName: w.areaName || "ذي قار",
        warningType: typeMap[w.warningType] || w.warningType,
        severity: severityMap[w.severity] || w.severity,
        description: w.description,
        estimatedVotesAtRisk: w.estimatedVotesAtRisk,
        recommendedAction: w.recommendedAction,
        isActive: w.status === "ACTIVE",
        createdAt: w.createdAt.toISOString(),
      });
    });

    // 2. حساب المؤشرات اللحظية لدمجها (On-the-fly)
    const indicators = await getCachedIndicators().catch(() => null);

    if (indicators && indicators.districts) {
      indicators.districts.forEach((d) => {
        // أ. خطر انشقاق مرتفع
        if (d.drsScore > 60) {
          warnings.push({
            id: `drs-${d.id}`,
            areaType: "قضاء",
            areaName: d.name,
            warningType: "مهددة_خسارة",
            severity: "حرج",
            description: `مؤشر خطر انشقاق مرتفع DRS = ${d.drsScore} — مطلوب تدخّل فوري`,
            estimatedVotesAtRisk: Math.round(d.totalSupportedVotes * (d.drsScore / 100)) || 50,
            recommendedAction: "زيارة ميدانية وتفعيل خطة حماية الأصوات",
            isActive: true,
            createdAt: new Date().toISOString(),
          });
        }
        // ب. تراجع الدعم والموثوقية
        if (d.ewliScore > 55) {
          warnings.push({
            id: `ewli-${d.id}`,
            areaType: "قضاء",
            areaName: d.name,
            warningType: "متأرجحة",
            severity: "مرتفع",
            description: `تراجع مؤشر خسارة الأصوات الميدانية EWLI = ${d.ewliScore}`,
            estimatedVotesAtRisk: Math.round(d.totalSupportedVotes * 0.3) || 30,
            recommendedAction: "تفعيل قنوات التواصل والتنسيق المباشر",
            isActive: true,
            createdAt: new Date().toISOString(),
          });
        }
        // ج. مشاركة انتخابية متوقعة ضعيفة
        if (d.efiScore < 40) {
          warnings.push({
            id: `efi-${d.id}`,
            areaType: "قضاء",
            areaName: d.name,
            warningType: "مشاركة_منخفضة",
            severity: "حرج",
            description: `توقعات مشاركة انتخابية ضعيفة - مؤشر EFI = ${d.efiScore}`,
            estimatedVotesAtRisk: Math.round(d.totalVotersInArea * 0.1) || 150,
            recommendedAction: "تكثيف التعبئة والتأكيد على المترددين",
            isActive: true,
            createdAt: new Date().toISOString(),
          });
        }
        // د. موثوقية الكوادر منخفضة
        if (d.kriScore < 50) {
          warnings.push({
            id: `kri-${d.id}`,
            areaType: "قضاء",
            areaName: d.name,
            warningType: "قابلة_لاختراق",
            severity: "متوسط",
            description: `انخفاض موثوقية المفاتيح والتقارير الميدانية - مؤشر KRI = ${d.kriScore}`,
            estimatedVotesAtRisk: Math.round(d.totalSupportedVotes * 0.15) || 20,
            recommendedAction: "إعادة تقييم ومتابعة المندوبين",
            isActive: true,
            createdAt: new Date().toISOString(),
          });
        }
      });
    }

    // 3. خدمات معلقة لأكثر من 7 أيام
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const staleServices = await prisma.service.findMany({
      where: { status: "PENDING", createdAt: { lt: weekAgo } },
      take: 5,
      orderBy: { createdAt: "asc" },
      include: { voter: true, electionKey: true }
    });

    staleServices.forEach((s) => {
      const area = s.voter?.district || s.electionKey?.district || "غير محدد";
      warnings.push({
        id: `svc-${s.id}`,
        areaType: "ناحية",
        areaName: area,
        warningType: "متأرجحة",
        severity: s.priority === "URGENT" || s.priority === "HIGH" ? "مرتفع" : "متوسط",
        description: `طلب خدمي معلّق: (${s.title}) منذ أكثر من أسبوع للناخب`,
        estimatedVotesAtRisk: s.estimatedVotesImpact || 1,
        recommendedAction: "معالجة الطلب الخدمي بالتنسيق مع الجهات التنفيذية",
        isActive: true,
        createdAt: s.createdAt.toISOString(),
      });
    });

    // 4. مفاتيح ذات خطر عالٍ
    const highRiskKeys = await prisma.electionKey.findMany({
      where: { riskLevel: 5 },
      take: 5,
      include: { _count: { select: { voters: true } } },
    });

    highRiskKeys.forEach((k) => {
      warnings.push({
        id: `key-${k.id}`,
        areaType: "مركز اقتراع",
        areaName: k.pollingCenter || k.district,
        warningType: "مهددة_خسارة",
        severity: "مرتفع",
        description: `المفتاح: ${k.firstName} ${k.fatherName} - مستوى خطر 5 ومتابعة منخفضة`,
        estimatedVotesAtRisk: k.netVotes || 10,
        recommendedAction: "تواصل مباشر مع الكادر وعلاج تسرب الأصوات الميدانية",
        isActive: true,
        createdAt: k.createdAt.toISOString(),
      });
    });

    // تطبيق الفلاتر المطلوبة من شاشة المراقبة
    let filteredWarnings = warnings;
    if (filterType) {
      filteredWarnings = filteredWarnings.filter((w) => w.warningType === filterType);
    }
    if (filterSeverity) {
      filteredWarnings = filteredWarnings.filter((w) => w.severity === filterSeverity);
    }

    // ترتيب حسب الخطورة: حرج -> مرتفع -> متوسط -> منخفض
    const severityOrder: Record<string, number> = { "حرج": 0, "مرتفع": 1, "متوسط": 2, "منخفض": 3 };
    filteredWarnings.sort((a, b) => {
      const orderA = severityOrder[a.severity] ?? 99;
      const orderB = severityOrder[b.severity] ?? 99;
      return orderA - orderB;
    });

    // إرجاع مصفوفة التحذيرات مباشرة لتلائم الواجهة الرسومية
    return NextResponse.json(filteredWarnings);
  } catch (error) {
    return handleApiError(error, "early-warnings-get");
  }
}

import { createEarlyWarningSchema, formatZodError } from "@/lib/validators";

async function postHandler(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = createEarlyWarningSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const d = parsed.data;

    const warning = await prisma.earlyWarning.create({
      data: {
        warningType: d.warningType,
        severity: d.severity,
        description: d.description,
        status: d.status || "ACTIVE",
        areaType: d.areaType || "قضاء",
        areaName: d.areaName,
        estimatedVotesAtRisk: d.estimatedVotesAtRisk,
        recommendedAction: d.recommendedAction || "",
        electoralKeyId: d.electoralKeyId || null,
      },
    });

    return NextResponse.json(warning, { status: 201 });
  } catch (error) {
    return handleApiError(error, "early-warnings-post");
  }
}

export const GET = withAuth(getHandler, {
  GET: ["ADMIN", "KEY_USER", "OBSERVER"],
});

export const POST = withAuth(postHandler, {
  POST: ["ADMIN", "KEY_USER"],
});
