import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { requirePermission, auditLog, handleApiError, isValidCuid, getClientIp } from '@/lib/security';

const taskCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  taskType: z.string().max(50).optional(),
  targetVoterId: z.string().max(50).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = requirePermission(request, 'read');
    if ('error' in authResult) return authResult.error;

    const services = await db.service.findMany({
      include: {
        electionKey: true
      },
      orderBy: { createdAt: 'desc' },
    });

    const mappedTasks = services.map(s => {
      let status = 'PENDING';
      if (s.status === 'منجزة') status = 'COMPLETED';
      else if (s.status === 'قيد المتابعة') status = 'IN_PROGRESS';
      else if (s.status === 'مرفوضة') status = 'CANCELLED';

      return {
        id: s.id,
        title: s.title,
        description: s.description,
        priority: 'NORMAL',
        status,
        taskType: s.category || 'MUNICIPAL',
        targetVoter: s.electionKey ? {
          id: s.electionKey.id,
          fullName: `${s.electionKey.firstName} ${s.electionKey.fatherName} (مفتاح)`,
          phoneNumber: s.electionKey.phone,
          confidenceScore: s.electionKey.loyaltyScore,
        } : null,
        assignedTo: {
          id: 'admin',
          name: 'مدير النظام',
          district: s.electionKey?.district || 'الغراف',
        },
        createdAt: s.createdAt,
      };
    });

    const statusCounts = [
      { status: 'COMPLETED', _count: { id: mappedTasks.filter(t => t.status === 'COMPLETED').length } },
      { status: 'IN_PROGRESS', _count: { id: mappedTasks.filter(t => t.status === 'IN_PROGRESS').length } },
      { status: 'PENDING', _count: { id: mappedTasks.filter(t => t.status === 'PENDING').length } },
      { status: 'CANCELLED', _count: { id: mappedTasks.filter(t => t.status === 'CANCELLED').length } },
    ];

    return NextResponse.json({ tasks: mappedTasks, statusCounts });
  } catch (error) {
    return handleApiError(error, 'tasks-get');
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = requirePermission(request, 'write');
    if ('error' in authResult) return authResult.error;

    const rawBody = await request.json();
    const bodyResult = taskCreateSchema.safeParse(rawBody);
    if (!bodyResult.success) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
    }

    const { title, description, taskType, targetVoterId } = bodyResult.data;

    const service = await db.service.create({
      data: {
        title,
        description: description || '',
        category: taskType || 'بلدية',
        status: 'قيد المتابعة',
        cost: 0.0,
        keyId: targetVoterId || null,
      },
    });

    await auditLog({
      userId: authResult.user.userId,
      username: authResult.user.username,
      action: 'CREATE',
      entity: 'Task',
      entityId: service.id,
      ipAddress: getClientIp(request),
    });

    return NextResponse.json({
      id: service.id,
      title: service.title,
      description: service.description,
      priority: 'NORMAL',
      status: 'IN_PROGRESS',
      taskType: service.category,
      createdAt: service.createdAt,
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'tasks-post');
  }
}
