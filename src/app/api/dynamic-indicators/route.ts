import { NextRequest, NextResponse } from 'next/server';

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

export async function GET(request: NextRequest) {
  return NextResponse.json(mockDynamicIndicators);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newInd = {
      id: `dyn-${Date.now()}`,
      indicatorType: body.indicatorType,
      governorate: body.governorate || 'ذي قار',
      district: body.district || '',
      value: body.value || '',
      numericValue: body.numericValue ? parseFloat(body.numericValue) : 50,
      severity: body.severity || 'عادي',
      description: body.description || '',
      source: body.source || '',
      recordedAt: new Date().toISOString(),
    };
    mockDynamicIndicators.push(newInd);
    return NextResponse.json(newInd, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
