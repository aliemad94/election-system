import { describe, it, expect } from "vitest";
import {
  calculateNetVotes, calculateTotalVotes, calculateWeightedScore,
  classifyKey, calculateCostPerVote, calculateThresholdVotes,
  calculateVotesPerSeat, filterOneNetVoters, calculateElectionResults,
  CLASSIFICATION_LABELS, DHI_QAR_CONSTANTS, VOTE_WEIGHTS,
} from "../electoral-calculations";
import { allocateSeatsLaguë } from "../seat-projection";

describe("calculateNetVotes — الأصوات الصافية المرجّحة", () => {
  it("يطبّق الأوزان الصحيحة (0.8 / 0.5 / 0.3)", () => {
    expect(calculateNetVotes({ supportedVotes: 100, neutralVotes: 100, weakVotes: 100 })).toBe(160);
  });
  it("يعيد صفراً عند كل الأصوات صفراً", () => {
    expect(calculateNetVotes({ supportedVotes: 0, neutralVotes: 0, weakVotes: 0 })).toBe(0);
  });
  it("يقرّب لرقم عشري واحد", () => {
    expect(calculateNetVotes({ supportedVotes: 1, neutralVotes: 1, weakVotes: 1 })).toBe(1.6);
  });
  it("الأوزان مطابقة للثوابت", () => {
    expect(VOTE_WEIGHTS.supported).toBe(0.8);
    expect(VOTE_WEIGHTS.neutral).toBe(0.5);
    expect(VOTE_WEIGHTS.weak).toBe(0.3);
  });
});

describe("calculateTotalVotes", () => {
  it("يجمع الفئات الثلاث", () => {
    expect(calculateTotalVotes({ supportedVotes: 50, neutralVotes: 30, weakVotes: 20 })).toBe(100);
  });
});

describe("calculateWeightedScore — حماية القسمة على صفر", () => {
  it("يعيد صفراً عند totalVotes=0 (لا Infinity)", () => {
    const r = calculateWeightedScore(50, 0);
    expect(r).toBe(0);
    expect(Number.isFinite(r)).toBe(true);
  });
  it("يعيد صفراً عند totalVotes سالب", () => {
    expect(calculateWeightedScore(50, -10)).toBe(0);
  });
  it("يحسب النسبة الصحيحة", () => {
    expect(calculateWeightedScore(80, 100)).toBe(80);
  });
  it("النتيجة دائماً منتهية", () => {
    for (const [n, t] of [[0,0],[100,0],[50,100],[-5,0]] as Array<[number,number]>)
      expect(Number.isFinite(calculateWeightedScore(n, t))).toBe(true);
  });
});

describe("classifyKey — العتبات الفعلية 45/60/75", () => {
  it("75+ → قوي", () => {
    expect(classifyKey(75)).toBe(CLASSIFICATION_LABELS.STRONG);
    expect(classifyKey(100)).toBe(CLASSIFICATION_LABELS.STRONG);
  });
  it("60..74.9 → جيد", () => {
    expect(classifyKey(60)).toBe(CLASSIFICATION_LABELS.GOOD);
    expect(classifyKey(74.9)).toBe(CLASSIFICATION_LABELS.GOOD);
  });
  it("45..59.9 → مقبول", () => {
    expect(classifyKey(45)).toBe(CLASSIFICATION_LABELS.ACCEPTABLE);
    expect(classifyKey(59.9)).toBe(CLASSIFICATION_LABELS.ACCEPTABLE);
  });
  it("<45 → ضعيف", () => {
    expect(classifyKey(44.9)).toBe(CLASSIFICATION_LABELS.WEAK);
    expect(classifyKey(0)).toBe(CLASSIFICATION_LABELS.WEAK);
  });
  it("الحدود الفاصلة تنتمي للفئة الأعلى", () => {
    expect(classifyKey(45)).not.toBe(CLASSIFICATION_LABELS.WEAK);
    expect(classifyKey(60)).not.toBe(CLASSIFICATION_LABELS.ACCEPTABLE);
    expect(classifyKey(75)).not.toBe(CLASSIFICATION_LABELS.GOOD);
  });
});

describe("calculateCostPerVote — حماية القسمة على صفر", () => {
  it("يعيد صفراً عند netVotes=0", () => {
    expect(calculateCostPerVote(100000, 0)).toBe(0);
  });
  it("يحسب التكلفة الصحيحة", () => {
    expect(calculateCostPerVote(100000, 1000)).toBe(100);
  });
  it("يعيد صفراً عند netVotes سالب", () => {
    expect(calculateCostPerVote(100000, -50)).toBe(0);
  });
});

describe("filterOneNetVoters — نسبة الفقد", () => {
  it("لا يقسم على صفر بلا أصوات", () => {
    const r = filterOneNetVoters({ supportedVotes: 0, neutralVotes: 0, weakVotes: 0 });
    expect(r.lossPercent).toBe(0);
    expect(Number.isFinite(r.lossPercent)).toBe(true);
  });
  it("يحسب الفقد الصحيح", () => {
    const r = filterOneNetVoters({ supportedVotes: 100, neutralVotes: 100, weakVotes: 100 });
    expect(r.netVoters).toBe(160);
    expect(r.loss).toBe(140);
    expect(r.lossPercent).toBeCloseTo(46.7, 1);
  });
});

describe("allocateSeatsLaguë — توزيع المقاعد (القاسم العراقي 1.7)", () => {
  it("صفر مقاعد عند totalSeats=0", () => {
    expect(allocateSeatsLaguë([{ partyName: "أ", votes: 1000 }], 0)[0].seats).toBe(0);
  });
  it("صفر مقاعد بلا أصوات", () => {
    const r = allocateSeatsLaguë([{ partyName: "أ", votes: 0 }, { partyName: "ب", votes: 0 }], 5);
    expect(r.every((p) => p.seats === 0)).toBe(true);
  });
  it("يوزّع كل المقاعد المتاحة", () => {
    const r = allocateSeatsLaguë([
      { partyName: "أ", votes: 10000 }, { partyName: "ب", votes: 6000 }, { partyName: "ج", votes: 3000 },
    ], 9);
    expect(r.reduce((s, p) => s + p.seats, 0)).toBe(9);
  });
  it("الأكبر يحصل على مقاعد ≥ الأصغر", () => {
    const r = allocateSeatsLaguë([{ partyName: "كبير", votes: 20000 }, { partyName: "صغير", votes: 2000 }], 6);
    expect(r.find(p => p.partyName === "كبير")!.seats)
      .toBeGreaterThanOrEqual(r.find(p => p.partyName === "صغير")!.seats);
  });
  it("لا يتجاوز إجمالي المقاعد المطلوب", () => {
    const r = allocateSeatsLaguë([
      { partyName: "أ", votes: 12345 }, { partyName: "ب", votes: 9876 },
      { partyName: "ج", votes: 5432 }, { partyName: "د", votes: 100 },
    ], 18);
    expect(r.reduce((s, p) => s + p.seats, 0)).toBe(18);
  });
});

describe("DHI_QAR_CONSTANTS — ثوابت المحافظة", () => {
  it("18 مقعداً", () => { expect(DHI_QAR_CONSTANTS.PARLIAMENTARY_SEATS).toBe(18); });
  it("7 أقضية", () => { expect(DHI_QAR_CONSTANTS.DISTRICTS.length).toBe(7); });
  it("أصوات العتبة = 26920", () => { expect(calculateThresholdVotes()).toBe(26920); });
  it("أصوات المقعد = 29911", () => { expect(calculateVotesPerSeat()).toBe(29911); });
});

describe("calculateElectionResults — حساب النتائج الانتخابية", () => {
  it("يحسب نسبة التصويت ونسبة الأصوات الصحيحة ونسبة إجمالي المصوتين بشكل صحيح", () => {
    const input = {
      candidates: [
        { candidateName: "مرشح 1", partyName: "حزب 1", votes: 4000, isOurCandidate: true },
        { candidateName: "مرشح 2", partyName: "حزب 2", votes: 3000, isOurCandidate: false },
        { candidateName: "مرشح 3", partyName: "حزب 3", votes: 1000, isOurCandidate: false },
      ],
      totalRegistered: 10000,
      totalVotes: 8500,
      invalidVotes: 500,
      totalSeats: 3,
    };

    const result = calculateElectionResults(input);

    expect(result.validVotes).toBe(8000); // 8500 - 500
    expect(result.participationRate).toBe(85.0); // 8500 / 10000 = 85%
    expect(result.thresholdVotes).toBe(400); // 8000 * 0.05 = 400

    const c1 = result.candidates.find(c => c.candidateName === "مرشح 1");
    expect(c1).toBeDefined();
    expect(c1!.votePercentage).toBe(50); // 4000 / 8000 = 50%
    expect(c1!.votePercentageOfTurnout).toBeCloseTo(47.06, 1); // 4000 / 8500 = 47.06%

    const c2 = result.candidates.find(c => c.candidateName === "مرشح 2");
    expect(c2).toBeDefined();
    expect(c2!.votePercentage).toBe(37.5); // 3000 / 8000 = 37.5%
    expect(c2!.votePercentageOfTurnout).toBeCloseTo(35.29, 1); // 3000 / 8500 = 35.29%
  });

  it("تتباعد النسبتان عند وجود أصوات باطلة", () => {
    const input = {
      candidates: [
        { candidateName: "مرشح 1", partyName: "حزب 1", votes: 5000 },
      ],
      totalRegistered: 10000,
      totalVotes: 6000,
      invalidVotes: 1000,
      totalSeats: 1,
    };

    const result = calculateElectionResults(input);
    const c1 = result.candidates[0];

    expect(c1.votePercentage).toBe(100); // 5000 / 5000
    expect(c1.votePercentageOfTurnout).toBeCloseTo(83.33, 1); // 5000 / 6000
    expect(c1.votePercentage).not.toBe(c1.votePercentageOfTurnout);
  });

  it("يوزّع المقاعد على الأحزاب أولاً ثم يخصّصها لمرشحي الحزب الأعلى أصواتاً", () => {
    const input = {
      candidates: [
        { candidateName: "مرشح أ1", partyName: "حزب أ", votes: 5000 },
        { candidateName: "مرشح أ2", partyName: "حزب أ", votes: 3000 },
        { candidateName: "مرشح ب1", partyName: "حزب ب", votes: 6000 },
      ],
      totalRegistered: 20000,
      totalVotes: 15000,
      invalidVotes: 1000,
      totalSeats: 2,
    };
    const result = calculateElectionResults(input);
    // حزب أ مجموع أصواته 8000 (مرشح أ1 5000 + مرشح أ2 3000)
    // حزب ب مجموع أصواته 6000 (مرشح ب1 6000)
    // المقاعد الموزعة 2: كلاهما يذهب لحزب أ وفق سانت ليغو (8000 / 1.7 = 4705.8 > 6000 / 1.7 = 3529.4)
    // المقعد الثاني لحزب أ أيضاً (8000 / 3 = 2666.6 < 6000 / 1.7 = 3529.4 -> لا، المقعد الثاني يذهب لحزب ب!
    // لحظة: دعنا نتحقق من القسمة:
    // المقعد 1:
    // حزب أ: 8000 / 1.7 = 4705.88
    // حزب ب: 6000 / 1.7 = 3529.41
    // أعلى متوسط هو حزب أ -> يحصل حزب أ على المقعد الأول (المقاعد الموزعة لحزب أ = 1)
    // المقعد 2:
    // قاسم حزب أ الآن هو 3 (لأنه حصل على مقعد واحد: 2 * 1 + 1 = 3)
    // خارج قسمة حزب أ = 8000 / 3 = 2666.67
    // قاسم حزب ب لا يزال 1.7 (لأنه لم يحصل على مقاعد: مقاعد = 0)
    // خارج قسمة حزب ب = 6000 / 1.7 = 3529.41
    // أعلى متوسط هو حزب ب (3529.41 > 2666.67) -> يحصل حزب ب على المقعد الثاني.
    // إذن حزب أ يحصل على مقعد واحد (يذهب لـ مرشح أ1 لأنه الأعلى 5000 أصوات)
    // وحزب ب يحصل على مقعد واحد (يذهب لـ مرشح ب1 لأنه الأعلى 6000 أصوات)
    // دعنا نتأكد من التوقعات:
    const ca1 = result.candidates.find(c => c.candidateName === "مرشح أ1");
    const ca2 = result.candidates.find(c => c.candidateName === "مرشح أ2");
    const cb1 = result.candidates.find(c => c.candidateName === "مرشح ب1");

    expect(ca1!.seatsAllocated).toBe(1);
    expect(ca2!.seatsAllocated).toBe(0);
    expect(cb1!.seatsAllocated).toBe(1);
  });

  it("يستبعد السجلات النائبة (أصوات بقية مرشحي القائمة) من الحصول على مقاعد فردية ويحدّد الكيان الفائز كفائز كلي", () => {
    const input = {
      candidates: [
        { candidateName: "ناصر تركي", partyName: "ائتلاف الاعمار والتنمية (207)", votes: 7474 },
        { candidateName: "باقر يوسف", partyName: "ائتلاف الاعمار والتنمية (207)", votes: 7406 },
        { candidateName: "زينب وحيد", partyName: "ائتلاف الاعمار والتنمية (207)", votes: 2588 },
        { candidateName: "أصوات بقية مرشحي القائمة", partyName: "ائتلاف الاعمار والتنمية (207)", votes: 63424 },
        { candidateName: "حسن وريوش", partyName: "ائتلاف دولة القانون (257)", votes: 20000 },
      ],
      totalRegistered: 1000000,
      totalVotes: 500000,
      invalidVotes: 0,
      totalSeats: 4,
    };
    const result = calculateElectionResults(input);
    
    // ائتلاف الاعمار والتنمية (207) مجموع الأصوات: 80892 -> يحصل على 3 مقاعد
    // ائتلاف دولة القانون (257) مجموع الأصوات: 16213 -> يحصل على 1 مقعد
    // مقاعد ائتلاف الاعمار والتنمية (207) يجب أن تذهب للمرشحين الفعليين (ناصر تركي، باقر يوسف، زينب وحيد)
    // بالرغم من أن "أصوات بقية مرشحي القائمة" لديه 63424 صوتاً، لا يجب أن يحصل على أي مقعد.
    
    const nasir = result.candidates.find(c => c.candidateName === "ناصر تركي");
    const baqir = result.candidates.find(c => c.candidateName === "باقر يوسف");
    const zainab = result.candidates.find(c => c.candidateName === "زينب وحيد");
    const residual = result.candidates.find(c => c.candidateName === "أصوات بقية مرشحي القائمة");
    const hasan = result.candidates.find(c => c.candidateName === "حسن وريوش");

    expect(nasir!.seatsAllocated).toBe(1);
    expect(baqir!.seatsAllocated).toBe(1);
    expect(zainab!.seatsAllocated).toBe(1);
    expect(residual!.seatsAllocated).toBe(0);
    expect(hasan!.seatsAllocated).toBe(1);

    // التحقق من اسم الكيان الفائز وصوته الكلي
    expect(result.winnerName).toBe("ائتلاف الاعمار والتنمية (207)");
    expect(result.winnerVotes).toBe(80892);
  });

  it("يطبق كوتا النساء 25% باستبدال الفائز الذكر الأقل أصواتاً بالأنثى الأعلى أصواتاً في القائمة الأنسب", () => {
    const input = {
      candidates: [
        { candidateName: "مرشح أ1", partyName: "حزب أ", votes: 5000, gender: "ذكر" },
        { candidateName: "مرشح أ2", partyName: "حزب أ", votes: 3000, gender: "ذكر" },
        { candidateName: "مرشح أ3", partyName: "حزب أ", votes: 2000, gender: "ذكر" },
        { candidateName: "مرشحة أ4", partyName: "حزب أ", votes: 1500, gender: "أنثى" },
        { candidateName: "مرشح ب1", partyName: "حزب ب", votes: 4500, gender: "ذكر" },
        { candidateName: "مرشحة ب2", partyName: "حزب ب", votes: 800, gender: "أنثى" },
      ],
      totalRegistered: 100000,
      totalVotes: 50000,
      invalidVotes: 0,
      totalSeats: 4, // 25% من 4 = 1 مقعد كوتا للنساء
    };

    const result = calculateElectionResults(input);

    // التحقق من أن حزب أ فاز بـ 3 مقاعد وحزب ب فاز بمقعد واحد
    // الفائزون الأوليون هم: مرشح أ1، مرشح أ2، مرشح أ3، مرشح ب1 (كلهم ذكور)
    // لتطبيق كوتا النساء (بحاجة لمرشحة واحدة):
    // كلفة التبديل في حزب أ: (مرشح أ3: 2000) ضد (مرشحة أ4: 1500) = كلفة 500
    // كلفة التبديل في حزب ب: (مرشح ب1: 4500) ضد (مرشحة ب2: 800) = كلفة 3700
    // لذا يتم التبديل في حزب أ.
    
    const a1 = result.candidates.find(c => c.candidateName === "مرشح أ1");
    const a2 = result.candidates.find(c => c.candidateName === "مرشح أ2");
    const a3 = result.candidates.find(c => c.candidateName === "مرشح أ3");
    const a4 = result.candidates.find(c => c.candidateName === "مرشحة أ4");
    const b1 = result.candidates.find(c => c.candidateName === "مرشح ب1");
    const b2 = result.candidates.find(c => c.candidateName === "مرشحة ب2");

    expect(a1!.seatsAllocated).toBe(1);
    expect(a2!.seatsAllocated).toBe(1);
    expect(a3!.seatsAllocated).toBe(0); // خسر المقعد للكوتا
    expect(a4!.seatsAllocated).toBe(1); // فازت بموجب الكوتا الجندرية
    expect(b1!.seatsAllocated).toBe(1); // احتفظ بمقعده لأن كلفة التبديل أعلى
    expect(b2!.seatsAllocated).toBe(0);
  });
});
