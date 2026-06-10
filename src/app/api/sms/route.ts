import { NextRequest, NextResponse } from 'next/server';

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

export async function GET() {
  return NextResponse.json(mockSMSCampaigns);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, messageBody, filterDistrict } = body;

    const targetCount = 350;
    const sentCount = targetCount;
    const deliveredCount = Math.floor(targetCount * 0.95);
    const failedCount = targetCount - deliveredCount;

    const campaign = {
      id: `campaign-${Date.now()}`,
      name,
      messageBody,
      status: 'SENT',
      targetCount,
      sentCount,
      deliveredCount,
      failedCount,
      filterDistrict,
      createdAt: new Date().toISOString(),
    };

    mockSMSCampaigns.push(campaign);
    return NextResponse.json(campaign, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
