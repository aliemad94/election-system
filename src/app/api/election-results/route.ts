// ====================================================================
// /api/election-results — نتائج الانتخابات اللحظية
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/security";

async function getHandler(_req: NextRequest) {
  try {
    const [totalVoters, votedCount, byDistrictRaw, byTribeRaw, topKeysRaw] =
      await Promise.all([
        prisma.voter.count(),
        prisma.voter.count({ where: { votedOnDay: true } }),
        prisma.voter.groupBy({ by: ["district"], _count: { _all: true } }),
        prisma.voter.groupBy({
          by: ["tribeId"],
          _count: { _all: true },
        }),
        prisma.voter.groupBy({
          by: ["keyId"],
          _count: { _all: true },
          where: { votedOnDay: true },
          orderBy: { _count: { keyId: "desc" } },
          take: 10,
        }),
      ]);

    // تفصيل الأقضية مع الحضور
    const votedByDistrict = await prisma.voter.groupBy({
      by: ["district"],
      _count: { _all: true },
      where: { votedOnDay: true },
    });
    const votedDistrictMap = new Map(
      votedByDistrict.map((r) => [r.district, r._count._all])
    );
    const byDistrict = byDistrictRaw
      .map((r) => ({
        district: r.district,
        total: r._count._all,
        voted: votedDistrictMap.get(r.district) ?? 0,
        turnoutPct:
          r._count._all > 0
            ? Math.round(
                ((votedDistrictMap.get(r.district) ?? 0) / r._count._all) * 100
              )
            : 0,
      }))
      .sort((a, b) => b.total - a.total);

    // تفصيل العشائر
    const nonNullTribes = byTribeRaw.filter((r) => r.tribeId);
    const tribeIds = nonNullTribes.map((r) => r.tribeId as string);
    const [tribes, votedByTribeRaw] = await Promise.all([
      tribeIds.length > 0
        ? prisma.tribe.findMany({
            where: { id: { in: tribeIds } },
            select: { id: true, name: true },
          })
        : [],
      tribeIds.length > 0
        ? prisma.voter.groupBy({
            by: ["tribeId"],
            _count: { _all: true },
            where: { votedOnDay: true, tribeId: { in: tribeIds } },
          })
        : [],
    ]);
    const tribeMap = new Map(tribes.map((t) => [t.id, t.name]));
    const votedTribeMap = new Map(
      votedByTribeRaw.map((r) => [r.tribeId, r._count._all])
    );
    const byTribe = nonNullTribes
      .map((r) => ({
        tribeId: r.tribeId,
        tribeName: tribeMap.get(r.tribeId as string) ?? "غير محدد",
        total: r._count._all,
        voted: votedTribeMap.get(r.tribeId) ?? 0,
        turnoutPct:
          r._count._all > 0
            ? Math.round(
                ((votedTribeMap.get(r.tribeId) ?? 0) / r._count._all) * 100
              )
            : 0,
      }))
      .sort((a, b) => b.voted - a.voted)
      .slice(0, 20);

    // أفضل المفاتيح أداءً
    const keyIds = topKeysRaw.map((r) => r.keyId);
    const keys =
      keyIds.length > 0
        ? await prisma.electionKey.findMany({
            where: { id: { in: keyIds } },
            select: {
              id: true,
              firstName: true,
              fatherName: true,
              keyCode: true,
              expectedVotes: true,
              _count: { select: { voters: true } },
            },
          })
        : [];
    const keyMap = new Map(keys.map((k) => [k.id, k]));
    const topKeys = topKeysRaw.map((r) => {
      const key = keyMap.get(r.keyId);
      return {
        keyId: r.keyId,
        keyCode: key?.keyCode || "",
        keyName: key ? `${key.firstName} ${key.fatherName}` : "غير معروف",
        voted: r._count._all,
        totalAssigned: key?._count.voters ?? 0,
        expectedVotes: key?.expectedVotes ?? 0,
      };
    });

    const turnoutPct =
      totalVoters > 0 ? Math.round((votedCount / totalVoters) * 100) : 0;

    return NextResponse.json({
      summary: {
        totalVoters,
        votedCount,
        notVotedCount: totalVoters - votedCount,
        turnoutPct,
      },
      byDistrict,
      byTribe,
      topKeys,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error, "election-results-get");
  }
}

export const GET = withAuth(getHandler, {
  GET: ["ADMIN", "KEY_USER", "OBSERVER"],
});

