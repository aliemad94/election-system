import { NextRequest, NextResponse } from 'next/server';

let mockWarnings = [
  {
    id: 'warn-1',
    areaType: 'قضاء',
    areaName: 'الغراف',
    warningType: 'مشاركة_منخفضة',
    severity: 'مرتفع',
    description: 'تراجع الحضور والمشاركة المتوقعة في مناطق الغراف الطرفية نتيجة تردي الخدمات الكهربائية.',
    estimatedVotesAtRisk: 250,
    recommendedAction: 'إرسال فريق الصيانة السريعة والتنسيق مع الدوائر البلدية لحل المشاكل الخدمية فوراً.',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'warn-2',
    areaType: 'مركز اقتراع',
    areaName: 'مدرسة الفرات للبنين',
    warningType: 'منافسة_عالية',
    severity: 'حرج',
    description: 'تحرك كثيف لماكينة ائتلاف دولة القانون المنافسة في قاطع آل سهلان.',
    estimatedVotesAtRisk: 180,
    recommendedAction: 'زيادة عدد اللقاءات الميدانية للمفاتيح (سعدون الركابي) وتوزيع منشورات الدعم المركزة.',
    isActive: true,
    createdAt: new Date().toISOString(),
  }
];

export async function GET(request: NextRequest) {
  return NextResponse.json(mockWarnings);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newWarn = {
      id: `warn-${Date.now()}`,
      areaType: body.areaType || 'قضاء',
      areaName: body.areaName || '',
      warningType: body.warningType || 'تنبيه',
      severity: body.severity || 'متوسط',
      description: body.description || '',
      estimatedVotesAtRisk: body.estimatedVotesAtRisk || 0,
      recommendedAction: body.recommendedAction || '',
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    mockWarnings.push(newWarn);
    return NextResponse.json(newWarn, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
