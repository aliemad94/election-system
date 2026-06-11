import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { requirePermission, auditLog, handleApiError, isValidCuid, getClientIp } from '@/lib/security';

// ---- Zod Validation Schemas ----
const voterFilterSchema = z.object({
  district: z.string().max(50).optional(),
  tribeId: z.string().max(50).optional(),
  status: z.enum(['SUPPORTIVE', 'NEUTRAL', 'OPPOSED']).optional(),
  search: z.string().max(100).optional(),
  keyId: z.string().max(50).optional(),
  page: z.coerce.number().int().min(1).max(10000).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

const voterCreateSchema = z.object({
  firstName: z.string().min(1).max(100),
  fatherName: z.string().min(1).max(100),
  grandfatherName: z.string().min(1).max(100),
  fourthName: z.string().min(1).max(100),
  gender: z.string().max(20),
  birthDate: z.string().optional(),
  phone: z.string().max(20).optional(),
  education: z.string().max(50).optional(),
  profession: z.string().max(100).optional(),
  province: z.string().max(50).optional(),
  district: z.string().max(50).optional(),
  subDistrict: z.string().max(50).optional(),
  pollingCenter: z.string().max(200).optional(),
  ballotStation: z.string().max(50).optional(),
  status: z.enum(['SUPPORTIVE', 'NEUTRAL', 'OPPOSED']).optional(),
  supportDegree: z.number().int().min(1).max(5).optional(),
  supportReason: z.string().max(500).optional(),
  voterCategory: z.string().max(50).optional(),
  conversionPath: z.string().max(200).optional(),
  keyId: z.string().min(1).max(50),
  relationship: z.string().max(50).optional(),
  influenceRate: z.number().int().min(0).max(100).optional(),
  isPrimaryFollow: z.boolean().optional(),
  lastContactDate: z.string().optional(),
  contactResult: z.string().max(200).optional(),
  nextAction: z.string().max(200).optional(),
  followUpDate: z.string().optional(),
  tribeId: z.string().max(50).optional(),
  subTribeId: z.string().max(50).optional(),
  maritalStatus: z.string().max(20).optional(),
  familySize: z.number().int().max(50).optional(),
  nationalId: z.string().max(20).optional(),
  area: z.string().max(100).optional(),
  socialMedia: z.any().optional(),
  firstContactDate: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  gpsVerified: z.boolean().optional(),
  isRegistryVerified: z.boolean().optional(),
  registryVoterId: z.string().max(30).optional(),
  // Aliases for compatibility
  dateOfBirth: z.string().optional(),
  phoneNumber: z.string().max(20).optional(),
  educationLevel: z.string().max(50).optional(),
  electoralKeyId: z.string().max(50).optional(),
  pollingCenterName: z.string().max(200).optional(),
  pollingCenterId: z.string().max(50).optional(),
  confidenceScore: z.number().int().min(1).max(5).optional(),
  tribe: z.string().max(100).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = requirePermission(request, 'read');
    if ('error' in authResult) return authResult.error;

    const { searchParams } = new URL(request.url);
    const filterResult = voterFilterSchema.safeParse(Object.fromEntries(searchParams));
    if (!filterResult.success) {
      return NextResponse.json({ error: 'معاملات غير صالحة' }, { status: 400 });
    }

    const { district, tribeId, status, search, keyId, page, limit } = filterResult.data;

    const where: Record<string, unknown> = {};
    if (district) where.district = district;
    if (tribeId) where.tribeId = tribeId;
    if (status) where.status = status;
    if (keyId) where.keyId = keyId;
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { fatherName: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const [voters, total] = await Promise.all([
      db.voter.findMany({
        where,
        include: {
          electionKey: { select: { id: true, keyCode: true, firstName: true, fatherName: true } },
          tribe: true,
          subTribe: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.voter.count({ where }),
    ]);

    const mappedVoters = voters.map((v) => ({
      ...v,
      fullName: `${v.firstName} ${v.fatherName} ${v.grandfatherName} ${v.fourthName}`.trim(),
      phoneNumber: v.phone,
      nickname: v.tribe?.name || 'غير محدد',
    }));

    return NextResponse.json({ voters: mappedVoters, total, page, limit });
  } catch (error) {
    return handleApiError(error, 'voters-get');
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = requirePermission(request, 'write');
    if ('error' in authResult) return authResult.error;

    const rawBody = await request.json();
    const bodyResult = voterCreateSchema.safeParse(rawBody);
    if (!bodyResult.success) {
      return NextResponse.json({ error: 'بيانات غير صالحة: ' + bodyResult.error.issues.map(i => i.message).join(', ') }, { status: 400 });
    }

    const body = bodyResult.data;
    const resolvedKeyId = body.keyId || body.electoralKeyId;
    if (!resolvedKeyId || !isValidCuid(resolvedKeyId)) {
      return NextResponse.json({ error: 'المفتاح الانتخابي المسؤول مطلوب وغير صالح' }, { status: 400 });
    }

    // Handle tribe resolve
    let resolvedTribeId = body.tribeId || null;
    if (!resolvedTribeId && body.tribe) {
      const foundTribe = await db.tribe.findUnique({ where: { name: body.tribe } });
      if (foundTribe) {
        resolvedTribeId = foundTribe.id;
      } else {
        const newTribe = await db.tribe.create({ data: { name: body.tribe } });
        resolvedTribeId = newTribe.id;
      }
    }

    // Resolve date and JSON fields
    const parsedBirthDate = body.birthDate || body.dateOfBirth ? new Date(body.birthDate || body.dateOfBirth || '') : new Date();
    const resolvedPhone = body.phone || body.phoneNumber || null;
    const resolvedEducation = body.education || body.educationLevel || null;
    
    let parsedSocialMedia = null;
    if (body.socialMedia) {
      try {
        parsedSocialMedia = typeof body.socialMedia === 'string' ? JSON.parse(body.socialMedia) : body.socialMedia;
      } catch {
        // Invalid JSON - ignore
      }
    }

    const voter = await db.voter.create({
      data: {
        firstName: body.firstName,
        fatherName: body.fatherName,
        grandfatherName: body.grandfatherName,
        fourthName: body.fourthName,
        gender: body.gender || 'ذكر',
        birthDate: parsedBirthDate,
        phone: resolvedPhone,
        education: resolvedEducation,
        profession: body.profession || null,
        maritalStatus: body.maritalStatus || null,
        familySize: body.familySize || null,
        nationalId: body.nationalId || null,
        area: body.area || null,
        socialMedia: parsedSocialMedia ?? undefined,
        firstContactDate: body.firstContactDate ? new Date(body.firstContactDate) : null,
        province: body.province || 'ذي قار',
        district: body.district || 'الغراف',
        subDistrict: body.subDistrict || 'المركز',
        pollingCenter: body.pollingCenter || body.pollingCenterName || 'مدرسة العراق الابتدائية',
        ballotStation: body.ballotStation || body.pollingCenterId || 'محطة رقم 1',
        status: body.status || 'NEUTRAL',
        supportDegree: body.supportDegree || body.confidenceScore || 3,
        supportReason: body.supportReason || null,
        voterCategory: body.voterCategory || 'محايد',
        conversionPath: body.conversionPath || null,
        votedOnDay: false,
        keyId: resolvedKeyId,
        relationship: body.relationship || null,
        influenceRate: body.influenceRate ?? 50,
        isPrimaryFollow: body.isPrimaryFollow ?? true,
        lastContactDate: body.lastContactDate ? new Date(body.lastContactDate) : null,
        contactResult: body.contactResult || null,
        nextAction: body.nextAction || null,
        followUpDate: body.followUpDate ? new Date(body.followUpDate) : null,
        tribeId: resolvedTribeId,
        subTribeId: body.subTribeId || null,
        latitude: body.latitude ?? null,
        longitude: body.longitude ?? null,
        gpsVerified: body.gpsVerified ?? false,
        isRegistryVerified: body.isRegistryVerified ?? false,
        registryVoterId: body.registryVoterId || null,
      },
      include: {
        electionKey: { select: { id: true, keyCode: true, firstName: true, fatherName: true } },
        tribe: true,
        subTribe: true,
      },
    });

    // Audit log
    await auditLog({
      userId: authResult.user.userId,
      username: authResult.user.username,
      action: 'CREATE',
      entity: 'Voter',
      entityId: voter.id,
      ipAddress: getClientIp(request),
    });

    const mapped = {
      ...voter,
      fullName: `${voter.firstName} ${voter.fatherName} ${voter.grandfatherName} ${voter.fourthName}`.trim(),
      phoneNumber: voter.phone,
      nickname: voter.tribe?.name || 'غير محدد',
    };

    return NextResponse.json(mapped, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'voters-post');
  }
}
