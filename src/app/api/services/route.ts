import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { requirePermission, auditLog, handleApiError, isValidCuid, getClientIp } from '@/lib/security';

// ---- Zod Validation ----
const serviceFilterSchema = z.object({
  status: z.string().max(50).optional(),
  category: z.string().max(50).optional(),
  keyId: z.string().max(50).optional(),
});

const serviceCreateSchema = z.object({
  title: z.string().min(1).max(200),
  category: z.string().max(50).optional(),
  description: z.string().max(2000).optional(),
  status: z.string().max(50).optional(),
  cost: z.number().min(0).optional(),
  keyId: z.string().max(50).optional(),
});

const serviceUpdateSchema = z.object({
  id: z.string().min(1),
  title: z.string().max(200).optional(),
  category: z.string().max(50).optional(),
  description: z.string().max(2000).optional(),
  status: z.string().max(50).optional(),
  cost: z.number().min(0).optional(),
  keyId: z.string().max(50).nullable().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = requirePermission(request, 'read');
    if ('error' in authResult) return authResult.error;

    const { searchParams } = new URL(request.url);
    const filterResult = serviceFilterSchema.safeParse(Object.fromEntries(searchParams));
    if (!filterResult.success) {
      return NextResponse.json({ error: 'معاملات غير صالحة' }, { status: 400 });
    }

    const { status, category, keyId } = filterResult.data;

    const where: Record<string, unknown> = {};
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
  } catch (error) {
    return handleApiError(error, 'services-get');
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = requirePermission(request, 'write');
    if ('error' in authResult) return authResult.error;

    const rawBody = await request.json();
    const bodyResult = serviceCreateSchema.safeParse(rawBody);
    if (!bodyResult.success) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
    }

    const { title, category, description, status, cost, keyId } = bodyResult.data;

    const service = await db.service.create({
      data: {
        title,
        category: category || 'بلدية',
        description: description || '',
        status: status || 'قيد المتابعة',
        cost: cost ?? 0.0,
        keyId: keyId || null,
      },
    });

    await auditLog({
      userId: authResult.user.userId,
      username: authResult.user.username,
      action: 'CREATE',
      entity: 'Service',
      entityId: service.id,
      ipAddress: getClientIp(request),
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'services-post');
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = requirePermission(request, 'write');
    if ('error' in authResult) return authResult.error;

    const rawBody = await request.json();
    const bodyResult = serviceUpdateSchema.safeParse(rawBody);
    if (!bodyResult.success) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
    }

    const { id, title, category, description, status, cost, keyId } = bodyResult.data;

    if (!isValidCuid(id)) {
      return NextResponse.json({ error: 'المعرف غير صالح' }, { status: 400 });
    }

    const updated = await db.service.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(category !== undefined && { category }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(cost !== undefined && { cost }),
        ...(keyId !== undefined && { keyId: keyId || null }),
      },
    });

    await auditLog({
      userId: authResult.user.userId,
      username: authResult.user.username,
      action: 'UPDATE',
      entity: 'Service',
      entityId: id,
      ipAddress: getClientIp(request),
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error, 'services-put');
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = requirePermission(request, 'delete');
    if ('error' in authResult) return authResult.error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || !isValidCuid(id)) {
      return NextResponse.json({ error: 'المعرف ID مطلوب وغير صالح' }, { status: 400 });
    }

    await db.service.delete({ where: { id } });

    await auditLog({
      userId: authResult.user.userId,
      username: authResult.user.username,
      action: 'DELETE',
      entity: 'Service',
      entityId: id,
      ipAddress: getClientIp(request),
    });

    return NextResponse.json({ success: true, message: 'تم حذف الخدمة بنجاح' });
  } catch (error) {
    return handleApiError(error, 'services-delete');
  }
}
