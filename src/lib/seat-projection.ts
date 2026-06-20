// ====================================================================
// seat-projection.ts — توزيع المقاعد بطريقة Saint-Laguë المعدّلة
// ====================================================================
// النسخة العراقية المعدّلة تستخدم 1.7 كقاسم للمقعد الأول (بدلاً من 1)،
// ثم القواسم القياسية 3، 5، 7، 9... للمقاعد التالية.
// هذا يقلّل من إعطاء مقاعد للأحزاب الصغيرة جداً.
// ====================================================================

export interface PartyVotes {
  partyName: string;
  votes: number;
}

export interface AllocatedSeats {
  partyName: string;
  votes: number;
  seats: number;
}

/**
 * يوزّع المقاعد التشريعية باستخدام طريقة Saint-Laguë لأعلى المتوسطات.
 * النسخة العراقية المعدّلة تستخدم 1.7 كقاسم أول.
 */
export function allocateSeatsLaguë(
  parties: PartyVotes[],
  totalSeats: number
): AllocatedSeats[] {
  if (totalSeats <= 0 || parties.length === 0) {
    return parties.map((p) => ({ partyName: p.partyName, votes: p.votes, seats: 0 }));
  }

  // تصفية الأحزاب بدون أصوات
  const validParties = parties.filter((p) => p.votes > 0);
  if (validParties.length === 0) {
    return parties.map((p) => ({ partyName: p.partyName, votes: p.votes, seats: 0 }));
  }

  const seats: Record<string, number> = {};
  validParties.forEach((p) => {
    seats[p.partyName] = 0;
  });

  // حلقة توزيع المقاعد
  for (let s = 0; s < totalSeats; s++) {
    let maxQuotient = -1;
    let selectedParty = "";

    validParties.forEach((p) => {
      const seatsAllocated = seats[p.partyName];
      // القاسم: 1.7 للمقعد الأول (معدّلة عراقية)، ثم 3، 5، 7...
      const divisor = seatsAllocated === 0 ? 1.7 : 2 * seatsAllocated + 1;
      const quotient = p.votes / divisor;

      if (quotient > maxQuotient) {
        maxQuotient = quotient;
        selectedParty = p.partyName;
      }
    });

    if (selectedParty) {
      seats[selectedParty]++;
    }
  }

  return parties.map((p) => ({
    partyName: p.partyName,
    votes: p.votes,
    seats: seats[p.partyName] || 0,
  }));
}

