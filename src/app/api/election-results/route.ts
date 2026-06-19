import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

// GET /api/election-results
// Returns real-time voting turnout aggregated by district and by tribe,
// derived from voter check-ins (votedOnDay flag).
async function getHandler(_req: NextRequest, { user: _user }: { user: AuthenticatedUser }) {
  try {
    const [totalVoters, votedCount, byDistrict, byTribe, byKey] = await Promise.all([
      // Overall totals
      prisma.voter.count(),
      prisma.voter.count({ where: { votedOnDay: true } }),

      // Breakdown by district
      prisma.voter.groupBy({
        by: ['district'],
        _count: { _all: true },
        where: {},
      }).then(async rows => {
        const votedRows = await prisma.voter.groupBy({
          by: ['district'],
          _count: { _all: true },
          where: { votedOnDay: true },
        });
        const votedMap = new Map(votedRows.map(r => [r.district, r._count._all]));
        return rows.map(r => ({
          district: r.district,
          total: r._count._all,
          voted: votedMap.get(r.district) ?? 0,
          turnoutPct: r._count._all > 0
            ? Math.round(((votedMap.get(r.district) ?? 0) / r._count._all) * 100)
            : 0,
        })).sort((a, b) => b.total - a.total);
      }),

      // Breakdown by tribe
      prisma.voter.groupBy({
        by: ['tribeId'],
        _count: { _all: true },
      }).then(async rows => {
        const nonNullRows = rows.filter(r => r.tribeId);
        if (nonNullRows.length === 0) return [];

        const tribeIds = nonNullRows.map(r => r.tribeId as string);
        const [tribes, votedRows] = await Promise.all([
          prisma.tribe.findMany({ where: { id: { in: tribeIds } }, select: { id: true, name: true } }),
          prisma.voter.groupBy({
            by: ['tribeId'],
            _count: { _all: true },
            where: { votedOnDay: true, tribeId: { in: tribeIds } },
          }),
        ]);
        const tribeMap = new Map(tribes.map(t => [t.id, t.name]));
        const votedMap = new Map(votedRows.map(r => [r.tribeId, r._count._all]));
        return nonNullRows.map(r => ({
          tribeId: r.tribeId,
          tribeName: tribeMap.get(r.tribeId as string) ?? 'غير محدد',
          total: r._count._all,
          voted: votedMap.get(r.tribeId) ?? 0,
          turnoutPct: r._count._all > 0
            ? Math.round(((votedMap.get(r.tribeId) ?? 0) / r._count._all) * 100)
            : 0,
        })).sort((a, b) => b.voted - a.voted).slice(0, 20);
      }),

      // Top performing election keys
      prisma.voter.groupBy({
        by: ['keyId'],
        _count: { _all: true },
        where: { votedOnDay: true },
        orderBy: { _count: { keyId: 'desc' } },
        take: 10,
      }).then(async rows => {
        if (rows.length === 0) return [];
        const keyIds = rows.map(r => r.keyId);
        const keys = await prisma.electionKey.findMany({
          where: { id: { in: keyIds } },
          select: {
            id: true,
            firstName: true,
            fatherName: true,
            expectedVotes: true,
            _count: { select: { voters: true } },
          },
        });
        const keyMap = new Map(keys.map(k => [k.id, k]));
        return rows.map(r => {
          const key = keyMap.get(r.keyId);
          return {
            keyId: r.keyId,
            keyName: key ? `${key.firstName} ${key.fatherName}` : 'غير معروف',
            voted: r._count._all,
            totalAssigned: key?._count.voters ?? 0,
            expectedVotes: key?.expectedVotes ?? 0,
          };
        });
      }),
    ]);

    const turnoutPct = totalVoters > 0 ? Math.round((votedCount / totalVoters) * 100) : 0;

    return NextResponse.json({
      summary: {
        totalVoters,
        votedCount,
        notVotedCount: totalVoters - votedCount,
        turnoutPct,
      },
      byDistrict,
      byTribe,
      topKeys: byKey,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[election-results-get] failed:", error);
    return NextResponse.json({ error: "فشل تحميل نتائج الانتخابات" }, { status: 500 });
  }
}

export const GET = withAuth(getHandler, { GET: ["admin", "viewer", "operator"] });
