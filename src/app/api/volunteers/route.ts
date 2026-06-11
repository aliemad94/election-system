import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requirePermission, handleApiError, getClientIp, auditLog } from '@/lib/security';

// In-memory data (will be replaced with DB in future)
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

const volunteerCreateSchema = z.object({
  fullName: z.string().min(1).max(200),
  phone: z.string().max(20).optional(),
  email: z.string().max(200).optional(),
  role: z.enum(['FIELD_AGENT', 'COORDINATOR', 'SUPERVISOR']).optional(),
  district: z.string().max(100).optional(),
  area: z.string().max(100).optional(),
  pollingCenterId: z.string().max(200).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
  efficiencyScore: z.number().min(0).max(100).optional(),
  notes: z.string().max(1000).optional(),
});

const volunteerUpdateSchema = z.object({
  id: z.string().min(1),
  fullName: z.string().max(200).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().max(200).optional(),
  role: z.enum(['FIELD_AGENT', 'COORDINATOR', 'SUPERVISOR']).optional(),
  district: z.string().max(100).optional(),
  area: z.string().max(100).optional(),
  pollingCenterId: z.string().max(200).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
  efficiencyScore: z.number().min(0).max(100).optional(),
  notes: z.string().max(1000).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = requirePermission(request, 'read');
    if ('error' in authResult) return authResult.error;
    return NextResponse.json(mockVolunteers);
  } catch (error) {
    return handleApiError(error, 'volunteers-get');
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = requirePermission(request, 'write');
    if ('error' in authResult) return authResult.error;

    const rawBody = await request.json();
    const bodyResult = volunteerCreateSchema.safeParse(rawBody);
    if (!bodyResult.success) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
    }

    const body = bodyResult.data;
    const newVol = {
      id: `vol-${Date.now()}`,
      fullName: body.fullName,
      phone: body.phone || '',
      email: body.email || '',
      role: body.role || 'FIELD_AGENT',
      district: body.district || '',
      area: body.area || '',
      pollingCenterId: body.pollingCenterId || '',
      status: body.status || 'ACTIVE',
      efficiencyScore: body.efficiencyScore ?? 80.0,
      totalAssignedTasks: 0,
      totalCompletedTasks: 0,
      notes: body.notes || '',
      createdAt: new Date().toISOString(),
    };

    mockVolunteers.push(newVol);
    return NextResponse.json(newVol, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'volunteers-post');
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = requirePermission(request, 'write');
    if ('error' in authResult) return authResult.error;

    const rawBody = await request.json();
    const bodyResult = volunteerUpdateSchema.safeParse(rawBody);
    if (!bodyResult.success) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
    }

    const { id, ...data } = bodyResult.data;
    const idx = mockVolunteers.findIndex(v => v.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: 'المتطوع غير موجود' }, { status: 404 });
    }

    mockVolunteers[idx] = { ...mockVolunteers[idx], ...data };
    return NextResponse.json(mockVolunteers[idx]);
  } catch (error) {
    return handleApiError(error, 'volunteers-put');
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = requirePermission(request, 'delete');
    if ('error' in authResult) return authResult.error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 });
    }
    mockVolunteers = mockVolunteers.filter(v => v.id !== id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, 'volunteers-delete');
  }
}
