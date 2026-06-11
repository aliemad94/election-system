import { NextRequest, NextResponse } from 'next/server';
import { requirePermission, handleApiError } from '@/lib/security';

// Static historical data - read-only reference
const historicalResults = [
  {
    id: 'res-1',
    electionYear: '2023',
    governorate: 'ذي قار',
    district: 'الغراف',
    partyOrList: 'ائتلاف دولة القانون',
    partyPercentage: 25.5,
    partyVotes: 4200,
    candidateName: 'حيدر الغزي',
    candidateVotes: 2100,
    seatsWon: 1,
    participationChange: 2.1,
    partyStrengthChange: 1.5,
  },
  {
    id: 'res-2',
    electionYear: '2023',
    governorate: 'ذي قار',
    district: 'الغراف',
    partyOrList: 'تيار الحكمة الوطني',
    partyPercentage: 18.2,
    partyVotes: 2900,
    candidateName: 'علي الركابي',
    candidateVotes: 1450,
    seatsWon: 0,
    participationChange: 1.2,
    partyStrengthChange: -0.8,
  }
];

export async function GET(request: NextRequest) {
  try {
    const authResult = requirePermission(request, 'read');
    if ('error' in authResult) return authResult.error;
    return NextResponse.json(historicalResults);
  } catch (error) {
    return handleApiError(error, 'election-results-get');
  }
}

// POST disabled for historical data
export async function POST(request: NextRequest) {
  try {
    const authResult = requirePermission(request, 'manage_system');
    if ('error' in authResult) return authResult.error;
    // Historical election results should not be added via API
    return NextResponse.json({ error: 'لا يمكن إضافة نتائج انتخابية عبر API' }, { status: 403 });
  } catch (error) {
    return handleApiError(error, 'election-results-post');
  }
}
