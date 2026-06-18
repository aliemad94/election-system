import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { auditLog, getClientIp } from "@/lib/security";

// GET /api/sms - Returns mockup campaign counters based on real database records
async function getHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const totalVoters = await prisma.voter.count();
    const checkedInCount = await prisma.voter.count({ where: { votedOnDay: true } });
    
    return NextResponse.json({
      sent: totalVoters - checkedInCount,
      pending: checkedInCount,
    });
  } catch (error) {
    console.error("[sms-get] failed:", error);
    return NextResponse.json({ error: "Failed to retrieve SMS stats" }, { status: 500 });
  }
}

// POST /api/sms - Launches/Simulates a targeted SMS broadcast
async function postHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const body = await request.json();
    const { smsText, selectedDistrict, selectedTribe, confidenceScore } = body;
    const clientIp = getClientIp(request);

    if (!smsText) {
      return NextResponse.json({ error: "نص الرسالة مطلوب" }, { status: 400 });
    }

    // Build filter query for counting target reach
    const where: Record<string, any> = {};
    if (selectedDistrict) {
      where.district = selectedDistrict;
    }
    if (selectedTribe) {
      where.tribeId = selectedTribe;
    }
    if (Array.isArray(confidenceScore) && confidenceScore.length > 0) {
      where.supportDegree = { in: confidenceScore.map((s: any) => parseInt(s) || 3) };
    }

    const reach = await prisma.voter.count({ where });

    // Log the event in our database audit log
    await auditLog({
      userId: user.userId,
      username: user.username,
      action: "CREATE",
      entity: "SMSCampaign",
      details: {
        textLength: smsText.length,
        estimatedReach: reach,
        district: selectedDistrict || "الكل",
        tribe: selectedTribe || "الكل",
      },
      ipAddress: clientIp,
    });

    return NextResponse.json({
      success: true,
      message: `تم إطلاق حملة البث بنجاح إلى ${reach} ناخب مستهدف`,
      reach,
    });
  } catch (error) {
    console.error("[sms-post] failed:", error);
    return NextResponse.json({ error: "Failed to broadcast SMS campaign" }, { status: 500 });
  }
}

export const GET = withAuth(getHandler, { GET: ["admin", "viewer", "operator"] });
export const POST = withAuth(postHandler, { POST: ["admin", "operator"] });
