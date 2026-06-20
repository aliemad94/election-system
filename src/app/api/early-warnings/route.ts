// ====================================================================
// /api/early-warnings — نظام الإنذار المبكر
// ====================================================================

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/security";
import { getCachedIndicators } from "@/lib/indicators-cache";
import { prisma } from "@/lib/prisma";

interface Warning {
  id: string;
  level: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  category: string;
  title: string;
  description: string;
  district?: string | null;
  metric?: number;
  threshold?: number;
}

async function getHandler() {
  try {
    const warnings: Warning[] = [];
    const indicators = await getCachedIndicators();

    // 1. تحذيرات من مؤشرات الأقضية
    indicators.districts.forEach((d) => {
      if (d.drsScore > 60) {
        warnings.push({
          id: `drs-${d.id}`,
          level: "CRITICAL",
          category: "خطر الانشقاق",
          title: `خطر انشقاق عالٍ في ${d.name}`,
          description: `مؤشر DRS = ${d.drsScore} — مطلوب تدخّل فوري لمنع فقدان الأصوات`,
          district: d.name,
          metric: d.drsScore,
          threshold: 60,
        });
      }
      if (d.ewliScore > 55) {
        warnings.push({
          id: `ewli-${d.id}`,
          level: "HIGH",
          category: "إنذار فقدان",
          title: `إنذار فقدان أصوات في ${d.name}`,
          description: `مؤشر EWLI = ${d.ewliScore} — تراجع محتمل في الدعم`,
          district: d.name,
          metric: d.ewliScore,
          threshold: 55,
        });
      }
      if (d.efiScore < 40) {
        warnings.push({
          id: `efi-${d.id}`,
          level: "CRITICAL",
          category: "تنبؤ ضعيف",
          title: `تنبؤ انتخابي ضعيف في ${d.name}`,
          description: `مؤشر EFI = ${d.efiScore} — المنطقة تحتاج تعزيز عاجل`,
          district: d.name,
          metric: d.efiScore,
          threshold: 40,
        });
      }
      if (d.kriScore < 50) {
        warnings.push({
          id: `kri-${d.id}`,
          level: "MEDIUM",
          category: "موثوقية منخفضة",
          title: `موثوقية مفاتيح منخفضة في ${d.name}`,
          description: `مؤشر KRI = ${d.kriScore} — المفاتيح بحاجة متابعة`,
          district: d.name,
          metric: d.kriScore,
          threshold: 50,
        });
      }
    });

    // 2. خدمات معلّقة لأكثر من 7 أيام
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const staleServices = await prisma.service.findMany({
      where: { status: "PENDING", createdAt: { lt: weekAgo } },
      take: 5,
      orderBy: { createdAt: "asc" },
    });
    staleServices.forEach((s) => {
      warnings.push({
        id: `svc-${s.id}`,
        level: "MEDIUM",
        category: "خدمة معلّقة",
        title: `خدمة معلّقة: ${s.title}`,
        description: `بانتظار منذ ${new Date(s.createdAt).toLocaleDateString("ar-IQ")}`,
        metric: Math.floor((Date.now() - s.createdAt.getTime()) / (24 * 60 * 60 * 1000)),
        threshold: 7,
      });
    });

    // 3. مفاتيح ذات خطر عالٍ
    const highRiskKeys = await prisma.electionKey.findMany({
      where: { riskLevel: 5 },
      take: 5,
      include: { _count: { select: { voters: true } } },
    });
    highRiskKeys.forEach((k) => {
      warnings.push({
        id: `key-${k.id}`,
        level: "HIGH",
        category: "مفتاح高风险",
        title: `مفتاح高风险: ${k.firstName} ${k.fatherName}`,
        description: `مستوى الخطر 5 — ${k._count.voters} ناخب متأثر`,
        district: k.district,
        metric: k.riskLevel,
        threshold: 4,
      });
    });

    // ترتيب حسب الخطورة
    const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    warnings.sort((a, b) => order[a.level] - order[b.level]);

    return NextResponse.json({
      warnings,
      summary: {
        total: warnings.length,
        critical: warnings.filter((w) => w.level === "CRITICAL").length,
        high: warnings.filter((w) => w.level === "HIGH").length,
        medium: warnings.filter((w) => w.level === "MEDIUM").length,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error, "early-warnings-get");
  }
}

export const GET = withAuth(getHandler, {
  GET: ["ADMIN", "KEY_USER", "OBSERVER"],
});

