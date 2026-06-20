// ====================================================================
// indicators.ts — مؤشرات أساسية (GSI + EDRI)
// ====================================================================

import { prisma } from "./prisma";

/**
 * يحسب مؤشرات GSI (Geographic Strength Index) و EDRI (Election Day Readiness Index)
 * بشكل مبسّط من بيانات الحضور الفعلية.
 */
export async function computeAllIndicators() {
  const totalVoters = await prisma.voter.count();
  const checkedIn = await prisma.voter.count({ where: { votedOnDay: true } });

  const gsiVal = totalVoters > 0 ? (checkedIn / totalVoters) * 100 : 0;

  const tribes = await prisma.tribe.findMany({
    select: {
      id: true,
      name: true,
      _count: { select: { voters: true } },
    },
  });

  const checkedInPerTribe = await prisma.voter.groupBy({
    by: ["tribeId"],
    where: { votedOnDay: true },
    _count: { id: true },
  });

  const checkedInDict = new Map<string, number>();
  checkedInPerTribe.forEach((g) => {
    if (g.tribeId) {
      checkedInDict.set(g.tribeId, g._count.id);
    }
  });

  const byTribe = tribes.map((t) => {
    const total = t._count.voters;
    const checked = checkedInDict.get(t.id) || 0;
    return {
      tribeId: t.id,
      name: t.name,
      totalVoters: total,
      checkedIn: checked,
      gsi: total > 0 ? (checked / total) * 100 : 0,
    };
  });

  // EDRI — العشيرة المسيطرة والإنتروبيا
  let dominantTribe = "لا يوجد";
  let dominantShare = 0;
  let maxChecked = 0;

  byTribe.forEach((bt) => {
    if (bt.checkedIn > maxChecked) {
      maxChecked = bt.checkedIn;
      dominantTribe = bt.name;
    }
  });

  if (checkedIn > 0) {
    dominantShare = maxChecked / checkedIn;
  }

  // إنتروبيا شانون على توزيع العشائر
  let entropyScore = 0;
  if (checkedIn > 0) {
    let sum = 0;
    byTribe.forEach((bt) => {
      const p = bt.checkedIn / checkedIn;
      if (p > 0) {
        sum -= p * Math.log2(p);
      }
    });
    entropyScore = Math.round(sum * 100) / 100;
  }

  const edriVal = totalVoters > 0 ? (checkedIn / totalVoters) * 100 : 0;

  return {
    gsi: {
      gsi: Math.round(gsiVal * 10) / 10,
      totalVoters,
      checkedIn,
      byTribe,
    },
    edri: {
      edri: Math.round(edriVal * 10) / 10,
      dominantTribe,
      dominantShare,
      entropyScore,
    },
  };
}

