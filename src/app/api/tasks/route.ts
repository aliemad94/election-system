import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const services = await db.service.findMany({
      include: {
        electionKey: true
      },
      orderBy: { createdAt: 'desc' },
    });

    // Map Service to Task structure
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

    // Group counts
    const statusCounts = [
      { status: 'COMPLETED', _count: { id: mappedTasks.filter(t => t.status === 'COMPLETED').length } },
      { status: 'IN_PROGRESS', _count: { id: mappedTasks.filter(t => t.status === 'IN_PROGRESS').length } },
      { status: 'PENDING', _count: { id: mappedTasks.filter(t => t.status === 'PENDING').length } },
      { status: 'CANCELLED', _count: { id: mappedTasks.filter(t => t.status === 'CANCELLED').length } },
    ];

    return NextResponse.json({ tasks: mappedTasks, statusCounts });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'فشل في جلب المهام' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, taskType, targetVoterId } = body;

    // Create a service instead
    const service = await db.service.create({
      data: {
        title,
        description: description || '',
        category: taskType || 'بلدية',
        status: 'قيد المتابعة',
        cost: 0.0,
        keyId: targetVoterId || null, // Map targetVoterId to keyId
      },
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
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'فشل في إنشاء المهمة' }, { status: 500 });
  }
}
