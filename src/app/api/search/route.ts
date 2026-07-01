// ====================================================================
// /api/search — بحث شامل عبر الناخبين والعشائر والمفاتيح
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/security";

async function searchHandler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim();
  const entity = searchParams.get("entity") ?? "all";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: "البحث يجب أن يكون حرفين على الأقل" },
      { status: 400 }
    );
  }

  try {
    const perEntity = entity === "all" ? Math.floor(limit / 3) : limit;

    let votersList: any[] = [];
    let tribesList: any[] = [];
    let keysList: any[] = [];

    if (entity === "voters" || entity === "all") {
      const voters = await prisma.voter.findMany({
        where: {
          OR: [
            { firstName: { contains: query } },
            { fatherName: { contains: query } },
            { grandfatherName: { contains: query } },
            { fourthName: { contains: query } },
            { nationalId: { contains: query } },
            { phone: { contains: query } },
          ],
        },
        take: perEntity,
        select: {
          id: true,
          firstName: true,
          fatherName: true,
          grandfatherName: true,
          fourthName: true,
          nationalId: true,
          votedOnDay: true,
          district: true,
          tribe: { select: { name: true } },
        },
      });
      votersList = voters.map((v) => ({
        id: v.id,
        fullName: `${v.firstName} ${v.fatherName} ${v.grandfatherName}`.trim(),
        subtitle: `${v.district} — ${v.tribe?.name ?? ""}${v.votedOnDay ? " ✓" : ""}`,
      }));
    }

    if (entity === "tribes" || entity === "all") {
      const tribes = await prisma.tribe.findMany({
        where: { name: { contains: query } },
        take: perEntity,
        select: { id: true, name: true, _count: { select: { voters: true } } },
      });
      tribesList = tribes.map((t) => ({
        id: t.id,
        fullName: t.name,
        subtitle: `${t._count.voters} ناخب`,
      }));
    }

    if (entity === "keys" || entity === "all") {
      const keys = await prisma.electionKey.findMany({
        where: {
          OR: [
            { firstName: { contains: query } },
            { fatherName: { contains: query } },
            { phone: { contains: query } },
            { keyCode: { contains: query } },
          ],
        },
        take: perEntity,
        select: {
          id: true,
          keyCode: true,
          firstName: true,
          fatherName: true,
          district: true,
          tribe: { select: { name: true } },
        },
      });
      keysList = keys.map((k) => ({
        id: k.id,
        fullName: `${k.keyCode} — ${k.firstName} ${k.fatherName}`,
        subtitle: `${k.district} — ${k.tribe?.name ?? ""}`,
      }));
    }

    const flatResults = [
      ...votersList.map(v => ({ id: v.id, entity: "voters", label: v.fullName, sublabel: v.subtitle })),
      ...tribesList.map(t => ({ id: t.id, entity: "tribes", label: t.fullName, sublabel: t.subtitle })),
      ...keysList.map(k => ({ id: k.id, entity: "keys", label: k.fullName, sublabel: k.subtitle }))
    ];

    return NextResponse.json({
      voters: votersList,
      tribes: tribesList,
      electionKeys: keysList,
      results: flatResults,
      total: flatResults.length,
      query
    });
  } catch (error) {
    return handleApiError(error, "search");
  }
}

export const GET = withAuth(searchHandler, {
  GET: ["ADMIN", "KEY_USER", "OBSERVER"],
});

