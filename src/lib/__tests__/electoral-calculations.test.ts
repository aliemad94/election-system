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
  it("أصوات العتبة = 24795", () => { expect(calculateThresholdVotes()).toBe(24795); });
  it("أصوات المقعد = 27550", () => { expect(calculateVotesPerSeat()).toBe(27550); });
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
});
