import { NextRequest, NextResponse } from 'next/server';
import { calculateAllCompositeIndicators } from '@/lib/indicators-engine';
import { requirePermission, handleApiError } from '@/lib/security';
import { z } from 'zod';

const districtFilterSchema = z.object({
  district: z.string().max(100).optional(),
});

// GET /api/composite-indicators
export async function GET(request: NextRequest) {
  try {
    const authResult = requirePermission(request, 'read');
    if ('error' in authResult) return authResult.error;

    const { searchParams } = new URL(request.url);
    const filterResult = districtFilterSchema.safeParse(Object.fromEntries(searchParams));
    if (!filterResult.success) {
      return NextResponse.json({ error: 'معاملات غير صالحة' }, { status: 400 });
    }

    const { district } = filterResult.data;
    const result = await calculateAllCompositeIndicators();

    if (district) {
      const found = result.districts.find((d: { district: string }) => d.district === district);
      if (!found) {
        return NextResponse.json({ error: 'القضاء غير موجود' }, { status: 404 });
      }
      return NextResponse.json(found);
    }

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error, 'composite-indicators-get');
  }
}

// POST /api/composite-indicators - recalculate
export async function POST(request: NextRequest) {
  try {
    const authResult = requirePermission(request, 'write');
    if ('error' in authResult) return authResult.error;

    const result = await calculateAllCompositeIndicators();
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error, 'composite-indicators-post');
  }
}
