// ====================================================================
// /api/dynamic-indicators — مؤشرات ديناميكية (GSI + EDRI مبسّط)
// ====================================================================

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/security";
import { computeAllIndicators } from "@/lib/indicators";

async function getHandler() {
  try {
    const data = await computeAllIndicators();
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error, "dynamic-indicators-get");
  }
}

export const GET = withAuth(getHandler, {
  GET: ["ADMIN", "KEY_USER", "OBSERVER"],
});

