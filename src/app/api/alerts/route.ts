import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requirePermission, handleApiError } from '@/lib/security';

let mockAlerts = [
  {
    id: 'alert-1',
    type: 'WARNING',
    title: 'تحرك منافسين في الغراف',
    description: 'تم رصد تحركات دعائية مكثفة للخصوم في حي الغدير.',
    governorate: 'ذي قار',
    district: 'الغراف',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'alert-2',
    type: 'CRITICAL',
    title: 'خطر تسرب أصوات مفتاح',
    description: 'المفتاح سعدون الركابي لديه طلبات خدمية معلقة ويهدد بتجميد نشاطه.',
    governorate: 'ذي قار',
    district: 'الغراف',
    isRead: false,
    createdAt: new Date().toISOString(),
  }
];

const alertCreateSchema = z.object({
  type: z.enum(['INFO', 'WARNING', 'CRITICAL']).optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  governorate: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = requirePermission(request, 'read');
    if ('error' in authResult) return authResult.error;

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    
    const alerts = mockAlerts.slice(0, limit);
    const unreadCount = mockAlerts.filter(a => !a.isRead).length;

    return NextResponse.json({ alerts, unreadCount });
  } catch (error) {
    return handleApiError(error, 'alerts-get');
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = requirePermission(request, 'write');
    if ('error' in authResult) return authResult.error;

    const rawBody = await request.json();
    const bodyResult = alertCreateSchema.safeParse(rawBody);
    if (!bodyResult.success) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
    }

    const body = bodyResult.data;
    const alert = {
      id: `alert-${Date.now()}`,
      type: body.type || 'INFO',
      title: body.title,
      description: body.description || '',
      governorate: body.governorate || 'ذي قار',
      district: body.district || '',
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    mockAlerts.unshift(alert);
    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'alerts-post');
  }
}
