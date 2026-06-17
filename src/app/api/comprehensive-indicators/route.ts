import { NextRequest, NextResponse } from "next/server";
import { calculateComprehensiveIndicators } from "@/lib/comprehensive-indicators-engine";
import { withAuth, AuthenticatedUser } from "@/lib/auth-guard";

async function getHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const data = await calculateComprehensiveIndicators();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[comprehensive-indicators-get] failed:", error);
    return NextResponse.json({ error: error.message || "Failed to retrieve comprehensive indicators" }, { status: 500 });
  }
}

export const GET = withAuth(getHandler, { GET: ["admin", "observer"] });
