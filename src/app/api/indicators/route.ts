// ====================================================================
// /api/indicators — المؤشرات المركّبة الكاملة (مخزّنة مؤقتاً 15s)
// ====================================================================

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/security";
import { getCachedIndicators } from "@/lib/indicators-cache";

async function getHandler() {
  try {
    const data = await getCachedIndicators();
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error, "indicators-get");
  }
}

export const GET = withAuth(getHandler, {
  GET: ["ADMIN", "KEY_USER", "OBSERVER"],
});

