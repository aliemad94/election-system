import { NextRequest, NextResponse } from "next/server";
import { calculateAllCompositeIndicators } from "@/lib/indicators-engine";
import { withAuth, AuthenticatedUser } from "@/lib/auth-guard";

async function getHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const data = await calculateAllCompositeIndicators();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[composite-indicators-get] failed:", error);
    return NextResponse.json({ error: "Failed to calculate composite indicators" }, { status: 500 });
  }
}

async function postHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const data = await calculateAllCompositeIndicators();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[composite-indicators-post] failed:", error);
    return NextResponse.json({ error: "Failed to recalculate composite indicators" }, { status: 500 });
  }
}

export const GET = withAuth(getHandler, { GET: ["admin", "observer", "operator", "key_user"] });
export const POST = withAuth(postHandler, { POST: ["admin", "operator"] });
