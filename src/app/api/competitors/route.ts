import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { requirePermission, auditLog, handleApiError, isValidCuid, getClientIp } from '@/lib/security';

// ---- Zod Validation ----
const competitorCreateSchema = z.object({
  name: z.string().min(1).max(200),
  party: z.string().min(1).max(200),
  tribe: z.string().max(200).optional(),
  baseDistrict: z.string().max(100).optional(),
  estimatedVotes: z.number().int().min(0).optional(),
});

const competitorUpdateSchema = z.object({
  id: z.string().min(1),
  name: z.string().max(200).optional(),
  party: z.string().max(200).optional(),
  tribe: z.string().max(200).optional(),
  baseDistrict: z.string().max(100).optional(),
  estimatedVotes: z.number().int().min(0).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = requirePermission(request, 'read');
    if ('error' in authResult) return authResult.error;

    const competitors = await db.competitor.findMany({
      orderBy: { estimatedVotes: 'desc' },
    });
    return NextResponse.json(competitors);
  } catch (error) {
    return handleApiError(error, 'competitors-get');
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = requirePermission(request, 'write');
    if ('error' in authResult) return authResult.error;

    const rawBody = await request.json();
    const bodyResult = competitorCreateSchema.safeParse(rawBody);
    if (!bodyResult.success) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
    }

    const { name, party, tribe, baseDistrict, estimatedVotes } = bodyResult.data;

    const competitor = await db.competitor.create({
      data: {
        name,
        party,
        tribe: tribe || '',
        baseDistrict: baseDistrict || '',
        estimatedVotes: estimatedVotes || 0,
      },
    });

    await auditLog({
      userId: authResult.user.userId,
      username: authResult.user.username,
      action: 'CREATE',
      entity: 'Competitor',
      entityId: competitor.id,
      ipAddress: getClientIp(request),
    });

    return NextResponse.json(competitor, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'competitors-post');
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = requirePermission(request, 'write');
    if ('error' in authResult) return authResult.error;

    const rawBody = await request.json();
    const bodyResult = competitorUpdateSchema.safeParse(rawBody);
    if (!bodyResult.success) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
    }

    const { id, name, party, tribe, baseDistrict, estimatedVotes } = bodyResult.data;

    if (!isValidCuid(id)) {
      return NextResponse.json({ error: 'المعرف غير صالح' }, { status: 400 });
    }

    const updated = await db.competitor.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(party !== undefined && { party }),
        ...(tribe !== undefined && { tribe }),
        ...(baseDistrict !== undefined && { baseDistrict }),
        ...(estimatedVotes !== undefined && { estimatedVotes }),
      },
    });

    await auditLog({
      userId: authResult.user.userId,
      username: authResult.user.username,
      action: 'UPDATE',
      entity: 'Competitor',
      entityId: id,
      ipAddress: getClientIp(request),
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error, 'competitors-put');
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

    await db.competitor.delete({ where: { id } });

    await auditLog({
      userId: authResult.user.userId,
      username: authResult.user.username,
      action: 'DELETE',
      entity: 'Competitor',
      entityId: id,
      ipAddress: getClientIp(request),
    });

    return NextResponse.json({ success: true, message: 'تم حذف المنافس بنجاح' });
  } catch (error) {
    return handleApiError(error, 'competitors-delete');
  }
}
