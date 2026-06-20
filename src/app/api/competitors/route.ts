// ====================================================================
// /api/competitors — إدارة المنافسين (CRUD)
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError, auditLog } from "@/lib/security";
import { z } from "zod";

const competitorSchema = z.object({
  candidateName: z.string().min(1, "اسم المرشح مطلوب"),
  partyOrList: z.string().min(1, "القائمة مطلوبة"),
  strengthLevel: z.number().int().min(1).max(5).default(3),
  district: z.string().optional().default(""),
  primaryArea: z.string().optional().default(""),
  estimatedVotesBase: z.number().int().min(0).default(0),
  keyStrengths: z.string().optional(),
  keyWeaknesses: z.string().optional(),
  counterStrategy: z.string().optional(),
});

async function getHandler(_req: NextRequest) {
  try {
    const competitors = await prisma.competitor.findMany({
      orderBy: { createdAt: "desc" },
    });

    const mapped = competitors.map((c) => ({
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
    return handleApiError(error, "competitors-get");
  }
}

async function postHandler(req: NextRequest, { user }: any) {
  try {
    const body = await req.json();
    const parsed = competitorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "بيانات غير صالحة" },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const competitor = await prisma.competitor.create({
      data: {
        name: d.candidateName,
        party: d.partyOrList,
        tribe: d.primaryArea || "",
        baseDistrict: d.district || "",
        estimatedVotes: d.estimatedVotesBase,
        strengthLevel: d.strengthLevel,
        primaryArea: d.primaryArea || null,
        keyStrengths: d.keyStrengths || null,
        keyWeaknesses: d.keyWeaknesses || null,
        counterStrategy: d.counterStrategy || null,
      },
    });

    await auditLog({
      userId: user.userId,
      username: user.username,
      action: "CREATE",
      entity: "Competitor",
      entityId: competitor.id,
      details: { name: competitor.name },
    });

    return NextResponse.json(competitor, { status: 201 });
  } catch (error) {
    return handleApiError(error, "competitors-post");
  }
}

export const GET = withAuth(getHandler, {
  GET: ["ADMIN", "KEY_USER", "OBSERVER"],
});
export const POST = withAuth(postHandler, { POST: ["ADMIN", "KEY_USER"] });

