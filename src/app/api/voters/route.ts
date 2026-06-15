import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedUser } from "@/lib/auth-guard";

// Simple schema filter for compatibility with k6 test GET /api/voters?page=1&limit=20
async function getHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") ?? "50")));
    const tribeId = searchParams.get("tribeId");

    const where: Record<string, any> = {};
    if (tribeId) {
      where.tribeId = tribeId;
    }

    const [voters, total] = await Promise.all([
      prisma.voter.findMany({
        where,
        orderBy: { name: "asc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          tribe: true,
        },
      }),
      prisma.voter.count({ where }),
    ]);

    const mappedVoters = voters.map((v) => ({
      ...v,
      fullName: v.name,
      phoneNumber: v.phone,
      nickname: v.tribe?.name || "غير محدد",
    }));

    return NextResponse.json({ voters: mappedVoters, total, page, limit });
  } catch (error) {
    console.error("[voters-get] failed:", error);
    return NextResponse.json({ error: "Failed to retrieve voters" }, { status: 500 });
  }
}

// Simple voter create for compatibility
async function postHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const body = await request.json();
    const { name, nationalId, phone, tribeId } = body;

    if (!name || !nationalId || !tribeId) {
      return NextResponse.json({ error: "name, nationalId, and tribeId are required" }, { status: 400 });
    }

    const voter = await prisma.voter.create({
      data: {
        name,
        nationalId,
        phone,
        tribeId,
        checkedIn: false,
      },
      include: {
        tribe: true,
      },
    });

    const mapped = {
      ...voter,
      fullName: voter.name,
      phoneNumber: voter.phone,
      nickname: voter.tribe?.name || "غير محدد",
    };

    return NextResponse.json(mapped, { status: 201 });
  } catch (error) {
    console.error("[voters-post] failed:", error);
    return NextResponse.json({ error: "Failed to create voter" }, { status: 500 });
  }
}

export const GET = withAuth(getHandler, { GET: ["admin", "viewer", "operator", "key_user"] });
export const POST = withAuth(postHandler, { POST: ["admin", "operator", "key_user"] });
