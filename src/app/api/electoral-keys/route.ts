import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { requirePermission, auditLog, handleApiError, isValidCuid, getClientIp } from '@/lib/security';

function mapGender(genderStr: string | null | undefined): string {
  if (genderStr === 'أنثى') return 'أنثى';
  return 'ذكر';
}

function mapDegree(degreeStr: string | null | undefined): string {
  if (!degreeStr) return 'بكالوريوس';
  return degreeStr;
}

// ---- Zod Validation ----
const keyFilterSchema = z.object({
  district: z.string().max(50).optional(),
  search: z.string().max(100).optional(),
  tribeId: z.string().max(50).optional(),
});

const keyCreateSchema = z.object({
  keyCode: z.string().min(1).max(50).optional(),
  code: z.string().min(1).max(50).optional(),
  firstName: z.string().min(1).max(100),
  fatherName: z.string().max(100).optional(),
  grandfatherName: z.string().max(100).optional(),
  fourthName: z.string().max(100).optional(),
  gender: z.string().max(20).optional(),
  birthDate: z.string().optional(),
  education: z.string().max(50).optional(),
  educationLevel: z.string().max(50).optional(),
  profession: z.string().max(100).optional(),
  phone: z.string().min(1).max(20),
  socialMedia: z.any().optional(),
  province: z.string().max(50).optional(),
  governorate: z.string().max(50).optional(),
  district: z.string().max(50).optional(),
  subDistrict: z.string().max(50).optional(),
  pollingCenter: z.string().max(200).optional(),
  expectedVotes: z.number().int().min(0).optional(),
  totalVotes: z.number().int().min(0).optional(),
  influenceLevel: z.number().int().min(1).max(5).optional(),
  mobilizationCap: z.number().int().min(1).max(5).optional(),
  mobilizationAbility: z.number().int().min(1).max(5).optional(),
  loyaltyScore: z.number().int().min(1).max(5).optional(),
  loyaltyLevel: z.number().int().min(1).max(5).optional(),
  riskLevel: z.number().int().min(1).max(5).optional(),
  keyAccuracyScore: z.number().min(0).max(1).optional(),
  reliabilityLogs: z.any().optional(),
  tribeId: z.string().max(50).optional(),
  nickname: z.string().max(100).optional(),
  tribe: z.string().max(100).optional(),
});

// GET /api/electoral-keys
export async function GET(request: NextRequest) {
  try {
    const authResult = requirePermission(request, 'read');
    if ('error' in authResult) return authResult.error;

    const { searchParams } = new URL(request.url);
    const filterResult = keyFilterSchema.safeParse(Object.fromEntries(searchParams));
    if (!filterResult.success) {
      return NextResponse.json({ error: 'معاملات غير صالحة' }, { status: 400 });
    }

    const { district, search, tribeId } = filterResult.data;

    const where: Record<string, unknown> = {};
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
    return handleApiError(error, 'electoral-keys-get');
  }
}

// POST /api/electoral-keys
export async function POST(request: NextRequest) {
  try {
    const authResult = requirePermission(request, 'write');
    if ('error' in authResult) return authResult.error;

    const rawBody = await request.json();
    const bodyResult = keyCreateSchema.safeParse(rawBody);
    if (!bodyResult.success) {
      return NextResponse.json({ error: 'بيانات غير صالحة: ' + bodyResult.error.issues.map(i => i.message).join(', ') }, { status: 400 });
    }

    const body = bodyResult.data;

    // Map tribe name/id
    let tribeId: string | null = null;
    let subTribeId: string | null = null;

    if (body.tribeId) {
      tribeId = body.tribeId;
    } else if (body.nickname || body.tribe) {
      const tribeName = body.nickname || body.tribe;
      if (tribeName) {
        const foundTribe = await db.tribe.findUnique({ where: { name: tribeName } });
        if (foundTribe) {
          tribeId = foundTribe.id;
        } else {
          const newTribe = await db.tribe.create({ data: { name: tribeName } });
          tribeId = newTribe.id;
        }
      }
    }

    const key = await db.electionKey.create({
      data: {
        keyCode: body.keyCode || body.code || `KEY-${Date.now()}`,
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
        expectedVotes: body.expectedVotes || body.totalVotes || 0,
        influenceLevel: body.influenceLevel || 3,
        mobilizationCap: body.mobilizationCap || body.mobilizationAbility || 3,
        loyaltyScore: body.loyaltyScore || body.loyaltyLevel || 3,
        riskLevel: body.riskLevel || 1,
        keyAccuracyScore: body.keyAccuracyScore ?? 1.0,
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

    // Audit log
    await auditLog({
      userId: authResult.user.userId,
      username: authResult.user.username,
      action: 'CREATE',
      entity: 'ElectionKey',
      entityId: key.id,
      ipAddress: getClientIp(request),
    });

    return NextResponse.json(key, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'electoral-keys-post');
  }
}
