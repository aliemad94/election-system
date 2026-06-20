// ====================================================================
// /api/analysis — تحليلات عامة (واجهة مبسّطة للمؤشرات)
// ====================================================================

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/security";
import { getCachedIndicators } from "@/lib/indicators-cache";

async function getHandler() {
  try {
    const indicators = await getCachedIndicators();
    const gov = indicators.governorate;

    return NextResponse.json({
      summary: {
        efi: gov.efiScore,
        eii: gov.eiiScore,
        kri: gov.kriScore,
        vps: gov.vpsScore,
        drs: gov.drsScore,
        projectedSeats: gov.projectedSeats,
        totalNetVotes: gov.totalNetVotes,
      },
      districts: indicators.districts.map((d) => ({
        name: d.name,
        efi: d.efiScore,
        seats: d.projectedSeats,
        keys: d.totalKeysInArea,
        voters: d.totalVotersInArea,
      })),
      seats: indicators.seatProjection,
      lastCalculated: indicators.lastCalculated,
    });
  } catch (error) {
    return handleApiError(error, "analysis-get");
  }
}

export const GET = withAuth(getHandler, {
  GET: ["ADMIN", "KEY_USER", "OBSERVER"],
});

