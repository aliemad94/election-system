export interface ROIResult {
  roi: number;
  label: string;
  hasSpendingData: boolean;
}

/**
 * Calculates Campaign ROI safely
 * If there is no spending data (totalSpent <= 0), it returns hasSpendingData = false.
 */
export function computeCampaignROI(netVotes: number, totalSpent: number): ROIResult {
  if (totalSpent <= 0) {
    return {
      roi: 0,
      label: "لا توجد بيانات إنفاق",
      hasSpendingData: false,
    };
  }

  // Formula: (netVotes / (totalSpent / 1,000,000)) * 10
  const roi = Math.min(200, Math.round((netVotes / (totalSpent / 1000000)) * 10) / 10);
  return {
    roi,
    label: `${roi}%`,
    hasSpendingData: true,
  };
}
