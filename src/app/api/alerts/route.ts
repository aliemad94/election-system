import { NextRequest, NextResponse } from 'next/server';

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const alerts = mockAlerts.slice(0, limit);
    const unreadCount = mockAlerts.filter(a => !a.isRead).length;

    return NextResponse.json({ alerts, unreadCount });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ error: 'فشل في جلب التنبيهات' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, title, description, governorate, district } = body;

    const alert = {
      id: `alert-${Date.now()}`,
      type: type || 'INFO',
      title,
      description,
      governorate: governorate || 'ذي قار',
      district,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    mockAlerts.unshift(alert);
    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json({ error: 'فشل في إنشاء التنبيه' }, { status: 500 });
  }
}
