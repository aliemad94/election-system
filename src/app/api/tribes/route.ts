import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedUser } from "@/lib/auth-guard";

async function getHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const tribes = await prisma.tribe.findMany({
      include: {
        voters: true,
      },
    });

    const mapped = tribes.map((t) => {
      const voterCount = t.voters.length;
      const checkedInCount = t.voters.filter((v) => v.checkedIn).length;
      const votedPercentage = voterCount > 0 ? Math.round((checkedInCount / voterCount) * 100) : 0;

      return {
        id: t.id,
        name: t.name,
        leaderName: "غير محدد",
        leaderPhone: "",
        influence: 3,
        district: "ذي قار",
        notes: "",
        voterCount,
        votedCount: checkedInCount,
        votedPercentage,
        avgConfidence: 3,
      };
    });

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("[tribes-get] failed:", error);
    return NextResponse.json({ error: "Failed to retrieve tribes" }, { status: 500 });
  }
}

async function postHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const tribe = await prisma.tribe.create({
      data: {
        name,
      },
    });

    return NextResponse.json(tribe, { status: 201 });
  } catch (error) {
    console.error("[tribes-post] failed:", error);
    return NextResponse.json({ error: "Failed to create tribe" }, { status: 500 });
  }
}

export const GET = withAuth(getHandler, { GET: ["admin", "viewer", "operator", "key_user"] });
export const POST = withAuth(postHandler, { POST: ["admin", "operator"] });
