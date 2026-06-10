import { NextRequest, NextResponse } from 'next/server';
import { calculateAllCompositeIndicators } from '@/lib/indicators-engine';

// GET /api/composite-indicators - جلب المؤشرات المركبة
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district');

    // Calculate all indicators dynamically in memory
    const result = await calculateAllCompositeIndicators();

    if (district) {
      const found = result.districts.find(d => d.district === district);
      if (!found) {
        return NextResponse.json({ error: 'القضاء غير موجود' }, { status: 404 });
      }
      return NextResponse.json(found);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching composite indicators:', error);
    return NextResponse.json({ error: 'فشل في جلب المؤشرات المركبة', details: error?.message }, { status: 500 });
  }
}

// POST /api/composite-indicators - إعادة حساب المؤشرات
export async function POST() {
  try {
    const result = await calculateAllCompositeIndicators();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error calculating composite indicators:', error);
    return NextResponse.json({ error: 'فشل في حساب المؤشرات المركبة', details: error?.message }, { status: 500 });
  }
}
