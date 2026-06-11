import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requirePermission, handleApiError } from '@/lib/security';

let mockDynamicIndicators = [
  {
    id: 'dyn-1',
    indicatorType: 'مزاج_شعبي',
    governorate: 'ذي قار',
    district: 'الغراف',
    value: 'إيجابي مع تطلع للخدمات',
    numericValue: 75,
    severity: 'إيجابي',
    description: 'ارتياح ملحوظ لدى الأهالي بعد صيانة شبكة الكهرباء في حي المركز.',
    source: 'فرق ميدانية',
    recordedAt: new Date().toISOString(),
  },
  {
    id: 'dyn-2',
    indicatorType: 'قضايا_ساخنة',
    governorate: 'ذي قار',
    district: 'الغراف',
    value: 'طلب توظيف خريجين',
    numericValue: 80,
    severity: 'سلبي',
    description: 'مطالبات واسعة من خريجي الدبلومات بتوفير عقود عمل حكومية.',
    source: 'استبيانات',
    recordedAt: new Date().toISOString(),
  }
];

const indicatorCreateSchema = z.object({
  indicatorType: z.string().min(1).max(100),
  governorate: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
  value: z.string().max(500).optional(),
  numericValue: z.number().min(0).max(100).optional(),
  severity: z.string().max(50).optional(),
  description: z.string().max(1000).optional(),
  source: z.string().max(200).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = requirePermission(request, 'read');
    if ('error' in authResult) return authResult.error;
    return NextResponse.json(mockDynamicIndicators);
  } catch (error) {
    return handleApiError(error, 'dynamic-indicators-get');
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = requirePermission(request, 'write');
    if ('error' in authResult) return authResult.error;

    const rawBody = await request.json();
    const bodyResult = indicatorCreateSchema.safeParse(rawBody);
    if (!bodyResult.success) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
    }

    const body = bodyResult.data;
    const newInd = {
      id: `dyn-${Date.now()}`,
      indicatorType: body.indicatorType,
      governorate: body.governorate || 'ذي قار',
      district: body.district || '',
      value: body.value || '',
      numericValue: body.numericValue ?? 50,
      severity: body.severity || 'عادي',
      description: body.description || '',
      source: body.source || '',
      recordedAt: new Date().toISOString(),
    };
    mockDynamicIndicators.push(newInd);
    return NextResponse.json(newInd, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'dynamic-indicators-post');
  }
}
