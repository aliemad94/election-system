// ====================================================================
// POST /api/sms-campaigns/[id]/send — إرسال حملة رسائل قصيرة
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import type { AuthenticatedUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";

async function postHandler(
  request: NextRequest,
  { params, user }: { params: Promise<{ id: string }>; user: AuthenticatedUser }
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

    // تغيير الحالة إلى SCHEDULED ليقوم معالج الخلفية بإرسالها بشكل متوازٍ وآمن
    const updated = await prisma.sMSCampaign.update({
      where: { id },
      data: {
        status: "SCHEDULED",
        scheduledAt: new Date(),
      },
    });

    // إنشاء تنبيه بجدولة الإرسال
    await prisma.alert.create({
      data: {
        type: "INFO",
        title: "تم جدولة حملة الرسائل",
        message: `تمت جدولة الحملة "${campaign.name}" وجاري معالجتها وإرسالها في الخلفية إلى ${campaign.recipientCount} مستلم`,
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
