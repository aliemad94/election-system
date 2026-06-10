import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const keyId = searchParams.get('keyId');

    const where: any = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (keyId) where.keyId = keyId;

    const services = await db.service.findMany({
      where,
      include: {
        electionKey: {
          select: { id: true, keyCode: true, firstName: true, fatherName: true, phone: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(services);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, category, description, status, cost, keyId } = body;

    if (!title) {
      return NextResponse.json({ error: 'العنوان مطلوب' }, { status: 400 });
    }

    const service = await db.service.create({
      data: {
        title,
        category: category || 'بلدية',
        description: description || '',
        status: status || 'قيد المتابعة',
        cost: cost ? parseFloat(cost) : 0.0,
        keyId: keyId || null,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, category, description, status, cost, keyId } = body;

    if (!id) {
      return NextResponse.json({ error: 'المعرف ID مطلوب لتحديث الخدمة' }, { status: 400 });
    }

    const updated = await db.service.update({
      where: { id },
      data: {
        title,
        category,
        description,
        status,
        cost: cost ? parseFloat(cost) : undefined,
        keyId: keyId || null,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'المعرف ID مطلوب لحذف الخدمة' }, { status: 400 });
    }

    await db.service.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'تم حذف الخدمة بنجاح' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
