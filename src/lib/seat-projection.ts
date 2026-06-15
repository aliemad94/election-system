export interface PartyVotes {
  partyName: string;
  votes: number;
}

export interface AllocatedSeats {
  partyName: string;
  seats: number;
}

/**
 * Allocates legislative seats using the Saint-Laguë highest-averages method.
 * Iraqi modified version uses 1.7 as the first divisor.
 */
export function allocateSeatsLaguë(parties: PartyVotes[], totalSeats: number): AllocatedSeats[] {
  if (totalSeats <= 0 || parties.length === 0) {
    return parties.map(p => ({ partyName: p.partyName, seats: 0 }));
  }

  const result: Record<string, number> = {};
  parties.forEach(p => {
    result[p.partyName] = 0;
  });

  // Saint-Laguë highest averages seat allocation loop
  for (let s = 0; s < totalSeats; s++) {
    let maxQuotient = -1;
    let selectedParty = '';

    parties.forEach(p => {
      const seatsAllocated = result[p.partyName];
      // Divisor is 1.7 for first seat (modified Saint-Laguë), then standard 3, 5, 7...
      const divisor = seatsAllocated === 0 ? 1.7 : (2 * seatsAllocated + 1);
      const quotient = p.votes / divisor;

      if (quotient > maxQuotient) {
        maxQuotient = quotient;
        selectedParty = p.partyName;
      }
    });

    if (selectedParty) {
      result[selectedParty]++;
    }
  }

  return parties.map(p => ({
    partyName: p.partyName,
    seats: result[p.partyName] || 0,
  }));
}
