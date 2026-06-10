import { NextRequest, NextResponse } from 'next/server';

let mockVolunteers = [
  {
    id: 'vol-1',
    fullName: 'أحمد صالح الكناني',
    phone: '07712345678',
    email: 'ahmed@election.iq',
    role: 'FIELD_AGENT',
    district: 'الغراف',
    area: 'المركز',
    pollingCenterId: 'مدرسة العراق الابتدائية',
    status: 'ACTIVE',
    efficiencyScore: 85.0,
    totalAssignedTasks: 12,
    totalCompletedTasks: 10,
    notes: 'نشط جداً في قاطع الغراف',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vol-2',
    fullName: 'سجاد كريم الركابي',
    phone: '07812345679',
    email: 'sajjad@election.iq',
    role: 'COORDINATOR',
    district: 'الغراف',
    area: 'آل سهلان',
    pollingCenterId: 'مدرسة الفرات للبنين',
    status: 'ACTIVE',
    efficiencyScore: 90.0,
    totalAssignedTasks: 8,
    totalCompletedTasks: 8,
    notes: 'مسؤول التنسيق الميداني للعشائر',
    createdAt: new Date().toISOString(),
  }
];

export async function GET(request: Request) {
  return NextResponse.json(mockVolunteers);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, phone, email, role, district, area, pollingCenterId, status, efficiencyScore, notes } = body;

    const newVol = {
      id: `vol-${Date.now()}`,
      fullName,
      phone,
      email: email || '',
      role: role || 'FIELD_AGENT',
      district: district || '',
      area: area || '',
      pollingCenterId: pollingCenterId || '',
      status: status || 'ACTIVE',
      efficiencyScore: efficiencyScore ? parseFloat(efficiencyScore) : 80.0,
      totalAssignedTasks: 0,
      totalCompletedTasks: 0,
      notes: notes || '',
      createdAt: new Date().toISOString(),
    };

    mockVolunteers.push(newVol);
    return NextResponse.json(newVol, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    const idx = mockVolunteers.findIndex(v => v.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: 'المتطوع غير موجود' }, { status: 404 });
    }

    mockVolunteers[idx] = {
      ...mockVolunteers[idx],
      ...data,
    };

    return NextResponse.json(mockVolunteers[idx]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    mockVolunteers = mockVolunteers.filter(v => v.id !== id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
