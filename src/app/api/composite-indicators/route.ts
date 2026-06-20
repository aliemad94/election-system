// ====================================================================
// /api/composite-indicators — تفصيل المؤشرات المركّبة لكل قضاء
// ====================================================================
// نفس بيانات /api/indicators لكن بترتيب يركّز على المقارنة بين الأقضية.
// ====================================================================

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/security";
import { getCachedIndicators } from "@/lib/indicators-cache";

async function getHandler() {
  try {
    const data = await getCachedIndicators();

    // تركيز على مقارنة الأقضية
    const districtComparison = data.districts.map((d) => ({
      district: d.name,
      efiScore: d.efiScore,
      eiiScore: d.eiiScore,
      kriScore: d.kriScore,
      vpsScore: d.vpsScore,
      drsScore: d.drsScore,
      apiScore: d.apiScore,
      ewliScore: d.ewliScore,
      gsiScore: d.gsiScore,
      edriScore: d.edriScore,
      projectedSeats: d.projectedSeats,
      totalKeys: d.totalKeysInArea,
      totalVoters: d.totalVotersInArea,
      netVotes: d.totalNetVotes,
    }));

    return NextResponse.json({
      governorate: data.governorate,
      districtComparison,
      seatProjection: data.seatProjection,
      lastCalculated: data.lastCalculated,
    });
  } catch (error) {
    return handleApiError(error, "composite-indicators-get");
  }
}

export const GET = withAuth(getHandler, {
  GET: ["ADMIN", "KEY_USER", "OBSERVER"],
});

