import { NextRequest, NextResponse } from "next/server";
import { getCachedIndicators } from "@/lib/indicators-cache";
import { withAuth } from "@/lib/auth-guard";

async function getIndicators(_req: NextRequest): Promise<NextResponse> {
  try {
    const indicators = await getCachedIndicators();
    return NextResponse.json(
      {
        success: true,
        data: {
          gsi: {
            value: indicators.gsi.gsi,
            totalVoters: indicators.gsi.totalVoters,
            checkedIn: indicators.gsi.checkedIn,
            byTribe: indicators.gsi.byTribe,
          },
          edri: {
            value: indicators.edri.edri,
            dominantTribe: indicators.edri.dominantTribe,
            dominantShare: Math.round(indicators.edri.dominantShare * 1000) / 10,
            entropyScore: indicators.edri.entropyScore,
          },
          cachedAt: new Date().toISOString(),
        },
      },
      { headers: { "Cache-Control": "public, max-age=10, stale-while-revalidate=20" } }
    );
  } catch (error) {
    console.error("[indicators] computation failed:", error);
    return NextResponse.json({ success: false, error: "Failed to compute indicators" }, { status: 500 });
  }
}

export const GET = withAuth(getIndicators, { GET: ["admin", "viewer", "operator"] });
