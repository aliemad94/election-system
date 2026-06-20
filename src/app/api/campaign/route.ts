// ====================================================================
// /api/campaign — إدارة الحملة (مؤشرات الكفاءة والتكلفة)
// ====================================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/security";
import { computeCampaignROI } from "@/lib/campaign";

async function getHandler() {
  try {
    const [voters, services, keys] = await Promise.all([
      prisma.voter.findMany({ include: { services: true } }),
      prisma.service.findMany(),
      prisma.electionKey.findMany({ include: { services: true } }),
    ]);

    const supportedCount = voters.filter(
      (v) => (v.status || "").toUpperCase() === "SUPPORTED"
    ).length;
    const netVotes = Math.max(
      0,
      supportedCount -
        voters.filter((v) => (v.status || "").toUpperCase() === "WEAK").length
    );

    const totalSpent =
      voters.flatMap((v) => v.services).reduce((s, x) => s + (x.cost || 0), 0) +
      keys.flatMap((k) => k.services).reduce((s, x) => s + (x.cost || 0), 0);

    const roi = computeCampaignROI(netVotes, totalSpent);
    const costPerVoter =
      netVotes > 0 ? Math.round(totalSpent / netVotes) : 0;
    const efficiencyScore = roi.hasSpendingData
      ? Math.min(100, Math.round(roi.roi))
      : 0;

    return NextResponse.json({
      efficiencyScore,
      costPerVoter,
      totalSpent,
      netVotes,
      roi: roi.roi,
      roiLabel: roi.label,
      hasSpendingData: roi.hasSpendingData,
      servicesCount: services.length,
      servedVoters: voters.filter((v) => v.services.length > 0).length,
    });
  } catch (error) {
    return handleApiError(error, "campaign-get");
  }
}

export const GET = withAuth(getHandler, {
  GET: ["ADMIN", "KEY_USER", "OBSERVER"],
});

