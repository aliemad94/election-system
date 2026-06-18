import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedUser } from "@/lib/auth-guard";

// GET /api/competitors - Returns all competitors
async function getHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const competitors = await prisma.competitor.findMany({
      orderBy: { createdAt: "desc" },
    });

    const mapped = competitors.map(c => ({
      id: c.id,
      candidateName: c.name,
      partyOrList: c.party,
      strengthLevel: String(c.strengthLevel),
      district: c.baseDistrict,
      primaryArea: c.primaryArea || c.tribe || "",
      estimatedVotesBase: c.estimatedVotes,
      keyStrengths: c.keyStrengths || "",
      keyWeaknesses: c.keyWeaknesses || "",
      counterStrategy: c.counterStrategy || "",
      createdAt: c.createdAt.toISOString(),
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("[competitors-get] failed:", error);
    return NextResponse.json({ error: "Failed to retrieve competitors" }, { status: 500 });
  }
}

// POST /api/competitors - Creates a new competitor
async function postHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const body = await request.json();
    const {
      candidateName,
      partyOrList,
      strengthLevel,
      district,
      primaryArea,
      estimatedVotesBase,
      keyStrengths,
      keyWeaknesses,
      counterStrategy
    } = body;

    if (!candidateName || !partyOrList) {
      return NextResponse.json({ error: "اسم المرشح المنافس والقائمة حقول مطلوبة" }, { status: 400 });
    }

    const competitor = await prisma.competitor.create({
      data: {
        name: candidateName,
        party: partyOrList,
        tribe: primaryArea || "", // maintaining schema compatibility
        baseDistrict: district || "",
        estimatedVotes: parseInt(estimatedVotesBase) || 0,
        strengthLevel: parseInt(strengthLevel) || 3,
        primaryArea: primaryArea || null,
        keyStrengths: keyStrengths || null,
        keyWeaknesses: keyWeaknesses || null,
        counterStrategy: counterStrategy || null,
      },
    });

    return NextResponse.json(competitor, { status: 201 });
  } catch (error) {
    console.error("[competitors-post] failed:", error);
    return NextResponse.json({ error: "Failed to create competitor profile" }, { status: 500 });
  }
}

export const GET = withAuth(getHandler, { GET: ["admin", "viewer", "operator"] });
export const POST = withAuth(postHandler, { POST: ["admin", "operator"] });
