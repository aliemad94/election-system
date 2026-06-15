export interface EnrichedKey {
  id: string;
  keyCode: string;
  firstName: string;
  fatherName: string;
  district: string;
  eiiScore: number;
  kriScore: number;
  vpsScore: number;
  drsScore: number;
  campaignROI: number;
  netVotes: number;
  supportedVotes: number;
  neutralVotes: number;
  weakVotes: number;
  totalVotes: number;
  weightedScore: number;
  keyAccuracyScore: number;
  tribeId: string | null;
  subTribeId: string | null;
}

export function enrichElectoralKey(key: any, allVoters: any[] = [], sentimentTrends: any[] = []): any {
  return {
    ...key,
    voters: [],
    services: [],
    tribe: null,
    subTribe: null,
    eiiScore: 80,
    kriScore: 80,
    vpsScore: 80,
    drsScore: 10,
    campaignROI: 1,
    netVotes: 0,
    supportedVotes: 0,
    neutralVotes: 0,
    weakVotes: 0,
    totalVotes: 0,
    weightedScore: 80,
    keyAccuracyScore: 1,
  };
}
