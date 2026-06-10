import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function mapGender(genderStr: string | null): string {
  if (genderStr === 'أنثى') return 'أنثى';
  return 'ذكر';
}

function mapDegree(degreeStr: string | null): string {
  if (!degreeStr) return 'بكالوريوس';
  return degreeStr;
}

// GET /api/electoral-keys - قائمة المفاتيح الانتخابية مع فلاتر
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district');
    const search = searchParams.get('search');
    const tribeId = searchParams.get('tribeId');

    const where: any = {};

    if (district) where.district = district;
    if (tribeId) where.tribeId = tribeId;
    if (search) {
      where.OR = [
        { keyCode: { contains: search } },
        { firstName: { contains: search } },
        { fatherName: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const keys = await db.electionKey.findMany({
      where,
      include: {
        voters: true,
        services: true,
        tribe: true,
        subTribe: true,
      },
      orderBy: { expectedVotes: 'desc' },
    });

    // Enrich for frontend compatibility
    const enriched = keys.map((key) => {
      const supported = key.voters.filter(v => v.status === 'SUPPORTIVE').length;
      const neutral = key.voters.filter(v => v.status === 'NEUTRAL').length;
      const opposed = key.voters.filter(v => v.status === 'OPPOSED').length;
      const total = key.voters.length;

      const accuracy = key.keyAccuracyScore ?? 1.0;
      const netVotes = Math.round((supported * 1.0 + neutral * 0.5) * accuracy);
      
      const eiiScore = Math.min(100, Math.max(0, (key.influenceLevel * 10) + (key.mobilizationCap * 10)));
      const kriScore = Math.min(100, Math.max(0, Math.round(key.loyaltyScore * 12 + accuracy * 40)));
      const drsScore = Math.min(100, Math.max(0, key.riskLevel * 20));
      const campaignROI = key.services.reduce((sum, s) => sum + s.cost, 0) > 0
        ? Math.round((netVotes / (key.services.reduce((sum, s) => sum + s.cost, 0) / 1000000)) * 10) / 10
        : 100.0;
      
      const weightedScore = Math.round((eiiScore + kriScore + (100 - drsScore)) / 3);

      return {
        ...key,
        code: key.keyCode,
        gender: key.gender === 'أنثى' ? 'أنثى' : 'ذكر',
        educationLevel: key.education,
        nickname: key.tribe?.name || 'غير محدد',
        supportedVotes: supported,
        neutralVotes: neutral,
        weakVotes: opposed,
        netVotes,
        eiiScore,
        kriScore,
        drsScore,
        campaignROI,
        weightedScore,
        classification: weightedScore >= 75 ? 'قوي' : weightedScore >= 50 ? 'جيد' : 'مقبول',
        voterCount: total,
      };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    console.error('Error fetching electoral keys:', error);
    return NextResponse.json({ error: 'فشل في جلب المفاتيح الانتخابية' }, { status: 500 });
  }
}

// POST /api/electoral-keys - إنشاء مفتاح انتخابي جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Map tribe name/id
    let tribeId: string | null = null;
    let subTribeId: string | null = null;

    if (body.tribeId) {
      tribeId = body.tribeId;
    } else if (body.nickname || body.tribe) {
      // Find or create tribe by name
      const tribeName = body.nickname || body.tribe;
      const foundTribe = await db.tribe.findUnique({ where: { name: tribeName } });
      if (foundTribe) {
        tribeId = foundTribe.id;
      } else {
        const newTribe = await db.tribe.create({ data: { name: tribeName } });
        tribeId = newTribe.id;
      }
    }

    const key = await db.electionKey.create({
      data: {
        keyCode: body.keyCode || body.code,
        firstName: body.firstName,
        fatherName: body.fatherName || '',
        grandfatherName: body.grandfatherName || '',
        fourthName: body.fourthName || '',
        gender: mapGender(body.gender),
        birthDate: body.birthDate ? new Date(body.birthDate) : new Date('1980-01-01'),
        education: mapDegree(body.education || body.educationLevel),
        profession: body.profession || '',
        phone: body.phone,
        socialMedia: body.socialMedia || {},
        province: body.province || body.governorate || 'ذي قار',
        district: body.district || 'الغراف',
        subDistrict: body.subDistrict || 'المركز',
        pollingCenter: body.pollingCenter || 'مدرسة العراق الابتدائية',
        expectedVotes: Number(body.expectedVotes || body.totalVotes) || 0,
        influenceLevel: Number(body.influenceLevel) || 3,
        mobilizationCap: Number(body.mobilizationCap || body.mobilizationAbility) || 3,
        loyaltyScore: Number(body.loyaltyScore || body.loyaltyLevel) || 3,
        riskLevel: Number(body.riskLevel) || 1,
        keyAccuracyScore: body.keyAccuracyScore !== undefined ? parseFloat(body.keyAccuracyScore) : 1.0,
        reliabilityLogs: body.reliabilityLogs || {},
        tribeId,
        subTribeId,
      },
      include: {
        voters: true,
        services: true,
        tribe: true,
        subTribe: true,
      }
    });

    return NextResponse.json(key, { status: 201 });
  } catch (error: any) {
    console.error('Error creating electoral key:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'كود المفتاح أو رقم الهاتف موجود مسبقاً' }, { status: 409 });
    }
    return NextResponse.json({ error: 'فشل في إنشاء المفتاح الانتخابي' }, { status: 500 });
  }
}
