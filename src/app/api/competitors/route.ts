import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const competitors = await db.competitor.findMany({
      orderBy: { estimatedVotes: 'desc' },
    });
    return NextResponse.json(competitors);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, party, tribe, baseDistrict, estimatedVotes } = body;

    if (!name || !party) {
      return NextResponse.json({ error: 'اسم المرشح والحزب مطلوبان' }, { status: 400 });
    }

    const competitor = await db.competitor.create({
      data: {
        name,
        party,
        tribe: tribe || '',
        baseDistrict: baseDistrict || '',
        estimatedVotes: estimatedVotes ? parseInt(estimatedVotes) : 0,
      },
    });

    return NextResponse.json(competitor, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, party, tribe, baseDistrict, estimatedVotes } = body;

    if (!id) {
      return NextResponse.json({ error: 'المعرف ID مطلوب لتحديث بيانات المنافس' }, { status: 400 });
    }

    const updated = await db.competitor.update({
      where: { id },
      data: {
        name,
        party,
        tribe,
        baseDistrict,
        estimatedVotes: estimatedVotes !== undefined ? parseInt(estimatedVotes) : undefined,
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
      return NextResponse.json({ error: 'المعرف ID مطلوب لحذف المنافس' }, { status: 400 });
    }

    await db.competitor.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'تم حذف المنافس بنجاح' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
