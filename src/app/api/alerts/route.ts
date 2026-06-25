// ====================================================================
// /api/alerts — تنبيهات مباشرة مولّدة من المؤشرات الحرجة
// ====================================================================

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/security";
import { getCachedIndicators } from "@/lib/indicators-cache";
import { prisma } from "@/lib/prisma";

interface AlertItem {
  id: string;
  type: "CRITICAL" | "WARNING" | "INFO";
  title: string;
  description: string;
  district: string | null;
  createdAt: string;
}

async function getHandler() {
  try {
    const alerts: AlertItem[] = [];
    const now = new Date().toISOString();

    // 1. تنبيهات من المؤشرات (DRS/EWLI/EFI حرجة)
    try {
      const indicators = await getCachedIndicators();

      indicators.districts.forEach((d) => {
        if (d.drsScore > 60) {
          alerts.push({
            id: `drs-${d.id}`,
            type: "CRITICAL",
            title: `خطر انشقاق عالٍ في ${d.name}`,
            description: `مؤشر DRS = ${d.drsScore} — مطلوب تدخّل فوري`,
            district: d.name,
            createdAt: now,
          });
        }
        if (d.ewliScore > 60) {
          alerts.push({
            id: `ewli-${d.id}`,
            type: "WARNING",
            title: `إنذار فقدان أصوات في ${d.name}`,
            description: `مؤشر EWLI = ${d.ewliScore} — تراجع محتمل`,
            district: d.name,
            createdAt: now,
          });
        }
        if (d.efiScore < 40) {
          alerts.push({
            id: `efi-${d.id}`,
            type: "CRITICAL",
            title: `تنبؤ انتخابي ضعيف في ${d.name}`,
            description: `مؤشر EFI = ${d.efiScore} — يحتاج تعزيز`,
            district: d.name,
            createdAt: now,
          });
        }
      });
    } catch {
      // المؤشرات قد تفشل — نتجاهل ونكمل
    }

    // 2. خدمات عالقة (PENDING لأكثر من 7 أيام)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const staleServices = await prisma.service.findMany({
      where: {
        status: "PENDING",
        createdAt: { lt: weekAgo },
      },
      take: 5,
      orderBy: { createdAt: "asc" },
    });
    staleServices.forEach((s) => {
      alerts.push({
        id: `svc-${s.id}`,
        type: "WARNING",
        title: `خدمة معلّقة: ${s.title}`,
        description: `بانتظار منذ ${new Date(s.createdAt).toLocaleDateString("en-US")}`,
        district: null,
        createdAt: s.createdAt.toISOString(),
      });
    });

    // 3. مفاتيح ذات خطر عالٍ (riskLevel = 5)
    const highRiskKeys = await prisma.electionKey.findMany({
      where: { riskLevel: 5 },
      take: 3,
      include: { _count: { select: { voters: true } } },
    });
    highRiskKeys.forEach((k) => {
      alerts.push({
        id: `key-${k.id}`,
        type: "CRITICAL",
        title: `مفتاح高风险: ${k.firstName} ${k.fatherName}`,
        description: `مستوى الخطر 5 — ${k._count.voters} ناخب متأثر`,
        district: k.district,
        createdAt: now,
      });
    });

    // ترتيب: CRITICAL أولاً ثم WARNING ثم INFO
    const order = { CRITICAL: 0, WARNING: 1, INFO: 2 };
    alerts.sort((a, b) => order[a.type] - order[b.type]);

    return NextResponse.json(alerts);
  } catch (error) {
    return handleApiError(error, "alerts-get");
  }
}

export const GET = withAuth(getHandler, {
  GET: ["ADMIN", "KEY_USER", "OBSERVER"],
});

