export async function calculateAllCompositeIndicators() {
  return {
    governorate: {
      id: "gov-ذي قار",
      eiiScore: 80,
      kriScore: 80,
      vpsScore: 80,
      drsScore: 80,
      campaignROI: 80,
      apiScore: 80,
      ewliScore: 80,
      gsiScore: 80,
      edriScore: 80,
      efiScore: 80,
      totalKeysInArea: 0,
      totalNetVotes: 0,
      totalSupportedVotes: 0,
      totalNeutralVotes: 0,
      totalWeakVotes: 0,
      totalVotersInArea: 0,
      projectedSeats: 0,
      calculatedAt: new Date().toISOString(),
    },
    districts: [],
    lastCalculated: new Date().toISOString(),
  };
}
