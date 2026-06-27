// ====================================================================
// POST /api/sms-campaigns/[id]/send — إرسال حملة رسائل قصيرة
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";

async function postHandler(
  request: NextRequest,
  { params, user }: { params: Promise<{ id: string }>; user: any }
) {
  try {
    const { id } = await params;

    const campaign = await prisma.sMSCampaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "الحملة غير موجودة" },
        { status: 404 }
      );
    }

    if (campaign.status === "SENT") {
      return NextResponse.json(
        { error: "الحملة مُرسَلة بالفعل" },
        { status: 400 }
      );
    }

    // في بيئة الإنتاج، هنا يتم الاتصال بـ Twilio/Vonage API
    // حالياً نُحدّث الحالة فقط كمحاكاة
    const updated = await prisma.sMSCampaign.update({
      where: { id },
      data: {
        status: "SENT",
        sentAt: new Date(),
      },
    });

    // إنشاء تنبيه بنجاح الإرسال
    await prisma.alert.create({
      data: {
        type: "INFO",
        title: "تم إرسال حملة رسائل",
        message: `تم إرسال الحملة "${campaign.name}" إلى ${campaign.recipientCount} مستلم`,
        source: "SMSEngine",
        relatedId: campaign.id,
      },
    });

    // تسجيل العملية في سجل التدقيق
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        username: user.username,
        action: "UPDATE",
        entity: "SMSCampaign",
        entityId: id,
        details: JSON.stringify({ action: "SEND", recipients: campaign.recipientCount }),
      },
    });

    return NextResponse.json({
      success: true,
      campaign: updated,
      message: `تم إرسال الحملة بنجاح إلى ${campaign.recipientCount} مستلم`,
    });
  } catch (error) {
    console.error("Error sending SMS campaign:", error);
    return NextResponse.json(
      { error: "حدث خطأ في إرسال الحملة" },
      { status: 500 }
    );
  }
}

export const POST = withAuth(postHandler, {
  POST: ["ADMIN", "KEY_USER"],
});
