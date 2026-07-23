// ====================================================================
// معالجة حملات SMS: حجز ذري، تسليم idempotent، وحالات فشل صريحة
// ====================================================================

import crypto from "node:crypto";
import { prisma } from "./prisma";
import { maskPhone } from "./response-dto";
import { sendSms, SmsSubmissionUnknownError } from "./sms-provider";
import { writeAuditLog } from "./security";

const MAX_DELIVERY_ATTEMPTS = 3;
const DELIVERY_CONCURRENCY = 5;
const CAMPAIGN_LEASE_MS = 2 * 60 * 1000;
const CAMPAIGN_STALE_MS = 5 * 60 * 1000;

function campaignLeaseName(campaignId: string): string {
  return `sms-campaign:${campaignId}`;
}

async function heartbeatCampaign(
  campaignId: string,
  owner: string
): Promise<boolean> {
  const now = new Date();
  const renewed = await prisma.schedulerLease.updateMany({
    where: {
      name: campaignLeaseName(campaignId),
      owner,
      lockedUntil: { gt: now },
    },
    data: { lockedUntil: new Date(now.getTime() + CAMPAIGN_LEASE_MS) },
  });
  if (renewed.count !== 1) return false;

  const campaign = await prisma.sMSCampaign.updateMany({
    where: { id: campaignId, status: "PROCESSING" },
    data: { processingStartedAt: now },
  });
  return campaign.count === 1;
}

function renderMessage(
  template: string,
  voter: {
    id: string;
    firstName: string;
    fatherName: string;
    grandfatherName: string;
    fourthName: string;
    district: string;
    pollingCenter: string;
    tribe: { name: string } | null;
  }
): string {
  const fullName = [
    voter.firstName,
    voter.fatherName,
    voter.grandfatherName,
    voter.fourthName,
  ].filter(Boolean).join(" ");
  let rendered = template
    .replaceAll("{firstName}", voter.firstName)
    .replaceAll("{fullName}", fullName)
    .replaceAll("{district}", voter.district)
    .replaceAll("{polling_center}", voter.pollingCenter)
    .replaceAll("{tribe}", voter.tribe?.name || "");

  rendered = rendered.replace(/\{([^{}|]+\|[^{}]+)\}/g, (_match, choicesText) => {
    const choices = String(choicesText).split("|");
    const digest = crypto
      .createHash("sha256")
      .update(`${voter.id}:${choicesText}`)
      .digest();
    return choices[digest[0] % choices.length];
  });
  if (rendered.length > 480) {
    throw new Error("Rendered SMS exceeds 480 characters");
  }
  return rendered;
}

function recipientLimit(): number {
  const value = Number(process.env.SMS_MAX_RECIPIENTS || "5000");
  return Number.isInteger(value) && value > 0 ? Math.min(value, 50_000) : 5000;
}

export function campaignVoterWhere(campaign: {
  filterType: string | null;
  filterValue: string | null;
}) {
  const where: Record<string, unknown> = {
    deletedAt: null,
    phone: { not: null },
  };
  if (!campaign.filterType || !campaign.filterValue) return where;

  switch (campaign.filterType) {
    case "CUSTOM": {
      const parsed = JSON.parse(campaign.filterValue) as {
        district?: unknown;
        tribeId?: unknown;
        minSupportDegree?: unknown;
        status?: unknown;
      };
      if (typeof parsed.district === "string" && parsed.district) {
        where.district = parsed.district;
      }
      if (typeof parsed.tribeId === "string" && parsed.tribeId) {
        where.tribeId = parsed.tribeId;
      }
      if (
        typeof parsed.minSupportDegree === "number" &&
        Number.isInteger(parsed.minSupportDegree) &&
        parsed.minSupportDegree >= 1 &&
        parsed.minSupportDegree <= 5
      ) {
        where.supportDegree = { gte: parsed.minSupportDegree };
      }
      if (
        typeof parsed.status === "string" &&
        ["SUPPORTED", "NEUTRAL", "WEAK"].includes(parsed.status)
      ) {
        where.status = parsed.status;
      }
      break;
    }
    case "DISTRICT":
      where.district = campaign.filterValue;
      break;
    case "TRIBE":
      where.tribe = { name: campaign.filterValue };
      break;
    case "CLASSIFICATION":
      where.electionKey = { classification: campaign.filterValue };
      break;
    case "CONFIDENCE": {
      const minimum = Number(campaign.filterValue);
      if (!Number.isInteger(minimum) || minimum < 0 || minimum > 100) {
        throw new Error("Invalid confidence campaign filter");
      }
      where.confidenceScore = { gte: minimum };
      break;
    }
    default:
      throw new Error("Unsupported campaign filter");
  }
  return where;
}

export function deriveCampaignStatus(
  countByStatus: ReadonlyMap<string, number>
): "DELIVERED" | "SUBMITTED" | "PARTIAL" | "FAILED" {
  const total = Array.from(countByStatus.values()).reduce(
    (sum, count) => sum + count,
    0
  );
  const delivered = countByStatus.get("DELIVERED") || 0;
  const submitted =
    (countByStatus.get("QUEUED") || 0) +
    (countByStatus.get("SENT") || 0) +
    delivered;
  const submissionUnknown = countByStatus.get("SUBMISSION_UNKNOWN") || 0;

  if (total > 0 && delivered === total) return "DELIVERED";
  if (total > 0 && submitted === total) return "SUBMITTED";
  if (submitted > 0 || submissionUnknown > 0) return "PARTIAL";
  return "FAILED";
}

async function processDelivery(
  delivery: { id: string; voterId: string },
  campaign: { id: string; provider: string; message: string }
): Promise<void> {
  const claimed = await prisma.sMSDelivery.updateMany({
    where: {
      id: delivery.id,
      status: { in: ["PENDING", "FAILED"] },
      attempts: { lt: MAX_DELIVERY_ATTEMPTS },
    },
    data: {
      status: "SENDING",
      attempts: { increment: 1 },
      lastError: null,
    },
  });
  if (claimed.count === 0) return;

  let providerAccepted = false;
  try {
    const voter = await prisma.voter.findUnique({
      where: { id: delivery.voterId },
      select: {
        id: true,
        phone: true,
        firstName: true,
        fatherName: true,
        grandfatherName: true,
        fourthName: true,
        district: true,
        pollingCenter: true,
        tribe: { select: { name: true } },
      },
    });
    if (!voter?.phone) throw new Error("Recipient has no valid phone");
    const result = await sendSms(
      campaign.provider,
      voter.phone,
      renderMessage(campaign.message, voter),
      delivery.id
    );
    providerAccepted = true;
    await prisma.sMSDelivery.updateMany({
      where: { id: delivery.id, status: "SENDING" },
      data: {
        status: "QUEUED",
        providerMessageId: result.providerMessageId,
        providerStatus: result.providerStatus,
        sentAt: new Date(),
        lastError: null,
      },
    });
  } catch (error) {
    const submissionUnknown =
      providerAccepted || error instanceof SmsSubmissionUnknownError;
    await prisma.sMSDelivery.updateMany({
      where: { id: delivery.id, status: "SENDING" },
      data: {
        status: submissionUnknown ? "SUBMISSION_UNKNOWN" : "FAILED",
        lastError:
          submissionUnknown
            ? "Provider submission outcome unknown; awaiting callback or manual reconciliation"
            : error instanceof Error
            ? error.message.slice(0, 500)
            : "Unknown provider error",
      },
    });
  }
}

async function processClaimedCampaign(
  campaignId: string,
  leaseOwner: string
): Promise<boolean> {
  const now = new Date();
  const campaign = await prisma.$transaction(async (tx) => {
    const claimed = await tx.sMSCampaign.updateMany({
      where: {
        id: campaignId,
        status: "SCHEDULED",
        OR: [{ scheduledAt: null }, { scheduledAt: { lte: now } }],
      },
      data: {
        status: "PROCESSING",
        processingStartedAt: now,
        lastError: null,
      },
    });
    if (claimed.count !== 1) return null;
    await tx.sMSDelivery.updateMany({
      where: { campaignId, status: "SENDING" },
      data: {
        status: "SUBMISSION_UNKNOWN",
        lastError:
          "Interrupted after provider submission began; awaiting callback or manual reconciliation",
      },
    });
    const record = await tx.sMSCampaign.findUniqueOrThrow({
      where: { id: campaignId },
    });
    await writeAuditLog(tx, {
      username: "scheduler",
      action: "UPDATE",
      entity: "SMSCampaign",
      entityId: campaignId,
      details: { action: "CLAIMED_FOR_PROCESSING" },
    });
    return record;
  });
  if (!campaign) return false;

  try {
    if (!(await heartbeatCampaign(campaign.id, leaseOwner))) {
      throw new Error("Campaign processing lease was lost");
    }
    const where = campaignVoterWhere(campaign);
    const totalRecipients = await prisma.voter.count({ where });
    const limit = recipientLimit();
    if (totalRecipients === 0) {
      throw new Error("Campaign has no eligible recipients");
    }
    if (totalRecipients > limit) {
      throw new Error(`Campaign recipient count exceeds configured limit (${limit})`);
    }

    const recipients = await prisma.voter.findMany({
      where,
      select: { id: true, phone: true },
      orderBy: { id: "asc" },
      take: limit,
    });
    if (!(await heartbeatCampaign(campaign.id, leaseOwner))) {
      throw new Error("Campaign processing lease was lost");
    }
    await prisma.$transaction(async (tx) => {
      await tx.sMSDelivery.createMany({
        data: recipients.map((recipient) => ({
          campaignId: campaign.id,
          voterId: recipient.id,
          maskedPhone: maskPhone(recipient.phone, "KEY_USER"),
        })),
        skipDuplicates: true,
      });
      await tx.sMSCampaign.update({
        where: { id: campaign.id },
        data: { recipientCount: recipients.length },
      });
      await writeAuditLog(tx, {
        username: "scheduler",
        action: "UPDATE",
        entity: "SMSCampaign",
        entityId: campaign.id,
        details: { action: "PROCESSING", recipients: recipients.length },
      });
    });

    for (let round = 0; round < MAX_DELIVERY_ATTEMPTS; round += 1) {
      const deliveries = await prisma.sMSDelivery.findMany({
        where: {
          campaignId: campaign.id,
          status: { in: ["PENDING", "FAILED"] },
          attempts: { lt: MAX_DELIVERY_ATTEMPTS },
        },
        select: { id: true, voterId: true },
        orderBy: { id: "asc" },
      });
      if (deliveries.length === 0) break;

      for (
        let index = 0;
        index < deliveries.length;
        index += DELIVERY_CONCURRENCY
      ) {
        if (!(await heartbeatCampaign(campaign.id, leaseOwner))) {
          throw new Error("Campaign processing lease was lost");
        }
        await Promise.all(
          deliveries
            .slice(index, index + DELIVERY_CONCURRENCY)
            .map((delivery) => processDelivery(delivery, campaign))
        );
        if (!(await heartbeatCampaign(campaign.id, leaseOwner))) {
          throw new Error("Campaign processing lease was lost");
        }
      }
    }

    const counts = await prisma.sMSDelivery.groupBy({
      by: ["status"],
      where: { campaignId: campaign.id },
      _count: { id: true },
    });
    const countByStatus = new Map(
      counts.map((item) => [item.status, item._count.id])
    );
    const queued = countByStatus.get("QUEUED") || 0;
    const sent = countByStatus.get("SENT") || 0;
    const delivered = countByStatus.get("DELIVERED") || 0;
    const failed = countByStatus.get("FAILED") || 0;
    const submissionUnknown = countByStatus.get("SUBMISSION_UNKNOWN") || 0;
    const submitted = queued + sent + delivered;
    const totalDeliveries = counts.reduce(
      (sum, item) => sum + item._count.id,
      0
    );
    const finalStatus = deriveCampaignStatus(countByStatus);

    if (!(await heartbeatCampaign(campaign.id, leaseOwner))) {
      throw new Error("Campaign processing lease was lost");
    }
    await prisma.$transaction(async (tx) => {
      const finalized = await tx.sMSCampaign.updateMany({
        where: { id: campaign.id, status: "PROCESSING" },
        data: {
          status: finalStatus,
          recipientCount: totalDeliveries,
          processingStartedAt: null,
          sentAt: submitted > 0 ? new Date() : null,
          lastError:
            submissionUnknown > 0
              ? `${submissionUnknown} submissions require reconciliation`
              : failed > 0
                ? `${failed} deliveries failed`
                : null,
        },
      });
      if (finalized.count !== 1) {
        throw new Error("Campaign processing ownership was lost before finalization");
      }
      await tx.alert.create({
        data: {
          type:
            finalStatus === "SUBMITTED" || finalStatus === "DELIVERED"
              ? "INFO"
              : "WARNING",
          title: "انتهى إرسال حملة الرسائل إلى المزود",
          message: `قَبِل المزود ${submitted} رسالة، وفشل إرسال ${failed} رسالة، وتحتاج ${submissionUnknown} رسالة إلى مطابقة callback أو مراجعة يدوية`,
          source: "SMSEngine",
          relatedId: campaign.id,
        },
      });
      await writeAuditLog(tx, {
        username: "scheduler",
        action: "UPDATE",
        entity: "SMSCampaign",
        entityId: campaign.id,
        details: {
          action: "PROVIDER_SUBMISSION_FINISHED",
          submitted,
          delivered,
          failed,
          submissionUnknown,
          status: finalStatus,
        },
      });
    });
    return true;
  } catch (error) {
    // A worker that lost its renewable lease must never overwrite the state
    // of a replacement worker that recovered and reclaimed the campaign.
    if (!(await heartbeatCampaign(campaign.id, leaseOwner))) return false;
    await prisma.$transaction(async (tx) => {
      const failed = await tx.sMSCampaign.updateMany({
        where: { id: campaign.id, status: "PROCESSING" },
        data: {
          status: "FAILED",
          processingStartedAt: null,
          lastError:
            error instanceof Error
              ? error.message.slice(0, 500)
              : "Campaign processing failed",
        },
      });
      if (failed.count !== 1) return;
      await writeAuditLog(tx, {
        username: "scheduler",
        action: "UPDATE",
        entity: "SMSCampaign",
        entityId: campaign.id,
        details: { action: "FAILED" },
      });
    });
    return false;
  }
}

export async function processCampaign(campaignId: string): Promise<boolean> {
  const leaseName = campaignLeaseName(campaignId);
  const lease = await acquireSchedulerLease(leaseName, CAMPAIGN_LEASE_MS);
  if (!lease.acquired) return false;
  try {
    return await processClaimedCampaign(campaignId, lease.owner);
  } finally {
    await releaseSchedulerLease(leaseName, lease.owner);
  }
}

export async function processDueCampaigns(): Promise<number> {
  const now = new Date();
  const staleThreshold = new Date(now.getTime() - CAMPAIGN_STALE_MS);
  const staleCampaigns = await prisma.sMSCampaign.findMany({
    where: {
      status: "PROCESSING",
      processingStartedAt: { lt: staleThreshold },
    },
    select: { id: true },
    take: 100,
  });
  let recoveredCount = 0;
  for (const campaign of staleCampaigns) {
    const activeLease = await prisma.schedulerLease.findFirst({
      where: {
        name: campaignLeaseName(campaign.id),
        lockedUntil: { gt: now },
      },
      select: { name: true },
    });
    if (activeLease) continue;

    const recovered = await prisma.sMSCampaign.updateMany({
      where: {
        id: campaign.id,
        status: "PROCESSING",
        processingStartedAt: { lt: staleThreshold },
      },
      data: {
        status: "SCHEDULED",
        processingStartedAt: null,
        lastError: "Recovered after expired processing lease",
      },
    });
    recoveredCount += recovered.count;
  }
  if (recoveredCount > 0) {
    await prisma.$transaction(async (tx) => {
      await writeAuditLog(tx, {
        username: "scheduler",
        action: "UPDATE",
        entity: "SMSCampaign",
        details: {
          action: "RECOVERED_STALE_CAMPAIGNS",
          count: recoveredCount,
        },
      });
    });
  }

  const due = await prisma.sMSCampaign.findMany({
    where: {
      status: "SCHEDULED",
      OR: [{ scheduledAt: null }, { scheduledAt: { lte: new Date() } }],
    },
    select: { id: true },
    orderBy: { scheduledAt: "asc" },
    take: 20,
  });
  let processed = 0;
  for (const campaign of due) {
    if (await processCampaign(campaign.id)) processed += 1;
  }
  return processed;
}

export async function acquireSchedulerLease(
  name: string,
  durationMs: number
): Promise<{ acquired: boolean; owner: string }> {
  const owner = crypto.randomUUID();
  await prisma.schedulerLease.upsert({
    where: { name },
    update: {},
    create: {
      name,
      owner: "",
      lockedUntil: new Date(0),
    },
  });
  const result = await prisma.schedulerLease.updateMany({
    where: { name, lockedUntil: { lte: new Date() } },
    data: {
      owner,
      lockedUntil: new Date(Date.now() + durationMs),
    },
  });
  return { acquired: result.count === 1, owner };
}

export async function releaseSchedulerLease(
  name: string,
  owner: string
): Promise<void> {
  await prisma.schedulerLease.updateMany({
    where: { name, owner },
    data: { lockedUntil: new Date(0) },
  });
}
