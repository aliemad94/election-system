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

    // إذا كانت قاعدة البيانات فارغة، نقم ببذر نتائج 2025 الرسمية لذي قار تلقائياً بالبيانات المحددة فقط
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
          seatsWon: 3, 
          thresholdVotes: 25654,
          status: "مصادق",
          winnerName: "ائتلاف الاعمار والتنمية",
          winnerVotes: 80892,
          notes: "النتائج النهائية لانتخاب مجلس النواب العراقي 2025 — توزيع الفائزين — محافظة ذي قار. المصدر: المفوضية العليا المستقلة للانتخابات.",
          candidates: {
            create: [
              // 1. ائتلاف الاعمار والتنمية (207) — مجموع الأصوات: 80,892، مقاعد: 3
              { candidateName: "ناصر تركي ياسر لفته ال عواد", partyName: "ائتلاف الاعمار والتنمية (207)", votes: 7474, votePercentage: 1.46, votePercentageOfTurnout: 1.39, seatsAllocated: 1, isOurCandidate: true, notes: "مرشح فائز - رقم 5" },
              { candidateName: "باقر يوسف خلف علي الياسري", partyName: "ائتلاف الاعمار والتنمية (207)", votes: 7406, votePercentage: 1.44, votePercentageOfTurnout: 1.38, seatsAllocated: 1, isOurCandidate: true, notes: "مرشح فائز - رقم 3" },
              { candidateName: "زينب وحيد سلمان علي الخزرجي", partyName: "ائتلاف الاعمار والتنمية (207)", votes: 2588, votePercentage: 0.5, votePercentageOfTurnout: 0.48, seatsAllocated: 1, isOurCandidate: true, notes: "مرشح فائز - رقم 4" },
              { candidateName: "أصوات بقية مرشحي القائمة", partyName: "ائتلاف الاعمار والتنمية (207)", votes: 63424, votePercentage: 12.36, votePercentageOfTurnout: 11.78, seatsAllocated: 0, isOurCandidate: true, notes: "أصوات بقية مرشحي القائمة غير الفائزين" },

              // 2. ائتلاف دولة القانون (257) — مجموع الأصوات: 74,563، مقاعد: 3
              { candidateName: "حسن وريوش دخيل محمد جويس الاسدي", partyName: "ائتلاف دولة القانون (257)", votes: 16213, votePercentage: 3.16, votePercentageOfTurnout: 3.01, seatsAllocated: 1, isOurCandidate: false, notes: "مرشح فائز - رقم 3" },
              { candidateName: "حسين نعمة دخيل كاظم البطاط", partyName: "ائتلاف دولة القانون (257)", votes: 9783, votePercentage: 1.91, votePercentageOfTurnout: 1.82, seatsAllocated: 1, isOurCandidate: false, notes: "مرشح فائز - رقم 1" },
              { candidateName: "منى قاسم باقر جابر الفراجي", partyName: "ائتلاف دولة القانون (257)", votes: 4957, votePercentage: 0.97, votePercentageOfTurnout: 0.92, seatsAllocated: 1, isOurCandidate: false, notes: "مرشح فائز - رقم 9" },
              { candidateName: "أصوات بقية مرشحي القائمة", partyName: "ائتلاف دولة القانون (257)", votes: 43610, votePercentage: 8.5, votePercentageOfTurnout: 8.1, seatsAllocated: 0, isOurCandidate: false, notes: "أصوات بقية مرشحي القائمة غير الفائزين" },

              // 3. حركة الصادقون (202) — مجموع الأصوات: 61,696، مقاعد: 3
              { candidateName: "احمد كاظم فارس محسن الرميض", partyName: "حركة الصادقون (202)", votes: 7545, votePercentage: 1.47, votePercentageOfTurnout: 1.4, seatsAllocated: 1, isOurCandidate: false, notes: "مرشح فائز - رقم 7" },
              { candidateName: "عادل حاشوش جابر جاسم الحاتمي", partyName: "حركة الصادقون (202)", votes: 7269, votePercentage: 1.42, votePercentageOfTurnout: 1.35, seatsAllocated: 1, isOurCandidate: false, notes: "مرشح فائز - رقم 1" },
              { candidateName: "وفاء ضياء لازم عليوي الطائي", partyName: "حركة الصادقون (202)", votes: 2908, votePercentage: 0.57, votePercentageOfTurnout: 0.54, seatsAllocated: 1, isOurCandidate: false, notes: "مرشح فائز - رقم 8" },
              { candidateName: "أصوات بقية مرشحي القائمة", partyName: "حركة الصادقون (202)", votes: 43974, votePercentage: 8.57, votePercentageOfTurnout: 8.17, seatsAllocated: 0, isOurCandidate: false, notes: "أصوات بقية مرشحي القائمة غير الفائزين" },

              // 4. تحالف قوى الدولة الوطنية (231) — مجموع الأصوات: 46,607، مقاعد: 2
              { candidateName: "قسطل ابوطالب ظاهر حاتم ال عجيل", partyName: "تحالف قوى الدولة الوطنية (231)", votes: 6468, votePercentage: 1.26, votePercentageOfTurnout: 1.2, seatsAllocated: 1, isOurCandidate: false, notes: "مرشح فائز - رقم 3" },
              { candidateName: "مرتضى عبد خزعل ظاهر ال ابراهيمي", partyName: "تحالف قوى الدولة الوطنية (231)", votes: 6306, votePercentage: 1.23, votePercentageOfTurnout: 1.17, seatsAllocated: 1, isOurCandidate: false, notes: "مرشح فائز - رقم 1" },
              { candidateName: "أصوات بقية مرشحي القائمة", partyName: "تحالف قوى الدولة الوطنية (231)", votes: 33833, votePercentage: 6.59, votePercentageOfTurnout: 6.28, seatsAllocated: 0, isOurCandidate: false, notes: "أصوات بقية مرشحي القائمة غير الفائزين" },

              // 5. منظمة بدر (218) — مجموع الأصوات: 44,421، مقاعد: 2
              { candidateName: "رزاق محيسن عجيمي تويلي الرماحي", partyName: "منظمة بدر (218)", votes: 9364, votePercentage: 1.83, votePercentageOfTurnout: 1.74, seatsAllocated: 1, isOurCandidate: false, notes: "مرشح فائز - رقم 1" },
              { candidateName: "عبدالله حامد حسين شبيب الحميدي", partyName: "منظمة بدر (218)", votes: 3788, votePercentage: 0.74, votePercentageOfTurnout: 0.7, seatsAllocated: 1, isOurCandidate: false, notes: "مرشح فائز - رقم 2" },
              { candidateName: "أصوات بقية مرشحي القائمة", partyName: "منظمة بدر (218)", votes: 31269, votePercentage: 6.09, votePercentageOfTurnout: 5.81, seatsAllocated: 0, isOurCandidate: false, notes: "أصوات بقية مرشحي القائمة غير الفائزين" },

              // 6. حركة سومريون (239) — مجموع الأصوات: 36,611، مقاعد: 1
              { candidateName: "هديه جاسم عليوي لفته الجميعان", partyName: "حركة سومريون (239)", votes: 5884, votePercentage: 1.15, votePercentageOfTurnout: 1.09, seatsAllocated: 1, isOurCandidate: false, notes: "مرشح فائز - رقم 38" },
              { candidateName: "أصوات بقية مرشحي القائمة", partyName: "حركة سومريون (239)", votes: 30727, votePercentage: 5.99, votePercentageOfTurnout: 5.71, seatsAllocated: 0, isOurCandidate: false, notes: "أصوات بقية مرشحي القائمة غير الفائزين" },

              // 7. تحالف خدمات (271) — مجموع الأصوات: 31,171، مقاعد: 1
              { candidateName: "علا عوده لايذ شناوه الشناوه", partyName: "تحالف خدمات (271)", votes: 11484, votePercentage: 2.24, votePercentageOfTurnout: 2.13, seatsAllocated: 1, isOurCandidate: false, notes: "مرشح فائز - رقم 1" },
              { candidateName: "أصوات بقية مرشحي القائمة", partyName: "تحالف خدمات (271)", votes: 19687, votePercentage: 3.84, votePercentageOfTurnout: 3.66, seatsAllocated: 0, isOurCandidate: false, notes: "أصوات بقية مرشحي القائمة غير الفائزين" },

              // 8. ابشر يا عراق (224) — مجموع الأصوات: 23,214، مقاعد: 1
              { candidateName: "علي صابر كاظم عجيل الكناني", partyName: "ابشر يا عراق (224)", votes: 3732, votePercentage: 0.73, votePercentageOfTurnout: 0.69, seatsAllocated: 1, isOurCandidate: false, notes: "مرشح فائز - رقم 4" },
              { candidateName: "أصوات بقية مرشحي القائمة", partyName: "ابشر يا عراق (224)", votes: 19482, votePercentage: 3.8, votePercentageOfTurnout: 3.62, seatsAllocated: 0, isOurCandidate: false, notes: "أصوات بقية مرشحي القائمة غير الفائزين" },

              // 9. اشراقة كانون (245) — مجموع الأصوات: 22,521، مقاعد: 1
              { candidateName: "فاروق عدنان يوسف يعقوب الهاشم", partyName: "اشراقة كانون (245)", votes: 6471, votePercentage: 1.26, votePercentageOfTurnout: 1.2, seatsAllocated: 1, isOurCandidate: false, notes: "مرشح فائز - رقم 9" },
              { candidateName: "أصوات بقية مرشحي القائمة", partyName: "اشراقة كانون (245)", votes: 16050, votePercentage: 3.13, votePercentageOfTurnout: 2.98, seatsAllocated: 0, isOurCandidate: false, notes: "أصوات بقية مرشحي القائمة غير الفائزين" },

              // 10. كتلة دعم الدولة (289) — مجموع الأصوات: 21,615، مقاعد: 1
              { candidateName: "عماد قاسم عزيز عبد علي", partyName: "كتلة دعم الدولة (289)", votes: 3226, votePercentage: 0.63, votePercentageOfTurnout: 0.6, seatsAllocated: 1, isOurCandidate: false, notes: "مرشح فائز - رقم 5" },
              { candidateName: "أصوات بقية مرشحي القائمة", partyName: "كتلة دعم الدولة (289)", votes: 18389, votePercentage: 3.58, votePercentageOfTurnout: 3.42, seatsAllocated: 0, isOurCandidate: false, notes: "أصوات بقية مرشحي القائمة غير الفائزين" },

              // 11. حركة حقوق (251) — مجموع الأصوات: 21,184، مقاعد: 1
              { candidateName: "محمد جبار مناتي مشيعل ال سلطان", partyName: "حركة حقوق (251)", votes: 6267, votePercentage: 1.22, votePercentageOfTurnout: 1.16, seatsAllocated: 1, isOurCandidate: false, notes: "مرشح فائز - رقم 1" },
              { candidateName: "أصوات بقية مرشحي القائمة", partyName: "حركة حقوق (251)", votes: 14917, votePercentage: 2.91, votePercentageOfTurnout: 2.77, seatsAllocated: 0, isOurCandidate: false, notes: "أصوات بقية مرشحي القائمة غير الفائزين" },
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
      candidates, // array of { candidateName, partyName, votes, isOurCandidate, notes: "الترتيب: X", votePercentage: winPct }
    } = body;

    if (!year || !scope || !electionType || !candidates || !Array.isArray(candidates)) {
      return NextResponse.json({ error: "البيانات المدخلة غير مكتملة" }, { status: 400 });
    }

    const calculated = calculateElectionResults({
      candidates: candidates.map(c => ({
        candidateName: c.candidateName,
        partyName: c.partyName,
        votes: Number(c.votes) || 0,
        isOurCandidate: c.isOurCandidate,
      })),
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
            create: candidates.map((c) => {
              const calcCandidate = calculated.candidates.find(cc => cc.candidateName === c.candidateName);
              return {
                candidateName: c.candidateName,
                partyName: c.partyName,
                votes: Number(c.votes) || 0,
                // نستخدم نسبة فوز المرشح المدخلة يدوياً أو نحسبها تلقائياً
                votePercentage: c.votePercentage !== undefined ? Number(c.votePercentage) : (calcCandidate?.votePercentage ?? 0),
                votePercentageOfTurnout: calcCandidate?.votePercentageOfTurnout ?? 0,
                seatsAllocated: calcCandidate?.seatsAllocated ?? 0,
                isOurCandidate: c.isOurCandidate || false,
                notes: c.notes, // لتخزين ترتيب المرشح
              };
            }),
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
