import { prisma } from "./prisma";

export async function computeAllIndicators() {
  const totalVoters = await prisma.voter.count();
  const checkedIn = await prisma.voter.count({ where: { votedOnDay: true } });

  // GSI = Checked-In percentage (checkedIn / totalVoters * 100) or default to 0 if totalVoters is 0
  const gsiVal = totalVoters > 0 ? (checkedIn / totalVoters) * 100 : 0;

  // Let's get checked in voters by tribe to satisfy indicators.gsi.byTribe structure
  // and other details:
  // We need indicators.gsi.gsi, indicators.gsi.totalVoters, indicators.gsi.checkedIn, indicators.gsi.byTribe
  const tribes = await prisma.tribe.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          voters: true,
        },
      },
      voters: {
        where: { votedOnDay: true },
        select: { id: true },
      },
    },
  });

  const byTribe = tribes.map((t) => {
    const total = t._count.voters;
    const checked = t.voters.length;
    return {
      tribeId: t.id,
      name: t.name,
      totalVoters: total,
      checkedIn: checked,
      gsi: total > 0 ? (checked / total) * 100 : 0,
    };
  });

  // EDRI computation details:
  // indicators.edri.edri, indicators.edri.dominantTribe, indicators.edri.dominantShare, indicators.edri.entropyScore
  // entropyScore could be computed or static. Let's compute a simple entropy or share.
  // Dominant tribe is the tribe with the highest checked-in voters.
  let dominantTribe = "None";
  let dominantShare = 0;
  let maxChecked = 0;

  tribes.forEach((t) => {
    const checked = t.voters.length;
    if (checked > maxChecked) {
      maxChecked = checked;
      dominantTribe = t.name;
    }
  });

  if (checkedIn > 0) {
    dominantShare = maxChecked / checkedIn;
  }

  // Simple Shannon entropy over tribe distributions of checked-in voters
  let entropyScore = 0;
  if (checkedIn > 0) {
    let sum = 0;
    tribes.forEach((t) => {
      const p = t.voters.length / checkedIn;
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
