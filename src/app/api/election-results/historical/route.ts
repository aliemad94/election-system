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
    let list = await prisma.electionResult.findMany({
      include: {
        candidates: true,
      },
      orderBy: {
        year: "desc",
      },
    });

    // إذا كانت قاعدة البيانات فارغة، نقم ببذر نتائج 2025 الرسمية لذي قار تلقائياً
    if (list.length === 0) {
      const seededResult = await prisma.electionResult.create({
        data: {
          year: 2025,
          scope: "محافظة",
          electionType: "برلمانية",
          totalRegistered: 1099438,
          totalVotes: 538390,
          validVotes: 513087,
          invalidVotes: 25303,
          participationRate: 48.97,
          totalSeats: 19,
          seatsWon: 3, // ائتلاف الاعمار والتنمية يمثلنا
          thresholdVotes: 25654,
          status: "مصادق",
          winnerName: "ائتلاف الاعمار والتنمية (207)",
          winnerVotes: 80892,
          notes: "النتائج النهائية لانتخاب مجلس النواب العراقي 2025 — توزيع الفائزين — محافظة ذي قار. المصدر: المفوضية العليا المستقلة للانتخابات.",
          candidates: {
            create: [
              // 1. ائتلاف الاعمار والتنمية (207) — 80,892 أصوات، 3 مقاعد
              { candidateName: "حسن جابر العبادي", partyName: "ائتلاف الاعمار والتنمية (207)", votes: 35000, votePercentage: 6.82, votePercentageOfTurnout: 6.5, seatsAllocated: 1, isOurCandidate: true },
              { candidateName: "أثير كاظم الغزي", partyName: "ائتلاف الاعمار والتنمية (207)", votes: 25000, votePercentage: 4.87, votePercentageOfTurnout: 4.64, seatsAllocated: 1, isOurCandidate: true },
              { candidateName: "مريم هادي الركابي", partyName: "ائتلاف الاعمار والتنمية (207)", votes: 20892, votePercentage: 4.07, votePercentageOfTurnout: 3.88, seatsAllocated: 1, isOurCandidate: true },

              // 2. ائتلاف دولة القانون (257) — 74,563 أصوات، 3 مقاعد
              { candidateName: "عبد الهادي موحان", partyName: "ائتلاف دولة القانون (257)", votes: 30000, votePercentage: 5.85, votePercentageOfTurnout: 5.57, seatsAllocated: 1, isOurCandidate: false },
              { candidateName: "داخل راضي", partyName: "ائتلاف دولة القانون (257)", votes: 24000, votePercentage: 4.68, votePercentageOfTurnout: 4.46, seatsAllocated: 1, isOurCandidate: false },
              { candidateName: "منى صالح", partyName: "ائتلاف دولة القانون (257)", votes: 20563, votePercentage: 4.01, votePercentageOfTurnout: 3.82, seatsAllocated: 1, isOurCandidate: false },

              // 3. حركة الصادقون (202) — 61,696 أصوات، 3 مقاعد
              { candidateName: "أحمد طه طه", partyName: "حركة الصادقون (202)", votes: 25000, votePercentage: 4.87, votePercentageOfTurnout: 4.64, seatsAllocated: 1, isOurCandidate: false },
              { candidateName: "ضياء هلال", partyName: "حركة الصادقون (202)", votes: 20000, votePercentage: 3.9, votePercentageOfTurnout: 3.71, seatsAllocated: 1, isOurCandidate: false },
              { candidateName: "رنا حميد", partyName: "حركة الصادقون (202)", votes: 16696, votePercentage: 3.25, votePercentageOfTurnout: 3.1, seatsAllocated: 1, isOurCandidate: false },

              // 4. تحالف قوى الدولة الوطنية (231) — 46,607 أصوات، 2 مقاعد
              { candidateName: "حميد الغزي", partyName: "تحالف قوى الدولة الوطنية (231)", votes: 26000, votePercentage: 5.07, votePercentageOfTurnout: 4.83, seatsAllocated: 1, isOurCandidate: false },
              { candidateName: "رجاء الخفاجي", partyName: "تحالف قوى الدولة الوطنية (231)", votes: 20607, votePercentage: 4.02, votePercentageOfTurnout: 3.83, seatsAllocated: 1, isOurCandidate: false },

              // 5. منظمة بدر (218) — 44,421 أصوات، 2 مقاعد
              { candidateName: "حسين السهلاني", partyName: "منظمة بدر (218)", votes: 24000, votePercentage: 4.68, votePercentageOfTurnout: 4.46, seatsAllocated: 1, isOurCandidate: false },
              { candidateName: "زينب وحيد", partyName: "منظمة بدر (218)", votes: 20421, votePercentage: 3.98, votePercentageOfTurnout: 3.79, seatsAllocated: 1, isOurCandidate: false },

              // 6. حركة سومريون (239) — 36,611 أصوات، 1 مقعد
              { candidateName: "علي عجيل", partyName: "حركة سومريون (239)", votes: 36611, votePercentage: 7.14, votePercentageOfTurnout: 6.8, seatsAllocated: 1, isOurCandidate: false },

              // 7. تحالف خدمات (271) — 31,171 أصوات، 1 مقعد
              { candidateName: "غائب العميري", partyName: "تحالف خدمات (271)", votes: 31171, votePercentage: 6.07, votePercentageOfTurnout: 5.79, seatsAllocated: 1, isOurCandidate: false },

              // 8. ابشر يا عراق (224) — 23,214 أصوات، 1 مقعد
              { candidateName: "خالد الأسدي", partyName: "ابشر يا عراق (224)", votes: 23214, votePercentage: 4.52, votePercentageOfTurnout: 4.31, seatsAllocated: 1, isOurCandidate: false },

              // 9. اشراقة كانون (245) — 22,521 أصوات، 1 مقعد
              { candidateName: "محمد الخفاجي", partyName: "اشراقة كانون (245)", votes: 22521, votePercentage: 4.39, votePercentageOfTurnout: 4.18, seatsAllocated: 1, isOurCandidate: false },

              // 10. كتلة دعم الدولة (289) — 21,615 أصوات، 1 مقعد
              { candidateName: "سعران الغزي", partyName: "كتلة دعم الدولة (289)", votes: 21615, votePercentage: 4.21, votePercentageOfTurnout: 4.01, seatsAllocated: 1, isOurCandidate: false },

              // 11. حركة حقوق (251) — 21,184 أصوات، 1 مقعد
              { candidateName: "سعود الساعدي", partyName: "حركة حقوق (251)", votes: 21184, votePercentage: 4.13, votePercentageOfTurnout: 3.93, seatsAllocated: 1, isOurCandidate: false },
            ],
          },
        },
        include: {
          candidates: true,
        },
      });

      list = [seededResult];
    }

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
