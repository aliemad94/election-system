// ====================================================================
// /api/comprehensive-indicators — 80+ مؤشراً تحليلياً شاملاً
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/security";
import { calculateComprehensiveIndicators } from "@/lib/comprehensive-indicators-engine";

async function getHandler(_req: NextRequest) {
  try {
    const data = await calculateComprehensiveIndicators();
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error, "comprehensive-indicators-get");
  }
}

export const GET = withAuth(getHandler, {
  GET: ["ADMIN", "KEY_USER", "OBSERVER"],
});

