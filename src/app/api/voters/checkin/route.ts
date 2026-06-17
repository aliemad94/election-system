import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { invalidateIndicatorsCache } from "@/lib/indicators-cache";

async function checkinHandler(req: NextRequest): Promise<NextResponse> {
  let body: { voterId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { voterId } = body;
  if (!voterId || typeof voterId !== "string") {
    return NextResponse.json({ error: "voterId is required" }, { status: 400 });
  }

  try {
    const result = await prisma.voter.updateMany({
      where: { id: voterId, votedOnDay: false },
      data: { votedOnDay: true },
    });

    if (result.count === 0) {
      const voter = await prisma.voter.findUnique({
        where: { id: voterId },
        select: { id: true, votedOnDay: true },
      });
      if (!voter) {
        return NextResponse.json({ error: "Voter not found" }, { status: 404 });
      }
      return NextResponse.json({ status: "already_checked_in", voterId });
    }

    invalidateIndicatorsCache();
    return NextResponse.json({ status: "checked_in", voterId });
  } catch (error) {
    console.error("[checkin] failed:", error);
    return NextResponse.json({ error: "Check-in failed" }, { status: 500 });
  }
}

export const POST = withAuth(checkinHandler, { POST: ["admin", "operator"] });
