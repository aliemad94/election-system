import { NextResponse } from 'next/server';
import { calculateComprehensiveIndicators } from '@/lib/comprehensive-indicators-engine';

export async function GET() {
  try {
    const data = await calculateComprehensiveIndicators();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error calculating comprehensive indicators:', error);
    return NextResponse.json(
      { error: 'Failed to calculate indicators', details: error?.message },
      { status: 500 }
    );
  }
}
