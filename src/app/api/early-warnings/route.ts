import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requirePermission, handleApiError } from '@/lib/security';

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
    recommendedAction: 'زيادة عدد اللقاءات الميدانية للمفاتيح وتوزيع منشورات الدعم المركزة.',
    isActive: true,
    createdAt: new Date().toISOString(),
  }
];

const warningCreateSchema = z.object({
  areaType: z.string().max(50).optional(),
  areaName: z.string().max(100).optional(),
  warningType: z.string().max(100).optional(),
  severity: z.enum(['منخفض', 'متوسط', 'مرتفع', 'حرج']).optional(),
  description: z.string().max(1000).optional(),
  estimatedVotesAtRisk: z.number().int().min(0).optional(),
  recommendedAction: z.string().max(500).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = requirePermission(request, 'read');
    if ('error' in authResult) return authResult.error;
    return NextResponse.json(mockWarnings);
  } catch (error) {
    return handleApiError(error, 'early-warnings-get');
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = requirePermission(request, 'write');
    if ('error' in authResult) return authResult.error;

    const rawBody = await request.json();
    const bodyResult = warningCreateSchema.safeParse(rawBody);
    if (!bodyResult.success) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
    }

    const body = bodyResult.data;
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
  } catch (error) {
    return handleApiError(error, 'early-warnings-post');
  }
}
