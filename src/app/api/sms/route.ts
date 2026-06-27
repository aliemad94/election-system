// ====================================================================
// /api/sms — بث رسائل SMS (محاكاة: تسجيل الحملة بدون إرسال فعلي)
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError, auditLog } from "@/lib/security";
import { z } from "zod";

const smsSchema = z.object({
  message: z.string().min(1, "نص الرسالة مطلوب").max(480, "الرسالة طويلة جداً"),
  district: z.string().optional(),
  tribeId: z.string().optional(),
  minSupportDegree: z.number().int().min(1).max(5).optional(),
  status: z.enum(["SUPPORTED", "NEUTRAL", "WEAK"]).optional(),
});

async function getHandler() {
  try {
    // إرجاع سجل الحملات السابقة (من AuditLog حيث action = CREATE و entity = SMS)
    const logs = await prisma.auditLog.findMany({
      where: {
        action: "CREATE",
        entity: "SMS",
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        details: true,
        createdAt: true,
        username: true,
      },
    });

    const campaigns = logs.map((l) => {
      let details: any = {};
      try {
        details = l.details ? JSON.parse(l.details) : {};
      } catch {
        // تجاهل
      }
      return {
        id: l.id,
        message: details.message || "",
        recipients: details.recipients || 0,
        filter: details.filter || "",
        createdAt: l.createdAt.toISOString(),
        username: l.username,
      };
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    return handleApiError(error, "sms-get");
  }
}

async function postHandler(req: NextRequest, { user }: any) {
  try {
    const body = await req.json();
    const parsed = smsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "بيانات غير صالحة" },
        { status: 400 }
      );
    }

    const { message, district, tribeId, minSupportDegree, status } = parsed.data;

    // حساب المستلمين المحتملين
    const where: Record<string, unknown> = {};
    if (district) where.district = district;
    if (tribeId) where.tribeId = tribeId;
    if (status) where.status = status;
    if (minSupportDegree) where.supportDegree = { gte: minSupportDegree };

    const recipientCount = await prisma.voter.count({
      where: { ...where, phone: { not: null } },
    });

    // تسجيل الحملة في AuditLog (محاكاة — لا إرسال فعلي)
    const filterDesc = [
      district && `قضاء: ${district}`,
      tribeId && `عشيرة`,
      status && `حالة: ${status}`,
      minSupportDegree && `ثقة≥${minSupportDegree}`,
    ]
      .filter(Boolean)
      .join("، ");

    // فك صياغة Spintax للرسالة لتقدير طول النص الفعلي
    let cleanedMessage = message;
    const spintaxRegex = /\{([^{}]+)\}/g;
    cleanedMessage = cleanedMessage.replace(spintaxRegex, (match, choicesStr) => {
      if (choicesStr.includes('|')) {
        const choices = choicesStr.split('|');
        return choices[0]; // استخدام الخيار الأول كقيمة افتراضية للحساب
      }
      return match;
    });

    // كشف ما إذا كانت الرسالة تحتوي على أحرف عربية (Unicode)
    const isArabic = /[\u0600-\u06FF]/.test(cleanedMessage);
    const charLimit = isArabic ? 70 : 160;

    await auditLog({
      userId: user.userId,
      username: user.username,
      action: "CREATE",
      entity: "SMS",
      details: {
        message,
        recipients: recipientCount,
        filter: filterDesc || "الكل",
      },
    });

    return NextResponse.json({
      success: true,
      recipients: recipientCount,
      message: `تم تسجيل حملة SMS لـ ${recipientCount} مستلم`,
      smsCount: Math.ceil(cleanedMessage.length / charLimit) * recipientCount,
    });
  } catch (error) {
    return handleApiError(error, "sms-post");
  }
}

export const GET = withAuth(getHandler, {
  GET: ["ADMIN", "KEY_USER", "OBSERVER"],
});
export const POST = withAuth(postHandler, { POST: ["ADMIN", "KEY_USER"] });

