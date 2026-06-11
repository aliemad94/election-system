import { NextRequest, NextResponse } from 'next/server';
import { calculateComprehensiveIndicators } from '@/lib/comprehensive-indicators-engine';
import { requirePermission, handleApiError } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    const authResult = requirePermission(request, 'read');
    if ('error' in authResult) return authResult.error;

    const data = await calculateComprehensiveIndicators();
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error, 'comprehensive-indicators-get');
  }
}
