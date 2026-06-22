// ====================================================================
// GET+POST /api/sms-campaigns — إدارة حملات الرسائل القصيرة
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";

async function getHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where = status ? { status } : {};

    const campaigns = await prisma.sMSCampaign.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error("Error fetching SMS campaigns:", error);
    return NextResponse.json(
      { error: "حدث خطأ في استرجاع الحملات" },
      { status: 500 }
    );
  }
}

async function postHandler(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { name, message, filterType, filterValue, provider, scheduledAt } = body;

    if (!name || !message) {
      return NextResponse.json(
        { error: "اسم الحملة ونص الرسالة مطلوبان" },
        { status: 400 }
      );
    }

    // حساب عدد المستلمين بناءً على الفلتر
    let recipientCount = 0;
    if (filterType && filterValue) {
      switch (filterType) {
        case "DISTRICT":
          recipientCount = await prisma.voter.count({
            where: { district: filterValue, phone: { not: null } },
          });
          break;
        case "TRIBE":
          recipientCount = await prisma.voter.count({
            where: { tribe: { name: filterValue }, phone: { not: null } },
          });
          break;
        case "CLASSIFICATION":
          recipientCount = await prisma.electionKey.count({
            where: { classification: filterValue },
          });
          break;
        case "CONFIDENCE":
          const minScore = parseInt(filterValue) || 0;
          recipientCount = await prisma.voter.count({
            where: {
              confidenceScore: { gte: minScore },
              phone: { not: null },
            },
          });
          break;
        default:
          break;
      }
    } else {
      // بدون فلتر — جميع الناخبين الذين لديهم أرقام هواتف
      recipientCount = await prisma.voter.count({
        where: { phone: { not: null } },
      });
    }

    const campaign = await prisma.sMSCampaign.create({
      data: {
        name,
        message,
        filterType: filterType || null,
        filterValue: filterValue || null,
        recipientCount,
        status: scheduledAt ? "SCHEDULED" : "DRAFT",
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        provider: provider || "TWILIO",
      },
    });

    return NextResponse.json({
      success: true,
      campaign,
    });
  } catch (error) {
    console.error("Error creating SMS campaign:", error);
    return NextResponse.json(
      { error: "حدث خطأ في إنشاء الحملة" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getHandler, {
  GET: ["ADMIN", "KEY_USER", "OBSERVER"],
});

export const POST = withAuth(postHandler, {
  POST: ["ADMIN", "KEY_USER"],
});
