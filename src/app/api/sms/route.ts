import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requirePermission, handleApiError } from '@/lib/security';

let mockSMSCampaigns = [
  {
    id: 'campaign-1',
    name: 'دعوة لحضور التجمع الانتخابي الكبير للشباب',
    messageBody: 'يدعوكم مرشحكم لحضور التجمع الانتخابي المقام في الغراف يوم الخميس القادم الساعة 7 مساءً. حضوركم شرف لنا.',
    status: 'SENT',
    targetCount: 450,
    sentCount: 450,
    deliveredCount: 420,
    failedCount: 30,
    filterDistrict: 'الغراف',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'campaign-2',
    name: 'تأكيد المشاركة وتوجيهات يوم الاقتراع',
    messageBody: 'أخي الناخب الكريم، صوتك هو الضمان للتغيير. ندعوك للتوجه إلى مركز الاقتراع الخاص بك يوم الأحد مبكراً.',
    status: 'DRAFT',
    targetCount: 1200,
    sentCount: 0,
    deliveredCount: 0,
    failedCount: 0,
    filterDistrict: 'الغراف',
    createdAt: new Date().toISOString(),
  }
];

const smsCreateSchema = z.object({
  name: z.string().min(1).max(200),
  messageBody: z.string().min(1).max(500),
  filterDistrict: z.string().max(100).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = requirePermission(request, 'read');
    if ('error' in authResult) return authResult.error;
    return NextResponse.json(mockSMSCampaigns);
  } catch (error) {
    return handleApiError(error, 'sms-get');
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = requirePermission(request, 'write');
    if ('error' in authResult) return authResult.error;

    const rawBody = await request.json();
    const bodyResult = smsCreateSchema.safeParse(rawBody);
    if (!bodyResult.success) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
    }

    const { name, messageBody, filterDistrict } = bodyResult.data;
    const targetCount = 350;
    const sentCount = targetCount;
    const deliveredCount = Math.floor(targetCount * 0.95);
    const failedCount = targetCount - deliveredCount;

    const campaign = {
      id: `campaign-${Date.now()}`,
      name,
      messageBody,
      status: 'SENT' as const,
      targetCount,
      sentCount,
      deliveredCount,
      failedCount,
      filterDistrict: filterDistrict || '',
      createdAt: new Date().toISOString(),
    };

    mockSMSCampaigns.push(campaign);
    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'sms-post');
  }
}
