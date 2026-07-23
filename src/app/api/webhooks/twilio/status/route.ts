import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "twilio";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/security";

const STATUS_RANK: Record<string, number> = {
  accepted: 1,
  scheduled: 1,
  queued: 1,
  sending: 2,
  sent: 3,
  delivered: 4,
  read: 5,
  undelivered: 4,
  failed: 4,
  canceled: 4,
};

function localDeliveryStatus(providerStatus: string): string {
  if (providerStatus === "delivered" || providerStatus === "read") {
    return "DELIVERED";
  }
  if (
    providerStatus === "undelivered" ||
    providerStatus === "failed" ||
    providerStatus === "canceled"
  ) {
    return "FAILED";
  }
  if (providerStatus === "sent") return "SENT";
  return "QUEUED";
}

export async function POST(request: NextRequest) {
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const callbackUrl = process.env.TWILIO_STATUS_CALLBACK_URL?.trim();
  const signature = request.headers.get("x-twilio-signature");
  if (
    process.env.SMS_ENABLED !== "true" ||
    !authToken ||
    !accountSid ||
    !callbackUrl ||
    !signature
  ) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/x-www-form-urlencoded")
  ) {
    return NextResponse.json({ error: "نوع المحتوى غير صالح" }, { status: 415 });
  }

  const form = await request.formData();
  const params: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (typeof value === "string") params[key] = value;
  }
  const deliveryId = request.nextUrl.searchParams.get("deliveryId") || "";
  if (!/^[A-Za-z0-9_-]{10,100}$/.test(deliveryId)) {
    return NextResponse.json({ error: "معرف التسليم غير صالح" }, { status: 400 });
  }
  const validationUrl = new URL(callbackUrl);
  validationUrl.searchParams.set("deliveryId", deliveryId);
  if (!validateRequest(authToken, signature, validationUrl.toString(), params)) {
    return NextResponse.json({ error: "توقيع غير صالح" }, { status: 403 });
  }

  const messageSid = params.MessageSid || params.SmsSid;
  const providerStatus = (params.MessageStatus || params.SmsStatus || "").toLowerCase();
  const errorCode = params.ErrorCode?.slice(0, 32) || null;
  if (
    params.AccountSid !== accountSid ||
    !/^SM[a-fA-F0-9]{32}$/.test(messageSid) ||
    !(providerStatus in STATUS_RANK)
  ) {
    return NextResponse.json({ error: "بيانات callback غير صالحة" }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    const candidateDelivery = await tx.sMSDelivery.findFirst({
      where: {
        id: deliveryId,
        OR: [{ providerMessageId: null }, { providerMessageId: messageSid }],
      },
      select: {
        id: true,
        campaignId: true,
        providerStatus: true,
        status: true,
      },
    });
    if (!candidateDelivery) return;

    // Serialize all callbacks that recalculate the same campaign. Without this
    // row lock, two final callbacks can each observe the other delivery as
    // non-terminal and permanently leave the campaign in SUBMITTED.
    const lockedCampaign = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT "id"
      FROM "SMSCampaign"
      WHERE "id" = ${candidateDelivery.campaignId}
      FOR UPDATE
    `;
    if (lockedCampaign.length !== 1) return;

    // The lookup above may have happened before another callback committed.
    // Re-read only after holding the campaign lock so monotonicity decisions
    // always use the latest committed delivery state.
    const delivery = await tx.sMSDelivery.findFirst({
      where: {
        id: deliveryId,
        campaignId: candidateDelivery.campaignId,
        OR: [{ providerMessageId: null }, { providerMessageId: messageSid }],
      },
      select: {
        id: true,
        campaignId: true,
        providerStatus: true,
        status: true,
      },
    });
    if (!delivery) return;

    const currentProviderStatus = delivery.providerStatus?.toLowerCase() || "";
    const currentRank = STATUS_RANK[currentProviderStatus] ?? 0;
    const nextRank = STATUS_RANK[providerStatus] ?? 0;
    const isAlreadyDelivered = delivery.status === "DELIVERED";
    const shouldIgnore =
      isAlreadyDelivered ||
      nextRank < currentRank ||
      (nextRank === currentRank && currentProviderStatus === providerStatus);
    if (shouldIgnore) return;

    const status = localDeliveryStatus(providerStatus);
    await tx.sMSDelivery.update({
      where: { id: delivery.id },
      data: {
        status,
        providerMessageId: messageSid,
        providerStatus,
        providerErrorCode: errorCode,
        deliveredAt: status === "DELIVERED" ? new Date() : null,
        lastError:
          status === "FAILED"
            ? `Twilio delivery failure${errorCode ? ` (${errorCode})` : ""}`
            : null,
      },
    });

    const counts = await tx.sMSDelivery.groupBy({
      by: ["status"],
      where: { campaignId: delivery.campaignId },
      _count: { id: true },
    });
    const countByStatus = new Map(
      counts.map((item) => [item.status, item._count.id])
    );
    const total = counts.reduce((sum, item) => sum + item._count.id, 0);
    const delivered = countByStatus.get("DELIVERED") || 0;
    const failed = countByStatus.get("FAILED") || 0;
    const terminal = delivered + failed;
    const campaignStatus =
      total > 0 && delivered === total
        ? "DELIVERED"
        : total > 0 && terminal === total
          ? delivered > 0
            ? "PARTIAL"
            : "FAILED"
          : "SUBMITTED";

    await tx.sMSCampaign.update({
      where: { id: delivery.campaignId },
      data: {
        status: campaignStatus,
        lastError:
          failed > 0 ? `${failed} delivery confirmations failed` : null,
      },
    });
    await writeAuditLog(tx, {
      username: "twilio-webhook",
      action: "UPDATE",
      entity: "SMSDelivery",
      entityId: delivery.id,
      details: {
        providerStatus,
        campaignStatus,
        delivered,
        failed,
        total,
      },
    });
  });

  return new NextResponse(null, { status: 204 });
}
