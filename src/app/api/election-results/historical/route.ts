// ====================================================================
// /api/election-results/historical — إدارة سجلات النتائج الانتخابية الفعلية
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError, auditLog } from "@/lib/security";
import { calculateElectionResults } from "@/lib/electoral-calculations";

async function getHandler(_req: NextRequest) {
  try {
    const list = await prisma.electionResult.findMany({
      include: {
        candidates: true,
      },
      orderBy: {
        year: "desc",
      },
    });
    return NextResponse.json({ list });
  } catch (error) {
    return handleApiError(error, "election-results-historical-get");
  }
}

async function postHandler(req: NextRequest, { user }: { user: any }) {
  try {
    const body = await req.json();
    const {
      year,
      district,
      scope,
      electionType,
      totalRegistered,
      totalVotes,
      invalidVotes,
      totalSeats,
      status,
      notes,
      candidates, // array of { candidateName, partyName, votes, isOurCandidate }
    } = body;

    if (!year || !scope || !electionType || !candidates || !Array.isArray(candidates)) {
      return NextResponse.json({ error: "البيانات المدخلة غير مكتملة" }, { status: 400 });
    }

    const calculated = calculateElectionResults({
      candidates,
      totalRegistered: Number(totalRegistered) || 0,
      totalVotes: Number(totalVotes) || 0,
      invalidVotes: Number(invalidVotes) || 0,
      totalSeats: Number(totalSeats) || 0,
    });

    const result = await prisma.$transaction(async (tx) => {
      const record = await tx.electionResult.create({
        data: {
          year: Number(year),
          district: scope === "قضاء" ? district : null,
          scope,
          electionType,
          totalRegistered: Number(totalRegistered) || 0,
          totalVotes: Number(totalVotes) || 0,
          invalidVotes: Number(invalidVotes) || 0,
          validVotes: calculated.validVotes,
          participationRate: calculated.participationRate,
          totalSeats: Number(totalSeats) || 0,
          seatsWon: calculated.seatsWon,
          thresholdVotes: calculated.thresholdVotes,
          status,
          winnerName: calculated.winnerName,
          winnerVotes: calculated.winnerVotes,
          notes,
          candidates: {
            create: calculated.candidates.map((c) => ({
              candidateName: c.candidateName,
              partyName: c.partyName,
              votes: c.votes,
              votePercentage: c.votePercentage,
              votePercentageOfTurnout: c.votePercentageOfTurnout,
              seatsAllocated: c.seatsAllocated,
              isOurCandidate: c.isOurCandidate,
            })),
          },
        },
        include: {
          candidates: true,
        },
      });
      return record;
    });

    await auditLog({
      userId: user.userId,
      username: user.username,
      action: "CREATE",
      entity: "ElectionResult",
      entityId: result.id,
      details: { year: result.year, scope: result.scope, electionType: result.electionType },
    });

    return NextResponse.json({ result });
  } catch (error) {
    return handleApiError(error, "election-results-historical-post");
  }
}

export const GET = withAuth(getHandler, {
  GET: ["ADMIN", "KEY_USER", "OBSERVER"],
});

export const POST = withAuth(postHandler, {
  POST: ["ADMIN"],
});
